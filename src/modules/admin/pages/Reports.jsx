import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import dashboardService from '../services/dashboard.service'
import api from '../../../core/services/api'

export default function AdminReports() {
  const { t } = useTranslation()
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
    const rows = [['Metric', 'Value']]
    if (stats) {
      rows.push([t('admin.reports.totalOrders'), stats.totalOrders || 0])
      rows.push([t('admin.reports.totalRevenue'), stats.totalRevenue || 0])
      rows.push([t('admin.reports.tevraCommission'), stats.totalTevraCommission || 0])
      rows.push([t('admin.reports.activeAgents'), stats.totalAgents || 0])
      rows.push([t('admin.reports.customersSubtitle'), stats.totalCustomers || 0])
    }
    rows.push([])
    rows.push([t('admin.table.agent'), t('admin.table.orders'), t('admin.table.revenue')])
    topAgents.forEach(a => rows.push([a.displayName, a.totalOrders, a.totalRevenue]))
    rows.push([])
    rows.push([t('admin.reports.topCities'), t('admin.table.orders')])
    cities.forEach(c => rows.push([c.city || t('admin.reports.noCity'), c.totalOrders]))

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
    { title: t('admin.reports.totalOrders'), value: stats.totalOrders?.toLocaleString() || '0', icon: 'shopping_cart', subtitle: t('admin.reports.cumulativeTotal') },
    { title: t('admin.reports.totalRevenue'), value: `$${Number(stats.totalRevenue || 0).toLocaleString()}`, icon: 'payments', subtitle: t('admin.reports.grossRevenue') },
    { title: t('admin.reports.tevraCommission'), value: `$${Number(stats.totalTevraCommission || 0).toLocaleString()}`, icon: 'account_balance', subtitle: t('admin.reports.platformProfit') },
    { title: t('admin.reports.activeAgents'), value: stats.totalAgents?.toLocaleString() || '0', icon: 'support_agent', subtitle: `${stats.totalCustomers || 0} ${t('admin.reports.customersSubtitle')}` },
  ] : []

  const maxCityOrders = cities.length ? Math.max(...cities.map(c => Number(c.totalOrders) || 1)) : 1
  const cityColors = ['bg-zinc-900', 'bg-zinc-700', 'bg-zinc-500', 'bg-zinc-400', 'bg-zinc-300']

  return (
    <div className="max-w-7xl mx-auto w-full space-y-5 platform-enter">
      {/* Header & Filters */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">{t('admin.reports.title')}</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{t('admin.reports.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-zinc-100 p-0.5 rounded-lg hidden sm:flex items-center">
            {[{ label: t('admin.reports.period7d'), value: '7d' }, { label: t('admin.reports.period30d'), value: '30d' }, { label: t('admin.reports.period1y'), value: '1y' }].map(f => (
              <button key={f.value} onClick={() => setPeriod(f.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${period === f.value ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:bg-white/60'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 text-white font-medium text-sm hover:bg-zinc-800 transition-colors">
            <span className="material-symbols-outlined text-[16px]">download</span>
            {t('common.export')}
          </button>
        </div>
      </section>

      {/* Metric Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metricCards.map((card, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-zinc-200 stat-card">
            <div className="flex justify-between items-start mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-100 text-zinc-600">
                <span className="material-symbols-outlined text-[18px]">{card.icon}</span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mb-0.5">{card.title}</p>
            <h3 className="text-xl font-semibold text-zinc-900">{card.value}</h3>
            <p className="text-[10px] text-zinc-400 mt-1">{card.subtitle}</p>
          </div>
        ))}
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-zinc-200 relative overflow-hidden">
          <div className="flex justify-between items-start mb-5 relative z-10">
            <div>
              <h4 className="text-sm font-semibold text-zinc-900">{t('admin.reports.salesGrowth')}</h4>
              <p className="text-xs text-zinc-500">{t('admin.reports.monthlyTrend')}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-900"></span>
              <span className="text-xs font-medium text-zinc-600">{t('admin.reports.salesLabel')}</span>
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
                      <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] px-2 py-0.5 rounded font-medium whitespace-nowrap">
                        ${Number(m.revenue).toLocaleString()}
                      </div>
                    </div>
                    <div className="w-full max-w-8 rounded-t-md bg-zinc-300 hover:bg-zinc-900 transition-colors"
                      style={{ height: `${Math.max(pct, 3)}%` }}></div>
                    <span className="text-[9px] sm:text-[10px] text-zinc-500 font-medium mt-1 capitalize">{monthLabel}</span>
                  </div>
                )
              })
            })() : (
              <div className="flex items-center justify-center w-full h-full text-zinc-400 text-sm">{t('admin.reports.noSalesData')}</div>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 flex flex-col">
          <h4 className="text-sm font-semibold text-zinc-900 mb-1">{t('admin.reports.byCategory')}</h4>
          <p className="text-xs text-zinc-500 mb-5">{t('admin.reports.sectorDistribution')}</p>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {(() => {
              const catColors = ['bg-zinc-200', 'bg-zinc-400', 'bg-zinc-600', 'bg-zinc-800', 'bg-zinc-900', 'bg-zinc-500']
              const totalRev = categories.reduce((s, c) => s + Number(c.totalRevenue || 0), 0) || 1
              const catData = categories.slice(0, 6).map((c, i) => ({
                name: c.category || t('admin.reports.noCategory'),
                pct: Math.round(Number(c.totalRevenue || 0) / totalRev * 100),
                color: catColors[i % catColors.length],
              }))
              return (
                <>
                  <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-zinc-50 relative flex items-center justify-center overflow-hidden">
                    {catData.length > 0 ? (
                      <svg viewBox="0 0 42 42" className="absolute inset-0 w-full h-full">
                        {(() => {
                          const svgColors = ['#d4d4d8', '#a1a1aa', '#71717a', '#52525b', '#3f3f46', '#27272a']
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
                      <span className="text-xl sm:text-2xl font-semibold text-zinc-900">{categories.length}</span>
                      <p className="text-[10px] text-zinc-500 font-medium uppercase">{t('admin.reports.categoriesLabel')}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 w-full">
                    {catData.map((c, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${c.color}`}></span>
                        <span className="text-xs text-zinc-600 truncate">{c.name}</span>
                        <span className="text-xs font-medium text-zinc-900 ml-auto">{c.pct}%</span>
                      </div>
                    ))}
                    {catData.length === 0 && <p className="col-span-2 text-xs text-zinc-400 text-center">{t('admin.reports.noData')}</p>}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
            <h4 className="text-sm font-semibold text-zinc-900">{t('admin.reports.topGrowthAgents')}</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr className="bg-zinc-50 text-[11px] font-medium uppercase tracking-wider text-zinc-500 border-b border-zinc-100">
                  <th className="px-5 py-3">{t('admin.table.agent')}</th>
                  <th className="px-5 py-3">{t('admin.table.orders')}</th>
                  <th className="px-5 py-3 text-right">{t('admin.table.revenue')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {topAgents.map((agent, i) => (
                  <tr key={i} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center font-medium text-xs text-zinc-600">{i + 1}</div>
                        <span className="text-sm font-medium text-zinc-900">{agent.displayName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-zinc-900">{Number(agent.totalOrders).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-emerald-600 font-medium text-sm">${Number(agent.totalRevenue).toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-zinc-200">
          <h4 className="text-sm font-semibold text-zinc-900 mb-5">{t('admin.reports.topCities')}</h4>
          <div className="space-y-4">
            {cities.slice(0, 5).map((city, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-zinc-900">{city.city || t('admin.reports.noCity')}</span>
                  <span className="text-zinc-500">{Number(city.totalOrders).toLocaleString()} {t('admin.reports.ordersCount')}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
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
