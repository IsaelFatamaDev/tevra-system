import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useScrollReveal from '../../../core/hooks/useScrollReveal'
import shipmentsService from '../services/shipments.service'

const STATUS_MAP = {
  pending: 'confirmado',
  purchased: 'comprado',
  in_transit: 'transito',
  in_customs: 'aduana',
  ready: 'listo',
  delivered: 'entregado',
}

const ESTADOS_META = [
  { id: 'confirmado', icon: 'check_circle', color: 'bg-mint', textColor: 'text-mint' },
  { id: 'comprado', icon: 'storefront', color: 'bg-blue-400', textColor: 'text-blue-400' },
  { id: 'transito', icon: 'flight', color: 'bg-accent-gold', textColor: 'text-accent-gold' },
  { id: 'aduana', icon: 'inventory_2', color: 'bg-orange-400', textColor: 'text-orange-400' },
  { id: 'listo', icon: 'home_pin', color: 'bg-secondary', textColor: 'text-secondary' },
  { id: 'entregado', icon: 'verified', color: 'bg-mint', textColor: 'text-mint' },
]

function EstadoStep({ estado, activo, completado, esUltimo }) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-4 sm:gap-6">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${completado ? `${estado.color} shadow-lg` :
          activo ? `${estado.color} shadow-lg ring-4 ring-current/20 ${estado.textColor}` :
            'bg-surface-container border-2 border-outline-variant/30'
          }`}>
          <span className={`material-symbols-outlined text-lg ${completado || activo ? 'text-white fill-icon' : 'text-outline'}`}>
            {completado ? 'check' : estado.icon}
          </span>
        </div>
        {!esUltimo && (
          <div className={`w-0.5 flex-1 mt-1 min-h-[3rem] rounded-full transition-all duration-500 ${completado ? estado.color : 'bg-outline-variant/20'}`} />
        )}
      </div>
      <div className={`pb-8 flex-1 ${esUltimo ? 'pb-0' : ''}`}>
        <div className={`font-headline font-bold mb-1 transition-colors ${activo ? estado.textColor : completado ? 'text-primary' : 'text-outline'}`}>
          {estado.label}
        </div>
        <p className={`text-sm leading-relaxed transition-colors ${activo || completado ? 'text-text-muted' : 'text-outline-variant'}`}>
          {estado.sub}
        </p>
        {activo && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-full border border-outline-variant/20">
            <span className={`w-2 h-2 rounded-full animate-pulse ${estado.color}`} />
            <span className="text-xs font-bold text-text-muted uppercase tracking-wide">{t('tracking.timeline.currentStatus')}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TrackingPage() {
  const [codigo, setCodigo] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [pedido, setPedido] = useState(null)
  const [error, setError] = useState('')
  const { t } = useTranslation()
  const translatedStates = t('tracking.timeline.states', { returnObjects: true })
  const estadosPosibles = ESTADOS_META.map((meta, i) => ({
    ...meta,
    label: translatedStates[i]?.label || '',
    sub: translatedStates[i]?.sub || '',
  }))
  const handleBuscar = (e) => {
    e.preventDefault()
    setError('')
    if (!codigo.trim()) {
      setError(t('tracking.hero.emptyError'))
      return
    }
    setBuscando(true)
    shipmentsService.trackByNumber(codigo.trim())
      .then(data => {
        const estadoActual = STATUS_MAP[data.status] || 'confirmado'
        setPedido({
          codigo: data.trackingNumber || codigo.trim(),
          producto: data.description || 'Pedido en seguimiento',
          agente: data.agentName || '—',
          fecha: data.createdAt ? new Date(data.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
          estadoActual,
          estimado: data.estimatedArrival ? new Date(data.estimatedArrival).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
          events: data.events || [],
        })
      })
      .catch(() => {
        setError(t('tracking.hero.notFoundError'))
      })
      .finally(() => setBuscando(false))
  }

  const idxActual = estadosPosibles.findIndex((e) => e.id === pedido?.estadoActual)

  return (
    <main className="min-h-screen bg-background-cream" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
      <section className="tevra-hero-gradient py-16 sm:py-24 overflow-hidden">
        <div className="tevra-hero-overlay" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-mint/10 blur-[100px] rounded-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="max-w-2xl hero-enter">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-6">
              <span className="w-2 h-2 bg-mint rounded-full animate-pulse" />
              <span className="text-white text-[11px] font-bold uppercase tracking-widest">{t('tracking.hero.badge')}</span>
            </div>
            <h1 className="font-headline font-extrabold text-white leading-tight tracking-tight mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              {t('tracking.hero.title')}
            </h1>
            <p className="text-white/70 mb-10" style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)' }}>
              {t('tracking.hero.subtitle')}
            </p>
            <form onSubmit={handleBuscar} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3.5 focus-within:border-white/40 transition-colors">
                <span className="material-symbols-outlined text-white/50 mr-3 flex-shrink-0">search</span>
                <input
                  className="bg-transparent border-none focus:outline-none text-white placeholder:text-white/40 text-sm w-full font-mono tracking-wider"
                  placeholder={t('tracking.hero.placeholder')}
                  value={codigo}
                  onChange={(e) => { setCodigo(e.target.value); setError(''); setPedido(null) }}
                  type="text"
                />
              </div>
              <button
                type="submit"
                disabled={buscando}
                className="px-8 py-3.5 bg-tevra-coral text-white rounded-2xl font-headline font-bold text-sm hover:-translate-y-0.5 hover:shadow-xl shadow-lg shadow-tevra-coral transition-all disabled:opacity-60 flex items-center gap-2 justify-center"
              >
                {buscando ? (
                  <>
                    <span className="material-symbols-outlined text-base">hourglass_top</span>
                    {t('tracking.hero.searching')}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">my_location</span>
                    {t('tracking.hero.trackBtn')}
                  </>
                )}
              </button>
            </form>
            {error && (
              <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-tevra-coral/10 border border-tevra-coral/30 rounded-2xl">
                <span className="material-symbols-outlined text-tevra-coral text-sm">error</span>
                <p className="text-white/80 text-sm">{error}</p>
              </div>
            )}
            <p className="mt-4 text-white/40 text-xs">
              {t('tracking.hero.codeHint')}
            </p>
          </div>
        </div>
      </section>

      {pedido && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-soft border border-outline-variant/10">
                <h3 className="font-headline font-extrabold text-primary text-lg mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">receipt_long</span>
                  {t('tracking.detail.title')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">{t('tracking.detail.code')}</span>
                    <span className="font-mono font-bold text-primary text-sm">{pedido.codigo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">{t('tracking.detail.product')}</span>
                    <span className="font-medium text-primary text-sm">{pedido.producto}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">{t('tracking.detail.agent')}</span>
                    <span className="font-medium text-primary text-sm">{pedido.agente}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">{t('tracking.detail.orderDate')}</span>
                    <span className="font-medium text-primary text-sm">{pedido.fecha}</span>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/20">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-2">{t('tracking.detail.estimatedDelivery')}</span>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-mint/10 rounded-2xl border border-mint/20">
                      <span className="material-symbols-outlined text-mint text-lg">calendar_today</span>
                      <span className="font-headline font-bold text-primary text-sm">{pedido.estimado}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary rounded-3xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-secondary">support_agent</span>
                  <span className="font-headline font-bold">{t('tracking.detail.doubts')}</span>
                </div>
                <p className="text-white/60 text-sm mb-4">{t('tracking.detail.doubtsDesc')}</p>
                <button className="w-full py-3 bg-white/10 border border-white/10 rounded-2xl text-white font-bold text-sm hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">chat</span>
                  {t('tracking.detail.contactAgent')}
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 bg-surface-container-lowest rounded-3xl p-8 sm:p-10 shadow-soft border border-outline-variant/10">
              <h3 className="font-headline font-extrabold text-primary text-lg mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-mint">timeline</span>
                {t('tracking.timeline.title')}
              </h3>
              <div>
                {estadosPosibles.map((estado, i) => (
                  <EstadoStep
                    key={estado.id}
                    estado={estado}
                    activo={i === idxActual}
                    completado={i < idxActual}
                    esUltimo={i === estadosPosibles.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {!pedido && (
        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-14">
              <h2 className="font-headline font-extrabold text-primary tracking-tight mb-3" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)' }}>
                {t('tracking.timeline.statesTitle')}
              </h2>
              <p className="text-text-muted">{t('tracking.timeline.statesSubtitle')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {estadosPosibles.map((estado, i) => (
                <div key={estado.id} className="bg-surface-container-lowest rounded-3xl p-7 shadow-soft flex gap-4 items-start" style={{ animation: `fade-up 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.08 + 0.1}s both` }}>
                  <div className={`w-12 h-12 ${estado.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <span className="material-symbols-outlined text-white text-xl fill-icon">{estado.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-headline font-bold text-primary text-sm">{estado.label}</span>
                      <span className="text-[10px] font-black text-text-muted/50 bg-surface-container px-2 py-0.5 rounded-full">0{i + 1}</span>
                    </div>
                    <p className="text-text-muted text-xs leading-relaxed">{estado.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
