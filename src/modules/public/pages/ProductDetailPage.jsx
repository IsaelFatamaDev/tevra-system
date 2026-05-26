import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../../core/hooks/useCart'
import { useAuth } from '../../../core/contexts/AuthContext'
import { useSiteConfig } from '../../../core/contexts/SiteConfigContext'
import productsService from '../services/products.service'
import reviewsService from '../services/reviews.service'
import { useTranslateContent } from '../../../core/hooks/useTranslateContent'

/* ─── Star Rating ──────────────────────────────────────────────────── */
function Stars({ rating = 0, size = 16, interactive = false, onChange }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <span
          key={s}
          onClick={() => interactive && onChange?.(s)}
          className={`material-symbols-outlined leading-none ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          style={{
            fontSize: size,
            color: s <= Math.round(rating) ? '#FFA41C' : '#D1D5DB',
            fontVariationSettings: s <= Math.round(rating) ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          star
        </span>
      ))}
    </div>
  )
}

/* ─── Trust Badge ──────────────────────────────────────────────────── */
function TrustBadge({ icon, text, sub }) {
  return (
    <div className="flex items-start gap-3">
      <span className="material-symbols-outlined text-[#007185] text-[22px] shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-[13px] font-semibold text-slate-800">{text}</p>
        {sub && <p className="text-[12px] text-slate-500">{sub}</p>}
      </div>
    </div>
  )
}

/* ─── Review Card ──────────────────────────────────────────────────── */
function ReviewCard({ review }) {
  const initials = `${review.user?.firstName?.[0] || 'U'}${review.user?.lastName?.[0] || ''}`
  const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' }) : ''
  return (
    <div className="border border-slate-200 rounded-xl p-5 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0046be]/10 flex items-center justify-center text-[13px] font-bold text-[#0046be] shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-900">{review.user?.firstName || 'Usuario'} {review.user?.lastName?.[0] || ''}.</p>
            {date && <p className="text-[11px] text-slate-400">{date}</p>}
          </div>
        </div>
        <Stars rating={review.rating || 5} size={13} />
      </div>
      {review.title && <p className="font-bold text-[13px] text-slate-900 mb-1">{review.title}</p>}
      <p className="text-[13px] text-slate-600 leading-relaxed">{review.comment}</p>
    </div>
  )
}

/* ─── Related Product Card ─────────────────────────────────────────── */
function RelatedCard({ product }) {
  const priceSoles = Number(product.priceLocal || (product.priceUsd * 3.80))
  return (
    <Link
      to={`/catalogo/${product.slug || product.id}`}
      className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:border-slate-300 transition-all"
    >
      <div className="aspect-square bg-[#F8F8F8] p-4 flex items-center justify-center">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply" />
        ) : (
          <span className="material-symbols-outlined text-4xl text-slate-200">image</span>
        )}
      </div>
      <div className="p-4">
        {product.brand?.name && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{product.brand.name}</p>}
        <h4 className="text-[13px] font-medium text-[#007185] group-hover:text-[#C45500] line-clamp-2 mb-2 leading-snug">{product.name}</h4>
        <p className="text-[16px] font-bold text-slate-900">S/ {priceSoles.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
      </div>
    </Link>
  )
}

/* ─── Description Renderer ─────────────────────────────────────────── */
function DescriptionBlock({ text }) {
  if (!text) return null
  const lines = text.split('\n').filter(l => l.trim())
  return (
    <div className="space-y-4">
      {lines.map((line, i) => {
        const t = line.trim()
        // Format: "HEADER—paragraph text" or "HEADER—paragraph"
        const emDashIdx = t.indexOf('\u2014')
        if (emDashIdx > 0) {
          const header = t.slice(0, emDashIdx).trim()
          const body   = t.slice(emDashIdx + 1).trim()
          // Only treat as header—body if the left side looks like a title (no sentence ending)
          if (header.length < 60 && !header.endsWith('.')) {
            return (
              <div key={i} className="space-y-1">
                <p className="text-[13px] font-bold text-slate-900">{header}</p>
                <p className="text-[13.5px] text-slate-600 leading-relaxed">{body}</p>
              </div>
            )
          }
        }
        // ALL CAPS standalone header (no em dash)
        if (t.length >= 3 && t === t.toUpperCase() && /[A-Z]/.test(t) && !/\d/.test(t) && !t.includes('\u2014')) {
          return (
            <p key={i} className="text-[12px] font-black text-[#0046be] uppercase tracking-widest mt-2 pb-1 border-b border-slate-100">
              {t}
            </p>
          )
        }
        // Bullet line
        if (/^[-\u2014\u2022*]/.test(t)) {
          return (
            <div key={i} className="flex items-start gap-2.5 text-[13.5px] text-slate-600 leading-relaxed">
              <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#007185] shrink-0" />
              <span>{t.replace(/^[-\u2014\u2022*]\s*/, '')}</span>
            </div>
          )
        }
        return <p key={i} className="text-[13.5px] text-slate-600 leading-relaxed">{t}</p>
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                          */
/* ═══════════════════════════════════════════════════════════════════ */
export default function ProductDetailPage() {
  const { slug }                 = useParams()
  const navigate                 = useNavigate()
  const { whatsapp: supportWA }  = useSiteConfig()
  const { addItem }              = useCart()
  const { isAuthenticated }      = useAuth()
  const { t, i18n }              = useTranslation()

  const [product,          setProduct]          = useState(null)
  const [related,          setRelated]          = useState([])
  const [reviews,          setReviews]          = useState([])
  const [loading,          setLoading]          = useState(true)
  const [activeImg,        setActiveImg]        = useState(0)
  const [addedToCart,      setAddedToCart]      = useState(false)
  const [qty,              setQty]              = useState(1)
  const [activeTab,        setActiveTab]        = useState('desc') // 'desc' | 'specs' | 'reviews'
  const [showReviewForm,   setShowReviewForm]   = useState(false)
  const [reviewForm,       setReviewForm]       = useState({ rating: 5, title: '', comment: '' })
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewSubmitted,  setReviewSubmitted]  = useState(false)
  const [reviewError,      setReviewError]      = useState('')

  const currentLang          = i18n.language || 'es'
  const translatedDescription = useTranslateContent(product?.description, 'es')

  useEffect(() => {
    setLoading(true)
    productsService.findOne(slug)
      .then(data => {
        setProduct(data)
        setActiveImg(0)
        setQty(1)
        if (data?.category?.slug) {
          productsService.findAll({ category: data.category.slug, limit: 5 })
            .then(r => {
              const items = r?.items ?? (Array.isArray(r) ? r : [])
              setRelated(items.filter(p => p.id !== data.id).slice(0, 4))
            })
            .catch(() => {})
        }
        reviewsService.findByProduct(data.id)
          .then(list => setReviews(list))
          .catch(() => {})
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      productId: product.id,
      slug: product.slug || slug,
      name: product.name,
      price: Number(product.priceUsd || 0),
      image: product.images?.[0] || '',
      brand: product.brand?.name || '',
      qty,
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleWhatsApp = () => {
    if (!product || !supportWA) return
    const msg = encodeURIComponent(
      `¡Hola! Me interesa este producto de TeVra:\n\n*${product.name}*\nPrecio: $${Number(product.priceUsd || 0).toFixed(0)} USD\n${product.brand ? `Marca: ${product.brand.name}\n` : ''}\n¿Me pueden dar más información?`
    )
    window.open(`https://wa.me/${supportWA.replace(/\D/g, '')}?text=${msg}`, '_blank')
  }

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
      reviewsService.findByProduct(product.id).then(list => setReviews(list)).catch(() => {})
    } catch {
      setReviewError(t('product.reviewError', 'No se pudo enviar la reseña. Intenta de nuevo.'))
    } finally {
      setReviewSubmitting(false)
    }
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA]" style={{ paddingTop: 'clamp(3.5rem,8vh,5rem)' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-white rounded-2xl border border-slate-200" />
            <div className="space-y-4 py-4">
              <div className="h-4 bg-slate-100 rounded w-1/4" />
              <div className="h-8 bg-slate-100 rounded w-3/4" />
              <div className="h-8 bg-slate-100 rounded w-1/2" />
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-5/6" />
              <div className="h-14 bg-slate-100 rounded-full mt-8" />
              <div className="h-14 bg-slate-100 rounded-full" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  /* ── Not found ── */
  if (!product) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center" style={{ paddingTop: 'clamp(3.5rem,8vh,5rem)' }}>
        <div className="text-center p-12">
          <span className="material-symbols-outlined text-7xl text-slate-200 block mb-4">search_off</span>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('product.notFound')}</h1>
          <Link to="/catalogo" className="text-[#007185] hover:text-[#C45500] font-semibold hover:underline">{t('product.backToCatalog')}</Link>
        </div>
      </main>
    )
  }

  const images       = product.images?.length ? product.images : []
  const specs        = product.specifications ? Object.entries(product.specifications) : []
  const priceSoles   = Number(product.priceLocal || (product.priceUsd * 3.80))
  const priceUsd     = Number(product.priceUsd || 0)
  const refPrice     = Number(product.priceRefLocal || 0)
  const ahorra       = refPrice > priceSoles ? refPrice - priceSoles : 0
  const discountPct  = refPrice > priceSoles ? Math.round(((refPrice - priceSoles) / refPrice) * 100) : 0
  const avgRating    = product.avgRating || 0
  const reviewCount  = product.reviewCount || reviews.length

  const desc = currentLang.startsWith('en')
    ? (product.descriptionEn || translatedDescription || product.description)
    : product.description

  const TABS = [
    { id: 'desc',    label: t('product.detailTab', 'Descripción') },
    { id: 'reviews', label: `${t('product.customerReviews')} (${reviewCount})` },
  ]

  return (
    <main className="min-h-screen bg-[#FAFAFA]" style={{ paddingTop: 'clamp(3.5rem,8vh,5rem)' }}>

      {/* ── Breadcrumb ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100">
        <nav className="max-w-[1400px] mx-auto px-4 sm:px-8 py-3 flex items-center gap-1.5 text-[12px] text-slate-500 flex-wrap">
          <Link to="/" className="hover:text-[#C45500] transition-colors">Inicio</Link>
          <span className="material-symbols-outlined text-[14px] text-slate-300">chevron_right</span>
          <Link to="/catalogo" className="hover:text-[#C45500] transition-colors">{t('nav.buy')}</Link>
          {product.category && (
            <>
              <span className="material-symbols-outlined text-[14px] text-slate-300">chevron_right</span>
              <Link to={`/catalogo?category=${product.category.slug}`} className="hover:text-[#C45500] transition-colors">{product.category.name}</Link>
            </>
          )}
          <span className="material-symbols-outlined text-[14px] text-slate-300">chevron_right</span>
          <span className="text-slate-800 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* ── Main Product Section ───────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">

          {/* Left — Images */}
          <div className="flex gap-4">
            {/* Thumbnails vertical */}
            {images.length > 1 && (
              <div className="hidden sm:flex flex-col gap-2 w-16 shrink-0">
                {images.slice(0, 6).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      idx === activeImg
                        ? 'border-[#007185] shadow-sm'
                        : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain bg-[#F8F8F8] p-1 mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative" style={{ aspectRatio: '1/1' }}>
                {discountPct > 0 && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-[12px] font-black px-2.5 py-1 rounded-md z-10">
                    -{discountPct}%
                  </div>
                )}
                {images.length > 0 ? (
                  <img
                    src={images[activeImg]}
                    alt={product.name}
                    className="w-full h-full object-contain p-8 mix-blend-multiply"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-8xl text-slate-100">image</span>
                  </div>
                )}
              </div>

              {/* Mobile thumbnails row */}
              {images.length > 1 && (
                <div className="flex sm:hidden gap-2 mt-3 overflow-x-auto pb-1">
                  {images.slice(0, 6).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      className={`shrink-0 w-14 h-14 rounded-lg border-2 overflow-hidden transition-all ${idx === activeImg ? 'border-[#007185]' : 'border-slate-200 opacity-60'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain bg-[#F8F8F8] mix-blend-multiply" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — Product Info */}
          <div className="flex flex-col gap-5">

            {/* Brand + Title */}
            <div>
              {product.brand?.name && (
                <Link to={`/catalogo?brand=${product.brand.name}`} className="text-[#007185] hover:text-[#C45500] text-[13px] font-semibold hover:underline block mb-1">
                  {product.brand.name}
                </Link>
              )}
              <h1 className="text-[22px] sm:text-[26px] font-semibold text-slate-900 leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <Stars rating={avgRating} size={16} />
              <span className="text-[#007185] text-[13px] hover:text-[#C45500] cursor-pointer hover:underline" onClick={() => setActiveTab('reviews')}>
                {reviewCount > 0 ? `${reviewCount} ${t('product.reviews')}` : t('product.noReviews')}
              </span>
              {product.brand?.name && (
                <>
                  <span className="text-slate-200">|</span>
                  <span className="text-[13px] text-slate-500">{product.brand.name}</span>
                </>
              )}
            </div>

            {/* Price block */}
            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-baseline gap-2 flex-wrap mb-1">
                <span className="text-[13px] text-slate-600 font-medium">S/</span>
                <span className="text-[36px] font-medium text-slate-900 leading-none tracking-tight">
                  {priceSoles.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[14px] text-slate-500">· US$ {priceUsd.toFixed(2)}</span>
              </div>

              {refPrice > priceSoles && (
                <p className="text-[13px] text-slate-500 mb-1">
                  {t('catalog.sidebar.refPrice', 'Precio de referencia')}: <span className="line-through">S/ {refPrice.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </p>
              )}
              {ahorra > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[12px] font-bold px-3 py-1 rounded-full mt-1">
                  <span className="material-symbols-outlined text-[14px]">savings</span>
                  {t('catalog.card.saves')} S/ {ahorra.toLocaleString('es-PE', { minimumFractionDigits: 2 })} ({discountPct}%)
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <TrustBadge icon="local_shipping" text={t('catalog.card.freeShipping')} sub={t('product.shippingFrom')} />
              <TrustBadge icon="verified_user" text={t('catalog.card.origin')} sub={t('product.originalsDesc', 'Comprado en tiendas oficiales de USA')} />
              <TrustBadge icon="payments" text={t('product.payViaAgent', 'Paga a tu agente de confianza')} sub={t('product.payViaAgentSub', '100% seguro sin intermediarios digitales')} />
            </div>

            {/* Qty + Add to cart */}
            <div className="space-y-3">

              {/* Quantity selector */}
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-slate-600 font-medium">Cantidad:</span>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-700 font-bold"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-[14px] font-semibold text-slate-900 border-x border-slate-300">{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-700 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                className={`w-full py-3.5 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-sm ${
                  addedToCart
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-[#FFD814] hover:bg-[#F7CA00] text-slate-900 border border-[#FCD200]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{addedToCart ? 'check_circle' : 'shopping_cart'}</span>
                {addedToCart ? t('product.addedToCart') : t('product.addToCart')}
              </button>

              {/* Quote with agent */}
              <button
                onClick={handleWhatsApp}
                className="w-full py-3.5 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                {t('product.quoteWithAgent')}
              </button>

              {/* Find agent link */}
              <Link
                to="/directorio-agentes"
                className="w-full py-3 rounded-full font-semibold text-[14px] flex items-center justify-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
                {t('product.findAgent')}
              </Link>
            </div>

            {/* Secure order box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-slate-500 text-[18px]">lock</span>
                <p className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">{t('cart.secureOrder')}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: 'verified', label: t('product.trustOriginal', '100% Original') },
                  { icon: 'flight',   label: t('product.trustUSA', 'Desde USA') },
                  { icon: 'shield',   label: t('product.trustShipping', 'Envío Asegurado') },
                ].map(b => (
                  <div key={b.label} className="flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-[#007185] text-[22px]">{b.icon}</span>
                    <span className="text-[10px] text-slate-600 font-medium whitespace-pre-line leading-tight">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Tabs: Description / Specs / Reviews ───────────────────── */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 pb-10">

        {/* Tab bar */}
        <div className="flex border-b border-slate-200 mb-8 gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-6 py-3.5 text-[14px] font-semibold transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-[#007185] text-[#007185]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Description tab */}
        {activeTab === 'desc' && (
          <div className="max-w-3xl">
            {desc ? (
              <DescriptionBlock text={desc} />
            ) : (
              <p className="text-slate-400 text-[14px]">No hay descripción disponible.</p>
            )}
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">

            {/* Summary */}
            {reviewCount > 0 && (
              <div className="flex items-center gap-6 p-6 bg-white border border-slate-200 rounded-2xl w-fit">
                <div className="text-center">
                  <p className="text-[52px] font-black text-slate-900 leading-none">{avgRating.toFixed(1)}</p>
                  <Stars rating={avgRating} size={18} />
                  <p className="text-[12px] text-slate-500 mt-1">{reviewCount} {t('product.reviews')}</p>
                </div>
              </div>
            )}

            {/* Submit Review button */}
            {isAuthenticated && !showReviewForm && !reviewSubmitted && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#007185] text-[#007185] rounded-xl font-bold text-[14px] hover:bg-[#007185] hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">rate_review</span>
                {t('product.leaveReview')}
              </button>
            )}

            {!isAuthenticated && (
              <Link
                to={`/login?redirect=/catalogo/${product?.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-600 rounded-xl font-bold text-[14px] hover:border-[#007185] hover:text-[#007185] transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                {t('product.reviewLoginMsg')}
              </Link>
            )}

            {/* Review form */}
            {showReviewForm && !reviewSubmitted && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl shadow-sm">
                <h3 className="font-bold text-[17px] text-slate-900 mb-5">{t('product.leaveReviewTitle')}</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="text-[13px] font-semibold text-slate-700 block mb-2">{t('product.reviewRating')}</label>
                    <Stars rating={reviewForm.rating} size={28} interactive onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
                  </div>
                  <input
                    type="text"
                    placeholder={t('product.reviewTitlePlaceholder')}
                    value={reviewForm.title}
                    onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#007185]/30 focus:border-[#007185] transition-all"
                  />
                  <textarea
                    placeholder={t('product.reviewCommentPlaceholder')}
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                    rows={4}
                    required
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#007185]/30 focus:border-[#007185] transition-all resize-none"
                  />
                  {reviewError && <p className="text-red-500 text-[13px]">{reviewError}</p>}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={reviewSubmitting || !reviewForm.comment.trim()}
                      className="px-7 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] text-slate-900 border border-[#FCD200] rounded-full font-bold text-[14px] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {reviewSubmitting && <span className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />}
                      {reviewSubmitting ? t('product.reviewSubmitting') : t('product.reviewSubmit')}
                    </button>
                    <button type="button" onClick={() => setShowReviewForm(false)} className="px-5 py-2.5 text-slate-500 hover:text-slate-800 text-[14px] transition-colors">
                      {t('common.cancel')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {reviewSubmitted && (
              <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 border border-emerald-200 px-5 py-4 rounded-xl w-fit">
                <span className="material-symbols-outlined text-[22px]">check_circle</span>
                <p className="font-semibold text-[14px]">{t('product.reviewThanks')}</p>
              </div>
            )}

            {/* Reviews list */}
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.slice(0, 9).map(r => <ReviewCard key={r.id} review={r} />)}
              </div>
            ) : (
              <p className="text-slate-400 text-[14px]">{t('product.noReviews')}</p>
            )}
          </div>
        )}
      </section>

      {/* ── Related Products ────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[20px] font-bold text-slate-900">{t('product.relatedProducts')}</h2>
            <Link to="/catalogo" className="text-[#007185] hover:text-[#C45500] text-[13px] font-semibold hover:underline">
              {t('catalog.seeAll')} →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map(p => <RelatedCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

    </main>
  )
}
