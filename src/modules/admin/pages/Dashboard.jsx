import { useAuth } from '../../../core/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import dashboardService from '../services/dashboard.service'
import agentsService from '../../public/services/agents.service'

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-[#468189]/10 text-[#468189]',
  processing: 'bg-[#77ACA2]/15 text-[#468189]',
  shipped: 'bg-purple-100 text-purple-700',
  purchased_in_usa: 'bg-blue-100 text-blue-700',
  in_transit: 'bg-violet-100 text-violet-700',
  in_customs: 'bg-orange-100 text-orange-700',
  ready_for_delivery: 'bg-[#9DBEBB]/20 text-[#031926]',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminDashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [topAgents, setTopAgents] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [pendingAgents, setPendingAgents] = useState([])
  const [revenueByMonth, setRevenueByMonth] = useState([])
  const [loading, setLoading] = useState(true)

  const statusLabels = {
    pending: t('common.status.pending'),
    confirmed: t('common.status.confirmed'),
    processing: t('common.status.processing'),
    shipped: t('common.status.shipped'),
    purchased_in_usa: t('common.status.purchased_in_usa'),
    in_transit: t('common.status.in_transit'),
    in_customs: t('common.status.in_customs'),
    ready_for_delivery: t('common.status.ready_for_delivery'),
    delivered: t('common.status.delivered'),
    cancelled: t('common.status.cancelled'),
  }

  useEffect(() => {
    Promise.all([
      dashboardService.getAdminStats().catch(() => null),
      dashboardService.getTopAgents(5).catch(() => []),
      dashboardService.getRecentOrders(5).catch(() => ({ items: [] })),
      dashboardService.getPendingAgents().catch(() => []),
      dashboardService.getRevenueByMonth().catch(() => []),
    ]).then(([statsRes, agents, ordersRes, pending, revenue]) => {
      setStats(statsRes)
      setTopAgents(Array.isArray(agents) ? agents : [])
      const orders = ordersRes?.items || ordersRes?.data || (Array.isArray(ordersRes) ? ordersRes : [])
      setRecentOrders(orders.slice(0, 5))
      setPendingAgents(Array.isArray(pending) ? pending : [])
      setRevenueByMonth(Array.isArray(revenue) ? revenue : [])
    }).finally(() => setLoading(false))
  }, [])

  const handleExportCSV = () => {
    if (!recentOrders.length) return
    const headers = [t('admin.dashboard.tableHeaders.order'), t('admin.dashboard.tableHeaders.customer'), 'Email', 'Total', t('admin.dashboard.tableHeaders.status'), t('admin.table.date')]
    const rows = recentOrders.map(o => [
      o.orderNumber || o.id?.slice(0, 8),
      `${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`.trim(),
      o.customer?.email || '',
      Number(o.total || 0).toFixed(2),
      statusLabels[o.status] || o.status,
      o.createdAt ? new Date(o.createdAt).toLocaleDateString('es-PE') : '',
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `tevra-dashboard-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const handleApproveAgent = async (agent) => {
    try {
      await agentsService.updateStatus(agent.id, 'active')
      setPendingAgents(prev => prev.filter(a => a.id !== agent.id))
    } catch (err) { console.error('Error approving agent', err) }
  }

  const handleRejectAgent = async (agent) => {
    try {
      await agentsService.updateStatus(agent.id, 'inactive')
      setPendingAgents(prev => prev.filter(a => a.id !== agent.id))
    } catch (err) { console.error('Error rejecting agent', err) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#9DBEBB]/30 border-t-[#468189] animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#468189]">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  const statCards = stats ? [
    { title: t('admin.dashboard.stats.totalCustomers'), value: stats.totalCustomers ?? 0, icon: 'group', bg: 'bg-[#EBF2FA]', iconColor: 'text-[#031926]' },
    { title: t('admin.dashboard.stats.activeAgents'), value: stats.totalAgents ?? 0, icon: 'support_agent', bg: 'bg-[#468189]/15', iconColor: 'text-[#468189]' },
    { title: t('admin.dashboard.stats.totalOrders'), value: stats.totalOrders ?? 0, icon: 'package_2', bg: 'bg-[#9DBEBB]/20', iconColor: 'text-[#031926]' },
    { title: t('admin.dashboard.stats.revenue'), value: `$${Number(stats.totalRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: 'payments', bg: 'bg-[#031926]', iconColor: 'text-[#EBF2FA]' },
  ] : []

  const medals = ['🥇', '🥈', '🥉']

  const maxRevenue = revenueByMonth.length > 0
    ? Math.max(...revenueByMonth.map(r => parseFloat(r.revenue || 0)))
    : 100

  return (
    <div className="space-y-6 platform-enter">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#031926]">{t('admin.dashboard.title')}</h1>
          <p className="text-sm text-[#468189] mt-0.5">{t('admin.dashboard.welcome', { name: user?.firstName })}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="px-4 py-2 bg-white text-[#031926] font-medium rounded-lg border border-[#9DBEBB]/30 flex items-center gap-1.5 hover:bg-[#EBF2FA]/50 transition-colors text-sm">
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            {t('admin.dashboard.exportBtn')}
          </button>
          <button onClick={() => navigate('/registro-agente')} className="px-4 py-2 bg-[#031926] text-[#EBF2FA] font-medium rounded-lg flex items-center gap-1.5 hover:bg-[#468189] transition-colors text-sm">
            <span className="material-symbols-outlined text-[16px]">add</span>
            {t('admin.dashboard.newAgent')}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.title} className="bg-white rounded-xl p-5 border border-[#9DBEBB]/20 stat-card">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-[18px] ${s.iconColor}`}>{s.icon}</span>
              </div>
              <p className="text-xs font-medium text-[#468189]">{s.title}</p>
            </div>
            <p className="text-2xl font-semibold text-[#031926]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Orders by Status badges */}
      {stats?.ordersByStatus?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stats.ordersByStatus.map((s) => (
            <span key={s.status} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusColors[s.status] || 'bg-[#9DBEBB]/10 text-[#468189]'}`}>
              {statusLabels[s.status] || s.status}
              <span className="bg-white/60 px-1.5 py-0.5 rounded-full text-[10px] font-bold">{s.count}</span>
            </span>
          ))}
        </div>
      )}

      {/* Charts + Top Agents */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#9DBEBB]/20 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#9DBEBB]/10">
            <div>
              <h3 className="text-sm font-semibold text-[#031926]">{t('admin.dashboard.salesPerformance')}</h3>
              <p className="text-xs text-[#468189] mt-0.5">{t('admin.dashboard.monthlyRevenue')}</p>
            </div>
          </div>
          <div className="p-6">
            {revenueByMonth.length > 0 ? (
              <div className="flex items-end gap-2 h-52">
                {revenueByMonth.map((r, i) => {
                  const pct = maxRevenue > 0 ? (parseFloat(r.revenue) / maxRevenue) * 100 : 0
                  const monthLabel = r.month?.split('-')[1] || ''
                  const months = { '01': t('common.months.jan'), '02': t('common.months.feb'), '03': t('common.months.mar'), '04': t('common.months.apr'), '05': t('common.months.may'), '06': t('common.months.jun'), '07': t('common.months.jul'), '08': t('common.months.aug'), '09': t('common.months.sep'), '10': t('common.months.oct'), '11': t('common.months.nov'), '12': t('common.months.dec') }
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
                      <div className="text-[10px] text-[#468189] opacity-0 group-hover/bar:opacity-100 transition-opacity font-semibold">
                        ${Number(r.revenue).toLocaleString()}
                      </div>
                      <div
                        className="w-full rounded-t-md bg-[#468189] hover:bg-[#031926] transition-colors cursor-pointer min-h-1"
                        style={{ height: `${Math.max(pct, 2)}%` }}
                      />
                      <span className="text-[10px] text-[#9DBEBB] font-medium">{months[monthLabel] || monthLabel}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-end gap-2 h-52">
                {[40, 65, 45, 80, 55, 90, 70, 60, 85, 50, 75, 95].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-md bg-[#9DBEBB]/40" style={{ height: `${h}%` }} />
                    <span className="text-[10px] text-[#9DBEBB]">{['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Agents */}
        <div className="bg-white rounded-xl border border-[#9DBEBB]/20">
          <div className="px-5 py-4 border-b border-[#9DBEBB]/10">
            <h3 className="text-sm font-semibold text-[#031926]">{t('admin.dashboard.topAgents')}</h3>
            <p className="text-xs text-[#468189] mt-0.5">{t('admin.dashboard.topAgentsDesc')}</p>
          </div>
          <div className="p-4 space-y-2">
            {topAgents.length === 0 && (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-3xl text-text-muted/20 block mb-2">support_agent</span>
                <p className="text-sm text-text-muted">{t('admin.dashboard.noAgentData')}</p>
              </div>
            )}
            {topAgents.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low/60 transition-colors">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-semibold text-xs shrink-0">
                  {i < 3 ? <span className="text-sm">{medals[i]}</span> : <span>{i + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#031926] truncate">{a.displayName || t('admin.table.agent')}</p>
                  <p className="text-xs text-[#468189]">{Number(a.totalOrders || 0)} {t('admin.dashboard.sales')}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#031926]">${Number(a.totalRevenue || 0).toLocaleString()}</span>
                  <p className="text-[10px] text-emerald-600 font-medium">${Number(a.totalCommission || 0).toLocaleString()} {t('admin.dashboard.commission')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders + Pending Agents */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#9DBEBB]/20 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#9DBEBB]/10">
            <div>
              <h3 className="text-sm font-semibold text-[#031926]">{t('admin.dashboard.recentOrders')}</h3>
              <p className="text-xs text-[#468189] mt-0.5">{t('admin.dashboard.lastOrders')}</p>
            </div>
            <button onClick={() => navigate('/admin/orders')} className="text-sm font-medium text-[#468189] hover:text-[#031926] transition-colors flex items-center gap-1">
              {t('admin.dashboard.viewAll')}
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#EBF2FA]/30">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#468189] uppercase tracking-wider">{t('admin.dashboard.tableHeaders.order')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#468189] uppercase tracking-wider">{t('admin.dashboard.tableHeaders.customer')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#468189] uppercase tracking-wider hidden md:table-cell">{t('admin.dashboard.tableHeaders.agent')}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#468189] uppercase tracking-wider">{t('admin.dashboard.tableHeaders.amount')}</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#468189] uppercase tracking-wider">{t('admin.dashboard.tableHeaders.status')}</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 && (
                  <tr><td colSpan="5" className="px-6 py-10 text-center">
                    <span className="material-symbols-outlined text-3xl text-text-muted/20 block mb-2">receipt_long</span>
                    <p className="text-sm text-text-muted">{t('admin.dashboard.noOrders')}</p>
                  </td></tr>
                )}
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-t border-[#9DBEBB]/10 hover:bg-[#EBF2FA]/20 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="font-mono text-xs font-semibold text-[#468189]">{o.orderNumber || o.id?.slice(0, 8)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-[#031926] text-sm">{o.customer?.firstName || t('admin.dashboard.tableHeaders.customer')} {o.customer?.lastName || ''}</p>
                      <p className="text-xs text-[#9DBEBB]">{o.customer?.email || ''}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-[#9DBEBB] text-sm">
                      {o.agent ? `${o.agent.firstName || ''} ${o.agent.lastName || ''}`.trim() || '—' : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-[#031926]">${Number(o.total || 0).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[o.status] || 'bg-[#9DBEBB]/10 text-[#468189]'}`}>
                        {statusLabels[o.status] || o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Agent Applications */}
        <div className="bg-white rounded-xl border border-[#9DBEBB]/20">
          <div className="px-5 py-4 border-b border-[#9DBEBB]/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#031926]">{t('admin.dashboard.requests')}</h3>
                <p className="text-xs text-[#468189] mt-0.5">{t('admin.dashboard.pendingAgents')}</p>
              </div>
              {pendingAgents.length > 0 && (
                <span className="bg-[#EBF2FA] text-[#031926] text-xs font-semibold px-2 py-0.5 rounded-full">
                  {pendingAgents.length}
                </span>
              )}
            </div>
          </div>
          <div className="p-4 space-y-3">
            {pendingAgents.length === 0 && (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-3xl text-text-muted/20 block mb-2">how_to_reg</span>
                <p className="text-sm text-text-muted">{t('admin.dashboard.noPendingRequests')}</p>
              </div>
            )}
            {pendingAgents.map((a, i) => (
              <div key={a.id || i} className="p-3 rounded-lg border border-[#9DBEBB]/20 hover:border-[#9DBEBB]/40 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#EBF2FA] flex items-center justify-center text-[#031926] font-semibold text-xs shrink-0">
                    {(a.firstName || a.fullName || '?')[0].toUpperCase()}{(a.lastName || '')[0]?.toUpperCase() || ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#031926] truncate">
                      {a.firstName && a.lastName ? `${a.firstName} ${a.lastName}` : a.fullName || t('admin.dashboard.noName')}
                    </p>
                    <p className="text-xs text-[#468189]">{a.city || a.email || t('admin.dashboard.noInfo')}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApproveAgent(a)} className="flex-1 py-1.5 rounded-lg bg-[#031926] text-[#EBF2FA] text-xs font-medium hover:bg-[#468189] transition-colors">
                    {t('common.approve')}
                  </button>
                  <button onClick={() => handleRejectAgent(a)} className="flex-1 py-1.5 rounded-lg border border-[#9DBEBB]/30 text-[#468189] text-xs font-medium hover:bg-[#EBF2FA]/30 transition-colors">
                    {t('common.reject')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commission Summary */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#9DBEBB]/20 p-5">
            <span className="material-symbols-outlined text-[#9DBEBB] text-xl mb-3 block">account_balance</span>
            <p className="text-2xl font-semibold text-[#031926]">${Number(stats.totalTevraCommission ?? 0).toLocaleString()}</p>
            <p className="text-xs text-[#468189] mt-1">{t('admin.dashboard.commissions.tevra')}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#9DBEBB]/20 p-5">
            <span className="material-symbols-outlined text-[#9DBEBB] text-xl mb-3 block">handshake</span>
            <p className="text-2xl font-semibold text-[#031926]">${Number(stats.totalAgentCommission ?? 0).toLocaleString()}</p>
            <p className="text-xs text-[#468189] mt-1">{t('admin.dashboard.commissions.agents')}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#9DBEBB]/20 p-5">
            <span className="material-symbols-outlined text-[#9DBEBB] text-xl mb-3 block">inventory_2</span>
            <p className="text-2xl font-semibold text-[#031926]">{stats.totalProducts ?? 0}</p>
            <p className="text-xs text-[#468189] mt-1">{t('admin.dashboard.commissions.products')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
