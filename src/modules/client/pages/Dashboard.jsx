import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../core/contexts/AuthContext'
import dashboardService from '../../admin/services/dashboard.service'
import ReviewModal from '../../../core/components/ReviewModal'

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

const trackingSteps = ['pending', 'confirmed', 'purchased_in_usa', 'in_transit', 'in_customs', 'ready_for_delivery', 'delivered']

function getStepIndex(status) {
  const idx = trackingSteps.indexOf(status)
  return idx >= 0 ? idx : 0
}

export default function ClientDashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviewModal, setReviewModal] = useState(null)

  const statusTags = {
    pending: { label: t('client.dashboard.tracking.pending'), classes: statusClasses.pending },
    confirmed: { label: t('client.dashboard.tracking.confirmed'), classes: statusClasses.confirmed },
    processing: { label: t('client.dashboard.tracking.processing'), classes: statusClasses.processing },
    shipped: { label: t('client.dashboard.tracking.shipped'), classes: statusClasses.shipped },
    purchased_in_usa: { label: t('client.dashboard.tracking.purchaseUSA'), classes: statusClasses.purchased_in_usa },
    in_transit: { label: t('client.dashboard.tracking.inTransit'), classes: statusClasses.in_transit },
    in_customs: { label: t('client.dashboard.tracking.customs'), classes: statusClasses.in_customs },
    ready_for_delivery: { label: t('client.dashboard.tracking.ready'), classes: statusClasses.ready_for_delivery },
    delivered: { label: t('client.dashboard.tracking.delivered'), classes: statusClasses.delivered },
    cancelled: { label: t('client.dashboard.tracking.cancelled'), classes: statusClasses.cancelled },
  }

  const trackingLabels = [
    t('client.dashboard.tracking.pending'),
    t('client.dashboard.tracking.confirmed'),
    t('client.dashboard.tracking.purchaseUSA'),
    t('client.dashboard.tracking.inTransit'),
    t('client.dashboard.tracking.customs'),
    t('client.dashboard.tracking.ready'),
    t('client.dashboard.tracking.delivered'),
  ]

  useEffect(() => {
    Promise.all([
      dashboardService.getMyOrders().catch(() => []),
      dashboardService.getMyProfile().catch(() => null),
    ]).then(([ordersRes, profileRes]) => {
      const list = ordersRes?.data || ordersRes?.items || (Array.isArray(ordersRes) ? ordersRes : [])
      setOrders(list)

      let assignedAgent = profileRes?.agent;
      if (!assignedAgent && list.length > 0) {
        const orderWithAgent = list.find(o => o.agent);
        if (orderWithAgent) assignedAgent = orderWithAgent.agent;
      }

      if (assignedAgent) setAgent(assignedAgent)
    })
      .finally(() => setLoading(false))
  }, [])

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status))
  const completedCount = orders.filter(o => o.status === 'delivered').length
  const inTransitCount = orders.filter(o => ['shipped', 'in_transit', 'in_customs', 'purchased_in_usa', 'ready_for_delivery'].includes(o.status)).length
  const mainActiveOrder = activeOrders[0] || null

  return (
    <div className="space-y-10 platform-enter max-w-6xl mx-auto pb-10">

      {/* Hero Welcome + Agent Card */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col justify-center">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            {t('client.dashboard.greeting', { name: user?.firstName })} 👋
          </h1>
          <p className="text-slate-500 text-lg max-w-xl font-medium">
            {t('client.dashboard.subtitle')}
          </p>
        </div>
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-3xl flex flex-col items-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full bg-slate-50 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-slate-400">
                {(agent?.profileImage || agent?.user?.avatarUrl || agent?.avatarUrl) ? (
                  <img src={agent.profileImage || agent.user?.avatarUrl || agent.avatarUrl} alt="Agente" className="w-full h-full object-cover" />
                ) : agent ? (
                  <span className="text-xl font-bold text-slate-600">
                    {(agent.user?.firstName || agent.firstName || 'A')[0]}
                    {(agent.user?.lastName || agent.lastName || '')[0]}
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-3xl">support_agent</span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full text-[10px] flex items-center justify-center border-2 border-white shadow-sm">
                <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{t('client.dashboard.yourAgent')}</span>
            <h3 className="font-headline text-lg font-bold text-slate-900 mb-4 truncate w-full px-2">
              {agent ? `${agent.user?.firstName || agent.firstName || ''} ${agent.user?.lastName || agent.lastName || ''}`.trim() : t('client.dashboard.noAgent')}
            </h3>
            {agent && (agent.whatsapp || agent.user?.whatsapp) ? (
              <a href={`https://wa.me/${(agent.whatsapp || agent.user?.whatsapp).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                className="w-full bg-[#25D366]/10 text-[#1da851] py-3 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#25D366] hover:text-white transition-all text-sm group">
                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">chat</span>
                {t('client.dashboard.askWhatsApp')}
              </a>
            ) : (
              <button disabled className="w-full bg-slate-50 text-slate-400 py-3 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm cursor-not-allowed">
                <span className="material-symbols-outlined text-[20px]">chat</span>
                {t('client.dashboard.noAgentAvailable')}
              </button>
            )}
            {agent && (
              <button
                onClick={() => setReviewModal({ type: 'agent', targetId: agent.id, targetName: `${agent.user?.firstName || agent.firstName || ''} ${agent.user?.lastName || agent.lastName || ''}`.trim() })}
                className="w-full mt-2 py-2 text-xs font-bold text-slate-400 hover:text-primary flex items-center justify-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">star</span>
                Calificar a mi agente
              </button>
            )}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-400 font-medium tracking-wide">{t('client.dashboard.loadingOrders')}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { title: t('client.dashboard.stats.inTransit'), value: inTransitCount, icon: 'local_shipping', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
              { title: t('client.dashboard.stats.total'), value: orders.length, icon: 'package_2', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-100' },
              { title: t('client.dashboard.stats.completed'), value: completedCount, icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
            ].map((s) => (
              <div key={s.title} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex items-center gap-5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all">
                <div className={`w-14 h-14 ${s.bg} border rounded-2xl flex items-center justify-center shrink-0`}>
                  <span className={`material-symbols-outlined text-2xl ${s.color}`}>{s.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{s.title}</p>
                  <p className="text-3xl font-extrabold text-slate-900 font-headline tracking-tight">{s.value}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Active Order Tracking */}
          {mainActiveOrder && (
            <section className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 via-slate-800 to-slate-200"></div>

              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="w-24 h-24 bg-slate-50/80 rounded-3xl flex items-center justify-center border border-slate-100 shrink-0">
                  <span className="material-symbols-outlined text-5xl text-slate-300">inventory_2</span>
                </div>
                <div className="flex-1 w-full min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {t('client.dashboard.activeOrder')}
                      </p>
                      <h3 className="font-headline text-2xl font-extrabold text-slate-900 truncate">
                        {mainActiveOrder.orderNumber || `Pedido #${mainActiveOrder.id?.slice(0, 8)}`}
                      </h3>
                    </div>
                    <div className="flex flex-col sm:items-end">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold border ${statusTags[mainActiveOrder.status]?.classes || 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                        {statusTags[mainActiveOrder.status]?.label || mainActiveOrder.status}
                      </span>
                      <span className="text-sm font-extrabold text-slate-900 mt-2">
                        ${Number(mainActiveOrder.total || 0).toLocaleString()} <span className="text-[10px] text-slate-400">USD</span>
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar Premium */}
                  {mainActiveOrder.status !== 'cancelled' && (
                    <div className="mb-2">
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="bg-slate-800 h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${Math.max((getStepIndex(mainActiveOrder.status) / (trackingSteps.length - 1)) * 100, 5)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-3 px-1">
                        {trackingLabels.map((label, idx) => {
                          const isPast = idx <= getStepIndex(mainActiveOrder.status);
                          return (
                            <span key={label} className={`text-[10px] uppercase font-bold tracking-wider transition-colors ${isPast ? 'text-slate-800' : 'text-slate-300'}`}>
                              {label}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Grid for Quick Actions & Empty state combined if needed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Main Column */}
            <div className="lg:col-span-8 space-y-8">

              {/* Empty Active Orders */}
              {!mainActiveOrder && (
                <div className="bg-slate-50 rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                  <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">maps_ugc</span>
                  <h3 className="font-headline text-xl font-bold text-slate-800 mb-2">{t('client.dashboard.noActiveOrders')}</h3>
                  <p className="text-slate-500 max-w-sm mb-6">{t('client.dashboard.noActiveOrdersDesc')}</p>
                  {agent && (agent.whatsapp || agent.user?.whatsapp) && (
                    <a href={`https://wa.me/${(agent.whatsapp || agent.user?.whatsapp).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors inline-flex items-center gap-2">
                      {t('client.dashboard.writeAgent')}
                    </a>
                  )}
                </div>
              )}

              {/* Recent Orders Table */}
              <section className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
                  <h3 className="font-headline font-extrabold text-slate-900 text-lg">{t('client.dashboard.orderHistory')}</h3>
                  <Link to="/mi-cuenta/pedidos" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
                    {t('client.dashboard.totalOrders', { count: orders.length })}
                  </Link>
                </div>
                {orders.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50/50">
                    <span className="material-symbols-outlined text-4xl text-slate-200 mb-3 block">receipt_long</span>
                    <p className="text-sm text-slate-400 font-medium">{t('client.dashboard.noOrdersYet')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50/80">
                        <tr>
                          <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('client.dashboard.tableHeaders.order')}</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">{t('client.dashboard.tableHeaders.date')}</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t('client.dashboard.tableHeaders.amount')}</th>
                          <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{t('client.dashboard.tableHeaders.status')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.slice(0, 5).map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-4">
                              <div className="font-headline text-sm font-bold text-slate-900">{o.orderNumber || o.id?.slice(0, 8)}</div>
                              {o.items?.[0]?.productName && (
                                <div className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">{o.items[0].productName}{o.items.length > 1 ? ` +${o.items.length - 1}` : ''}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs font-medium text-slate-500 hidden sm:table-cell">
                              {o.createdAt ? new Date(o.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) : '—'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-extrabold text-slate-900">${Number(o.total || 0).toLocaleString()}</span>
                            </td>
                            <td className="px-8 py-4 flex justify-center">
                              <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${statusTags[o.status]?.classes || 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                {statusTags[o.status]?.label || o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar Actions Column */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="font-headline font-bold text-slate-900 mb-4 px-1">{t('client.dashboard.quickActions.title')}</h3>
              {[
                { icon: 'share_location', label: t('client.dashboard.quickActions.addresses'), desc: t('client.dashboard.quickActions.addressesDesc'), to: '/mi-cuenta/direcciones', active: true },
                { icon: 'shield_lock', label: t('client.dashboard.quickActions.security'), desc: t('client.dashboard.quickActions.securityDesc'), to: '/mi-cuenta/seguridad', active: true },
                { icon: 'wallet', label: t('client.dashboard.quickActions.paymentMethods'), desc: t('client.dashboard.quickActions.paymentMethodsDesc'), to: null, active: false },
              ].map((c, i) => c.active ? (
                <Link key={i} to={c.to} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-900 transition-colors">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-white transition-colors">{c.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{c.label}</p>
                    <p className="text-xs text-slate-400">{c.desc}</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-900 transition-colors">arrow_right_alt</span>
                </Link>
              ) : (
                <div key={i} className="bg-slate-50 rounded-3xl p-5 border border-slate-100 text-left flex items-center gap-4 opacity-70 cursor-not-allowed">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-slate-300">{c.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500">{c.label}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{t('client.dashboard.comingSoon')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <ReviewModal
        isOpen={!!reviewModal}
        onClose={() => setReviewModal(null)}
        type={reviewModal?.type}
        targetId={reviewModal?.targetId}
        targetName={reviewModal?.targetName}
        onSubmitted={() => setTimeout(() => setReviewModal(null), 2000)}
      />
    </div>
  )
}
