import { useState, useEffect } from 'react'
import dashboardService from '../services/dashboard.service'
import api from '../../../core/services/api'

export default function AdminReports() {
  const [stats, setStats] = useState(null)
  const [topAgents, setTopAgents] = useState([])
  const [cities, setCities] = useState([])
  const [revenueByMonth, setRevenueByMonth] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  const fetchData = (p) => {
    setLoading(true)
    const query = p ? `?period=${p}` : ''
    Promise.all([
      dashboardService.getAdminStats(),
      dashboardService.getTopAgents(5),
      dashboardService.getRevenueByMonth(p).catch(() => []),
      api.get(`/analytics/orders-by-city${query}`).catch(() => []),
      api.get(`/analytics/orders-by-category${query}`).catch(() => []),
    ]).then(([statsRes, agentsRes, revenueRes, citiesRes, catRes]) => {
      setStats(statsRes)
      setTopAgents(Array.isArray(agentsRes) ? agentsRes : [])
      setRevenueByMonth(Array.isArray(revenueRes) ? revenueRes : [])
      setCities(Array.isArray(citiesRes) ? citiesRes : [])
      setCategories(Array.isArray(catRes) ? catRes : [])
    }).catch(err => console.error("Error fetching reports", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData(period) }, [period])

  const handleExportCSV = () => {
    const rows = [['Métrica', 'Valor']]
    if (stats) {
      rows.push(['Total Pedidos', stats.totalOrders || 0])
      rows.push(['Ingresos Totales', stats.totalRevenue || 0])
      rows.push(['Comisión TeVra', stats.totalTevraCommission || 0])
      rows.push(['Agentes Activos', stats.totalAgents || 0])
      rows.push(['Clientes', stats.totalCustomers || 0])
    }
    rows.push([])
    rows.push(['Agente', 'Pedidos', 'Revenue'])
    topAgents.forEach(a => rows.push([a.displayName, a.totalOrders, a.totalRevenue]))
    rows.push([])
    rows.push(['Ciudad', 'Pedidos'])
    cities.forEach(c => rows.push([c.city || 'Sin ciudad', c.totalOrders]))

    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-tevra-${period}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const metricCards = stats ? [
    { title: 'Total Pedidos', value: stats.totalOrders?.toLocaleString() || '0', icon: 'shopping_cart', iconColor: 'bg-primary/10 text-primary', trend: '', trendBg: 'bg-primary/10 text-primary', type: 'up', subtitle: 'Acumulado total' },
    { title: 'Ingresos Totales', value: `$${Number(stats.totalRevenue || 0).toLocaleString()}`, icon: 'payments', iconColor: 'bg-emerald-500/10 text-emerald-600', trend: '', trendBg: 'bg-emerald-500/10 text-emerald-600', type: 'up', subtitle: 'Revenue bruto' },
    { title: 'Comisión TeVra', value: `$${Number(stats.totalTevraCommission || 0).toLocaleString()}`, icon: 'account_balance', iconColor: 'bg-amber-500/10 text-amber-600', trend: '', trendBg: 'bg-amber-500/10 text-amber-600', type: 'up', subtitle: 'Ganancia plataforma' },
    { title: 'Agentes Activos', value: stats.totalAgents?.toLocaleString() || '0', icon: 'support_agent', iconColor: 'bg-purple-500/10 text-purple-600', trend: '', trendBg: 'bg-purple-500/10 text-purple-600', type: 'up', subtitle: `${stats.totalCustomers || 0} clientes` },
  ] : []

  const maxCityOrders = cities.length ? Math.max(...cities.map(c => Number(c.totalOrders) || 1)) : 1
  const cityColors = ['bg-primary', 'bg-secondary', 'bg-primary', 'bg-amber-500', 'bg-emerald-500']

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
      {/* Header & Filters */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-headline font-extrabold text-primary tracking-tight">Reportes y Analítica</h2>
          <p className="text-text-muted text-sm sm:text-base max-w-xl">Monitorea el crecimiento y la salud operativa de TeVra.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-surface-container-high p-1 rounded-full hidden sm:flex items-center">
            {[{ label: '7 días', value: '7d' }, { label: '30 días', value: '30d' }, { label: 'Este año', value: '1y' }].map(f => (
              <button key={f.value} onClick={() => setPeriod(f.value)}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${period === f.value ? 'bg-white shadow-sm text-primary font-bold' : 'text-text-muted hover:bg-white'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-primary text-primary font-bold text-xs sm:text-sm hover:bg-surface-container-low transition-all">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Exportar
          </button>
        </div>
      </section>

      {/* Metric Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metricCards.map((card, i) => (
          <div key={i} className="bg-white p-5 sm:p-6 rounded-xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${card.iconColor}`}>
                <span className="material-symbols-outlined">{card.icon}</span>
              </div>
              <span className={`${card.trendBg} px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1`}>
                <span className="material-symbols-outlined text-[14px]">
                  {card.type === 'up' ? 'trending_up' : 'trending_down'}
                </span>
                {card.trend}
              </span>
            </div>
            <p className="text-text-muted text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-1">{card.title}</p>
            <h3 className="text-2xl sm:text-3xl font-headline font-extrabold text-primary">{card.value}</h3>
            <p className="text-[10px] text-text-muted/70 mt-2">{card.subtitle}</p>
          </div>
        ))}
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-outline-variant/10 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h4 className="text-lg sm:text-xl font-headline font-bold text-primary">Crecimiento de Ventas</h4>
              <p className="text-xs sm:text-sm text-text-muted">Tendencia histórica mensual de ingresos</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-secondary"></span>
              <span className="text-[10px] sm:text-xs font-bold text-primary">Ventas</span>
            </div>
          </div>
          {/* Dynamic Bar Chart */}
          <div className="h-48 sm:h-64 flex items-end gap-1 mt-4 relative">
            {revenueByMonth.length > 0 ? (() => {
              const maxRev = Math.max(...revenueByMonth.map(m => Number(m.revenue) || 0), 1)
              return revenueByMonth.map((m, i) => {
                const pct = (Number(m.revenue) || 0) / maxRev * 100
                const monthLabel = m.month ? new Date(m.month + '-01').toLocaleDateString('es-PE', { month: 'short' }) : ''
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                    <div className="relative w-full flex justify-center">
                      <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap">
                        ${Number(m.revenue).toLocaleString()}
                      </div>
                    </div>
                    <div className="w-full max-w-8 rounded-t-md bg-secondary/80 hover:bg-secondary transition-colors"
                      style={{ height: `${Math.max(pct, 3)}%` }}></div>
                    <span className="text-[9px] sm:text-[10px] text-text-muted font-bold mt-1 capitalize">{monthLabel}</span>
                  </div>
                )
              })
            })() : (
              <div className="flex items-center justify-center w-full h-full text-text-muted text-sm">Sin datos de ventas</div>
            )}
          </div>
        </div>

        <div className="bg-surface-container-low p-6 sm:p-8 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col">
          <h4 className="text-lg sm:text-xl font-headline font-bold text-primary mb-1">Por Categoría</h4>
          <p className="text-xs sm:text-sm text-text-muted mb-6">Distribución por sector</p>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {(() => {
              const catColors = ['bg-primary-container', 'bg-secondary', 'bg-primary', 'bg-amber-500', 'bg-emerald-500', 'bg-violet-500']
              const totalRev = categories.reduce((s, c) => s + Number(c.totalRevenue || 0), 0) || 1
              const catData = categories.slice(0, 6).map((c, i) => ({
                name: c.category || 'Sin categoría',
                pct: Math.round(Number(c.totalRevenue || 0) / totalRev * 100),
                color: catColors[i % catColors.length],
              }))
              return (
                <>
                  <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-surface-container-high relative flex items-center justify-center overflow-hidden">
                    {catData.length > 0 ? (
                      <svg viewBox="0 0 42 42" className="absolute inset-0 w-full h-full">
                        {(() => {
                          const svgColors = ['#c4c6ce', '#ff6b6b', '#0284c7', '#f59e0b', '#10b981', '#8b5cf6']
                          let offset = 0
                          return catData.map((c, i) => {
                            const dash = c.pct * 1.005
                            const gap = 100 - dash
                            const el = <circle key={i} cx="21" cy="21" r="15.9" fill="none" stroke={svgColors[i % svgColors.length]} strokeWidth="6"
                              strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset} />
                            offset += c.pct
                            return el
                          })
                        })()}
                      </svg>
                    ) : null}
                    <div className="text-center z-10">
                      <span className="text-xl sm:text-2xl font-extrabold text-primary">{categories.length}</span>
                      <p className="text-[10px] text-text-muted font-bold uppercase">Categorías</p>
                    </div>
                  </div>
                  <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 w-full">
                    {catData.map((c, i) => (
                      <div key={i} className="flex items-center gap-1 sm:gap-2">
                        <span className={`w-2 h-2 rounded-full ${c.color}`}></span>
                        <span className="text-[10px] sm:text-xs font-semibold truncate">{c.name}</span>
                        <span className="text-[10px] sm:text-xs font-bold ml-auto">{c.pct}%</span>
                      </div>
                    ))}
                    {catData.length === 0 && <p className="col-span-2 text-xs text-text-muted text-center">Sin datos</p>}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-outline-variant/10 flex justify-between items-center">
            <h4 className="text-base sm:text-lg font-headline font-bold text-primary">Agentes con Mayor Crecimiento</h4>
            <button className="text-[10px] sm:text-xs font-bold text-secondary uppercase tracking-widest hover:underline transition-all">Ver todos</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr className="bg-surface-container-low text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  <th className="px-5 sm:px-6 py-3 sm:py-4">Agente</th>
                  <th className="px-5 sm:px-6 py-3 sm:py-4">Pedidos</th>
                  <th className="px-5 sm:px-6 py-3 sm:py-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {topAgents.map((agent, i) => (
                  <tr key={i} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-5 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-[10px] sm:text-xs text-primary">{i + 1}</div>
                        <span className="text-xs sm:text-sm font-semibold text-primary">{agent.displayName}</span>
                      </div>
                    </td>
                    <td className="px-5 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold text-primary">{Number(agent.totalOrders).toLocaleString()}</td>
                    <td className="px-5 sm:px-6 py-3 sm:py-4 text-right">
                      <span className="text-emerald-600 font-bold text-xs sm:text-sm">${Number(agent.totalRevenue).toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-outline-variant/10">
          <h4 className="text-base sm:text-lg font-headline font-bold text-primary mb-5 sm:mb-6">Ciudades con Más Pedidos</h4>
          <div className="space-y-4 sm:space-y-6">
            {cities.slice(0, 5).map((city, i) => (
              <div key={i} className="space-y-1 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm font-bold">
                  <span className="text-primary">{city.city || 'Sin ciudad'}</span>
                  <span className="text-text-muted">{Number(city.totalOrders).toLocaleString()} pedidos</span>
                </div>
                <div className="w-full h-2 sm:h-2.5 bg-surface-container-low rounded-full overflow-hidden">
                  <div className={`h-full ${cityColors[i % cityColors.length]} rounded-full`} style={{ width: `${(Number(city.totalOrders) / maxCityOrders * 100).toFixed(0)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
