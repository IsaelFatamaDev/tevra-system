import { useState, useEffect } from 'react'
import { useAuth } from '../../../core/contexts/AuthContext'
import dashboardService from '../../admin/services/dashboard.service'
import api from '../../../core/services/api'

const statusTags = {
  pending: { label: 'Pendiente', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmado', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  purchased_in_usa: { label: 'Comprado USA', classes: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  in_transit: { label: 'En Tránsito', classes: 'bg-violet-50 text-violet-700 border-violet-200' },
  in_customs: { label: 'Aduana', classes: 'bg-orange-50 text-orange-700 border-orange-200' },
  ready_for_delivery: { label: 'Listo Entrega', classes: 'bg-teal-50 text-teal-700 border-teal-200' },
  delivered: { label: 'Entregado', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelado', classes: 'bg-red-50 text-red-700 border-red-200' },
}

export default function AgentDashboard() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [orders, setOrders] = useState([])
  const [commissions, setCommissions] = useState([])
  const [commissionSummary, setCommissionSummary] = useState({ totalEarned: 0, totalPaid: 0, totalPending: 0, count: 0 })
  const [agentProfile, setAgentProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderForm, setOrderForm] = useState({ customerEmail: '', productName: '', productLink: '', quantity: 1, unitPrice: '', notes: '' })
  const [orderSaving, setOrderSaving] = useState(false)
  const [orderErrors, setOrderErrors] = useState({})
  const [orderMsg, setOrderMsg] = useState(null)

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

  const validateOrder = () => {
    const e = {}
    if (!orderForm.customerEmail.trim()) e.customerEmail = 'Email requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderForm.customerEmail)) e.customerEmail = 'Email inválido'
    if (!orderForm.productName.trim()) e.productName = 'Nombre requerido'
    if (!orderForm.unitPrice || isNaN(orderForm.unitPrice) || Number(orderForm.unitPrice) <= 0) e.unitPrice = 'Precio inválido'
    if (!orderForm.quantity || Number(orderForm.quantity) < 1) e.quantity = 'Mín. 1'
    setOrderErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreateOrder = async () => {
    if (!validateOrder()) return
    setOrderSaving(true)
    setOrderMsg(null)
    try {
      const users = await api.get(`/users?email=${encodeURIComponent(orderForm.customerEmail)}`)
      const customerList = users?.items || (Array.isArray(users) ? users : [])
      const customer = customerList.find(u => u.email === orderForm.customerEmail)
      if (!customer) {
        setOrderMsg({ type: 'error', text: 'El email proveído no pertenece a un cliente registrado.' })
        setOrderSaving(false)
        return
      }
      await api.post('/orders', {
        customerId: customer.id,
        agentId: agentProfile?.id || undefined,
        items: [{
          productName: orderForm.productName,
          quantity: Number(orderForm.quantity),
          unitPrice: Number(orderForm.unitPrice),
        }],
        notes: orderForm.notes || undefined,
        productLink: orderForm.productLink || undefined,
      })
      setShowOrderModal(false)
      setOrderForm({ customerEmail: '', productName: '', productLink: '', quantity: 1, unitPrice: '', notes: '' })
      setOrderMsg(null)
      const ordersRes = await dashboardService.getAgentOrders().catch(() => [])
      const orderList = ordersRes?.data || (Array.isArray(ordersRes) ? ordersRes : [])
      setOrders(orderList)
    } catch (err) {
      setOrderMsg({ type: 'error', text: err.message || 'Error grave al registrar pedido.' })
    } finally {
      setOrderSaving(false)
    }
  }

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0)

  return (
    <div className="space-y-8 platform-enter max-w-7xl mx-auto pb-10">
      
      {/* Hero / Profile Header - Premium */}
      <div className="relative overflow-hidden rounded-[2rem] p-8 sm:p-10 text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-800"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.15)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.1)_0%,transparent_60%)]" />
        </div>
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 z-10 text-center md:text-left">
          
          <div className="w-24 h-24 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-4xl font-extrabold shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-headline font-extrabold tracking-tight mb-1">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-slate-400 font-medium tracking-wide flex items-center justify-center md:justify-start gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Socio TeVra Oficial
            </p>
            <div className="flex items-center justify-center md:justify-start gap-5">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                <span className="material-symbols-outlined text-sky-400 text-[20px]">package_2</span>
                <span className="font-bold">{orders.length} <span className="text-slate-400 font-medium ml-1">pedidos</span></span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                <span className="material-symbols-outlined text-emerald-400 text-[20px]">account_balance_wallet</span>
                <span className="font-bold">{commissions.length} <span className="text-slate-400 font-medium ml-1">ganancias</span></span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button onClick={() => { setShowOrderModal(true); setOrderMsg(null); setOrderErrors({}) }}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-slate-900 rounded-2xl font-bold transition-all hover:bg-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
              Nuevo Pedido
            </button>
            <a href="https://wa.me/50370001234" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25d366]/20 text-[#25d366] hover:bg-[#25d366] hover:text-white rounded-2xl font-bold transition-all border border-[#25d366]/30">
              <span className="material-symbols-outlined text-[20px]">chat</span>
               Chat Sorporte
            </a>
          </div>
        </div>
      </div>

      {/* Analytics & Referral Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         <div className="lg:col-span-2 grid grid-cols-2 gap-4 sm:gap-6">
            {[
              { label: 'Ventas Globales', value: `$${totalRevenue.toLocaleString()}`, icon: 'monitoring', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
              { label: 'Ingresos Netos', value: `$${Number(commissionSummary.totalEarned || 0).toLocaleString()}`, icon: 'account_balance_wallet', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
              { label: 'Importaciones', value: orders.length, icon: 'inventory_2', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
              { label: 'Por Cobrar', value: `$${Number(commissionSummary.totalPending || 0).toLocaleString()}`, icon: 'schedule', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all">
                <div className={`w-12 h-12 rounded-2xl ${s.bg} border flex items-center justify-center mb-4`}>
                  <span className={`material-symbols-outlined text-2xl ${s.color}`}>{s.icon}</span>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight">{s.value}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
         </div>

         <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                 <span className="material-symbols-outlined text-slate-800">share</span>
              </span>
              <h3 className="font-headline font-bold text-slate-900 text-lg">Crecimiento</h3>
            </div>
            <p className="text-sm text-slate-500 font-medium mb-6">Comparte tu clave de afiliado exclusiva y aumenta tus clientes pasivos cada mes.</p>
            
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 flex-1 flex items-center justify-center">
               <span className="font-mono text-slate-800 font-bold overflow-hidden text-ellipsis whitespace-nowrap px-2 text-sm">{referralLink}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto">
               <button onClick={handleCopyLink} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">{copied ? 'check_circle' : 'content_copy'}</span>
                  {copied ? 'Copiado' : 'Copiar'}
               </button>
               <button onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(`¡Importa seguro conmigo en TeVra! 👉 ${referralLink}`)}`, '_blank') }} 
                   className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#25d366]/10 text-[#1da851] font-bold text-xs hover:bg-[#25d366]/20 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  WhatsApp
               </button>
            </div>
         </div>
      </div>

      {/* Orders List & Recent Commissions */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 rounded-full border-4 border-slate-200 border-t-slate-800" /></div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 pt-4">
          
          {/* Active Orders Quick-View */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white">
              <div>
                 <h3 className="font-headline font-extrabold text-slate-900 text-lg">En Operación</h3>
                 <p className="text-xs text-slate-400 font-medium mt-1">Registros de pedidos para tus clientes</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pedido ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">Comprador</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Monto</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Progreso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.length === 0 ? (
                    <tr><td colSpan="4" className="px-8 py-10 text-center text-slate-400">Todo limpio. No hay importaciones.</td></tr>
                  ) : orders.slice(0, 6).map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 font-headline text-sm font-bold text-slate-900">
                         {o.orderNumber || o.id?.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                         <p className="font-bold text-slate-800">{o.customer?.firstName} {o.customer?.lastName}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <span className="font-extrabold text-slate-900">${parseFloat(o.total || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-4 flex justify-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[10px] font-bold border ${statusTags[o.status]?.classes || 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                          {statusTags[o.status]?.label || o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Commissions Viewer */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-headline font-extrabold text-slate-900 text-lg">Comisiones</h3>
              <span className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">{commissions.length}</span>
            </div>
            <div className="p-6 space-y-3 flex-1 overflow-y-auto">
              {commissions.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-10">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">receipt_long</span>
                    <p className="text-sm">Tus registros aparecerán aquí.</p>
                 </div>
              )}
              {commissions.slice(0, 5).map((c, i) => (
                <div key={c.id || i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-lg font-extrabold text-slate-900">${parseFloat(c.amount || 0).toLocaleString()}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${
                      c.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                      c.status === 'approved' ? 'bg-sky-100 text-sky-800' :
                      c.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                    {c.status === 'paid' ? 'Pagada' : c.status === 'approved' ? 'Aprobada' : c.status === 'cancelled' ? 'Anulada' : 'Espera'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowOrderModal(false)} />
          <div className="relative bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cierre de Venta</p>
                 <h3 className="text-xl font-extrabold text-slate-900 font-headline">Nueva Cotización</h3>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-400">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto no-scrollbar">
               {orderMsg && (
                 <div className={`mb-6 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border ${orderMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                   <span className="material-symbols-outlined">{orderMsg.type === 'success' ? 'check_circle' : 'gpp_bad'}</span>
                   {orderMsg.text}
                 </div>
               )}
               <div className="space-y-5">
                 <div>
                   <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Correo del Cliente</label>
                   <input value={orderForm.customerEmail} onChange={e => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                     className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm font-medium ${orderErrors.customerEmail ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-slate-900/5 focus:border-slate-900'} outline-none focus:ring-4 transition-all`} placeholder="usuario@email.com" />
                   {orderErrors.customerEmail && <p className="text-[11px] text-red-500 font-bold mt-1.5">{orderErrors.customerEmail}</p>}
                 </div>
                 
                 <div>
                   <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Artículo</label>
                   <input value={orderForm.productName} onChange={e => setOrderForm({ ...orderForm, productName: e.target.value })}
                     className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm font-medium ${orderErrors.productName ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-slate-900/5 focus:border-slate-900'} outline-none focus:ring-4 transition-all`} placeholder="MacBook Pro M3..." />
                   {orderErrors.productName && <p className="text-[11px] text-red-500 font-bold mt-1.5">{orderErrors.productName}</p>}
                 </div>

                 <div className="grid grid-cols-2 gap-5">
                   <div>
                     <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Cantidad</label>
                     <input type="number" min="1" value={orderForm.quantity} onChange={e => setOrderForm({ ...orderForm, quantity: e.target.value })}
                       className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm font-medium ${orderErrors.quantity ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-slate-900/5 focus:border-slate-900'} outline-none focus:ring-4 transition-all`} />
                     {orderErrors.quantity && <p className="text-[11px] text-red-500 font-bold mt-1.5">{orderErrors.quantity}</p>}
                   </div>
                   <div>
                     <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">P. Unitario USD</label>
                     <input type="number" min="0" step="0.01" value={orderForm.unitPrice} onChange={e => setOrderForm({ ...orderForm, unitPrice: e.target.value })}
                       className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm font-medium ${orderErrors.unitPrice ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-slate-900/5 focus:border-slate-900'} outline-none focus:ring-4 transition-all`} placeholder="0.00" />
                     {orderErrors.unitPrice && <p className="text-[11px] text-red-500 font-bold mt-1.5">{orderErrors.unitPrice}</p>}
                   </div>
                 </div>
                 
                 <div>
                   <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Enlace de Compra Alterno</label>
                   <input value={orderForm.productLink} onChange={e => setOrderForm({ ...orderForm, productLink: e.target.value })}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-slate-900/5 focus:border-slate-900 outline-none focus:ring-4 transition-all" placeholder="https://amazon.com/..." />
                 </div>
                 
                 <div>
                   <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contexto o Notas</label>
                   <textarea value={orderForm.notes} onChange={e => setOrderForm({ ...orderForm, notes: e.target.value })}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-slate-900/5 focus:border-slate-900 outline-none focus:ring-4 transition-all resize-none" rows="2" placeholder="Especificaciones, color exacto..."></textarea>
                 </div>
               </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 flex gap-4 bg-white shrink-0">
               <button onClick={() => setShowOrderModal(false)} className="flex-1 py-4 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors">Cancelar</button>
               <button onClick={handleCreateOrder} disabled={orderSaving} className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                 {orderSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[20px]">add_task</span>}
                 Generar Factura
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
