import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import useScrollReveal from '../../../core/hooks/useScrollReveal'
import productsService from '../services/products.service'

const SORT_OPTIONS = [
  { value: '', label: 'Destacados' },
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'popular', label: 'Más populares' },
]

const DEMAND_BADGES = {
  very_high: { label: 'Top ventas', bg: 'bg-secondary text-white' },
  high: { label: 'Más pedido', bg: 'bg-mint text-primary' },
}

function ProductCard({ producto }) {
  const { ref, isVisible } = useScrollReveal(0.05)
  const imgUrl = producto.images?.[0]
  const badge = DEMAND_BADGES[producto.demandLevel]

  return (
    <div
      ref={ref}
      className={`bg-surface-container-lowest rounded-3xl overflow-hidden shadow-soft hover:shadow-premium hover:-translate-y-1.5 transition-all duration-400 flex flex-col group reveal ${isVisible ? 'visible' : ''}`}
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
            Destacado
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
                <span className="text-[10px] font-bold text-mint">en Perú</span>
              </div>
            )}
          </div>
          {producto.marginPct && (
            <div className="flex items-center gap-1 mb-3">
              <span className="material-symbols-outlined text-mint text-xs">savings</span>
              <span className="text-[10px] font-bold text-mint">Ahorras ~{producto.marginPct}%</span>
            </div>
          )}
          <button className="w-full bg-primary text-white py-3 rounded-2xl font-headline font-bold text-sm hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 group-hover:bg-secondary">
            <span className="material-symbols-outlined text-base">chat_bubble</span>
            Cotizar ahora
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

  useEffect(() => {
    productsService.getCategories()
      .then(data => setCategories(Array.isArray(data) ? data : data?.items || []))
      .catch(() => { })
  }, [])

  const fetchProducts = useCallback(() => {
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

  useEffect(() => { fetchProducts() }, [fetchProducts])

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
      <section className="hero-gradient py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="hero-enter">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-5">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span className="text-white text-[11px] font-bold uppercase tracking-widest">Productos desde USA</span>
            </div>
            <h1 className="font-headline font-extrabold text-white tracking-tight mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              Catálogo TeVra
            </h1>
            <p className="text-white/70 max-w-xl mb-8" style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)' }}>
              Elige cualquier producto, cotiza con tu agente y recíbelo en 5–10 días hábiles. Originales garantizados.
            </p>
            <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 max-w-md">
              <span className="material-symbols-outlined text-white/60 mr-3">search</span>
              <input
                className="bg-transparent border-none focus:outline-none text-white placeholder:text-white/50 text-sm w-full"
                placeholder="Busca tu producto (Nike, iPhone, Coach...)"
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
              Todo
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
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">search_off</span>
            <p className="font-headline font-bold text-xl text-primary mb-2">Sin resultados</p>
            <p className="text-text-muted">Intenta con otro término o envíanos el link del producto que buscas.</p>
            <button onClick={() => { setBusqueda(''); setCatActiva(''); setPage(1) }} className="mt-6 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-secondary transition-colors">
              Ver todo el catálogo
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <p className="text-text-muted text-sm">
                <span className="font-bold text-primary">{total}</span> productos encontrados
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
                  100% originales desde USA
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
              {products.map((p) => <ProductCard key={p.id} producto={p} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-text-muted font-bold text-sm disabled:opacity-40 hover:bg-surface-container-high transition-colors"
                >
                  Anterior
                </button>
                <span className="text-sm text-text-muted px-4">
                  Página <span className="font-bold text-primary">{page}</span> de {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-text-muted font-bold text-sm disabled:opacity-40 hover:bg-surface-container-high transition-colors"
                >
                  Siguiente
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
              ¿No encontraste lo que buscas?
            </h3>
            <p className="text-white/60">Envíanos el link de cualquier tienda de USA y te cotizamos en minutos.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link to="/agentes" className="flex items-center gap-2 px-6 py-4 bg-secondary text-white rounded-2xl font-headline font-bold hover:-translate-y-0.5 hover:shadow-xl transition-all shadow-lg shadow-secondary/30">
              <span className="material-symbols-outlined">link</span>
              Cotizar por link
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
