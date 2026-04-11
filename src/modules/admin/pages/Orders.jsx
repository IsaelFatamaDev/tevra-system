import { useState, useEffect, useCallback } from 'react'
import ordersService from '../services/orders.service'
import Pagination from '../../../core/components/Pagination'
import generateBoleta from '../../../core/utils/generateBoleta'

const ITEMS_PER_PAGE = 10

const STATUS_CONFIG = {
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Entregado' },
  in_transit: { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary', label: 'En Tránsito' },
  purchased_in_usa: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500', label: 'Comprado USA' },
  confirmed: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Confirmado' },
  pending: { bg: 'bg-surface-container-low', text: 'text-text-muted', dot: 'bg-outline', label: 'Pendiente' },
  in_customs: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', label: 'En Aduana' },
  ready_for_delivery: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500', label: 'Listo Entrega' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Cancelado' },
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [viewOrder, setViewOrder] = useState(null)
  const [statusModal, setStatusModal] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchOrders = useCallback(() => {
    setLoading(true)
    ordersService.findAll({ search: search || undefined, status: statusFilter || undefined })
      .then(data => {
        const list = Array.isArray(data) ? data : data?.items || []
        setOrders(list)
        setTotal(data?.total ?? list.length)
      })
      .catch(err => console.error('Error fetching orders', err))
      .finally(() => setLoading(false))
  }, [search, statusFilter])

  useEffect(() => {
    setPage(1)
    const t = setTimeout(fetchOrders, search ? 350 : 0)
    return () => clearTimeout(t)
  }, [search, statusFilter])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const paginated = orders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

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

  const handleExportCSV = () => {
    const headers = ['Pedido', 'Cliente', 'Email', 'Agente', 'Fecha', 'Estado', 'Total']
    const rows = orders.map(o => [
      o.orderNumber || '',
      `${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`.trim(),
      o.customer?.email || '',
      o.agent ? `${o.agent.user?.firstName || ''} ${o.agent.user?.lastName || ''}`.trim() : 'Directo',
      new Date(o.createdAt).toLocaleDateString(),
      o.status || '',
      Number(o.total || 0).toFixed(2),
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `pedidos_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const metrics = [
    { label: 'Total Pedidos', value: orders.length, icon: 'shopping_cart', color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Ingresos', value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: 'payments', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Entregados', value: orders.filter(o => o.status === 'delivered').length, icon: 'check_circle', color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'En Camino', value: orders.filter(o => ['in_transit', 'in_customs', 'purchased_in_usa'].includes(o.status)).length, icon: 'local_shipping', color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6 platform-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-on-background font-headline tracking-tight">Gestión de Pedidos</h2>
          <p className="text-sm text-text-muted mt-1">Monitorea el ciclo de vida de los envíos.</p>
        </div>
        <button onClick={handleExportCSV} className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 text-sm">
          <span className="material-symbols-outlined text-[18px]">download</span> Exportar
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-outline-variant/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-4 stat-card">
            <div className={`w-11 h-11 rounded-xl ${m.bg} ${m.color} flex items-center justify-center flex-shrink-0`}>
              <span className="material-symbols-outlined text-[22px]">{m.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{m.label}</p>
              <p className="text-xl font-black text-on-background font-headline">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-outline-variant/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-4 border-b border-outline-variant/10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por # pedido o cliente..."
              className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setStatusFilter('')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${!statusFilter ? 'bg-primary text-white shadow-sm' : 'bg-surface-container-low text-text-muted hover:bg-surface-container-high border border-outline-variant'}`}>
              Todos
            </button>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button key={key} onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${statusFilter === key ? `${cfg.bg} ${cfg.text} ring-1 ring-current` : 'bg-surface-container-low text-text-muted hover:bg-surface-container-high border border-outline-variant'}`}>
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-outline-variant">inbox</span>
            <p className="text-sm text-text-muted mt-2">No se encontraron pedidos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-[#f8fafc] text-[11px] font-bold text-text-muted uppercase tracking-wider border-b border-outline-variant/10">
                  <th className="px-5 py-3">Pedido</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/8">
                {paginated.map(ord => {
                  const st = STATUS_CONFIG[ord.status] || STATUS_CONFIG.pending
                  const customerName = ord.customer ? `${ord.customer.firstName} ${ord.customer.lastName}` : '—'
                  return (
                    <tr key={ord.id} className="hover:bg-surface-container-low/50 transition-colors group">
                      <td className="px-5 py-3.5"><span className="text-sm font-bold text-primary">{ord.orderNumber || ord.id?.slice(0, 8)}</span></td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-on-background">{customerName}</p>
                        <p className="text-xs text-text-muted">{ord.customer?.email || ''}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-text-muted">{ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td className="px-5 py-3.5 text-sm font-bold text-on-background">${Number(ord.total || 0).toFixed(2)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${st.bg} ${st.text} text-[11px] font-bold rounded-full`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setViewOrder(ord)} title="Ver detalle"
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button onClick={() => { setStatusModal(ord); setNewStatus(ord.status) }} title="Cambiar estado"
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-text-muted hover:text-amber-600 transition-colors">
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

        <div className="px-5 py-3 border-t border-outline-variant/10 bg-[#fafafa] flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-text-muted">
            Mostrando <span className="font-bold text-text-muted">{Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}-{Math.min(page * ITEMS_PER_PAGE, total)}</span> de <span className="font-bold text-text-muted">{total}</span> pedidos
          </span>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
        </div>
      </div>

      {/* View Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="text-lg font-bold text-on-background font-headline">Pedido {viewOrder.orderNumber}</h3>
              <button onClick={() => setViewOrder(null)} className="p-1 hover:bg-surface-container-high rounded-lg"><span className="material-symbols-outlined text-text-muted">close</span></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-[11px] text-text-muted font-semibold mb-0.5">Cliente</p><p className="font-bold text-on-background">{viewOrder.customer?.firstName} {viewOrder.customer?.lastName}</p></div>
                <div><p className="text-[11px] text-text-muted font-semibold mb-0.5">Agente</p><p className="font-bold text-on-background">{viewOrder.agent?.firstName || '—'} {viewOrder.agent?.lastName || ''}</p></div>
                <div><p className="text-[11px] text-text-muted font-semibold mb-0.5">Subtotal</p><p className="font-bold">${Number(viewOrder.subtotal || 0).toFixed(2)}</p></div>
                <div><p className="text-[11px] text-text-muted font-semibold mb-0.5">Envío</p><p className="font-bold">${Number(viewOrder.shippingCost || 0).toFixed(2)}</p></div>
                <div><p className="text-[11px] text-text-muted font-semibold mb-0.5">Total</p><p className="font-bold text-primary text-lg">${Number(viewOrder.total || 0).toFixed(2)}</p></div>
                <div><p className="text-[11px] text-text-muted font-semibold mb-0.5">Entrega estimada</p><p className="font-bold">{viewOrder.estimatedDeliveryDate ? new Date(viewOrder.estimatedDeliveryDate).toLocaleDateString('es-PE') : '—'}</p></div>
              </div>
              {viewOrder.items?.length > 0 && (
                <div>
                  <p className="text-[11px] text-text-muted font-semibold mb-2">Productos</p>
                  <div className="space-y-2">
                    {viewOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2.5 bg-surface-container-low rounded-lg">
                        {item.productImage && <img src={item.productImage} alt="" className="w-8 h-8 rounded object-cover" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{item.productName}</p>
                          <p className="text-xs text-text-muted">x{item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold">${Number(item.totalPrice || 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-outline-variant/30 flex justify-end gap-2">
              <button onClick={() => generateBoleta(viewOrder)}
                className="px-4 py-2 text-sm font-bold text-primary bg-primary/10 hover:bg-primary/10 rounded-lg flex items-center gap-1.5 transition-colors">
                <span className="material-symbols-outlined text-[18px]">receipt_long</span> Generar Boleta
              </button>
              <button onClick={() => setViewOrder(null)} className="px-4 py-2 text-sm font-bold text-text-muted hover:bg-surface-container-high rounded-lg transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-outline-variant/30">
              <h3 className="text-lg font-bold text-on-background font-headline">Cambiar Estado</h3>
              <p className="text-sm text-text-muted mt-0.5">Pedido {statusModal.orderNumber}</p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button key={key} onClick={() => setNewStatus(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all border ${newStatus === key ? `${cfg.bg} ${cfg.text} border-current` : 'border-outline-variant/30 text-text-muted hover:bg-surface-container-low'}`}>
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-outline-variant/30 flex justify-end gap-2">
              <button onClick={() => setStatusModal(null)} className="px-4 py-2 text-sm font-medium text-text-muted hover:bg-surface-container-high rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleUpdateStatus} disabled={saving || newStatus === statusModal.status}
                className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary disabled:opacity-40 transition-colors">
                {saving ? 'Guardando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
