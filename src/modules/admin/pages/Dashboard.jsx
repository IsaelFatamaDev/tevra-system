import { useAuth } from '../../../core/contexts/AuthContext'
import { useState, useEffect } from 'react'
import dashboardService from '../services/dashboard.service'

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-sky-100 text-sky-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  purchased_in_usa: 'bg-blue-100 text-blue-700',
  in_transit: 'bg-violet-100 text-violet-700',
  in_customs: 'bg-orange-100 text-orange-700',
  ready_for_delivery: 'bg-teal-100 text-teal-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}
const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  processing: 'Procesando',
  shipped: 'Enviado',
  purchased_in_usa: 'Comprado USA',
  in_transit: 'En tránsito',
  in_customs: 'En aduana',
  ready_for_delivery: 'Listo entrega',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [topAgents, setTopAgents] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [pendingAgents, setPendingAgents] = useState([])
  const [revenueByMonth, setRevenueByMonth] = useState([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-text-muted">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = stats ? [
    { title: 'Total Clientes', value: stats.totalCustomers ?? 0, icon: 'group', gradient: 'from-sky-500 to-blue-600', bg: 'bg-sky-50', iconColor: 'text-sky-600' },
    { title: 'Agentes Activos', value: stats.totalAgents ?? 0, icon: 'support_agent', gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { title: 'Total Pedidos', value: stats.totalOrders ?? 0, icon: 'package_2', gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { title: 'Ingresos', value: `$${Number(stats.totalRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: 'payments', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', iconColor: 'text-violet-600' },
  ] : []

  const medals = ['🥇', '🥈', '🥉']

  const maxRevenue = revenueByMonth.length > 0
    ? Math.max(...revenueByMonth.map(r => parseFloat(r.revenue || 0)))
    : 100

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-primary tracking-tight">Dashboard Overview</h1>
          <p className="text-on-surface-variant mt-1">Bienvenido, {user?.firstName}. Aquí tienes el resumen de TeVra hoy.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white text-primary font-semibold rounded-xl shadow-sm border border-outline-variant/20 flex items-center gap-2 hover:bg-surface-container-low transition-colors text-sm">
            <span className="material-symbols-outlined text-lg">file_download</span>
            Exportar
          </button>
          <button className="px-5 py-2.5 bg-linear-to-br from-primary to-primary-dark text-white font-semibold rounded-xl shadow-lg flex items-center gap-2 hover:opacity-90 transition-opacity text-sm">
            <span className="material-symbols-outlined text-lg">add</span>
            Nuevo Agente
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((s) => (
          <div key={s.title} className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-[22px] ${s.iconColor}`}>{s.icon}</span>
              </div>
              <span className="material-symbols-outlined text-text-muted/20 text-lg group-hover:text-emerald-400 transition-colors">trending_up</span>
            </div>
            <p className="text-3xl font-extrabold text-on-background font-headline tracking-tight">{s.value}</p>
            <p className="text-sm text-text-muted mt-1 font-medium">{s.title}</p>
          </div>
        ))}
      </div>

      {/* Orders by Status badges */}
      {stats?.ordersByStatus?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stats.ordersByStatus.map((s) => (
            <span key={s.status} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusColors[s.status] || 'bg-gray-100 text-gray-600'}`}>
              {statusLabels[s.status] || s.status}
              <span className="bg-white/60 px-1.5 py-0.5 rounded-full text-[10px] font-bold">{s.count}</span>
            </span>
          ))}
        </div>
      )}

      {/* Charts + Top Agents */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
            <div>
              <h3 className="font-headline font-bold text-on-background text-lg">Rendimiento de Ventas</h3>
              <p className="text-xs text-text-muted mt-0.5">Ingresos mensuales</p>
            </div>
          </div>
          <div className="p-6">
            {revenueByMonth.length > 0 ? (
              <div className="flex items-end gap-2 h-52">
                {revenueByMonth.map((r, i) => {
                  const pct = maxRevenue > 0 ? (parseFloat(r.revenue) / maxRevenue) * 100 : 0
                  const monthLabel = r.month?.split('-')[1] || ''
                  const months = { '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic' }
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
                      <div className="text-[10px] text-text-muted opacity-0 group-hover/bar:opacity-100 transition-opacity font-semibold">
                        ${Number(r.revenue).toLocaleString()}
                      </div>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-primary to-sky-500 transition-all hover:from-primary-dark hover:to-sky-600 cursor-pointer min-h-[4px]"
                        style={{ height: `${Math.max(pct, 2)}%` }}
                      />
                      <span className="text-[10px] text-text-muted font-medium">{months[monthLabel] || monthLabel}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-end gap-2 h-52">
                {[40, 65, 45, 80, 55, 90, 70, 60, 85, 50, 75, 95].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-primary/15 to-sky-400/15" style={{ height: `${h}%` }} />
                    <span className="text-[10px] text-text-muted">{['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Agents */}
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/10">
          <div className="px-6 py-5 border-b border-outline-variant/10">
            <h3 className="font-headline font-bold text-on-background text-lg">Top Agentes</h3>
            <p className="text-xs text-text-muted mt-0.5">Por ingresos generados</p>
          </div>
          <div className="p-4 space-y-2">
            {topAgents.length === 0 && (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-3xl text-text-muted/20 block mb-2">support_agent</span>
                <p className="text-sm text-text-muted">Sin datos de agentes aún</p>
              </div>
            )}
            {topAgents.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low/60 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-sky-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {i < 3 ? <span className="text-lg">{medals[i]}</span> : <span>{i + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-background truncate">{a.displayName || 'Agente'}</p>
                  <p className="text-xs text-text-muted">{Number(a.totalOrders || 0)} ventas</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-on-background">${Number(a.totalRevenue || 0).toLocaleString()}</span>
                  <p className="text-[10px] text-emerald-600 font-medium">${Number(a.totalCommission || 0).toLocaleString()} com.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders + Pending Agents */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
            <div>
              <h3 className="font-headline font-bold text-on-background text-lg">Pedidos Recientes</h3>
              <p className="text-xs text-text-muted mt-0.5">Últimas órdenes del sistema</p>
            </div>
            <button className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
              Ver todos
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Pedido</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Agente</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Monto</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 && (
                  <tr><td colSpan="5" className="px-6 py-10 text-center">
                    <span className="material-symbols-outlined text-3xl text-text-muted/20 block mb-2">receipt_long</span>
                    <p className="text-sm text-text-muted">No hay pedidos aún</p>
                  </td></tr>
                )}
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-t border-outline-variant/5 hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="font-mono text-xs font-semibold text-primary">{o.orderNumber || o.id?.slice(0, 8)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-on-background text-sm">{o.customer?.firstName || 'Cliente'} {o.customer?.lastName || ''}</p>
                      <p className="text-xs text-text-muted">{o.customer?.email || ''}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-text-muted text-sm">
                      {o.agent ? `${o.agent.firstName || ''} ${o.agent.lastName || ''}`.trim() || '—' : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-on-background">${Number(o.total || 0).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[o.status] || 'bg-gray-100 text-gray-600'}`}>
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
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/10">
          <div className="px-6 py-5 border-b border-outline-variant/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline font-bold text-on-background text-lg">Solicitudes</h3>
                <p className="text-xs text-text-muted mt-0.5">Agentes pendientes</p>
              </div>
              {pendingAgents.length > 0 && (
                <span className="bg-secondary/10 text-secondary text-xs font-bold px-2.5 py-1 rounded-full">
                  {pendingAgents.length}
                </span>
              )}
            </div>
          </div>
          <div className="p-4 space-y-3">
            {pendingAgents.length === 0 && (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-3xl text-text-muted/20 block mb-2">how_to_reg</span>
                <p className="text-sm text-text-muted">No hay solicitudes pendientes</p>
              </div>
            )}
            {pendingAgents.map((a, i) => (
              <div key={a.id || i} className="p-4 rounded-xl border border-outline-variant/10 hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center text-secondary font-bold text-xs shrink-0">
                    {(a.firstName || a.fullName || '?')[0].toUpperCase()}{(a.lastName || '')[0]?.toUpperCase() || ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-background truncate">
                      {a.firstName && a.lastName ? `${a.firstName} ${a.lastName}` : a.fullName || 'Sin nombre'}
                    </p>
                    <p className="text-xs text-text-muted">{a.city || a.email || 'Sin información'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors">
                    Aprobar
                  </button>
                  <button className="flex-1 py-2 rounded-xl border border-outline-variant/20 text-text-muted text-xs font-bold hover:bg-surface-container-low transition-colors">
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commission Summary */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white">
            <span className="material-symbols-outlined text-white/50 text-2xl mb-3 block">account_balance</span>
            <p className="text-3xl font-extrabold font-headline">${Number(stats.totalTevraCommission ?? 0).toLocaleString()}</p>
            <p className="text-sm text-white/60 mt-1">Comisión TeVra</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
            <span className="material-symbols-outlined text-white/50 text-2xl mb-3 block">handshake</span>
            <p className="text-3xl font-extrabold font-headline">${Number(stats.totalAgentCommission ?? 0).toLocaleString()}</p>
            <p className="text-sm text-white/60 mt-1">Comisión Agentes</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
            <span className="material-symbols-outlined text-white/50 text-2xl mb-3 block">inventory_2</span>
            <p className="text-3xl font-extrabold font-headline">{stats.totalProducts ?? 0}</p>
            <p className="text-sm text-white/60 mt-1">Productos en Catálogo</p>
          </div>
        </div>
      )}
    </div>
  )
}
