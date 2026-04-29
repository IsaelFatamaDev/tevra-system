import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import ordersService from '../services/orders.service'
import Pagination from '../../../core/components/Pagination'
import generateBoleta from '../../../core/utils/generateBoleta'

const ITEMS_PER_PAGE = 10

export default function AdminOrders() {
  const { t } = useTranslation()

  const STATUS_CONFIG = {
    delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: t('common.status.delivered') },
    in_transit: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: t('common.status.in_transit') },
    purchased_in_usa: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500', label: t('common.status.purchased_in_usa') },
    confirmed: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: t('common.status.confirmed') },
    pending: { bg: 'bg-[#EBF2FA]', text: 'text-[#468189]', dot: 'bg-[#9DBEBB]', label: t('common.status.pending') },
    in_customs: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', label: t('common.status.in_customs') },
    ready_for_delivery: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500', label: t('common.status.ready_for_delivery') },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: t('common.status.cancelled') },
  }
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
    const timer = setTimeout(fetchOrders, search ? 350 : 0)
    return () => clearTimeout(timer)
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
    const headers = [t('admin.table.order'), t('admin.table.customer'), 'Email', t('admin.table.agent'), t('admin.table.date'), t('admin.table.status'), t('admin.table.total')]
    const rows = orders.map(o => [
      o.orderNumber || '',
      `${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`.trim(),
      o.customer?.email || '',
      o.agent ? `${o.agent.user?.firstName || ''} ${o.agent.user?.lastName || ''}`.trim() : t('admin.orders.direct'),
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
    { label: t('admin.orders.totalOrders'), value: orders.length, icon: 'shopping_cart' },
    { label: t('admin.orders.revenue'), value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: 'payments' },
    { label: t('admin.orders.delivered'), value: orders.filter(o => o.status === 'delivered').length, icon: 'check_circle' },
    { label: t('admin.orders.inTransit'), value: orders.filter(o => ['in_transit', 'in_customs', 'purchased_in_usa'].includes(o.status)).length, icon: 'local_shipping' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-5 platform-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#031926]">{t('admin.orders.title')}</h2>
          <p className="text-sm text-[#468189] mt-0.5">{t('admin.orders.subtitle')}</p>
        </div>
        <button onClick={handleExportCSV} className="bg-[#031926] hover:bg-[#0d3349] text-[#EBF2FA] px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors text-sm">
          <span className="material-symbols-outlined text-[16px]">download</span> {t('common.export')}
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-[#9DBEBB]/20 flex items-center gap-3 stat-card">
            <div className="w-9 h-9 rounded-lg bg-[#EBF2FA] text-[#468189] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
            </div>
            <div>
              <p className="text-xs text-[#468189]">{m.label}</p>
              <p className="text-lg font-semibold text-[#031926]">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-[#9DBEBB]/20 overflow-hidden">
        <div className="p-4 border-b border-[#9DBEBB]/10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9DBEBB] text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('admin.orders.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setStatusFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!statusFilter ? 'bg-[#031926] text-[#EBF2FA]' : 'bg-[#EBF2FA]/30 text-[#468189] hover:bg-[#EBF2FA] border border-[#9DBEBB]/20'}`}>
              {t('common.all')}
            </button>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button key={key} onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === key ? 'bg-[#031926] text-[#EBF2FA]' : 'bg-[#EBF2FA]/30 text-[#468189] hover:bg-[#EBF2FA] border border-[#9DBEBB]/20'}`}>
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-[#9DBEBB]/20 border-t-[#468189] rounded-full animate-spin" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-3xl text-[#9DBEBB]">inbox</span>
            <p className="text-sm text-[#468189] mt-2">{t('admin.orders.noOrdersFound')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-[#EBF2FA]/30 text-[11px] font-medium text-[#468189] uppercase tracking-wider border-b border-[#9DBEBB]/10">
                  <th className="px-5 py-3">{t('admin.table.order')}</th>
                  <th className="px-5 py-3">{t('admin.table.customer')}</th>
                  <th className="px-5 py-3">{t('admin.table.date')}</th>
                  <th className="px-5 py-3">{t('admin.table.total')}</th>
                  <th className="px-5 py-3">{t('admin.table.status')}</th>
                  <th className="px-5 py-3 text-right">{t('admin.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#9DBEBB]/10">
                {paginated.map(ord => {
                  const st = STATUS_CONFIG[ord.status] || STATUS_CONFIG.pending
                  const customerName = ord.customer ? `${ord.customer.firstName} ${ord.customer.lastName}` : '—'
                  return (
                    <tr key={ord.id} className="hover:bg-[#EBF2FA]/30 transition-colors group">
                      <td className="px-5 py-3"><span className="text-sm font-medium text-[#031926]">{ord.orderNumber || ord.id?.slice(0, 8)}</span></td>
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-[#031926]">{customerName}</p>
                        <p className="text-xs text-[#468189]">{ord.customer?.email || ''}</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#468189]">{ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td className="px-5 py-3 text-sm font-medium text-[#031926]">${Number(ord.total || 0).toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 ${st.bg} ${st.text} text-[11px] font-medium rounded-md`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setViewOrder(ord)} title={t('admin.orders.orderDetail')}
                            className="p-1.5 rounded-md hover:bg-[#EBF2FA] text-[#9DBEBB] hover:text-[#031926] transition-colors">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button onClick={() => { setStatusModal(ord); setNewStatus(ord.status) }} title={t('admin.orders.changeStatus')}
                            className="p-1.5 rounded-md hover:bg-[#EBF2FA] text-[#9DBEBB] hover:text-amber-600 transition-colors">
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

        <div className="px-5 py-3 border-t border-[#9DBEBB]/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-[#468189]">
            {t('admin.pagination.showing')} <span className="font-medium">{Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}-{Math.min(page * ITEMS_PER_PAGE, total)}</span> {t('admin.pagination.of')} <span className="font-medium">{total}</span> {t('admin.pagination.orders')}
          </span>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
        </div>
      </div>

      {/* View Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#031926]/40 backdrop-blur-sm transition-opacity" onClick={() => setViewOrder(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-hidden relative z-10 flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-[#9DBEBB]/10 flex justify-between items-center bg-[#EBF2FA]/30/50">
              <div>
                <h3 className="text-lg font-semibold text-[#031926]">{t('admin.orders.orderDetail')}</h3>
                <p className="text-sm font-mono text-[#468189] mt-0.5">{viewOrder.orderNumber}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="p-2 hover:bg-[#EBF2FA] rounded-full transition-colors">
                <span className="material-symbols-outlined text-[#9DBEBB] text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm mb-8 bg-[#EBF2FA]/30 p-5 rounded-xl border border-[#9DBEBB]/10">
                <div><p className="text-[11px] font-medium uppercase tracking-wider text-[#468189] mb-1">{t('admin.table.customer')}</p><p className="font-medium text-[#031926]">{viewOrder.customer?.firstName} {viewOrder.customer?.lastName}</p></div>
                <div><p className="text-[11px] font-medium uppercase tracking-wider text-[#468189] mb-1">{t('admin.table.agent')}</p><p className="font-medium text-[#031926]">{viewOrder.agent?.firstName || '—'} {viewOrder.agent?.lastName || ''}</p></div>
                <div><p className="text-[11px] font-medium uppercase tracking-wider text-[#468189] mb-1">{t('admin.orders.estimatedDelivery')}</p><p className="font-medium text-[#031926]">{viewOrder.estimatedDeliveryDate ? new Date(viewOrder.estimatedDeliveryDate).toLocaleDateString('es-PE') : '—'}</p></div>
                <div><p className="text-[11px] font-medium uppercase tracking-wider text-[#468189] mb-1">{t('admin.orders.subtotal')}</p><p className="font-medium text-[#031926]">${Number(viewOrder.subtotal || 0).toFixed(2)}</p></div>
                <div><p className="text-[11px] font-medium uppercase tracking-wider text-[#468189] mb-1">{t('admin.orders.shipping')}</p><p className="font-medium text-[#031926]">${Number(viewOrder.shippingCost || 0).toFixed(2)}</p></div>
                <div><p className="text-[11px] font-medium uppercase tracking-wider text-[#468189] mb-1">{t('admin.orders.tevraCost')}</p><p className="font-medium text-[#031926]">${Number(viewOrder.tevraCommission || 0).toFixed(2)}</p></div>
                {Number(viewOrder.agentCommission || 0) > 0 && (
                  <div><p className="text-[11px] font-medium uppercase tracking-wider text-[#468189] mb-1">{t('admin.orders.agentCommission')}</p><p className="font-medium text-[#031926]">${Number(viewOrder.agentCommission || 0).toFixed(2)}</p></div>
                )}
                <div><p className="text-[11px] font-medium uppercase tracking-wider text-[#468189] mb-1">{t('admin.orders.total')}</p><p className="font-semibold text-tevra-coral text-lg">${Number(viewOrder.total || 0).toFixed(2)}</p></div>
              </div>

              {viewOrder.items?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[#031926] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#9DBEBB] text-[18px]">inventory_2</span>
                    {t('admin.orders.products')} ({viewOrder.items.length})
                  </p>
                  <div className="space-y-2">
                    {viewOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-white border border-[#9DBEBB]/10 rounded-xl hover:border-[#9DBEBB]/20 transition-colors">
                        {item.productImage ? (
                          <img src={item.productImage} alt="" className="w-12 h-12 rounded-lg object-cover ring-1 ring-[#9DBEBB]/15" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[#EBF2FA]/30 flex items-center justify-center ring-1 ring-[#9DBEBB]/15"><span className="material-symbols-outlined text-[#9DBEBB]">image</span></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#031926] truncate">{item.productName}</p>
                          <p className="text-xs font-medium text-[#468189] bg-[#EBF2FA] w-fit px-2 py-0.5 rounded-full mt-1">{t('admin.orders.quantity')} {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-[#031926]">${Number(item.totalPrice || 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#9DBEBB]/10 flex justify-end gap-3 bg-[#EBF2FA]/30/50">
              <button onClick={() => setViewOrder(null)} className="px-4 py-2 bg-white border border-[#9DBEBB]/20 text-sm font-medium text-[#468189] hover:bg-[#EBF2FA]/30 hover:text-[#031926] rounded-xl transition-colors shadow-sm">
                {t('common.close')}
              </button>
              <button onClick={() => generateBoleta(viewOrder)}
                className="px-5 py-2 text-sm font-semibold text-[#EBF2FA] bg-[#031926] hover:bg-[#0d3349] rounded-xl shadow-md transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">receipt_long</span> {t('admin.orders.generateReceipt')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#031926]/40 backdrop-blur-sm transition-opacity" onClick={() => setStatusModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-[#9DBEBB]/10 flex justify-between items-start bg-[#EBF2FA]/30/50">
              <div>
                <h3 className="text-lg font-semibold text-[#031926]">{t('admin.orders.changeStatus')}</h3>
                <p className="text-sm font-mono text-[#468189] mt-0.5">{statusModal.orderNumber}</p>
              </div>
              <button onClick={() => setStatusModal(null)} className="p-2 hover:bg-[#EBF2FA] rounded-full transition-colors -mr-2">
                <span className="material-symbols-outlined text-[#9DBEBB] text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-2.5">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button key={key} onClick={() => setNewStatus(key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${newStatus === key ? 'bg-[#031926] text-[#EBF2FA] border-[#031926] shadow-md ring-1 ring-[#031926] ring-offset-1' : 'bg-white border-[#9DBEBB]/20 text-[#031926] hover:border-[#9DBEBB]/40 hover:bg-[#EBF2FA]/30'}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${newStatus === key ? 'bg-white' : cfg.dot} ring-2 ${newStatus === key ? 'ring-white/30' : 'ring-transparent'}`} />
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#9DBEBB]/10 flex justify-end gap-3 bg-[#EBF2FA]/30/50">
              <button onClick={() => setStatusModal(null)} className="px-4 py-2 bg-white border border-[#9DBEBB]/20 text-sm font-medium text-[#468189] hover:bg-[#EBF2FA]/30 hover:text-[#031926] rounded-xl transition-colors shadow-sm">
                {t('common.cancel')}
              </button>
              <button onClick={handleUpdateStatus} disabled={saving || newStatus === statusModal.status}
                className="px-5 py-2 text-sm font-semibold bg-tevra-coral text-[#EBF2FA] rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-40 disabled:hover:translate-y-0 disabled:shadow-none">
                {saving ? t('common.saving') : t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
