import { useState, useEffect } from 'react'
import reviewsService from '../../public/services/reviews.service'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState(0)
  const [verifiedFilter, setVerifiedFilter] = useState('')
  const [viewReview, setViewReview] = useState(null)

  useEffect(() => {
    reviewsService.findAll()
      .then(data => setReviews(Array.isArray(data) ? data : data?.items || []))
      .catch(err => console.error('Error fetching reviews', err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = reviews.filter(rev => {
    const q = search.toLowerCase()
    const name = rev.reviewer ? `${rev.reviewer.firstName} ${rev.reviewer.lastName}` : ''
    const matchSearch = !q || name.toLowerCase().includes(q) || rev.title?.toLowerCase().includes(q) || rev.body?.toLowerCase().includes(q)
    const matchRating = !ratingFilter || rev.rating === ratingFilter
    const matchVerified = verifiedFilter === '' || (verifiedFilter === 'yes' ? rev.isVerifiedPurchase : !rev.isVerifiedPurchase)
    return matchSearch && matchRating && matchVerified
  })

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0
  const verifiedCount = reviews.filter(r => r.isVerifiedPurchase).length
  const ratingDist = [5, 4, 3, 2, 1].map(star => ({ star, count: reviews.filter(r => r.rating === star).length }))

  const Stars = ({ rating, size = 16 }) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`material-symbols-outlined text-[${size}px] ${i < rating ? 'text-amber-400' : 'text-gray-200'}`}
          style={{ fontVariationSettings: i < rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
      ))}
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-headline tracking-tight">Moderación de Reseñas</h2>
        <p className="text-sm text-gray-500 mt-1">Supervisa la retroalimentación de los clientes sobre los productos.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">star</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Rating Promedio</p>
            <p className="text-lg font-black text-gray-900 font-headline">{avgRating.toFixed(1)}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">reviews</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Reseñas</p>
            <p className="text-lg font-black text-gray-900 font-headline">{reviews.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">verified</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Verificadas</p>
            <p className="text-lg font-black text-gray-900 font-headline">{verifiedCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Distribución</p>
          <div className="space-y-1">
            {ratingDist.map(d => (
              <div key={d.star} className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 w-3 font-bold">{d.star}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: reviews.length ? `${(d.count / reviews.length) * 100}%` : '0%' }} />
                </div>
                <span className="text-[10px] text-gray-400 w-4 text-right">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por usuario, título o comentario..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[5, 4, 3, 2, 1].map(star => (
              <button key={star} onClick={() => setRatingFilter(ratingFilter === star ? 0 : star)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${ratingFilter === star ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-300' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
                {star}<span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </button>
            ))}
            <button onClick={() => setVerifiedFilter(verifiedFilter === 'yes' ? '' : 'yes')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${verifiedFilter === 'yes' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
              Verificadas
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-[3px] border-sky-200 border-t-sky-600 rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-gray-300">rate_review</span>
            <p className="text-sm text-gray-400 mt-2">No se encontraron reseñas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[650px]">
              <thead>
                <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Usuario</th>
                  <th className="px-5 py-3">Calificación</th>
                  <th className="px-5 py-3">Comentario</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(rev => {
                  const reviewerName = rev.reviewer ? `${rev.reviewer.firstName} ${rev.reviewer.lastName}` : 'Anónimo'
                  return (
                    <tr key={rev.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {rev.reviewer?.avatarUrl ? (
                            <img src={rev.reviewer.avatarUrl} alt={reviewerName} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-sky-700 font-bold text-xs">
                              {(rev.reviewer?.firstName?.[0] || 'A') + (rev.reviewer?.lastName?.[0] || '')}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800">{reviewerName}</p>
                            <p className="text-xs text-gray-400 truncate">{rev.title || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3"><Stars rating={rev.rating} /></td>
                      <td className="px-5 py-3 text-sm text-gray-500 max-w-[200px] truncate">{rev.body}</td>
                      <td className="px-5 py-3 text-sm text-gray-400">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('es-PE') : '—'}</td>
                      <td className="px-5 py-3">
                        {rev.isVerifiedPurchase ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span> Verificada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-full">
                            <span className="material-symbols-outlined text-[12px]">schedule</span> Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => setViewReview(rev)} title="Ver detalle"
                          className="p-1.5 rounded-lg hover:bg-sky-50 text-gray-400 hover:text-sky-600 transition-colors opacity-60 group-hover:opacity-100">
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

        <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-400">
            Mostrando <span className="font-bold text-gray-600">{filtered.length}</span> de <span className="font-bold text-gray-600">{reviews.length}</span> reseñas
          </span>
        </div>
      </div>

      {/* View Review Modal */}
      {viewReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 font-headline">Detalle de Reseña</h3>
              <button onClick={() => setViewReview(null)} className="p-1 hover:bg-gray-100 rounded-lg"><span className="material-symbols-outlined text-gray-400">close</span></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-700 font-bold text-sm">
                  {(viewReview.reviewer?.firstName?.[0] || 'A') + (viewReview.reviewer?.lastName?.[0] || '')}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{viewReview.reviewer ? `${viewReview.reviewer.firstName} ${viewReview.reviewer.lastName}` : 'Anónimo'}</p>
                  <p className="text-xs text-gray-400">{viewReview.createdAt ? new Date(viewReview.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Stars rating={viewReview.rating} size={20} />
                <span className="text-sm font-bold text-gray-600">{viewReview.rating}/5</span>
                {viewReview.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
                    <span className="material-symbols-outlined text-[11px]">verified</span> Compra Verificada
                  </span>
                )}
              </div>
              {viewReview.title && <p className="text-base font-bold text-gray-800">{viewReview.title}</p>}
              <p className="text-sm text-gray-600 leading-relaxed">{viewReview.body}</p>
              {viewReview.helpfulCount > 0 && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">thumb_up</span> {viewReview.helpfulCount} personas encontraron esto útil
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
