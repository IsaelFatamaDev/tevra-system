import { useState, useEffect } from 'react'
import dashboardService from '../../admin/services/dashboard.service'
import ordersService from '../../admin/services/orders.service'
import Pagination from '../../../core/components/Pagination'
import generateBoleta from '../../../core/utils/generateBoleta'

const ITEMS_PER_PAGE = 10

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-primary/10 text-primary',
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

export default function AgentOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [viewOrder, setViewOrder] = useState(null)

  const handleViewOrder = async (order) => {
    try {
      const detail = await ordersService.findOne(order.id)
      setViewOrder(detail)
    } catch {
      setViewOrder(order)
    }
  }

  useEffect(() => {
    dashboardService.getAgentOrders()
      .then(data => {
        const list = data?.items || data?.data || (Array.isArray(data) ? data : [])
        setOrders(list)
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter(o => {
    if (filter === 'active') return !['delivered', 'cancelled'].includes(o.status)
    if (filter === 'completed') return o.status === 'delivered'
    return true
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0)

  return (
    <div className="space-y-6 platform-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-background">Mis Pedidos</h1>
          <p className="text-sm text-text-muted mt-1">Gestiona todos los pedidos de tus clientes</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Pedidos', value: orders.length, icon: 'package_2' },
          { label: 'Activos', value: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length, icon: 'pending_actions' },
          { label: 'Ingresos', value: `$${totalRevenue.toLocaleString()}`, icon: 'payments' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-outline-variant/30 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-text-muted text-lg">{s.icon}</span>
              <span className="text-xs text-text-muted font-medium">{s.label}</span>
            </div>
            <p className="text-xl font-bold text-on-background">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'Todos' },
          { value: 'active', label: 'Activos' },
          { value: 'completed', label: 'Entregados' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f.value ? 'bg-primary text-white' : 'bg-white text-text-muted hover:bg-surface-container-high border border-outline-variant'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs bg-surface-container-low">
                  <th className="text-left px-5 py-3 font-medium">Pedido</th>
                  <th className="text-left px-3 py-3 font-medium">Cliente</th>
                  <th className="text-left px-3 py-3 font-medium">Productos</th>
                  <th className="text-left px-3 py-3 font-medium">Fecha</th>
                  <th className="text-right px-3 py-3 font-medium">Monto</th>
                  <th className="text-center px-3 py-3 font-medium">Estado</th>
                  <th className="text-center px-3 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="7" className="px-5 py-8 text-center text-text-muted">Sin pedidos encontrados</td></tr>
                ) : paginated.map(o => (
                  <tr key={o.id} className="border-t border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-5 py-3">
                      <button onClick={() => handleViewOrder(o)} className="font-mono text-xs text-primary font-medium hover:underline">
                        {o.orderNumber || o.id?.slice(0, 8)}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-on-background text-sm">{o.customer?.firstName || 'Cliente'} {o.customer?.lastName || ''}</p>
                      <p className="text-text-muted text-xs">{o.customer?.email || ''}</p>
                    </td>
                    <td className="px-3 py-3 text-text-muted text-xs">{o.items?.length || 0} items</td>
                    <td className="px-3 py-3 text-text-muted text-xs">{o.createdAt ? new Date(o.createdAt).toLocaleDateString('es-PE') : '—'}</td>
                    <td className="px-3 py-3 text-right font-semibold text-on-background">${parseFloat(o.total || 0).toLocaleString()}</td>
                    <td className="text-center px-3 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[o.status] || 'bg-surface-container-high text-text-muted'}`}>
                        {statusLabels[o.status] || o.status}
                      </span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleViewOrder(o)} title="Ver detalle"
                          className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-[18px] text-text-muted hover:text-primary">visibility</span>
                        </button>
                        {o.customer?.phone && (
                          <a href={`https://wa.me/${o.customer.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp"
                            className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[18px] text-emerald-600">chat</span>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
        </div>
      )}

      {/* Order Detail Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-on-background font-headline">Pedido {viewOrder.orderNumber}</h3>
                <p className="text-xs text-text-muted mt-0.5">{viewOrder.createdAt ? new Date(viewOrder.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[viewOrder.status] || 'bg-surface-container-high text-text-muted'}`}>
                  {statusLabels[viewOrder.status] || viewOrder.status}
                </span>
                <button onClick={() => setViewOrder(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <span className="material-symbols-outlined text-text-muted">close</span>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Client Info */}
              <div className="bg-surface-container-low rounded-xl p-4">
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-2">Datos del Cliente</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-text-muted text-xs">Nombre</p>
                    <p className="font-semibold text-on-background">{viewOrder.customer?.firstName || '—'} {viewOrder.customer?.lastName || ''}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs">Email</p>
                    <p className="font-semibold text-on-background">{viewOrder.customer?.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs">Teléfono</p>
                    <p className="font-semibold text-on-background">{viewOrder.customer?.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs">Dirección</p>
                    <p className="font-semibold text-on-background">
                      {typeof viewOrder.shippingAddress === 'object' && viewOrder.shippingAddress !== null
                        ? [viewOrder.shippingAddress.street, viewOrder.shippingAddress.district, viewOrder.shippingAddress.city, viewOrder.shippingAddress.country].filter(Boolean).join(', ')
                        : viewOrder.shippingAddress || viewOrder.customer?.address || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Products */}
              {viewOrder.items?.length > 0 && (
                <div>
                  <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-2">Productos</p>
                  <div className="space-y-2">
                    {viewOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
                        {item.productImage ? (
                          <img src={item.productImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
                            <span className="material-symbols-outlined text-text-muted text-lg">image</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-on-background truncate">{item.productName || 'Producto'}</p>
                          <p className="text-xs text-text-muted">${Number(item.unitPrice || 0).toFixed(2)} × {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-on-background">${Number(item.totalPrice || 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial Summary */}
              <div className="bg-surface-container-low rounded-xl p-4">
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-3">Resumen Financiero</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-text-muted">Subtotal</span><span className="font-semibold">${Number(viewOrder.subtotal || 0).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Envío</span><span className="font-semibold">${Number(viewOrder.shippingCost || 0).toFixed(2)}</span></div>
                  <div className="flex justify-between border-t border-outline-variant pt-2 mt-2"><span className="font-bold text-on-background">Total</span><span className="font-bold text-primary text-lg">${Number(viewOrder.total || 0).toFixed(2)}</span></div>
                  {viewOrder.agentCommission != null && (
                    <div className="flex justify-between text-emerald-600"><span className="font-medium">Tu Comisión</span><span className="font-bold">${Number(viewOrder.agentCommission || 0).toFixed(2)}</span></div>
                  )}
                </div>
              </div>

              {viewOrder.estimatedDeliveryDate && (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                  Entrega estimada: <span className="font-semibold text-on-background">{new Date(viewOrder.estimatedDeliveryDate).toLocaleDateString('es-PE')}</span>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => generateBoleta(viewOrder)}
                className="px-4 py-2 text-sm font-bold text-primary bg-primary/10 hover:bg-primary/10 rounded-lg flex items-center gap-1.5 transition-colors">
                <span className="material-symbols-outlined text-[18px]">receipt_long</span> Generar Boleta
              </button>
              {viewOrder.customer?.phone && (
                <a href={`https://wa.me/${viewOrder.customer.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1.5 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">chat</span> WhatsApp
                </a>
              )}
              <button onClick={() => setViewOrder(null)} className="px-4 py-2 text-sm font-bold text-text-muted hover:bg-gray-50 rounded-lg transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
