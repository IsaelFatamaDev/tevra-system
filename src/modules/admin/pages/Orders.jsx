import { useState, useEffect } from 'react'
import ordersService from '../services/orders.service'

const STATUS_CONFIG = {
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Entregado' },
  in_transit: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500', label: 'En Tránsito' },
  purchased_in_usa: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500', label: 'Comprado USA' },
  confirmed: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Confirmado' },
  pending: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', label: 'Pendiente' },
  in_customs: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', label: 'En Aduana' },
  ready_for_delivery: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500', label: 'Listo Entrega' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Cancelado' },
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewOrder, setViewOrder] = useState(null)
  const [statusModal, setStatusModal] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchOrders = () => {
    setLoading(true)
    ordersService.findAll()
      .then(data => setOrders(Array.isArray(data) ? data : data?.items || []))
      .catch(err => console.error('Error fetching orders', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    const matchSearch = !q || (o.orderNumber || '').toLowerCase().includes(q) ||
      `${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`.toLowerCase().includes(q)
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleUpdateStatus = async () => {
    if (!statusModal || !newStatus || newStatus === statusModal.status) return
    setSaving(true)
    try {
      await ordersService.updateStatus(statusModal.id, newStatus)
      fetchOrders()
      setStatusModal(null)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total || 0), 0)
  const metrics = [
    { label: 'Total Pedidos', value: orders.length, icon: 'shopping_cart', color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Ingresos', value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: 'payments', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Entregados', value: orders.filter(o => o.status === 'delivered').length, icon: 'check_circle', color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'En Camino', value: orders.filter(o => ['in_transit', 'in_customs', 'purchased_in_usa'].includes(o.status)).length, icon: 'local_shipping', color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-headline tracking-tight">Gestión de Pedidos</h2>
          <p className="text-sm text-gray-500 mt-1">Monitorea el ciclo de vida de los envíos.</p>
        </div>
        <button className="bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 text-sm">
          <span className="material-symbols-outlined text-[18px]">download</span> Exportar
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${m.bg} ${m.color} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-[20px]">{m.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{m.label}</p>
              <p className="text-lg font-black text-gray-900 font-headline">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por # pedido o cliente..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setStatusFilter('')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${!statusFilter ? 'bg-sky-600 text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
              Todos
            </button>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button key={key} onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${statusFilter === key ? `${cfg.bg} ${cfg.text} ring-1 ring-current` : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-[3px] border-sky-200 border-t-sky-600 rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-gray-300">inbox</span>
            <p className="text-sm text-gray-400 mt-2">No se encontraron pedidos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Pedido</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(ord => {
                  const st = STATUS_CONFIG[ord.status] || STATUS_CONFIG.pending
                  const customerName = ord.customer ? `${ord.customer.firstName} ${ord.customer.lastName}` : '—'
                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-5 py-3.5"><span className="text-sm font-bold text-sky-700">{ord.orderNumber || ord.id?.slice(0, 8)}</span></td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-gray-800">{customerName}</p>
                        <p className="text-xs text-gray-400">{ord.customer?.email || ''}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td className="px-5 py-3.5 text-sm font-bold text-gray-800">${Number(ord.total || 0).toFixed(2)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${st.bg} ${st.text} text-[11px] font-bold rounded-full`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setViewOrder(ord)} title="Ver detalle"
                            className="p-1.5 rounded-lg hover:bg-sky-50 text-gray-400 hover:text-sky-600 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button onClick={() => { setStatusModal(ord); setNewStatus(ord.status) }} title="Cambiar estado"
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">sync</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-400">
            Mostrando <span className="font-bold text-gray-600">{filtered.length}</span> de <span className="font-bold text-gray-600">{orders.length}</span> pedidos
          </span>
        </div>
      </div>

      {/* View Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 font-headline">Pedido {viewOrder.orderNumber}</h3>
              <button onClick={() => setViewOrder(null)} className="p-1 hover:bg-gray-100 rounded-lg"><span className="material-symbols-outlined text-gray-400">close</span></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-[11px] text-gray-400 font-semibold mb-0.5">Cliente</p><p className="font-bold text-gray-800">{viewOrder.customer?.firstName} {viewOrder.customer?.lastName}</p></div>
                <div><p className="text-[11px] text-gray-400 font-semibold mb-0.5">Agente</p><p className="font-bold text-gray-800">{viewOrder.agent?.firstName || '—'} {viewOrder.agent?.lastName || ''}</p></div>
                <div><p className="text-[11px] text-gray-400 font-semibold mb-0.5">Subtotal</p><p className="font-bold">${Number(viewOrder.subtotal || 0).toFixed(2)}</p></div>
                <div><p className="text-[11px] text-gray-400 font-semibold mb-0.5">Envío</p><p className="font-bold">${Number(viewOrder.shippingCost || 0).toFixed(2)}</p></div>
                <div><p className="text-[11px] text-gray-400 font-semibold mb-0.5">Total</p><p className="font-bold text-sky-700 text-lg">${Number(viewOrder.total || 0).toFixed(2)}</p></div>
                <div><p className="text-[11px] text-gray-400 font-semibold mb-0.5">Entrega estimada</p><p className="font-bold">{viewOrder.estimatedDeliveryDate ? new Date(viewOrder.estimatedDeliveryDate).toLocaleDateString('es-PE') : '—'}</p></div>
              </div>
              {viewOrder.items?.length > 0 && (
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold mb-2">Productos</p>
                  <div className="space-y-2">
                    {viewOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                        {item.productImage && <img src={item.productImage} alt="" className="w-8 h-8 rounded object-cover" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{item.productName}</p>
                          <p className="text-xs text-gray-400">x{item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold">${Number(item.totalPrice || 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 font-headline">Cambiar Estado</h3>
              <p className="text-sm text-gray-400 mt-0.5">Pedido {statusModal.orderNumber}</p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button key={key} onClick={() => setNewStatus(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all border ${newStatus === key ? `${cfg.bg} ${cfg.text} border-current` : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}>
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setStatusModal(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleUpdateStatus} disabled={saving || newStatus === statusModal.status}
                className="px-4 py-2 text-sm font-bold bg-sky-600 text-white rounded-lg hover:bg-sky-500 disabled:opacity-40 transition-colors">
                {saving ? 'Guardando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
