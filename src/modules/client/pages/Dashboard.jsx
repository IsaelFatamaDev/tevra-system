import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../core/contexts/AuthContext'
import dashboardService from '../../admin/services/dashboard.service'

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-primary/10 text-primary',
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
  purchased_in_usa: 'Comprado en USA',
  in_transit: 'En tránsito',
  in_customs: 'En aduana',
  ready_for_delivery: 'Listo para entrega',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const trackingSteps = ['pending', 'confirmed', 'purchased_in_usa', 'in_transit', 'in_customs', 'ready_for_delivery', 'delivered']
const trackingLabels = ['Pendiente', 'Confirmado', 'Compra USA', 'En tránsito', 'Aduana', 'Listo', 'Entregado']

function getStepIndex(status) {
  const idx = trackingSteps.indexOf(status)
  return idx >= 0 ? idx : 0
}

export default function ClientDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardService.getMyOrders().catch(() => []),
      dashboardService.getMyProfile().catch(() => null),
    ]).then(([ordersRes, profileRes]) => {
      const list = ordersRes?.data || ordersRes?.items || (Array.isArray(ordersRes) ? ordersRes : [])
      setOrders(list)
      if (profileRes?.agent) setAgent(profileRes.agent)
    })
      .finally(() => setLoading(false))
  }, [])

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status))
  const completedCount = orders.filter(o => o.status === 'delivered').length
  const inTransitCount = orders.filter(o => ['shipped', 'in_transit', 'in_customs', 'purchased_in_usa', 'ready_for_delivery'].includes(o.status)).length
  const mainActiveOrder = activeOrders[0] || null

  return (
    <div className="space-y-8">
      {/* Hero Welcome + Agent Card */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col justify-center">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-primary mb-3 tracking-tight">
            ¡Hola, {user?.firstName}! 👋
          </h1>
          <p className="text-on-surface-variant text-lg max-w-xl">
            Bienvenido de nuevo a tu espacio en TeVra. Aquí tienes el estado de tus importaciones y compras.
          </p>
        </div>
        <div className="lg:col-span-4">
          <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col items-center text-center shadow-sm border-b-2 border-primary/5">
            <div className="relative mb-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                <span className="material-symbols-outlined text-3xl">support_agent</span>
              </div>
              <span className="absolute bottom-0 right-0 bg-mint text-white p-0.5 rounded-full text-[10px] flex items-center justify-center border-2 border-surface-container-low">
                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Tu Agente Asignado</span>
            <h3 className="font-headline text-lg font-bold text-primary mb-3">{agent ? `${agent.firstName} ${agent.lastName}` : 'Sin agente'}</h3>
            {agent?.whatsapp ? (
              <a href={`https://wa.me/${agent.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                className="w-full bg-[#25D366] text-white py-2.5 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-all shadow-md text-sm">
                <span className="material-symbols-outlined text-lg">chat</span>
                Preguntar por WhatsApp
              </a>
            ) : (
              <button className="w-full bg-[#25D366] text-white py-2.5 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-all shadow-md text-sm">
                <span className="material-symbols-outlined text-lg">chat</span>
                Preguntar por WhatsApp
              </button>
            )}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-text-muted">Cargando tus pedidos...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { title: 'Pedidos en camino', value: inTransitCount, icon: 'local_shipping', color: 'text-primary', bg: 'bg-primary/5' },
              { title: 'Total Pedidos', value: orders.length, icon: 'package_2', color: 'text-secondary', bg: 'bg-secondary/5' },
              { title: 'Completados', value: completedCount, icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map((s) => (
              <div key={s.title} className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${s.bg} rounded-full flex items-center justify-center`}>
                  <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
                </div>
                <div>
                  <p className="text-sm text-text-muted font-medium">{s.title}</p>
                  <p className="text-2xl font-bold text-primary font-headline">{s.value}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Active Order Tracking */}
          {mainActiveOrder && (
            <section>
              <h2 className="font-headline text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">track_changes</span>
                Pedido Activo
              </h2>
              <div className="bg-surface-container-low rounded-2xl overflow-hidden p-6 md:p-8 border border-primary/5">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-4xl text-text-muted/30">package_2</span>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                      <div>
                        <h3 className="font-headline text-lg font-bold text-primary">
                          {mainActiveOrder.orderNumber || `Pedido #${mainActiveOrder.id?.slice(0, 8)}`}
                        </h3>
                        <p className="text-sm text-text-muted">${Number(mainActiveOrder.total || 0).toLocaleString()} USD</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${statusColors[mainActiveOrder.status] || 'bg-surface-container-high text-text-muted'}`}>
                        {statusLabels[mainActiveOrder.status] || mainActiveOrder.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {mainActiveOrder.status !== 'cancelled' && (
                      <div className="mb-4">
                        <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.max((getStepIndex(mainActiveOrder.status) / (trackingSteps.length - 1)) * 100, 5)}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-2">
                          {trackingLabels.map((label, idx) => (
                            <span
                              key={label}
                              className={`text-[10px] font-medium transition-colors ${idx <= getStepIndex(mainActiveOrder.status) ? 'text-primary font-semibold' : 'text-text-muted/50'}`}
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {mainActiveOrder.estimatedDeliveryDate && (
                      <p className="text-xs text-text-muted">
                        Entrega estimada: <span className="font-semibold text-primary">{new Date(mainActiveOrder.estimatedDeliveryDate).toLocaleDateString('es-PE')}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Order items preview */}
                {mainActiveOrder.items?.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-outline-variant/10">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Artículos del pedido</p>
                    <div className="flex flex-wrap gap-3">
                      {mainActiveOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2 shadow-sm">
                          {item.productImage ? (
                            <img src={item.productImage} alt={item.productName} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                              <span className="material-symbols-outlined text-text-muted/30 text-lg">image</span>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-on-background">{item.productName}</p>
                            <p className="text-[10px] text-text-muted">x{item.quantity} · ${Number(item.unitPrice || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Other Active Orders */}
          {activeOrders.length > 1 && (
            <section>
              <h2 className="font-headline text-lg font-bold text-primary mb-4">Otros Pedidos Activos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeOrders.slice(1, 5).map((o) => (
                  <div key={o.id} className="bg-white rounded-xl p-4 shadow-sm border border-outline-variant/10 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-semibold text-primary">{o.orderNumber || o.id?.slice(0, 8)}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[o.status] || 'bg-surface-container-high text-text-muted'}`}>
                        {statusLabels[o.status] || o.status}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-on-background">${Number(o.total || 0).toLocaleString()}</p>
                    <p className="text-xs text-text-muted mt-1">{o.createdAt ? new Date(o.createdAt).toLocaleDateString('es-PE') : ''}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {activeOrders.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-text-muted/20 block mb-3">package_2</span>
              <h3 className="font-headline text-lg font-bold text-on-background mb-1">No tienes pedidos activos</h3>
              <p className="text-sm text-text-muted mb-4">Contacta a tu agente para hacer tu primera compra</p>
              <button className="px-6 py-2.5 bg-[#25D366] text-white rounded-xl font-semibold text-sm hover:bg-[#20bd5a] transition-colors inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">chat</span>
                Escribir a mi agente
              </button>
            </div>
          )}

          {/* Order History */}
          <section className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
              <div>
                <h3 className="font-headline font-bold text-on-background text-lg">Historial de Pedidos</h3>
                <p className="text-xs text-text-muted mt-0.5">{orders.length} pedidos en total</p>
              </div>
            </div>
            {orders.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-text-muted/20 block mb-2">receipt_long</span>
                <p className="text-sm text-text-muted">Aún no tienes pedidos</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-container-low/50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Pedido</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">Fecha</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Monto</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-t border-outline-variant/5 hover:bg-surface-container-low/30 transition-colors">
                        <td className="px-6 py-3.5">
                          <span className="font-mono text-xs font-semibold text-primary">{o.orderNumber || o.id?.slice(0, 8)}</span>
                          {o.items?.[0]?.productName && (
                            <p className="text-xs text-text-muted mt-0.5 truncate max-w-[200px]">{o.items[0].productName}{o.items.length > 1 ? ` +${o.items.length - 1} más` : ''}</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-text-muted hidden sm:table-cell">{o.createdAt ? new Date(o.createdAt).toLocaleDateString('es-PE') : '—'}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-on-background">${Number(o.total || 0).toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[o.status] || 'bg-surface-container-high text-text-muted'}`}>
                            {statusLabels[o.status] || o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: 'location_on', label: 'Mis Direcciones', desc: 'Gestiona tus direcciones de envío', to: '/mi-cuenta/direcciones' },
              { icon: 'credit_card', label: 'Métodos de Pago', desc: 'Administra tus métodos de pago', to: null },
              { icon: 'lock', label: 'Seguridad', desc: 'Contraseña y verificación', to: '/mi-cuenta/seguridad' },
            ].map((c, i) => c.to ? (
              <Link key={i} to={c.to} className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/10 hover:shadow-md transition-all text-left flex items-center gap-4 group no-underline">
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-primary">{c.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-background">{c.label}</p>
                  <p className="text-xs text-text-muted">{c.desc}</p>
                </div>
                <span className="material-symbols-outlined text-text-muted/30 ml-auto">chevron_right</span>
              </Link>
            ) : (
              <button key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/10 hover:shadow-md transition-all text-left flex items-center gap-4 group opacity-60 cursor-default">
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">{c.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-background">{c.label}</p>
                  <p className="text-xs text-text-muted">Próximamente</p>
                </div>
                <span className="material-symbols-outlined text-text-muted/30 ml-auto">chevron_right</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
