import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../../core/hooks/useCart'
import productsService from '../services/products.service'

/* ------------------------------------------------------------------ */
/*  Star Rating                                                          */
/* ------------------------------------------------------------------ */
function StarRating({ rating = 0, count = 0, size = 'sm' }) {
  const px = size === 'sm' ? 'text-[14px]' : 'text-[18px]'
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map(s => {
          const filled  = s <= Math.floor(rating)
          const partial = !filled && s - 1 < rating
          return (
            <span
              key={s}
              className={`material-symbols-outlined ${px} ${filled ? 'text-[#FFA41C]' : partial ? 'text-[#FFA41C]' : 'text-slate-300'}`}
              style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
            >
              {partial ? 'star_half' : 'star'}
            </span>
          )
        })}
      </div>
      {count > 0 && (
        <span className="text-xs text-[#007185] hover:text-[#C45500] cursor-pointer hover:underline leading-none">
          {count.toLocaleString()}
        </span>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Product Card                                                         */
/* ------------------------------------------------------------------ */
function ProductCard({ producto, onClick }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const { t } = useTranslation()

  const imgUrl      = producto.images?.[0]
  const price       = Number(producto.priceUsd    || 0)
  const priceSoles  = Number(producto.priceLocal  || price * 3.80)
  const refPrice    = Number(producto.priceRefLocal || 0)
  const ahorra      = refPrice > priceSoles ? refPrice - priceSoles : 0
  const rating      = Number(producto.avgRating   || 0)
  const reviewCount = Number(producto.reviewCount || 0)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addItem({ productId: producto.id, slug: producto.slug, name: producto.name, price, image: imgUrl || '', brand: producto.brand?.name || '', qty: 1 })
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div onClick={onClick} className="group flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200 cursor-pointer h-full">

      {/* Image */}
      <div className="relative bg-[#F8F8F8] flex items-center justify-center" style={{ aspectRatio: '1/1', padding: '1.25rem' }}>
        {refPrice > priceSoles && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-sm tracking-wide z-10">
            -{Math.round(((refPrice - priceSoles) / refPrice) * 100)}%
          </div>
        )}
        <button
          onClick={e => e.stopPropagation()}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-sm text-slate-300 hover:text-red-500 transition-colors z-10"
        >
          <span className="material-symbols-outlined text-[18px]">favorite</span>
        </button>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={producto.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
          />
        ) : (
          <span className="material-symbols-outlined text-5xl text-slate-200">image</span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Brand */}
        {producto.brand?.name && (
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{producto.brand.name}</p>
        )}

        {/* Title */}
        <h3 className="text-[13.5px] font-medium text-[#007185] group-hover:text-[#C45500] leading-snug line-clamp-2 min-h-[2.6rem]">
          {producto.name}
        </h3>

        {/* Stars */}
        {reviewCount > 0 ? (
          <StarRating rating={rating} count={reviewCount} />
        ) : (
          <StarRating rating={0} count={0} />
        )}

        {/* Price block */}
        <div className="mt-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-600 font-medium">S/</span>
            <span className="text-[26px] font-medium text-slate-900 leading-none">
              {priceSoles.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          {refPrice > priceSoles && (
            <p className="text-[12px] text-slate-500 mt-0.5">
              {t('catalog.sidebar.refPrice')}: <span className="line-through">S/ {refPrice.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </p>
          )}
          {ahorra > 0 && (
            <p className="text-[12px] text-emerald-700 font-semibold mt-0.5">
              {t('catalog.card.saves')} S/ {ahorra.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* Shipping */}
        <p className="text-[12px] text-[#007600] font-semibold flex items-center gap-1 mt-0.5">
          <span className="material-symbols-outlined text-[14px]">local_shipping</span>
          {t('catalog.card.freeShipping')}
        </p>

        {/* Badge */}
        <p className="text-[11px] text-slate-600">
          <span className="font-bold text-slate-800">{t('catalog.card.origin')}</span> · 5-10 días
        </p>

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          className={`mt-auto w-full py-2.5 rounded-full text-[13px] font-semibold transition-all border shadow-sm ${
            added
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-[#FFD814] hover:bg-[#F7CA00] text-slate-900 border-[#FCD200]'
          }`}
        >
          {added ? t('catalog.card.added') : t('catalog.card.addToCart')}
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sidebar Section Wrapper                                              */
/* ------------------------------------------------------------------ */
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-slate-100 last:border-0 py-4">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full text-left group"
      >
        <span className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">{title}</span>
        <span className={`material-symbols-outlined text-slate-400 text-[20px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>
      {open && <div className="mt-3 space-y-1">{children}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                            */
/* ------------------------------------------------------------------ */
export default function CatalogoPage() {
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [brands,     setBrands]     = useState([])

  const [catActiva,      setCatActiva]      = useState('')
  const [busqueda,       setBusqueda]       = useState('')
  const [sortBy,         setSortBy]         = useState('')
  const [selectedBrands, setSelectedBrands] = useState([])
  const [minPrice,       setMinPrice]       = useState('')
  const [maxPrice,       setMaxPrice]       = useState('')

  const [loading,    setLoading]    = useState(true)
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const navigate      = useNavigate()
  const [searchParams] = useSearchParams()
  const { t }         = useTranslation()
  const searchRef     = useRef(null)

  const LIMIT = 48

  useEffect(() => {
    const s = searchParams.get('search')
    if (s) setBusqueda(s)
  }, [])

  const SORT_OPTIONS = [
    { value: '',           label: t('catalog.sort.featured')  },
    { value: 'newest',     label: t('catalog.sort.newest')    },
    { value: 'price_asc',  label: t('catalog.sort.priceAsc')  },
    { value: 'price_desc', label: t('catalog.sort.priceDesc') },
  ]

  /* Load categories & brands */
  useEffect(() => {
    productsService.getCategories()
      .then(d => setCategories(Array.isArray(d) ? d : d?.items || []))
      .catch(() => {})
    productsService.getBrands?.()
      .then(d => setBrands(Array.isArray(d) ? d : d?.items || []))
      .catch(() => {})
  }, [])

  /* Load products */
  useEffect(() => {
    setLoading(true)
    productsService.findAll({
      category : catActiva  || undefined,
      search   : busqueda   || undefined,
      sortBy   : sortBy     || undefined,
      brand    : selectedBrands.length ? selectedBrands.join(',') : undefined,
      page,
      limit    : LIMIT,
    })
    .then(data => {
      let items = data?.items ?? (Array.isArray(data) ? data : [])
      let count = data?.total ?? items.length
      let pages = data?.totalPages ?? 1

      /* Local price filter (prices are in Soles) */
      if (minPrice !== '' || maxPrice !== '') {
        const lo = minPrice ? Number(minPrice) : 0
        const hi = maxPrice ? Number(maxPrice) : Infinity
        items = items.filter(p => {
          const s = Number(p.priceLocal || (p.priceUsd * 3.80))
          return s >= lo && s <= hi
        })
        count = items.length
        pages = Math.ceil(count / LIMIT) || 1
      }

      setProducts(items)
      setTotal(count)
      setTotalPages(pages)
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false))
  }, [catActiva, busqueda, sortBy, selectedBrands, page, minPrice, maxPrice])

  const toggleBrand = (name) => {
    setSelectedBrands(p => p.includes(name) ? p.filter(b => b !== name) : [...p, name])
    setPage(1)
  }

  const applyPrice = (e) => { e.preventDefault(); setPage(1) }

  const clearAll = () => {
    setCatActiva(''); setSelectedBrands([]); setMinPrice(''); setMaxPrice(''); setSortBy(''); setPage(1)
  }

  const hasFilters = !!(catActiva || selectedBrands.length || minPrice || maxPrice)

  /* ---- Price range presets ---- */
  const PRICE_RANGES = [
    { label: `${t('catalog.sidebar.upTo')} S/ 500`,      min: '',     max: '500'  },
    { label: 'S/ 500 — S/ 1,500',                         min: '500',  max: '1500' },
    { label: 'S/ 1,500 — S/ 3,000',                       min: '1500', max: '3000' },
    { label: `${t('catalog.sidebar.moreThan')} S/ 3,000`, min: '3000', max: ''     },
  ]
  const activeRange = PRICE_RANGES.find(r => r.min === minPrice && r.max === maxPrice)

  /* ---- Sidebar JSX (shared between desktop & mobile drawer) ---- */
  const SidebarContent = (
    <div className="w-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-[#007185]">filter_alt</span>
          {t('catalog.sidebar.filters')}
        </h2>
        {hasFilters && (
          <button onClick={clearAll} className="text-[12px] text-[#007185] hover:text-[#C45500] hover:underline font-medium">
            {t('catalog.sidebar.clearAll')}
          </button>
        )}
      </div>

      {/* Categories */}
      <FilterSection title={t('catalog.sidebar.categories')}>
        <ul className="space-y-0.5">
          <li>
            <button
              onClick={() => { setCatActiva(''); setPage(1); setMobileFilterOpen(false) }}
              className={`w-full text-left text-[13px] px-2 py-1.5 rounded transition-colors ${!catActiva ? 'font-bold text-slate-900 bg-slate-100' : 'text-slate-600 hover:text-[#C45500] hover:bg-slate-50'}`}
            >
              {t('catalog.sidebar.allCategories')}
            </button>
          </li>
          {categories.map(cat => (
            <li key={cat.id}>
              <button
                onClick={() => { setCatActiva(cat.slug); setPage(1); setMobileFilterOpen(false) }}
                className={`w-full text-left text-[13px] px-2 py-1.5 rounded transition-colors flex items-center justify-between group/cat ${catActiva === cat.slug ? 'font-bold text-slate-900 bg-slate-100' : 'text-slate-600 hover:text-[#C45500] hover:bg-slate-50'}`}
              >
                <span>{cat.name}</span>
                {catActiva === cat.slug && <span className="material-symbols-outlined text-[14px] text-[#007185]">check</span>}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection title={t('catalog.sidebar.brands')}>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {brands.map(brand => {
              const checked = selectedBrands.includes(brand.name)
              return (
                <label key={brand.id ?? brand.name} className="flex items-center gap-2.5 cursor-pointer group/brand">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${checked ? 'bg-[#007185] border-[#007185]' : 'border-slate-300 group-hover/brand:border-[#007185] bg-white'}`}>
                    {checked && <span className="material-symbols-outlined text-white text-[11px]">check</span>}
                  </div>
                  <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleBrand(brand.name)} />
                  <span className={`text-[13px] transition-colors ${checked ? 'font-semibold text-slate-900' : 'text-slate-600 group-hover/brand:text-slate-900'}`}>
                    {brand.name}
                  </span>
                </label>
              )
            })}
          </div>
        </FilterSection>
      )}

      {/* Price ranges */}
      <FilterSection title={t('catalog.sidebar.price')}>
        <ul className="space-y-1 mb-4">
          {PRICE_RANGES.map(r => {
            const isActive = activeRange?.label === r.label
            return (
              <li key={r.label}>
                <button
                  onClick={() => { setMinPrice(r.min); setMaxPrice(r.max); setPage(1) }}
                  className={`w-full text-left text-[13px] px-2 py-1.5 rounded transition-colors ${isActive ? 'font-bold text-[#C45500] bg-orange-50' : 'text-[#007185] hover:text-[#C45500] hover:bg-slate-50'}`}
                >
                  {r.label}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Custom range */}
        <form onSubmit={applyPrice}>
          <p className="text-[11px] text-slate-500 font-medium mb-2 uppercase tracking-wide">{t('catalog.sidebar.customRange')}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center border border-slate-300 rounded-md px-2 py-1.5 focus-within:ring-2 focus-within:ring-[#007185] focus-within:border-[#007185] bg-white transition-all">
              <span className="text-slate-400 text-[12px] mr-1">S/</span>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className="w-full text-[13px] outline-none bg-transparent placeholder:text-slate-300"
              />
            </div>
            <span className="text-slate-400 text-[13px]">—</span>
            <div className="flex-1 flex items-center border border-slate-300 rounded-md px-2 py-1.5 focus-within:ring-2 focus-within:ring-[#007185] focus-within:border-[#007185] bg-white transition-all">
              <span className="text-slate-400 text-[12px] mr-1">S/</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="w-full text-[13px] outline-none bg-transparent placeholder:text-slate-300"
              />
            </div>
            <button
              type="submit"
              className="bg-[#007185] hover:bg-[#005f6b] text-white text-[12px] font-bold px-3 py-2 rounded-md transition-colors shrink-0"
            >
              {t('catalog.sidebar.go')}
            </button>
          </div>
        </form>
      </FilterSection>

      {/* Shipping filter */}
      <FilterSection title={t('catalog.sidebar.shipping')} defaultOpen={false}>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-4 h-4 rounded border-2 border-slate-300 bg-white" />
          <span className="text-[13px] text-slate-600">{t('catalog.sidebar.freeShipping')}</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-4 h-4 rounded border-2 border-slate-300 bg-white" />
          <span className="text-[13px] text-slate-600">{t('catalog.sidebar.arrivedUSA')}</span>
        </label>
      </FilterSection>

    </div>
  )

  return (
    <main className="min-h-screen bg-[#FAFAFA]" style={{ paddingTop: 'clamp(4rem, 10vh, 5.5rem)' }}>

      {/* ── Search Bar ─────────────────────────────────────────────── */}
      <div className="bg-slate-900 py-3 shadow-md">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 flex items-center gap-3">
          <div className="flex flex-1 max-w-2xl rounded-lg overflow-hidden shadow-sm ring-2 ring-[#febd69] focus-within:ring-[#f3a847] transition-all">
            <input
              ref={searchRef}
              className="flex-1 bg-white px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
              placeholder={t('catalog.searchPlaceholder')}
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setPage(1) }}
            />
            <button className="bg-[#febd69] hover:bg-[#f3a847] px-5 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-slate-900 text-[22px]">search</span>
            </button>
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 bg-white/10 text-white text-[13px] font-medium px-4 py-2.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            {t('catalog.sidebar.filters')}
            {hasFilters && <span className="bg-[#febd69] text-slate-900 w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ml-0.5">!</span>}
          </button>
        </div>
      </div>

      {/* ── Results strip ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <p className="text-[13px] text-slate-600">
            {loading
              ? <span className="animate-pulse">{t('common.loading')}</span>
              : <><span className="font-bold">1–{Math.min(total, LIMIT * page)}</span> {t('catalog.sidebar.of')} <span className="font-bold">{total}</span> {t('catalog.sidebar.results')}</>
            }
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-slate-500 hidden sm:block">{t('catalog.sidebar.sortBy')}</span>
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(1) }}
              className="text-[13px] bg-white border border-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#007185] focus:border-[#007185] cursor-pointer shadow-sm"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Layout ─────────────────────────────────────────────────── */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-6 flex gap-6">

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-[220px] shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm sticky top-24">
            {SidebarContent}
          </div>
        </aside>

        {/* Products Area */}
        <div className="flex-1 min-w-0">

          {/* Active filters chips */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {catActiva && (
                <span className="inline-flex items-center gap-1 bg-[#E8F4F5] text-[#007185] border border-[#007185]/30 text-[12px] font-semibold px-3 py-1 rounded-full">
                  {categories.find(c => c.slug === catActiva)?.name || catActiva}
                  <button onClick={() => { setCatActiva(''); setPage(1) }} className="text-[#007185] hover:text-red-500 ml-0.5">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              )}
              {selectedBrands.map(b => (
                <span key={b} className="inline-flex items-center gap-1 bg-[#E8F4F5] text-[#007185] border border-[#007185]/30 text-[12px] font-semibold px-3 py-1 rounded-full">
                  {b}
                  <button onClick={() => toggleBrand(b)} className="text-[#007185] hover:text-red-500 ml-0.5">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              ))}
              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1 bg-[#E8F4F5] text-[#007185] border border-[#007185]/30 text-[12px] font-semibold px-3 py-1 rounded-full">
                  S/ {minPrice || '0'} — S/ {maxPrice || '∞'}
                  <button onClick={() => { setMinPrice(''); setMaxPrice(''); setPage(1) }} className="text-[#007185] hover:text-red-500 ml-0.5">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Skeletons */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-lg animate-pulse overflow-hidden">
                  <div className="aspect-square bg-slate-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                    <div className="h-4 bg-slate-100 rounded w-full" />
                    <div className="h-4 bg-slate-100 rounded w-2/3" />
                    <div className="h-7 bg-slate-100 rounded w-1/2 mt-2" />
                    <div className="h-10 bg-slate-100 rounded-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && products.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-4 block">search_off</span>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('catalog.noResults')}</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">{t('catalog.noResultsDesc')}</p>
              {hasFilters && (
                <button onClick={clearAll} className="bg-[#007185] hover:bg-[#005f6b] text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors">
                  {t('catalog.sidebar.clearAll')}
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {!loading && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-4">
                {products.map(p => (
                  <ProductCard key={p.id} producto={p} onClick={() => navigate(`/catalogo/${p.slug || p.id}`)} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  <button
                    disabled={page <= 1}
                    onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className="px-3 py-2 text-[13px] bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const n = idx + 1
                    if (n === 1 || n === totalPages || Math.abs(page - n) <= 1) return (
                      <button
                        key={n}
                        onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        className={`px-3.5 py-2 text-[13px] rounded-lg border transition-all font-medium ${page === n ? 'bg-[#007185] text-white border-[#007185] shadow-sm' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                      >
                        {n}
                      </button>
                    )
                    if (n === 2 && page > 3) return <span key={n} className="px-2 py-2 text-slate-400">…</span>
                    if (n === totalPages - 1 && page < totalPages - 2) return <span key={n} className="px-2 py-2 text-slate-400">…</span>
                    return null
                  })}
                  <button
                    disabled={page >= totalPages}
                    onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className="px-3 py-2 text-[13px] bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── CTA Banner ─────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 to-[#003f6b] py-12 mt-6">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-black text-2xl text-white mb-1">{t('catalog.ctaTitle')}</h3>
            <p className="text-slate-300 text-[15px]">{t('catalog.ctaDesc')}</p>
          </div>
          <Link
            to="/cotizar-link"
            className="inline-flex items-center gap-2 bg-[#febd69] hover:bg-[#f3a847] text-slate-900 font-bold text-[14px] px-7 py-3.5 rounded-xl transition-all shadow-lg hover:-translate-y-0.5 shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">link</span>
            {t('catalog.quoteByLink')}
          </Link>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ───────────────────────────────────── */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative ml-auto w-[320px] max-w-full h-full bg-white shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
              <h2 className="font-bold text-[16px] text-slate-900">{t('catalog.sidebar.filters')}</h2>
              <button onClick={() => setMobileFilterOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <div className="flex-1 p-5 overflow-y-auto">
              {SidebarContent}
            </div>
            <div className="p-5 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-[#007185] hover:bg-[#005f6b] text-white py-3 rounded-xl font-bold text-[14px] transition-colors"
              >
                {t('catalog.sidebar.viewResults')} ({total})
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}
