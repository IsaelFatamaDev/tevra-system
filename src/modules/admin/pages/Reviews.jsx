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
        <span key={i} className={`material-symbols-outlined text-[${size}px] ${i < rating ? 'text-amber-400' : 'text-zinc-200'}`}
          style={{ fontVariationSettings: i < rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
      ))}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-5 platform-enter">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">Moderación de Reseñas</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Supervisa la retroalimentación de los clientes sobre los productos.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center gap-3 stat-card">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">star</span>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Rating Promedio</p>
            <p className="text-lg font-semibold text-zinc-900">{avgRating.toFixed(1)}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center gap-3 stat-card">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">reviews</span>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Total Reseñas</p>
            <p className="text-lg font-semibold text-zinc-900">{reviews.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center gap-3 stat-card">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Verificadas</p>
            <p className="text-lg font-semibold text-zinc-900">{verifiedCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200">
          <p className="text-xs text-zinc-500 mb-2">Distribución</p>
          <div className="space-y-1">
            {ratingDist.map(d => (
              <div key={d.star} className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-500 w-3 font-medium">{d.star}</span>
                <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: reviews.length ? `${(d.count / reviews.length) * 100}%` : '0%' }} />
                </div>
                <span className="text-[10px] text-zinc-500 w-4 text-right">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por usuario, título o comentario..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[5, 4, 3, 2, 1].map(star => (
              <button key={star} onClick={() => setRatingFilter(ratingFilter === star ? 0 : star)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${ratingFilter === star ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200'}`}>
                {star}<span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </button>
            ))}
            <button onClick={() => setVerifiedFilter(verifiedFilter === 'yes' ? '' : 'yes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${verifiedFilter === 'yes' ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200'}`}>
              Verificadas
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-3xl text-zinc-300">rate_review</span>
            <p className="text-sm text-zinc-500 mt-2">No se encontraron reseñas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[650px]">
              <thead>
                <tr className="bg-zinc-50 text-[11px] font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-100">
                  <th className="px-5 py-3">Usuario</th>
                  <th className="px-5 py-3">Calificación</th>
                  <th className="px-5 py-3">Comentario</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {paginated.map(rev => {
                  const reviewerName = rev.reviewer ? `${rev.reviewer.firstName} ${rev.reviewer.lastName}` : 'Anónimo'
                  return (
                    <tr key={rev.id} className="hover:bg-zinc-50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {rev.reviewer?.avatarUrl ? (
                            <img src={rev.reviewer.avatarUrl} alt={reviewerName} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-medium text-xs">
                              {(rev.reviewer?.firstName?.[0] || 'A') + (rev.reviewer?.lastName?.[0] || '')}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-900">{reviewerName}</p>
                            <p className="text-xs text-zinc-500 truncate">{rev.title || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3"><Stars rating={rev.rating} /></td>
                      <td className="px-5 py-3 text-sm text-zinc-500 max-w-[200px] truncate">{rev.body}</td>
                      <td className="px-5 py-3 text-sm text-zinc-500">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('es-PE') : '—'}</td>
                      <td className="px-5 py-3">
                        {rev.isVerifiedPurchase ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-medium rounded-md">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span> Verificada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[11px] font-medium rounded-md">
                            <span className="material-symbols-outlined text-[12px]">schedule</span> Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => setViewReview(rev)} title="Ver detalle"
                          className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors opacity-60 group-hover:opacity-100">
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

        <div className="px-5 py-3 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-zinc-500">
            Mostrando <span className="font-medium">{Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}-{Math.min(page * ITEMS_PER_PAGE, total)}</span> de <span className="font-medium">{total}</span> reseñas
          </span>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
        </div>
      </div>

      {/* View Review Modal */}
      {viewReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-base font-semibold text-zinc-900">Detalle de Reseña</h3>
              <button onClick={() => setViewReview(null)} className="p-1 hover:bg-zinc-100 rounded-md"><span className="material-symbols-outlined text-zinc-400 text-[18px]">close</span></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-medium text-sm">
                  {(viewReview.reviewer?.firstName?.[0] || 'A') + (viewReview.reviewer?.lastName?.[0] || '')}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">{viewReview.reviewer ? `${viewReview.reviewer.firstName} ${viewReview.reviewer.lastName}` : 'Anónimo'}</p>
                  <p className="text-xs text-zinc-500">{viewReview.createdAt ? new Date(viewReview.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Stars rating={viewReview.rating} size={20} />
                <span className="text-sm font-medium text-zinc-500">{viewReview.rating}/5</span>
                {viewReview.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded-md">
                    <span className="material-symbols-outlined text-[11px]">verified</span> Compra Verificada
                  </span>
                )}
              </div>
              {viewReview.title && <p className="text-sm font-semibold text-zinc-900">{viewReview.title}</p>}
              <p className="text-sm text-zinc-500 leading-relaxed">{viewReview.body}</p>
              {viewReview.helpfulCount > 0 && (
                <p className="text-xs text-zinc-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">thumb_up</span> {viewReview.helpfulCount} personas encontraron esto útil
                </p>
              )}
            </div>
            <div className="p-4 border-t border-zinc-100 flex justify-between gap-2">
              <button onClick={() => handleDeleteReview(viewReview.id)}
                className="px-3.5 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1.5 transition-colors">
                <span className="material-symbols-outlined text-[18px]">delete</span> Eliminar
              </button>
              <div className="flex gap-2">
                {!viewReview.isVerifiedPurchase && (
                  <button onClick={() => handleModerateReview(viewReview.id, 'approve')}
                    className="px-3.5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span> Aprobar
                  </button>
                )}
                <button onClick={() => handleModerateReview(viewReview.id, 'reject')}
                  className="px-3.5 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center gap-1.5 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">block</span> Rechazar
                </button>
                <button onClick={() => setViewReview(null)} className="px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 rounded-lg transition-colors">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
