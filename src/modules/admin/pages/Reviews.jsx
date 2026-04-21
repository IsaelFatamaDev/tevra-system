import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import reviewsService from '../../public/services/reviews.service'
import Pagination from '../../../core/components/Pagination'

const ITEMS_PER_PAGE = 10

export default function AdminReviews() {
  const { t } = useTranslation()
  const [reviews, setReviews] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [viewReview, setViewReview] = useState(null)

  const fetchReviews = useCallback(() => {
    setLoading(true)
    reviewsService.findAll({ search: search || undefined, rating: ratingFilter || undefined, status: 'all' })
      .then(data => {
        const list = Array.isArray(data) ? data : data?.items || []
        setReviews(list)
        setTotal(data?.total ?? list.length)
      })
      .catch(err => console.error('Error fetching reviews', err))
      .finally(() => setLoading(false))
  }, [search, ratingFilter])

  useEffect(() => {
    setPage(1)
    const timer = setTimeout(fetchReviews, search ? 350 : 0)
    return () => clearTimeout(timer)
  }, [search, ratingFilter])

  const verifiedFiltered = statusFilter === ''
    ? reviews
    : reviews.filter(r => r.status === statusFilter)

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const paginated = verifiedFiltered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleDeleteReview = async (id) => {
    if (!confirm(t('admin.reviews.deleteConfirm'))) return
    try {
      await reviewsService.remove(id)
      setViewReview(null)
      fetchReviews()
    } catch (err) { console.error('Error deleting review', err) }
  }

  const handleModerateReview = async (id, action) => {
    try {
      await reviewsService.moderate(id, action)
      setViewReview(null)
      fetchReviews()
    } catch (err) { console.error('Error moderating review', err) }
  }
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0
  const approvedCount = reviews.filter(r => r.status === 'approved').length
  const pendingCount = reviews.filter(r => r.status === 'pending').length
  const ratingDist = [5, 4, 3, 2, 1].map(star => ({ star, count: reviews.filter(r => r.rating === star).length }))

  const Stars = ({ rating, size = 16 }) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`material-symbols-outlined text-[${size}px] ${i < rating ? 'text-amber-400' : 'text-[#9DBEBB]'}`}
          style={{ fontVariationSettings: i < rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
      ))}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-5 platform-enter">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[#031926]">{t('admin.reviews.title')}</h2>
        <p className="text-sm text-[#468189] mt-0.5">{t('admin.reviews.subtitle')}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#9DBEBB]/20 flex items-center gap-3 stat-card">
          <div className="w-9 h-9 rounded-lg bg-[#EBF2FA] text-[#468189] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">star</span>
          </div>
          <div>
            <p className="text-xs text-[#468189]">{t('admin.reviews.avgRating')}</p>
            <p className="text-lg font-semibold text-[#031926]">{avgRating.toFixed(1)}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#9DBEBB]/20 flex items-center gap-3 stat-card">
          <div className="w-9 h-9 rounded-lg bg-[#EBF2FA] text-[#468189] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">reviews</span>
          </div>
          <div>
            <p className="text-xs text-[#468189]">{t('admin.reviews.totalReviews')}</p>
            <p className="text-lg font-semibold text-[#031926]">{reviews.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#9DBEBB]/20 flex items-center gap-3 stat-card">
          <div className="w-9 h-9 rounded-lg bg-[#EBF2FA] text-[#468189] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </div>
          <div>
            <p className="text-xs text-[#468189]">{t('admin.reviews.verified')}</p>
            <p className="text-lg font-semibold text-[#031926]">{approvedCount} <span className="text-sm font-normal text-amber-600">({pendingCount} {t('admin.reviews.pendingBadge')})</span></p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#9DBEBB]/20">
          <p className="text-xs text-[#468189] mb-2">{t('admin.reviews.distribution')}</p>
          <div className="space-y-1">
            {ratingDist.map(d => (
              <div key={d.star} className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#468189] w-3 font-medium">{d.star}</span>
                <div className="flex-1 h-1.5 bg-[#EBF2FA] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: reviews.length ? `${(d.count / reviews.length) * 100}%` : '0%' }} />
                </div>
                <span className="text-[10px] text-[#468189] w-4 text-right">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#9DBEBB]/20 overflow-hidden">
        <div className="p-4 border-b border-[#9DBEBB]/10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9DBEBB] text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('admin.reviews.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[5, 4, 3, 2, 1].map(star => (
              <button key={star} onClick={() => setRatingFilter(ratingFilter === star ? 0 : star)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${ratingFilter === star ? 'bg-[#031926] text-[#EBF2FA]' : 'bg-[#EBF2FA]/30 text-[#468189] hover:bg-[#EBF2FA] border border-[#9DBEBB]/20'}`}>
                {star}<span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </button>
            ))}
            {[{ key: '', label: t('common.all') }, { key: 'pending', label: t('admin.reviews.pendingBadge') }, { key: 'approved', label: t('admin.reviews.verifiedBadge') }, { key: 'rejected', label: t('common.rejected') }].map(opt => (
              <button key={opt.key} onClick={() => setStatusFilter(statusFilter === opt.key ? '' : opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === opt.key ? 'bg-[#031926] text-[#EBF2FA]' : 'bg-[#EBF2FA]/30 text-[#468189] hover:bg-[#EBF2FA] border border-[#9DBEBB]/20'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-[#9DBEBB]/20 border-t-[#468189] rounded-full animate-spin" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-3xl text-[#9DBEBB]">rate_review</span>
            <p className="text-sm text-[#468189] mt-2">{t('admin.reviews.noReviewsFound')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-162.5">
              <thead>
                <tr className="bg-[#EBF2FA]/30 text-[11px] font-medium text-[#468189] uppercase tracking-wider border-b border-[#9DBEBB]/10">
                  <th className="px-5 py-3">{t('admin.table.user')}</th>
                  <th className="px-5 py-3">{t('admin.table.rating')}</th>
                  <th className="px-5 py-3">{t('admin.table.comment')}</th>
                  <th className="px-5 py-3">{t('admin.table.date')}</th>
                  <th className="px-5 py-3">{t('admin.table.status')}</th>
                  <th className="px-5 py-3 text-right">{t('admin.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#9DBEBB]/10">
                {paginated.map(rev => {
                  const reviewerName = rev.reviewer ? `${rev.reviewer.firstName} ${rev.reviewer.lastName}` : t('admin.reviews.anonymous')
                  return (
                    <tr key={rev.id} className="hover:bg-[#EBF2FA]/30 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {rev.reviewer?.avatarUrl ? (
                            <img src={rev.reviewer.avatarUrl} alt={reviewerName} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#EBF2FA] flex items-center justify-center text-[#468189] font-medium text-xs">
                              {(rev.reviewer?.firstName?.[0] || 'A') + (rev.reviewer?.lastName?.[0] || '')}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#031926]">{reviewerName}</p>
                            <p className="text-xs text-[#468189] truncate">{rev.title || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3"><Stars rating={rev.rating} /></td>
                      <td className="px-5 py-3 text-sm text-[#468189] max-w-50 truncate">{rev.comment || rev.body || '—'}</td>
                      <td className="px-5 py-3 text-sm text-[#468189]">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('es-PE') : '—'}</td>
                      <td className="px-5 py-3">
                        {rev.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-medium rounded-md">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span> {t('admin.reviews.verifiedBadge')}
                          </span>
                        ) : rev.status === 'rejected' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 text-[11px] font-medium rounded-md">
                            <span className="material-symbols-outlined text-[12px]">block</span> {t('common.rejected')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#EBF2FA] text-[#468189] text-[11px] font-medium rounded-md">
                            <span className="material-symbols-outlined text-[12px]">schedule</span> {t('admin.reviews.pendingBadge')}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => setViewReview(rev)} title={t('admin.reviews.reviewDetail')}
                          className="p-1.5 rounded-md hover:bg-[#EBF2FA] text-[#9DBEBB] hover:text-[#031926] transition-colors opacity-60 group-hover:opacity-100">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
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
            {t('admin.pagination.showing')} <span className="font-medium">{Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}-{Math.min(page * ITEMS_PER_PAGE, total)}</span> {t('admin.pagination.of')} <span className="font-medium">{total}</span> {t('admin.pagination.reviews')}
          </span>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
        </div>
      </div>

      {/* View Review Modal */}
      {viewReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setViewReview(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>

            {/* Gradient header */}
            <div className="relative bg-linear-to-br from-[#031926] via-primary-mid to-[#031926] px-6 pt-6 pb-8">
              <button
                onClick={() => setViewReview(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[#EBF2FA] text-[16px]">close</span>
              </button>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-[#EBF2FA] font-bold text-lg shrink-0">
                  {(viewReview.reviewer?.firstName?.[0] || 'A')}{(viewReview.reviewer?.lastName?.[0] || '')}
                </div>
                <div>
                  <p className="text-[#EBF2FA] font-semibold text-base leading-tight">
                    {viewReview.reviewer ? `${viewReview.reviewer.firstName} ${viewReview.reviewer.lastName}` : t('admin.reviews.anonymous')}
                  </p>
                  <p className="text-[#EBF2FA]/50 text-xs mt-0.5">
                    {viewReview.createdAt ? new Date(viewReview.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                  </p>
                  {viewReview.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/30">
                      <span className="material-symbols-outlined text-[11px]">verified</span>
                      {t('admin.reviews.verifiedPurchase')}
                    </span>
                  )}
                </div>
              </div>

              {/* Stars + score */}
              <div className="flex items-center gap-3 mt-5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`material-symbols-outlined text-2xl ${i < viewReview.rating ? 'text-amber-400' : 'text-[#EBF2FA]/15'}`}
                      style={{ fontVariationSettings: i < viewReview.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                  ))}
                </div>
                <span className="text-[#EBF2FA]/70 text-sm font-medium">{viewReview.rating}/5</span>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {viewReview.title && (
                <p className="font-bold text-[#031926] text-base">{viewReview.title}</p>
              )}
              <blockquote className="relative pl-4 border-l-2 border-[#9DBEBB]/20">
                <p className="text-[#468189] text-sm leading-relaxed italic">"{viewReview.comment || viewReview.body || '—'}"</p>
              </blockquote>
              {viewReview.helpfulCount > 0 && (
                <p className="text-xs text-[#9DBEBB] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                  {viewReview.helpfulCount} {t('admin.reviews.helpfulCount')}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex items-center justify-between gap-3">
              <button onClick={() => handleDeleteReview(viewReview.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                <span className="material-symbols-outlined text-[16px]">delete</span>
                {t('common.delete')}
              </button>
              <div className="flex gap-2">
                {viewReview.status !== 'approved' && (
                  <button onClick={() => handleModerateReview(viewReview.id, 'approve')}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#EBF2FA] bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    {t('common.approve')}
                  </button>
                )}
                {viewReview.status !== 'rejected' && (
                  <button onClick={() => handleModerateReview(viewReview.id, 'reject')}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#EBF2FA] bg-primary-mid hover:bg-[#468189] rounded-xl transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">block</span>
                    {t('common.reject')}
                  </button>
                )}
                <button onClick={() => setViewReview(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#468189] hover:bg-[#EBF2FA] rounded-xl transition-colors">
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
