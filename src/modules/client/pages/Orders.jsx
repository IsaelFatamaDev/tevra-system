import { useState, useEffect } from 'react'
import dashboardService from '../../admin/services/dashboard.service'

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

export default function ClientOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    dashboardService.getMyOrders()
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
    if (filter === 'cancelled') return o.status === 'cancelled'
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-gray-900">Mis Pedidos</h1>
        <p className="text-sm text-gray-500 mt-1">Historial completo de tus importaciones</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'Todos' },
          { value: 'active', label: 'Activos' },
          { value: 'completed', label: 'Entregados' },
          { value: 'cancelled', label: 'Cancelados' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f.value ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 block mb-3">package_2</span>
          <h3 className="font-headline text-lg font-bold text-gray-900 mb-1">Sin pedidos</h3>
          <p className="text-sm text-gray-500">Aún no tienes pedidos registrados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-headline font-bold text-gray-900">
                    {order.orderNumber || `Pedido #${order.id?.slice(0, 8)}`}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-900">${parseFloat(order.total || 0).toLocaleString()} USD</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              </div>

              {order.items?.length > 0 && (
                <div className="border-t border-gray-100 pt-3 flex flex-wrap gap-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productName} className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-400 text-sm">image</span>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{item.productName}</p>
                        <p className="text-[10px] text-gray-500">x{item.quantity} · ${parseFloat(item.unitPrice || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {order.trackingNumber && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                  <span className="material-symbols-outlined text-sm">local_shipping</span>
                  Tracking: <span className="font-mono font-semibold text-gray-900">{order.trackingNumber}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
