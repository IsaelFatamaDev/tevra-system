import { useState, useEffect } from 'react'
import { useAuth } from '../../../core/contexts/AuthContext'
import dashboardService from '../../admin/services/dashboard.service'

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-sky-100 text-sky-700',
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
  purchased_in_usa: 'Comprado USA',
  in_transit: 'En tránsito',
  in_customs: 'Aduana',
  ready_for_delivery: 'Listo entrega',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export default function AgentDashboard() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [orders, setOrders] = useState([])
  const [commissions, setCommissions] = useState([])
  const [commissionSummary, setCommissionSummary] = useState({ totalEarned: 0, totalPaid: 0, totalPending: 0, count: 0 })
  const [agentProfile, setAgentProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const referralLink = `${window.location.origin}/ref/${agentProfile?.referralCode || user?.id?.slice(0, 8) || 'agent'}`

  useEffect(() => {
    Promise.all([
      dashboardService.getAgentOrders().catch(() => []),
      dashboardService.getMyCommissions().catch(() => ({ commissions: [], summary: {} })),
      dashboardService.getAgentProfile().catch(() => null),
    ]).then(([ordersRes, commissionsRes, profileRes]) => {
      const orderList = ordersRes?.data || (Array.isArray(ordersRes) ? ordersRes : [])
      setOrders(orderList)

      const cData = commissionsRes?.data || commissionsRes
      setCommissions(cData?.commissions || (Array.isArray(cData) ? cData : []))
      if (cData?.summary) setCommissionSummary(cData.summary)

      setAgentProfile(profileRes?.data || profileRes)
    }).finally(() => setLoading(false))
  }, [])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0)

  return (
    <div className="space-y-6">
      {/* Hero / Profile Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white"
        style={{ background: 'linear-gradient(135deg, #0a2540 0%, #1a1a2e 50%, #0d2137 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,214,143,0.12)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,107,107,0.08)_0%,transparent_50%)]" />
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center text-3xl font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-white/60 mt-1">Agente Verificado · Tevra</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">package_2</span>
                <span className="font-semibold">{orders.length}</span>
                <span className="text-white/50 text-sm">pedidos</span>
              </div>
              <div className="text-white/30">·</div>
              <span className="text-white/60 text-sm">{commissions.length} comisiones</span>
            </div>
          </div>
          <div className="flex gap-2">
            <a href="https://wa.me/50370001234" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#25d366] hover:bg-[#20bd5a] rounded-xl font-medium text-sm transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.624-1.467A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.588-5.932-1.609l-.425-.253-2.744.87.884-2.685-.276-.44A9.77 9.77 0 012.182 12c0-5.423 4.395-9.818 9.818-9.818S21.818 6.577 21.818 12s-4.395 9.818-9.818 9.818z" /></svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-white rounded-2xl p-5 border border-outline-variant/10 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-primary">link</span>
          <h3 className="font-semibold text-on-background">Tu Link de Referido</h3>
        </div>
        <p className="text-sm text-text-muted mb-3">Comparte este enlace para que nuevos clientes se registren contigo</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-background font-mono truncate border border-outline-variant/10">
            {referralLink}
          </div>
          <button onClick={handleCopyLink}
            className="px-4 py-2.5 bg-primary rounded-xl text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">{copied ? 'check' : 'content_copy'}</span>
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25d366]/10 text-[#25d366] rounded-lg text-xs font-medium hover:bg-[#25d366]/20 transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
            WhatsApp
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600/10 text-sky-600 rounded-lg text-xs font-medium hover:bg-sky-600/20 transition-colors">
            <span className="material-symbols-outlined text-[14px]">share</span>
            Compartir
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Ventas Totales', value: `$${totalRevenue.toLocaleString()}`, icon: 'payments', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Comisiones Ganadas', value: `$${Number(commissionSummary.totalEarned || 0).toLocaleString()}`, icon: 'account_balance_wallet', color: 'text-amber-600 bg-amber-50' },
          { label: 'Total Pedidos', value: orders.length, icon: 'package_2', color: 'text-purple-600 bg-purple-50' },
          { label: 'Comisiones Pendientes', value: `$${Number(commissionSummary.totalPending || 0).toLocaleString()}`, icon: 'pending', color: 'text-sky-600 bg-sky-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-outline-variant/10 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
              <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
            </div>
            <p className="text-xl font-bold text-on-background">{s.value}</p>
            <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin w-8 h-8 rounded-full border-4 border-sky-500 border-t-transparent" /></div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Orders Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10">
              <h3 className="font-semibold text-on-background">Mis Pedidos</h3>
              <span className="text-xs text-text-muted bg-surface-container-low px-2.5 py-1 rounded-full">{orders.length} pedidos</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-muted text-xs bg-surface-container-low/50">
                    <th className="text-left px-5 py-3 font-medium">Pedido</th>
                    <th className="text-left px-3 py-3 font-medium">Cliente</th>
                    <th className="text-right px-3 py-3 font-medium">Monto</th>
                    <th className="text-center px-3 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 && (
                    <tr><td colSpan="4" className="px-5 py-6 text-center text-text-muted text-sm">No tienes pedidos aún</td></tr>
                  )}
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-outline-variant/5 hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-primary font-medium">{o.orderNumber || o.id?.slice(0, 8)}</td>
                      <td className="px-3 py-3 text-on-background">{o.customer?.firstName || 'Cliente'} {o.customer?.lastName || ''}</td>
                      <td className="px-3 py-3 text-right font-semibold text-on-background">${parseFloat(o.total || 0).toLocaleString()}</td>
                      <td className="text-center px-3 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[o.status] || 'bg-gray-100 text-gray-600'}`}>
                          {statusLabels[o.status] || o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Commissions Summary */}
          <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10">
              <h3 className="font-semibold text-on-background">Comisiones</h3>
              <span className="text-xs text-text-muted bg-surface-container-low px-2.5 py-1 rounded-full">{commissionSummary.count || commissions.length}</span>
            </div>
            <div className="p-4 space-y-3">
              {commissions.length === 0 && <p className="text-sm text-text-muted text-center py-4">Sin comisiones aún</p>}
              {commissions.slice(0, 5).map((c, i) => (
                <div key={c.id || i} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low/50">
                  <div>
                    <p className="text-sm font-semibold text-on-background">${parseFloat(c.amount || 0).toLocaleString()}</p>
                    <p className="text-xs text-text-muted">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                    c.status === 'approved' ? 'bg-blue-50 text-blue-700' :
                      c.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                    }`}>{c.status === 'paid' ? 'Pagada' : c.status === 'approved' ? 'Aprobada' : c.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
