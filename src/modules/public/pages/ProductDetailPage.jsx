import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../../core/hooks/useCart'
import { useAuth } from '../../../core/contexts/AuthContext'
import productsService from '../services/products.service'
import reviewsService from '../services/reviews.service'
import { TEVRA_SUPPORT_WHATSAPP } from '../../../core/config/constants'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const { addItem } = useCart()
  const { isAuthenticated, user } = useAuth()
  const { t } = useTranslation()

  useEffect(() => {
    setLoading(true)
    productsService.findOne(slug)
      .then(data => {
        setProduct(data)
        setActiveImg(0)
        // Fetch related products by same category
        if (data?.category?.slug) {
          productsService.findAll({ category: data.category.slug, limit: 4 })
            .then(r => {
              const items = r?.items || (Array.isArray(r) ? r : [])
              setRelated(items.filter(p => p.id !== data.id).slice(0, 4))
            })
            .catch(() => { })
        }
        // Fetch product reviews (public — no auth needed)
        reviewsService.findByProduct(data.id)
          .then(list => setReviews(list))
          .catch(() => { })
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!reviewForm.comment.trim()) return
    setReviewSubmitting(true)
    setReviewError('')
    try {
      await reviewsService.create({
        productId: product.id,
        rating: reviewForm.rating,
        title: reviewForm.title.trim() || undefined,
        comment: reviewForm.comment.trim(),
      })
      setReviewSubmitted(true)
      setReviewForm({ rating: 5, title: '', comment: '' })
      reviewsService.findByProduct(product.id)
        .then(list => setReviews(list))
        .catch(() => { })
    } catch {
      setReviewError('No se pudo enviar la reseña. Intenta de nuevo.')
    } finally {
      setReviewSubmitting(false)
    }
  }

  const handleWhatsApp = () => {
    if (!product) return
    const msg = encodeURIComponent(
      `¡Hola! Me interesa este producto de TeVra:\n\n` +
      `*${product.name}*\n` +
      `Precio: $${Number(product.priceUsd || 0).toFixed(0)} USD\n` +
      (product.brand ? `Marca: ${product.brand.name}\n` : '') +
      `\n¿Me pueden dar más información?`
    )
    window.open(`https://wa.me/${TEVRA_SUPPORT_WHATSAPP.replace(/\D/g, '')}?text=${msg}`, '_blank')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background-cream" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }} />
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background-cream flex items-center justify-center" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">error</span>
          <p className="font-headline font-bold text-xl text-primary mb-2">{t('product.notFound')}</p>
          <Link to="/catalogo" className="text-secondary font-semibold hover:underline">{t('product.backToCatalog')}</Link>
        </div>
      </main>
    )
  }

  const images = product.images?.length ? product.images : []
  const specs = product.specifications ? Object.entries(product.specifications) : []
  const savingsAmount = product.priceRefLocal ? Math.round(Number(product.priceRefLocal) - (Number(product.priceUsd || 0) * 3.7)) : null

  return (
    <main className="min-h-screen bg-[#fff8f1]" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-4">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link to="/catalogo" className="hover:text-primary transition-colors">{t('nav.buy')}</Link>
          {product.category && (
            <>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <Link to={`/catalogo?category=${product.category.slug}`} className="hover:text-primary transition-colors">{product.category.name}</Link>
            </>
          )}
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary font-semibold truncate max-w-50">{product.name}</span>
        </nav>
      </div>

      {/* Product Main Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Left: Image Gallery (3/5) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-8 border border-outline-variant/10">
              {images.length > 0 ? (
                <img src={images[activeImg] || images[0]} alt={product.name} className="w-full h-full object-contain" />
              ) : (
                <span className="material-symbols-outlined text-8xl text-outline-variant/30">image</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${idx === activeImg ? 'border-primary ring-1 ring-primary/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                {images.length > 4 && (
                  <button
                    onClick={() => setActiveImg(4)}
                    className="aspect-square rounded-xl overflow-hidden border-2 border-transparent bg-surface-container flex items-center justify-center text-lg font-bold text-text-muted hover:bg-surface-container-high transition-colors"
                  >
                    +{images.length - 4}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Product Info (2/5) */}
          <div className="lg:col-span-2 lg:sticky lg:top-28 self-start space-y-6">
            {product.brand && (
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">{product.brand.name}</p>
            )}
            <h1 className="font-headline text-3xl lg:text-4xl font-extrabold text-primary leading-tight">{product.name}</h1>

            {/* Rating placeholder */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <span className="text-xs text-text-muted">({reviews.length} {t('product.reviews')})</span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-secondary">US$ {Number(product.priceUsd || 0).toFixed(0)}</span>
                {product.priceRefLocal && (
                  <span className="text-lg line-through text-text-muted/50">S/ {Number(product.priceRefLocal).toLocaleString()}</span>
                )}
              </div>
              {savingsAmount && savingsAmount > 0 && (
                <div className="inline-flex items-center px-3 py-1 bg-[#d1fadf] text-[#027a48] rounded-full text-xs font-bold gap-1">
                  {t('product.savingsUpTo')} S/ {savingsAmount.toLocaleString()} 💰
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-on-surface-variant leading-relaxed text-sm">{product.description}</p>

            {/* Specifications */}
            {specs.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">{t('product.specs')}</p>
                <ul className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-medium text-on-surface">
                  {specs.map(([key, val]) => (
                    <li key={key} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0"></span>
                      <span className="capitalize">{key}: {val}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Add to Cart + Agent Card */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  addItem({
                    productId: product.id,
                    slug: product.slug || slug,
                    name: product.name,
                    price: Number(product.priceUsd || 0),
                    image: images[0] || '',
                    brand: product.brand?.name || '',
                    qty: 1,
                  })
                  setAddedToCart(true)
                  setTimeout(() => setAddedToCart(false), 2000)
                }}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg text-lg ${addedToCart ? 'bg-mint text-primary shadow-green-100' : 'bg-primary text-white hover:bg-secondary'}`}
              >
                <span className="material-symbols-outlined">{addedToCart ? 'check_circle' : 'add_shopping_cart'}</span>
                {addedToCart ? t('product.addedToCart') : t('product.addToCart')}
              </button>

              <Link
                to="/directorio-agentes"
                className="w-full bg-[#25D366] hover:bg-[#1ebd5e] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-200"
              >
                <span className="material-symbols-outlined">chat</span>
                {t('product.quoteWithAgent')}
              </Link>
            </div>

            <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/20 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl">support_agent</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">{t('product.agentNetwork')}</p>
                  <p className="text-xs text-text-muted">{t('product.agentNetworkDesc')}</p>
                </div>
              </div>
              <Link to="/directorio-agentes" className="flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-base">group</span>
                {t('product.findAgent')}
              </Link>
              <div className="flex items-start gap-2 text-xs text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <p>{t('product.shippingFrom')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-16 space-y-8">
        <div>
          <h2 className="text-3xl font-bold font-headline text-primary">{t('product.customerReviews')}</h2>
          <p className="text-on-surface-variant text-sm mt-1">{t('product.reviewsDesc')}</p>
        </div>

        {/* Review submission form */}
        {isAuthenticated ? (
          <div className="bg-white rounded-2xl border border-outline-variant/20 p-6 shadow-sm">
            <h3 className="font-headline font-bold text-primary text-lg mb-4">Deja tu reseña</h3>
            {reviewSubmitted ? (
              <div className="flex items-center gap-3 text-mint py-4">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
                <p className="font-bold">¡Gracias por tu reseña! Será publicada pronto.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-primary mb-2">Calificación</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                        className="text-2xl transition-transform hover:scale-110"
                      >
                        <span
                          className="material-symbols-outlined text-amber-400"
                          style={{ fontVariationSettings: star <= reviewForm.rating ? "'FILL' 1" : "'FILL' 0" }}
                        >star</span>
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Título (opcional)"
                  value={reviewForm.title}
                  onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
                <textarea
                  placeholder="Cuéntanos tu experiencia con este producto..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
                {reviewError && <p className="text-red-500 text-xs">{reviewError}</p>}
                <button
                  type="submit"
                  disabled={reviewSubmitting || !reviewForm.comment.trim()}
                  className="px-8 py-3 bg-primary text-white rounded-xl font-headline font-bold text-sm hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {reviewSubmitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {reviewSubmitting ? 'Enviando...' : 'Publicar reseña'}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-6 text-center">
            <span className="material-symbols-outlined text-3xl text-text-muted mb-2 block">rate_review</span>
            <p className="text-text-muted text-sm mb-3">Inicia sesión para dejar una reseña</p>
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-secondary transition-colors">
              <span className="material-symbols-outlined text-base">login</span>
              Iniciar sesión
            </Link>
          </div>
        )}

        {/* Existing reviews */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-xl space-y-3 shadow-sm border border-outline-variant/10">
                <div className="flex justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(review.rating || 5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <span className="text-xs text-text-muted">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('es-PE') : ''}
                  </span>
                </div>
                {review.title && <p className="font-bold text-primary text-sm">{review.title}</p>}
                <p className="text-sm text-on-surface-variant leading-relaxed italic">"{review.comment}"</p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {(review.user?.firstName?.[0] || 'U')}{(review.user?.lastName?.[0] || '')}
                  </div>
                  <span className="text-xs font-bold">{review.user?.firstName || 'Usuario'} {review.user?.lastName?.[0] || ''}.</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {reviews.length === 0 && !isAuthenticated && (
          <p className="text-text-muted text-sm">Aún no hay reseñas para este producto. ¡Sé el primero!</p>
        )}
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-20 space-y-8">
          <h2 className="text-3xl font-bold font-headline text-primary">{t('product.relatedProducts')}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <Link key={p.id} to={`/catalogo/${p.slug || p.id}`} className="bg-white rounded-xl overflow-hidden group border border-transparent hover:border-outline-variant/20 transition-all hover:shadow-md">
                <div className="aspect-square bg-white p-6 relative">
                  {p.images?.[0] ? (
                    <img className="w-full h-full object-contain group-hover:scale-105 transition-transform" src={p.images[0]} alt={p.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-5xl text-outline-variant/30">image</span>
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-2">
                  {p.category && (
                    <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">{p.category.name}</p>
                  )}
                  <h3 className="font-bold text-primary leading-tight text-sm">{p.name}</h3>
                  <p className="text-secondary font-black text-lg">US$ {Number(p.priceUsd || 0).toFixed(0)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
