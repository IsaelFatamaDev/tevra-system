import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../../core/hooks/useCart'
import agentsService from '../services/agents.service'

export default function AgentProfilePage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { setSelectedAgent, items } = useCart()
  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    agentsService.findByCode(code)
      .then(data => setAgent(data))
      .catch(() => setAgent(null))
      .finally(() => setLoading(false))
  }, [code])

  const handleSelectAgent = () => {
    if (!agent) return
    const user = agent.user || {}
    setSelectedAgent({
      id: agent.id,
      code: agent.referralCode || code,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      city: agent.city,
      whatsapp: user.phone || agent.whatsapp || '',
      avatar: user.avatar || null,
    })
    navigate(items.length > 0 ? '/cotizar' : '/catalogo')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background-cream" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }} />
    )
  }

  if (!agent) {
    return (
      <main className="min-h-screen bg-background-cream flex items-center justify-center" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-outline-variant block">person_off</span>
          <p className="font-headline font-bold text-xl text-primary">Agente no encontrado</p>
          <Link to="/directorio-agentes" className="text-secondary font-semibold hover:underline">Ver directorio de agentes</Link>
        </div>
      </main>
    )
  }

  const user = agent.user || {}
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Agente TeVra'
  const initials = `${(user.firstName || 'A')[0]}${(user.lastName || '')[0] || ''}`.toUpperCase()

  return (
    <main className="min-h-screen bg-background-cream" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
      {/* Breadcrumbs */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 pb-4">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link to="/directorio-agentes" className="hover:text-primary transition-colors">Agentes</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary font-semibold truncate max-w-[200px]">{name}</span>
        </nav>
      </div>

      <section className="max-w-5xl mx-auto px-4 sm:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Profile info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header card */}
            <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-soft">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="font-headline font-bold text-2xl text-primary">{initials}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-headline font-extrabold text-2xl text-primary">{name}</h1>
                    {agent.isVerified && (
                      <span className="material-symbols-outlined text-mint text-xl" title="Agente verificado">verified</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-sm text-text-muted">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {agent.city || 'Sin ciudad'}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: `'FILL' ${i < Math.round(agent.rating || 0) ? 1 : 0}` }}>star</span>
                        ))}
                      </div>
                      <span className="text-xs text-text-muted">({agent.ratingCount || 0})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-container rounded-xl p-4 text-center">
                  <span className="block text-2xl font-black text-primary">{agent.totalSales || 0}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Ventas</span>
                </div>
                <div className="bg-surface-container rounded-xl p-4 text-center">
                  <span className="block text-2xl font-black text-primary">{agent.ratingCount || 0}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Reseñas</span>
                </div>
                <div className="bg-surface-container rounded-xl p-4 text-center">
                  <span className="block text-2xl font-black text-primary">{agent.coverageAreas?.length || 0}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Zonas</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {agent.bio && (
              <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-soft space-y-4">
                <h2 className="font-headline font-bold text-lg text-primary">Sobre mí</h2>
                <p className="text-on-surface-variant leading-relaxed">{agent.bio}</p>
              </div>
            )}

            {/* Specializations */}
            {agent.specializationCategories?.length > 0 && (
              <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-soft space-y-4">
                <h2 className="font-headline font-bold text-lg text-primary">Especialidades</h2>
                <div className="flex flex-wrap gap-2">
                  {agent.specializationCategories.map(cat => (
                    <span key={cat} className="px-4 py-2 bg-primary/5 text-primary text-sm font-bold rounded-xl">{cat}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Coverage areas */}
            {agent.coverageAreas?.length > 0 && (
              <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-soft space-y-4">
                <h2 className="font-headline font-bold text-lg text-primary">Zonas de cobertura</h2>
                <div className="flex flex-wrap gap-2">
                  {agent.coverageAreas.map(zone => (
                    <span key={zone} className="flex items-center gap-1 px-4 py-2 bg-surface-container text-text-muted text-sm font-medium rounded-xl">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {zone}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Action card */}
          <div className="lg:col-span-1">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-soft sticky top-28 space-y-5">
              <h3 className="font-headline font-bold text-lg text-primary">¿Cotizar con {(user.firstName || 'este agente')}?</h3>
              <p className="text-sm text-text-muted">
                {items.length > 0
                  ? `Tienes ${items.length} producto${items.length > 1 ? 's' : ''} en tu carrito. Selecciona a ${user.firstName || 'este agente'} para enviar tu cotización.`
                  : 'Selecciona a este agente y luego agrega productos a tu carrito para cotizar.'}
              </p>

              <button
                onClick={handleSelectAgent}
                className="w-full bg-primary text-white py-4 rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-2 hover:bg-secondary transition-colors shadow-lg"
              >
                <span className="material-symbols-outlined text-base">
                  {items.length > 0 ? 'send' : 'person_add'}
                </span>
                {items.length > 0 ? 'Cotizar mi carrito' : 'Seleccionar agente'}
              </button>

              <div className="border-t border-outline-variant/20 pt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-mint text-lg">verified_user</span>
                  <span className="text-text-muted">Agente verificado por TeVra</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-secondary text-lg">local_shipping</span>
                  <span className="text-text-muted">Envío desde Miami, FL</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                  <span className="text-text-muted">Respuesta en menos de 1 hora</span>
                </div>
              </div>

              {agent.referralCode && (
                <div className="bg-surface-container rounded-xl p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Código de agente</p>
                  <p className="font-mono font-bold text-primary text-lg">{agent.referralCode}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
