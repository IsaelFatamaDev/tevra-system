import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import dashboardService from '../../admin/services/dashboard.service'

const statusClasses = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  purchased_in_usa: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  in_transit: 'bg-violet-50 text-violet-700 border-violet-200',
  in_customs: 'bg-orange-50 text-orange-700 border-orange-200',
  ready_for_delivery: 'bg-teal-50 text-teal-700 border-teal-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}

function getTimelineProgress(currentStatus) {
  if (currentStatus === 'cancelled') return -1;
  const passed = [];
  let found = false;

  if (['pending', 'confirmed', 'processing'].includes(currentStatus)) return 0;
  if (['purchased_in_usa', 'shipped'].includes(currentStatus)) return 1;
  if (['in_transit'].includes(currentStatus)) return 2;
  if (['in_customs'].includes(currentStatus)) return 3;
  if (['ready_for_delivery'].includes(currentStatus)) return 4;
  if (['delivered'].includes(currentStatus)) return 5;

  return 0;
}

export default function ClientOrders() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const statusTags = {
    pending: { label: t('client.orders.status.pending'), classes: statusClasses.pending },
    confirmed: { label: t('client.orders.status.confirmed'), classes: statusClasses.confirmed },
    processing: { label: t('client.orders.status.processing'), classes: statusClasses.processing },
    shipped: { label: t('client.orders.status.shipped'), classes: statusClasses.shipped },
    purchased_in_usa: { label: t('client.orders.status.purchasedUSA'), classes: statusClasses.purchased_in_usa },
    in_transit: { label: t('client.orders.status.inTransit'), classes: statusClasses.in_transit },
    in_customs: { label: t('client.orders.status.inCustoms'), classes: statusClasses.in_customs },
    ready_for_delivery: { label: t('client.orders.status.readyForDelivery'), classes: statusClasses.ready_for_delivery },
    delivered: { label: t('client.orders.status.delivered'), classes: statusClasses.delivered },
    cancelled: { label: t('client.orders.status.cancelled'), classes: statusClasses.cancelled },
  }

  const timelineSteps = [
    { id: 'pending', label: t('client.orders.detail.timeline.orderReceived'), icon: 'receipt_long' },
    { id: 'purchased_in_usa', label: t('client.orders.detail.timeline.purchasedUSA'), icon: 'shopping_cart_checkout' },
    { id: 'in_transit', label: t('client.orders.detail.timeline.traveling'), icon: 'flight_takeoff' },
    { id: 'in_customs', label: t('client.orders.detail.timeline.inCustoms'), icon: 'inventory' },
    { id: 'ready_for_delivery', label: t('client.orders.detail.timeline.readyDelivery'), icon: 'local_shipping' },
    { id: 'delivered', label: t('client.orders.detail.timeline.delivered'), icon: 'check_circle' },
  ]

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
    <div className="space-y-8 platform-enter max-w-6xl mx-auto pb-10">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-slate-900 tracking-tight">{t('client.orders.title')}</h1>
        <p className="text-slate-500 mt-1">{t('client.orders.subtitle')}</p>
      </div>

      {/* Tabs / Filters */}
      <div className="flex gap-2 p-1 bg-slate-100/50 border border-slate-200 rounded-2xl w-max max-w-full overflow-x-auto">
        {[
          { value: 'all', label: t('client.orders.filters.all') },
          { value: 'active', label: t('client.orders.filters.active') },
          { value: 'completed', label: t('client.orders.filters.completed') },
          { value: 'cancelled', label: t('client.orders.filters.cancelled') },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${filter === f.value
              ? 'bg-white text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-16 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl text-slate-300">inventory_2</span>
          </div>
          <h3 className="font-headline text-xl font-bold text-slate-800 mb-2">{t('client.orders.noOrders')}</h3>
          <p className="text-slate-500 max-w-sm mx-auto">{t('client.orders.noOrdersDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(order => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col"
            >
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-headline font-extrabold text-lg text-slate-900 tracking-tight">
                      {order.orderNumber || `Pedido #${order.id?.slice(0, 8)}`}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                  </p>
                </div>

                <span className={`text-[11px] font-bold px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 whitespace-nowrap ${statusTags[order.status]?.classes || 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                  {statusTags[order.status]?.label || order.status}
                </span>
              </div>

              {/* Progress Mini-bar */}
              {order.status !== 'cancelled' && (
                <div className="mb-6 bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                    <span>{t('client.orders.progress')}</span>
                    <span className="text-slate-600">{Math.round((getTimelineProgress(order.status) + 1) / 6 * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800 transition-all duration-1000 rounded-full"
                      style={{ width: `${Math.max(5, (getTimelineProgress(order.status) + 1) / 6 * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Items Preview */}
              {order.items?.length > 0 && (
                <div className="flex gap-[-10px] items-center mb-6 pl-2">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="w-10 h-10 rounded-full border-2 border-white bg-slate-50 shrink-0 overflow-hidden shadow-sm -ml-2 z-[3] flex items-center justify-center">
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-[16px] text-slate-300">image</span>
                      )}
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 shrink-0 shadow-sm -ml-2 z-[2] flex items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-500">+{order.items.length - 3}</span>
                    </div>
                  )}
                  <div className="ml-3 text-xs text-slate-500 font-medium">
                    {order.items.reduce((a, b) => a + (b.quantity || 1), 0)} {t('client.orders.articles')}
                  </div>
                </div>
              )}

              <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">{t('client.orders.estimatedTotal')}</p>
                  <p className="font-extrabold text-slate-900">${parseFloat(order.total || 0).toLocaleString()} <span className="text-xs text-slate-500 font-medium tracking-normal">USD</span></p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Modal for Details */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${selectedOrder ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setSelectedOrder(null)}
        />

        {/* Panel */}
        <div
          className={`absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${selectedOrder ? 'translate-x-0' : 'translate-x-[110%]'}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white z-10">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('client.orders.detail.title')}</p>
              <h2 className="font-headline text-xl font-extrabold text-slate-900">
                {selectedOrder?.orderNumber || 'Pedido'}
              </h2>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Body */}
          {selectedOrder && (
            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">

              {/* Agent contact */}
              <div className="p-6 bg-slate-50 border-b border-slate-100">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">{t('client.orders.detail.assignedAgent')}</p>
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-slate-400">person</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      {selectedOrder.agent ? `${selectedOrder.agent.user?.firstName || selectedOrder.agent.firstName || ''} ${selectedOrder.agent.user?.lastName || selectedOrder.agent.lastName || ''}`.trim() || 'Agente TeVra' : 'Agente TeVra'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{t('client.orders.detail.managingOrder')}</p>
                  </div>
                  <button
                    onClick={() => {
                      const phone = (selectedOrder.agent?.whatsapp || selectedOrder.agent?.user?.whatsapp || '').replace(/[^0-9]/g, '');
                      const text = encodeURIComponent(`Hola, te escribo sobre mi pedido ${selectedOrder.orderNumber}`);
                      if (phone) window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                    }}
                    className="w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-[#25D366]/20 flex items-center justify-center shrink-0 transition-all"
                    title="WhatsApp"
                  >
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                  </button>
                </div>
              </div>

              {/* Advanced Timeline */}
              <div className="px-8 py-8">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">{t('client.orders.detail.tracking')}</p>
                <div className="relative">
                  {selectedOrder.status === 'cancelled' ? (
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 z-10 shadow-sm border border-white">
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                      </div>
                      <div className="pt-1.5">
                        <p className="font-bold text-slate-900">{t('client.orders.detail.cancelled')}</p>
                        <p className="text-xs text-slate-500 mt-1">{t('client.orders.detail.cancelledDesc')}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-100"></div>
                      <div className="space-y-6">
                        {timelineSteps.map((step, idx) => {
                          const progress = getTimelineProgress(selectedOrder.status);
                          const isCompleted = idx <= progress;
                          const isCurrent = idx === progress;

                          return (
                            <div key={step.id} className={`flex items-start gap-4 relative ${isCompleted ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                              {/* Connector line overlay for active stuff */}
                              {isCompleted && idx < timelineSteps.length - 1 && idx < progress && (
                                <div className="absolute left-[15.5px] top-8 h-8 w-0.5 bg-slate-800 -ml-[0.5px]"></div>
                              )}

                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm border-2 ${isCurrent ? 'bg-slate-900 text-white border-slate-900 ring-4 ring-slate-100' : (isCompleted ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-400')}`}>
                                <span className="material-symbols-outlined text-[14px]">
                                  {isCompleted ? 'check' : step.icon}
                                </span>
                              </div>
                              <div className="pt-1">
                                <p className={`font-bold ${isCurrent ? 'text-slate-900' : 'text-slate-700'}`}>{step.label}</p>
                                {isCurrent && (
                                  <p className="text-[11px] font-medium text-slate-500 mt-1">{t('client.orders.detail.currentPhase')}</p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="px-6 py-4 bg-slate-50/50">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">{t('client.orders.detail.productDetails')}</p>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="bg-white p-3 rounded-2xl border border-slate-100 flex gap-4 items-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                      <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0 overflow-hidden">
                        {item.productImage ? (
                          <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-slate-300">image</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate" title={item.productName}>{item.productName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Cant: {item.quantity}</p>
                      </div>
                      <div className="text-right shrink-0 pr-2">
                        <p className="font-extrabold text-slate-900 text-sm">${parseFloat(item.totalPrice || item.unitPrice * item.quantity || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="px-8 py-8 border-t border-slate-100 bg-white">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">{t('client.orders.detail.financialSummary')}</p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>{t('client.orders.detail.subtotal')}</span>
                    <span className="font-semibold">${parseFloat(selectedOrder.subtotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>{t('client.orders.detail.shippingCost')}</span>
                    {parseFloat(selectedOrder.shippingCost || 0) > 0 ? (
                      <span className="font-semibold">${parseFloat(selectedOrder.shippingCost).toLocaleString()}</span>
                    ) : (
                      <span className="font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs border border-amber-100">{t('client.orders.detail.toCalculate')}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>{t('client.orders.detail.tevraCost')}</span>
                    <span className="font-semibold">${parseFloat(selectedOrder.tevraCommission || 0).toLocaleString()}</span>
                  </div>
                  <div className="pt-4 mt-2 border-t border-slate-100 border-dashed flex justify-between items-center">
                    <span className="font-bold text-slate-900">{t('client.orders.detail.finalAmount')}</span>
                    <div className="text-right">
                      <span className="font-extrabold text-2xl text-slate-900 tracking-tight">${parseFloat(selectedOrder.total || 0).toLocaleString()}</span>
                      <span className="text-xs font-bold text-slate-400 ml-1">USD</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
