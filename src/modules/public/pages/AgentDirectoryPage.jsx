import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useScrollReveal from '../../../core/hooks/useScrollReveal'
import agentsService from '../services/agents.service'

const CITIES = ['Todas', 'Lima', 'Arequipa', 'Trujillo', 'Cusco', 'Chiclayo', 'Piura', 'Huancayo']

function AgentCard({ agent }) {
  const { ref, isVisible } = useScrollReveal(0.05)
  const user = agent.user || {}
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Agente TeVra'
  const initials = `${(user.firstName || 'A')[0]}${(user.lastName || '')[0] || ''}`.toUpperCase()

  return (
    <div ref={ref} className={`bg-surface-container-lowest rounded-2xl p-6 shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-300 flex flex-col reveal ${isVisible ? 'visible' : ''}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt={name} className="w-full h-full object-cover rounded-full" />
          ) : (
            <span className="font-headline font-bold text-lg text-primary">{initials}</span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-headline font-bold text-primary truncate">{name}</h3>
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <span className="material-symbols-outlined text-xs">location_on</span>
            {agent.city || 'Sin ciudad'}
          </div>
        </div>
        {agent.isVerified && (
          <span className="material-symbols-outlined text-mint text-xl ml-auto shrink-0" title="Verificado">verified</span>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex text-amber-400">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: `'FILL' ${i < Math.round(agent.rating || 0) ? 1 : 0}` }}>star</span>
          ))}
        </div>
        <span className="text-xs text-text-muted">({agent.ratingCount || 0})</span>
      </div>

      {/* Bio */}
      {agent.bio && (
        <p className="text-sm text-text-muted leading-relaxed line-clamp-2 mb-4">{agent.bio}</p>
      )}

      {/* Categories */}
      {agent.specializationCategories?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {agent.specializationCategories.slice(0, 3).map(cat => (
            <span key={cat} className="px-2.5 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wide rounded-full">{cat}</span>
          ))}
          {agent.specializationCategories.length > 3 && (
            <span className="px-2.5 py-1 bg-surface-container text-text-muted text-[10px] font-bold rounded-full">+{agent.specializationCategories.length - 3}</span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-text-muted mb-5 mt-auto">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm text-mint">shopping_bag</span>
          <span>{agent.totalSales || 0} ventas</span>
        </div>
        {agent.coverageAreas?.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-secondary">map</span>
            <span>{agent.coverageAreas.length} zonas</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <Link
        to={`/agente/${agent.referralCode || agent.id}`}
        className="w-full bg-primary text-white py-3 rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
      >
        <span className="material-symbols-outlined text-base">person</span>
        Ver perfil
      </Link>
    </div>
  )
}

export default function AgentDirectoryPage() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [cityFilter, setCityFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    agentsService.findAll({ status: 'active' })
      .then(data => {
        const items = data?.items || (Array.isArray(data) ? data : [])
        setAgents(items)
      })
      .catch(() => setAgents([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = agents.filter(a => {
    if (cityFilter && a.city?.toLowerCase() !== cityFilter.toLowerCase()) return false
    if (search) {
      const q = search.toLowerCase()
      const name = `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.toLowerCase()
      const cats = (a.specializationCategories || []).join(' ').toLowerCase()
      if (!name.includes(q) && !cats.includes(q) && !(a.city || '').toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <main className="min-h-screen bg-background-cream" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
      {/* Hero */}
      <section className="hero-gradient py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="hero-enter">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-5">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span className="text-white text-[11px] font-bold uppercase tracking-widest">Red de Agentes</span>
            </div>
            <h1 className="font-headline font-extrabold text-white tracking-tight mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              Encuentra tu Agente
            </h1>
            <p className="text-white/70 max-w-xl mb-8" style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)' }}>
              Elige un agente verificado en tu ciudad. Ellos gestionan tu pedido, te asesoran y te acompañan hasta la entrega.
            </p>
            <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 max-w-md">
              <span className="material-symbols-outlined text-white/60 mr-3">search</span>
              <input
                className="bg-transparent border-none focus:outline-none text-white placeholder:text-white/50 text-sm w-full"
                placeholder="Buscar agente por nombre, ciudad..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <div className="sticky top-[clamp(3.5rem,8vh,5rem)] z-40 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            {CITIES.map(city => (
              <button
                key={city}
                onClick={() => setCityFilter(city === 'Todas' ? '' : city)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${(city === 'Todas' && !cityFilter) || cityFilter === city
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-surface-container text-text-muted hover:bg-surface-container-high'
                  }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">person_search</span>
            <p className="font-headline font-bold text-xl text-primary mb-2">No encontramos agentes</p>
            <p className="text-text-muted">Intenta con otra ciudad o término de búsqueda.</p>
            <button onClick={() => { setSearch(''); setCityFilter('') }} className="mt-6 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-secondary transition-colors">
              Ver todos los agentes
            </button>
          </div>
        ) : (
          <>
            <p className="text-text-muted text-sm mb-8">
              <span className="font-bold text-primary">{filtered.length}</span> agentes disponibles
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(agent => <AgentCard key={agent.id} agent={agent} />)}
            </div>
          </>
        )}
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="text-white">
            <h3 className="font-headline font-extrabold text-2xl sm:text-3xl mb-2">¿Quieres ser agente?</h3>
            <p className="text-white/60">Únete a la red de agentes TeVra y genera ingresos sin inversión.</p>
          </div>
          <Link to="/registro-agente" className="flex items-center gap-2 px-6 py-4 bg-secondary text-white rounded-2xl font-headline font-bold hover:-translate-y-0.5 hover:shadow-xl transition-all shadow-lg shadow-secondary/30">
            <span className="material-symbols-outlined">person_add</span>
            Quiero ser agente
          </Link>
        </div>
      </section>
    </main>
  )
}
