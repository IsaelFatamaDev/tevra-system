import { useState, useEffect, useCallback } from 'react'
import reviewsService from '../../public/services/reviews.service'
import Pagination from '../../../core/components/Pagination'

const ITEMS_PER_PAGE = 10

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState(0)
  const [verifiedFilter, setVerifiedFilter] = useState('')
  const [page, setPage] = useState(1)
  const [viewReview, setViewReview] = useState(null)

  const fetchReviews = useCallback(() => {
    setLoading(true)
    reviewsService.findAll({ search: search || undefined, rating: ratingFilter || undefined })
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
    const t = setTimeout(fetchReviews, search ? 350 : 0)
    return () => clearTimeout(t)
  }, [search, ratingFilter])

  const verifiedFiltered = verifiedFilter === ''
    ? reviews
    : reviews.filter(r => verifiedFilter === 'yes' ? r.isVerifiedPurchase : !r.isVerifiedPurchase)

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const paginated = verifiedFiltered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleDeleteReview = async (id) => {
    if (!confirm('¿Eliminar esta reseña permanentemente?')) return
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
  const verifiedCount = reviews.filter(r => r.isVerifiedPurchase).length
  const ratingDist = [5, 4, 3, 2, 1].map(star => ({ star, count: reviews.filter(r => r.rating === star).length }))

  const Stars = ({ rating, size = 16 }) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`material-symbols-outlined text-[${size}px] ${i < rating ? 'text-amber-400' : 'text-outline-variant'}`}
          style={{ fontVariationSettings: i < rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
      ))}
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-on-background font-headline tracking-tight">Moderación de Reseñas</h2>
        <p className="text-sm text-text-muted mt-1">Supervisa la retroalimentación de los clientes sobre los productos.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-outline-variant flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">star</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Rating Promedio</p>
            <p className="text-lg font-black text-on-background font-headline">{avgRating.toFixed(1)}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-outline-variant flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">reviews</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Total Reseñas</p>
            <p className="text-lg font-black text-on-background font-headline">{reviews.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-outline-variant flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">verified</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Verificadas</p>
            <p className="text-lg font-black text-on-background font-headline">{verifiedCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-outline-variant">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Distribución</p>
          <div className="space-y-1">
            {ratingDist.map(d => (
              <div key={d.star} className="flex items-center gap-1.5">
                <span className="text-[10px] text-text-muted w-3 font-bold">{d.star}</span>
                <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: reviews.length ? `${(d.count / reviews.length) * 100}%` : '0%' }} />
                </div>
                <span className="text-[10px] text-text-muted w-4 text-right">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por usuario, título o comentario..."
              className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[5, 4, 3, 2, 1].map(star => (
              <button key={star} onClick={() => setRatingFilter(ratingFilter === star ? 0 : star)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${ratingFilter === star ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-300' : 'bg-surface-container-low text-text-muted hover:bg-surface-container-high border border-outline-variant'}`}>
                {star}<span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </button>
            ))}
            <button onClick={() => setVerifiedFilter(verifiedFilter === 'yes' ? '' : 'yes')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${verifiedFilter === 'yes' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300' : 'bg-surface-container-low text-text-muted hover:bg-surface-container-high border border-outline-variant'}`}>
              Verificadas
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-outline-variant">rate_review</span>
            <p className="text-sm text-text-muted mt-2">No se encontraron reseñas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[650px]">
              <thead>
                <tr className="bg-surface-container-low text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <th className="px-5 py-3">Usuario</th>
                  <th className="px-5 py-3">Calificación</th>
                  <th className="px-5 py-3">Comentario</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {paginated.map(rev => {
                  const reviewerName = rev.reviewer ? `${rev.reviewer.firstName} ${rev.reviewer.lastName}` : 'Anónimo'
                  return (
                    <tr key={rev.id} className="hover:bg-surface-container-low/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {rev.reviewer?.avatarUrl ? (
                            <img src={rev.reviewer.avatarUrl} alt={reviewerName} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                              {(rev.reviewer?.firstName?.[0] || 'A') + (rev.reviewer?.lastName?.[0] || '')}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-on-background">{reviewerName}</p>
                            <p className="text-xs text-text-muted truncate">{rev.title || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3"><Stars rating={rev.rating} /></td>
                      <td className="px-5 py-3 text-sm text-text-muted max-w-[200px] truncate">{rev.body}</td>
                      <td className="px-5 py-3 text-sm text-text-muted">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('es-PE') : '—'}</td>
                      <td className="px-5 py-3">
                        {rev.isVerifiedPurchase ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span> Verificada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-high text-text-muted text-[11px] font-bold rounded-full">
                            <span className="material-symbols-outlined text-[12px]">schedule</span> Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => setViewReview(rev)} title="Ver detalle"
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-colors opacity-60 group-hover:opacity-100">
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

        <div className="px-5 py-3 border-t border-outline-variant/30 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-text-muted">
            Mostrando <span className="font-bold text-text-muted">{Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}-{Math.min(page * ITEMS_PER_PAGE, total)}</span> de <span className="font-bold text-text-muted">{total}</span> reseñas
          </span>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
        </div>
      </div>

      {/* View Review Modal */}
      {viewReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="text-lg font-bold text-on-background font-headline">Detalle de Reseña</h3>
              <button onClick={() => setViewReview(null)} className="p-1 hover:bg-surface-container-high rounded-lg"><span className="material-symbols-outlined text-text-muted">close</span></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {(viewReview.reviewer?.firstName?.[0] || 'A') + (viewReview.reviewer?.lastName?.[0] || '')}
                </div>
                <div>
                  <p className="text-sm font-bold text-on-background">{viewReview.reviewer ? `${viewReview.reviewer.firstName} ${viewReview.reviewer.lastName}` : 'Anónimo'}</p>
                  <p className="text-xs text-text-muted">{viewReview.createdAt ? new Date(viewReview.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Stars rating={viewReview.rating} size={20} />
                <span className="text-sm font-bold text-text-muted">{viewReview.rating}/5</span>
                {viewReview.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
                    <span className="material-symbols-outlined text-[11px]">verified</span> Compra Verificada
                  </span>
                )}
              </div>
              {viewReview.title && <p className="text-base font-bold text-on-background">{viewReview.title}</p>}
              <p className="text-sm text-text-muted leading-relaxed">{viewReview.body}</p>
              {viewReview.helpfulCount > 0 && (
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">thumb_up</span> {viewReview.helpfulCount} personas encontraron esto útil
                </p>
              )}
            </div>
            <div className="p-4 border-t border-outline-variant/30 flex justify-between gap-2">
              <button onClick={() => handleDeleteReview(viewReview.id)}
                className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1.5 transition-colors">
                <span className="material-symbols-outlined text-[18px]">delete</span> Eliminar
              </button>
              <div className="flex gap-2">
                {!viewReview.isVerifiedPurchase && (
                  <button onClick={() => handleModerateReview(viewReview.id, 'approve')}
                    className="px-4 py-2 text-sm font-bold text-white bg-mint hover:bg-mint/80 rounded-lg flex items-center gap-1.5 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span> Aprobar
                  </button>
                )}
                <button onClick={() => handleModerateReview(viewReview.id, 'reject')}
                  className="px-4 py-2 text-sm font-bold text-white bg-secondary hover:bg-secondary/80 rounded-lg flex items-center gap-1.5 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">block</span> Rechazar
                </button>
                <button onClick={() => setViewReview(null)} className="px-4 py-2 text-sm font-bold text-text-muted hover:bg-surface-container-high rounded-lg transition-colors">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
