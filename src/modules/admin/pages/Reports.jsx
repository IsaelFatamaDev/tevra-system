import { useState, useEffect } from 'react'
import dashboardService from '../services/dashboard.service'
import api from '../../../core/services/api'

export default function AdminReports() {
  const [stats, setStats] = useState(null)
  const [topAgents, setTopAgents] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardService.getAdminStats(),
      dashboardService.getTopAgents(5),
      dashboardService.getRevenueByMonth().catch(() => []),
    ]).then(([statsRes, agentsRes, citiesRes]) => {
      setStats(statsRes)
      setTopAgents(Array.isArray(agentsRes) ? agentsRes : [])
    }).catch(err => console.error("Error fetching reports", err))
      .finally(() => setLoading(false))

    // Cities/orders by city
    api.get('/analytics/orders-by-city')
      .then(data => setCities(Array.isArray(data) ? data : []))
      .catch(() => { })
  }, [])

  const metricCards = stats ? [
    { title: 'Total Pedidos', value: stats.totalOrders?.toLocaleString() || '0', icon: 'shopping_cart', iconColor: 'bg-sky-500/10 text-sky-600', trend: '', trendBg: 'bg-sky-500/10 text-sky-600', type: 'up', subtitle: 'Acumulado total' },
    { title: 'Ingresos Totales', value: `$${Number(stats.totalRevenue || 0).toLocaleString()}`, icon: 'payments', iconColor: 'bg-emerald-500/10 text-emerald-600', trend: '', trendBg: 'bg-emerald-500/10 text-emerald-600', type: 'up', subtitle: 'Revenue bruto' },
    { title: 'Comisión TeVra', value: `$${Number(stats.totalTevraCommission || 0).toLocaleString()}`, icon: 'account_balance', iconColor: 'bg-amber-500/10 text-amber-600', trend: '', trendBg: 'bg-amber-500/10 text-amber-600', type: 'up', subtitle: 'Ganancia plataforma' },
    { title: 'Agentes Activos', value: stats.totalAgents?.toLocaleString() || '0', icon: 'support_agent', iconColor: 'bg-purple-500/10 text-purple-600', trend: '', trendBg: 'bg-purple-500/10 text-purple-600', type: 'up', subtitle: `${stats.totalCustomers || 0} clientes` },
  ] : []

  const maxCityOrders = cities.length ? Math.max(...cities.map(c => Number(c.totalOrders) || 1)) : 1
  const cityColors = ['bg-primary', 'bg-secondary', 'bg-sky-600', 'bg-amber-500', 'bg-emerald-500']

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
      {/* Header & Filters */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-headline font-extrabold text-primary tracking-tight">Reportes y Analítica</h2>
          <p className="text-text-muted text-sm sm:text-base max-w-xl">Monitorea el crecimiento y la salud operativa de TeVra.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-surface-container-high p-1 rounded-full flex items-center hidden sm:flex">
            <button className="px-4 py-1.5 text-xs font-medium rounded-full text-text-muted hover:bg-white transition-all">7 días</button>
            <button className="px-4 py-1.5 text-xs font-bold rounded-full bg-white shadow-sm text-primary transition-all">30 días</button>
            <button className="px-4 py-1.5 text-xs font-medium rounded-full text-text-muted hover:bg-white transition-all">Este año</button>
          </div>
          <button className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-primary text-primary font-bold text-xs sm:text-sm hover:bg-surface-container-low transition-all">
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
          {/* Chart Mock */}
          <div className="h-48 sm:h-64 flex items-end justify-between gap-1 mt-4 relative">
            <div className="absolute inset-0 flex flex-col justify-between opacity-10">
              <div className="border-b border-primary w-full"></div>
              <div className="border-b border-primary w-full"></div>
              <div className="border-b border-primary w-full"></div>
              <div className="border-b border-primary w-full"></div>
            </div>
            <div className="w-full h-full absolute bottom-0 left-0 bg-gradient-to-t from-secondary/5 to-transparent"></div>
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M 0 80 Q 20 70 30 40 T 60 50 T 80 20 T 100 30" fill="none" stroke="#ae2f34" strokeWidth="2"></path>
              <circle cx="0" cy="80" fill="#ae2f34" r="1.5"></circle>
              <circle cx="30" cy="40" fill="#ae2f34" r="1.5"></circle>
              <circle cx="60" cy="50" fill="#ae2f34" r="1.5"></circle>
              <circle cx="80" cy="20" fill="#ae2f34" r="1.5"></circle>
              <circle cx="100" cy="30" fill="#ae2f34" r="1.5"></circle>
            </svg>
            <div className="flex w-full justify-between mt-auto pt-4 text-[10px] text-text-muted font-bold uppercase tracking-tighter">
              <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span><span>Jul</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 sm:p-8 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col">
          <h4 className="text-lg sm:text-xl font-headline font-bold text-primary mb-1">Por Categoría</h4>
          <p className="text-xs sm:text-sm text-text-muted mb-6">Distribución por sector</p>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* Doughnut Mock */}
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-[12px] sm:border-[16px] border-primary-container relative flex items-center justify-center">
              <div className="absolute inset-0 border-[12px] sm:border-[16px] border-secondary content-[''] rounded-full" style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)' }}></div>
              <div className="text-center z-10">
                <span className="text-xl sm:text-2xl font-extrabold text-primary">100%</span>
                <p className="text-[10px] text-text-muted font-bold uppercase">Total</p>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 w-full">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                <span className="text-[10px] sm:text-xs font-semibold">Tecnología</span>
                <span className="text-[10px] sm:text-xs font-bold ml-auto">45%</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="text-[10px] sm:text-xs font-semibold">Calzado</span>
                <span className="text-[10px] sm:text-xs font-bold ml-auto">22%</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                <span className="text-[10px] sm:text-xs font-semibold">Bolsos</span>
                <span className="text-[10px] sm:text-xs font-bold ml-auto">15%</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-[10px] sm:text-xs font-semibold">Belleza</span>
                <span className="text-[10px] sm:text-xs font-bold ml-auto">12%</span>
              </div>
            </div>
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
