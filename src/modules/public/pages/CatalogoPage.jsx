import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../../core/hooks/useCart'
import productsService from '../services/products.service'

function StarRating({ rating = 0, count = 0 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={`material-symbols-outlined text-[13px] ${s <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}`}
          style={{ fontVariationSettings: s <= Math.round(rating) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
      ))}
      {count > 0 && <span className="text-[10px] text-slate-400 ml-0.5">({count})</span>}
    </div>
  )
}

function ProductCard({ producto, onClick }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const { t } = useTranslation()

  const imgUrl = producto.images?.[0]
  const savings = producto.marginPct ? Math.round(producto.marginPct) : null

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
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer group"
    >
      <div className="relative overflow-hidden bg-slate-50" style={{ aspectRatio: '4/3' }}>
        {imgUrl ? (
          <img src={imgUrl} alt={producto.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <span className="material-symbols-outlined text-5xl">image</span>
          </div>
        )}
        {producto.category && (
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg text-slate-600 border border-white">
            {producto.category?.name || producto.category}
          </span>
        )}
        {savings && (
          <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
            Ahorra {savings}%
          </span>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        {producto.brand && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{producto.brand.name}</span>
        )}
        <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2 flex-1">{producto.name}</h3>

        <StarRating rating={producto.avgRating || 0} count={producto.reviewCount || 0} />

        <div className="flex items-end justify-between mt-1">
          <div>
            <span className="font-black text-lg text-slate-900">${Number(producto.priceUsd || 0).toFixed(0)}</span>
            <span className="text-xs text-slate-400 ml-1">USD</span>
          </div>
          {producto.priceRefLocal && (
            <span className="text-[10px] text-slate-400 line-through">S/ {Number(producto.priceRefLocal).toLocaleString()}</span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          className={`w-full mt-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            added
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-900 text-white hover:bg-secondary'
          }`}
        >
          <span className="material-symbols-outlined text-base">{added ? 'check_circle' : 'chat'}</span>
          {added ? 'Agregado' : t('catalog.card.addToCart')}
        </button>
      </div>
    </div>
  )
}

export default function CatalogoPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [catActiva, setCatActiva] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [selectedBrands, setSelectedBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  const searchRef = useRef(null)

  useEffect(() => {
    const urlSearch = searchParams.get('search')
    if (urlSearch) setBusqueda(urlSearch)
  }, [])

  const SORT_OPTIONS = [
    { value: '', label: 'Popularidad' },
    { value: 'newest', label: 'Más recientes' },
    { value: 'price_asc', label: 'Menor precio' },
    { value: 'price_desc', label: 'Mayor precio' },
  ]

  useEffect(() => {
    productsService.getCategories()
      .then(data => setCategories(Array.isArray(data) ? data : data?.items || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    productsService.getBrands?.()
      .then(data => setBrands(Array.isArray(data) ? data : data?.items || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const query = {
      category: catActiva || undefined,
      search: busqueda || undefined,
      sortBy: sortBy || undefined,
      brands: selectedBrands.length ? selectedBrands.join(',') : undefined,
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
  }, [catActiva, busqueda, sortBy, selectedBrands, page])

  const handleSearch = (value) => {
    setBusqueda(value)
    setPage(1)
  }

  const handleCategoryChange = (slug) => {
    setCatActiva(slug)
    setPage(1)
  }

  const toggleBrand = (name) => {
    setSelectedBrands(prev =>
      prev.includes(name) ? prev.filter(b => b !== name) : [...prev, name]
    )
    setPage(1)
  }

  const clearAll = () => {
    setBusqueda('')
    setCatActiva('')
    setSortBy('')
    setSelectedBrands([])
    setPage(1)
  }

  const hasFilters = busqueda || catActiva || sortBy || selectedBrands.length > 0

  return (
    <main className="min-h-screen bg-slate-50" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>

      {/* Compact Search Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Search bar */}
            <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 gap-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <span className="material-symbols-outlined text-slate-400 text-[20px] shrink-0">search</span>
              <input
                ref={searchRef}
                className="bg-transparent border-none focus:outline-none text-sm text-slate-900 placeholder:text-slate-400 w-full"
                placeholder={t('catalog.searchPlaceholder')}
                type="text"
                value={busqueda}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {busqueda && (
                <button onClick={() => handleSearch('')} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
              className="hidden sm:block bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Mobile filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${showFilters || selectedBrands.length > 0 ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span className="hidden sm:inline">Filtros</span>
              {selectedBrands.length > 0 && (
                <span className="bg-white/30 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{selectedBrands.length}</span>
              )}
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => handleCategoryChange('')}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!catActiva ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              TODOS
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${catActiva === cat.slug ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {cat.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Expandable filters panel */}
        {showFilters && (
          <div className="border-t border-slate-100 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap gap-6">
              {brands.length > 0 && (
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3">Filtrar por Marca</p>
                  <div className="flex flex-wrap gap-2">
                    {brands.map(brand => (
                      <button
                        key={brand.id || brand.name}
                        onClick={() => toggleBrand(brand.name)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          selectedBrands.includes(brand.name)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-primary/50'
                        }`}
                      >
                        {selectedBrands.includes(brand.name) && (
                          <span className="material-symbols-outlined text-[12px]">check</span>
                        )}
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="sm:hidden">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3">Ordenar por</p>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
                  className="bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 px-3 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {hasFilters && (
                <button onClick={clearAll} className="self-end text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">filter_list_off</span>
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Results bar */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-500">
            {loading ? (
              <span className="text-slate-400">Buscando...</span>
            ) : (
              <><span className="font-bold text-slate-900">{total}</span> {t('catalog.productsFound')}</>
            )}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="material-symbols-outlined text-emerald-500 text-sm">verified</span>
            {t('catalog.originals')}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
                <div className="bg-slate-100" style={{ aspectRatio: '4/3' }} />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-4/5" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-9 bg-slate-100 rounded-xl mt-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4 block">search_off</span>
            <p className="font-bold text-lg text-slate-900 mb-2">{t('catalog.noResults')}</p>
            <p className="text-slate-500 text-sm mb-6">{t('catalog.noResultsDesc')}</p>
            <button onClick={clearAll} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-secondary transition-colors">
              {t('catalog.seeAll')}
            </button>
          </div>
        )}

        {/* Products grid */}
        {!loading && products.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} producto={p} onClick={() => navigate(`/catalogo/${p.slug || p.id}`)} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-slate-500 px-4">
                  Página <span className="font-bold text-slate-900">{page}</span> de {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="bg-primary py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-white text-center sm:text-left">
            <h3 className="font-headline font-extrabold text-2xl mb-1">{t('catalog.ctaTitle')}</h3>
            <p className="text-white/60 text-sm">{t('catalog.ctaDesc')}</p>
          </div>
          <Link
            to="/cotizar-link"
            className="flex items-center gap-2 px-8 py-4 bg-secondary text-white rounded-2xl font-headline font-bold hover:-translate-y-0.5 hover:shadow-xl transition-all shadow-lg shadow-secondary/30 shrink-0"
          >
            <span className="material-symbols-outlined">link</span>
            {t('catalog.quoteByLink')}
          </Link>
        </div>
      </div>

    </main>
  )
}
