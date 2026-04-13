import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useScrollReveal from '../../../core/hooks/useScrollReveal'
import { useCart } from '../../../core/hooks/useCart'
import productsService from '../services/products.service'

function ProductCard({ producto, onClick }) {
  const { ref, isVisible } = useScrollReveal(0.05)
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const { t } = useTranslation()

  const DEMAND_BADGES = {
    very_high: { label: t('catalog.badges.topSales'), bg: 'bg-secondary text-white' },
    high: { label: t('catalog.badges.mostOrdered'), bg: 'bg-mint text-primary' },
  }
  const imgUrl = producto.images?.[0]
  const badge = DEMAND_BADGES[producto.demandLevel]

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addItem({
      productId: producto.id,
      slug: producto.slug,
      name: producto.name,
      price: Number(producto.priceUsd || 0),
      image: producto.images?.[0] || '',
      brand: producto.brand?.name || '',
      qty: 1,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`bg-surface-container-lowest rounded-3xl overflow-hidden shadow-soft hover:shadow-premium hover:-translate-y-1.5 transition-all duration-400 flex flex-col group reveal cursor-pointer ${isVisible ? 'visible' : ''}`}
    >
      <div className="relative overflow-hidden h-52 bg-surface-container-low">
        {imgUrl ? (
          <img src={imgUrl} alt={producto.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-5xl">image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
        {badge && (
          <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${badge.bg}`}>
            {badge.label}
          </span>
        )}
        {producto.isFeatured && !badge && (
          <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-accent-gold text-primary">
            {t('catalog.badges.featured')}
          </span>
        )}
        <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
          <span className="material-symbols-outlined text-primary text-sm">favorite</span>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1 gap-3">
        <div>
          {producto.brand && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{producto.brand.name}</span>
          )}
          <h3 className="font-headline font-bold text-primary text-base leading-tight">{producto.name}</h3>
          <p className="text-text-muted text-xs mt-1 leading-relaxed line-clamp-2">{producto.description}</p>
        </div>
        <div className="mt-auto">
          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="font-black text-xl text-primary">${Number(producto.priceUsd || 0).toFixed(0)}</span>
              <span className="text-xs text-text-muted ml-1">USD</span>
            </div>
            {producto.priceRefLocal && (
              <div className="text-right">
                <span className="text-[10px] text-text-muted line-through block">~S/ {Number(producto.priceRefLocal).toLocaleString()}</span>
                <span className="text-[10px] font-bold text-mint">{t('catalog.card.savingsIn')}</span>
              </div>
            )}
          </div>
          {producto.marginPct && (
            <div className="flex items-center gap-1 mb-3">
              <span className="material-symbols-outlined text-mint text-xs">savings</span>
              <span className="text-[10px] font-bold text-mint">{t('catalog.card.saves')}{producto.marginPct}%</span>
            </div>
          )}
          <button onClick={handleAddToCart} className={`w-full py-3 rounded-2xl font-headline font-bold text-sm transition-colors flex items-center justify-center gap-2 ${added ? 'bg-mint text-primary' : 'bg-primary text-white hover:bg-secondary group-hover:bg-secondary'}`}>
            <span className="material-symbols-outlined text-base">{added ? 'check_circle' : 'add_shopping_cart'}</span>
            {added ? t('catalog.card.added') : t('catalog.card.addToCart')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CatalogoPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [catActiva, setCatActiva] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTimeout, setSearchTimeout] = useState(null)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const SORT_OPTIONS = [
    { value: '', label: t('catalog.sort.featured') },
    { value: 'newest', label: t('catalog.sort.newest') },
    { value: 'price_asc', label: t('catalog.sort.priceAsc') },
    { value: 'price_desc', label: t('catalog.sort.priceDesc') },
    { value: 'popular', label: t('catalog.sort.popular') },
  ]

  useEffect(() => {
    productsService.getCategories()
      .then(data => setCategories(Array.isArray(data) ? data : data?.items || []))
      .catch(() => { })
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    const query = {
      category: catActiva || undefined,
      search: busqueda || undefined,
      sortBy: sortBy || undefined,
      page,
      limit: 20,
    }
    productsService.findAll(query)
      .then(data => {
        if (data?.items) {
          setProducts(data.items)
          setTotal(data.total || 0)
          setTotalPages(data.totalPages || 1)
        } else if (Array.isArray(data)) {
          setProducts(data)
          setTotal(data.length)
        }
      })
      .catch(err => console.error('Error fetching products', err))
      .finally(() => setLoading(false))
  }, [catActiva, busqueda, sortBy, page])

  const handleSearch = (value) => {
    setBusqueda(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    setSearchTimeout(setTimeout(() => setPage(1), 400))
  }

  const handleCategoryChange = (slug) => {
    setCatActiva(slug)
    setPage(1)
  }

  return (
    <main className="min-h-screen bg-background-cream" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
      <section className="tevra-hero-gradient py-16 sm:py-20 overflow-hidden">
        <div className="tevra-hero-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="hero-enter">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-5">
              <span className="w-2 h-2 bg-tevra-coral rounded-full animate-pulse" />
              <span className="text-white text-[11px] font-bold uppercase tracking-widest">{t('catalog.badge')}</span>
            </div>
            <h1 className="font-headline font-extrabold text-white tracking-tight mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              {t('catalog.title')}
            </h1>
            <p className="text-white/70 max-w-xl mb-8" style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)' }}>
              {t('catalog.subtitle')}
            </p>
            <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 max-w-md">
              <span className="material-symbols-outlined text-white/50 mr-3">search</span>
              <input
                className="bg-transparent border-none focus:outline-none text-white placeholder:text-white/40 text-sm w-full"
                placeholder={t('catalog.searchPlaceholder')}
                type="text"
                value={busqueda}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-[clamp(3.5rem,8vh,5rem)] z-40 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => handleCategoryChange('')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${!catActiva ? 'bg-primary text-white shadow-md' : 'bg-surface-container text-text-muted hover:bg-surface-container-high'
                }`}
            >
              <span className="material-symbols-outlined text-sm">apps</span>
              {t('catalog.allCategories')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${catActiva === cat.slug ? 'bg-primary text-white shadow-md' : 'bg-surface-container text-text-muted hover:bg-surface-container-high'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        {!loading && products.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">search_off</span>
            <p className="font-headline font-bold text-xl text-primary mb-2">{t('catalog.noResults')}</p>
            <p className="text-text-muted">{t('catalog.noResultsDesc')}</p>
            <button onClick={() => { setBusqueda(''); setCatActiva(''); setPage(1) }} className="mt-6 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-secondary transition-colors">
              {t('catalog.seeAll')}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <p className="text-text-muted text-sm">
                <span className="font-bold text-primary">{total}</span> {t('catalog.productsFound')}
              </p>
              <div className="flex items-center gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
                  className="bg-surface-container-low border-0 rounded-xl text-xs font-bold text-text-muted px-3 py-2 focus:ring-2 focus:ring-primary/20"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="material-symbols-outlined text-mint text-sm">verified</span>
                  {t('catalog.originals')}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
              {products.map((p) => <ProductCard key={p.id} producto={p} onClick={() => navigate(`/catalogo/${p.slug || p.id}`)} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-text-muted font-bold text-sm disabled:opacity-40 hover:bg-surface-container-high transition-colors"
                >
                  {t('common.previous')}
                </button>
                <span className="text-sm text-text-muted px-4">
                  {t('common.page')} <span className="font-bold text-primary">{page}</span> {t('common.of')} {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-text-muted font-bold text-sm disabled:opacity-40 hover:bg-surface-container-high transition-colors"
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="text-white">
            <h3 className="font-headline font-extrabold text-2xl sm:text-3xl mb-2">
              {t('catalog.ctaTitle')}
            </h3>
            <p className="text-white/60">{t('catalog.ctaDesc')}</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link to="/agentes" className="flex items-center gap-2 px-6 py-4 bg-secondary text-white rounded-2xl font-headline font-bold hover:-translate-y-0.5 hover:shadow-xl transition-all shadow-lg shadow-secondary/30">
              <span className="material-symbols-outlined">link</span>
              {t('catalog.quoteByLink')}
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
