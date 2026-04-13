import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useScrollReveal from '../../../core/hooks/useScrollReveal'
import agentImage from '../../../assets/AgentImage.png'

const valoresIcons = [
  { icon: 'person_celebrate', color: 'bg-secondary' },
  { icon: 'account_balance_wallet', color: 'bg-primary' },
  { icon: 'trending_up', color: 'bg-accent-gold' },
]

const herramientasMeta = [
  { icon: 'language', color: 'border-secondary', iconColor: 'text-secondary' },
  { icon: 'link', color: 'border-primary', iconColor: 'text-primary' },
  { icon: 'auto_stories', color: 'border-secondary', iconColor: 'text-secondary' },
  { icon: 'school', color: 'border-primary', iconColor: 'text-primary' },
  { icon: 'support_agent', color: 'border-secondary', iconColor: 'text-secondary' },
  { icon: 'dashboard', color: 'border-outline-variant', iconColor: 'text-outline', pronto: true },
]

const tablaIngresos = [
  { clientes: 5, monto: '$90' },
  { clientes: 10, monto: '$216' },
  { clientes: 20, monto: '$450', destacado: true },
  { clientes: 30, monto: '$720' },
  { clientes: 50, monto: '$1,260' },
]

function HeroAgentes() {
  const { t } = useTranslation()
  return (
    <section className="tevra-hero-gradient py-20 md:py-32 overflow-hidden">
      <div className="tevra-hero-overlay" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-mint/10 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid md:grid-cols-12 gap-12 items-center hero-enter">
          <div className="md:col-span-7 space-y-6 sm:space-y-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-widest backdrop-blur-sm">
              {t('agentes.hero.badge')}
            </span>
            <h1
              className="font-headline font-extrabold text-white leading-[1.1] tracking-tight"
              style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)' }}
            >
              {t('agentes.hero.title')}
            </h1>
            <p className="text-white/90 font-medium max-w-xl" style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}>
              {t('agentes.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
              <Link
                to="/registro-agente"
                className="px-10 py-4 bg-white text-tevra-dark rounded-2xl font-headline font-bold text-lg hover:bg-surface-container-lowest transition-all shadow-xl shadow-black/10 active:scale-95"
                style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.125rem)' }}
              >
                {t('agentes.hero.joinBtn')}
              </Link>
              <div className="text-white/80 text-sm font-medium leading-relaxed">
                <span className="block">{t('agentes.hero.free')}</span>
                <span className="block">{t('agentes.hero.noInvestment')}</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block md:col-span-5 relative">
            <div className="absolute inset-0 bg-white/10 rounded-3xl rotate-3 scale-105 blur-2xl" />
            <img
              src={agentImage}
              alt="Agente TeVra"
              className="relative rounded-3xl shadow-2xl object-cover w-full border-8 border-white/10"
              style={{ aspectRatio: '4/5' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function ValoresSection() {
  const { t } = useTranslation()
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal(0.01)
  const valores = t('agentes.values', { returnObjects: true }).map((v, i) => ({ ...valoresIcons[i], ...v }))
  return (
    <section className="py-24 bg-background-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div ref={gridRef} className={`grid md:grid-cols-3 gap-8 reveal ${gridVisible ? 'visible' : ''}`}>
          {valores.map((v, i) => (
            <div key={i} className={`group p-10 bg-surface-container-low rounded-3xl hover:bg-surface-container-highest transition-all duration-300 stagger-${i + 1}`}>
              <div className={`w-14 h-14 ${v.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg`}>
                <span className="material-symbols-outlined text-white text-3xl">{v.icon}</span>
              </div>
              <h3 className="font-headline text-2xl font-bold text-primary mb-4">{v.title}</h3>
              <p className="text-text-muted leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CalculadoraSection() {
  const { t } = useTranslation()
  const [clientes, setClientes] = useState(15)
  const ingreso = Math.round(clientes * 18)
  const { ref, isVisible } = useScrollReveal(0.05)

  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div ref={ref} className={`bg-surface-container-lowest rounded-[2rem] shadow-xl overflow-hidden grid lg:grid-cols-2 reveal ${isVisible ? 'visible' : ''}`}>
          <div className="p-10 md:p-16 space-y-10">
            <div>
              <h2 className="font-headline text-4xl font-extrabold text-primary mb-4">{t('agentes.calculator.title')}</h2>
              <p className="text-text-muted">{t('agentes.calculator.subtitle')}</p>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold uppercase tracking-widest text-primary/60">{t('agentes.calculator.clientsQuestion')}</span>
                <span className="text-3xl font-bold text-primary">{clientes}</span>
              </div>
              <input
                className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-secondary"
                type="range" min="5" max="50" step="1"
                value={clientes}
                onChange={(e) => setClientes(Number(e.target.value))}
              />
              <div className="flex justify-between text-xs text-outline font-bold">
                <span>{`5 ${t('agentes.calculator.activeClients')}`.toUpperCase()}</span>
                <span>{`50 ${t('agentes.calculator.activeClients')}`.toUpperCase()}</span>
              </div>
            </div>
            <div className="bg-surface-container rounded-2xl p-8 border border-outline-variant/20">
              <p className="text-primary/70 text-sm font-semibold mb-2">{t('agentes.calculator.earningsEst')}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-secondary">${ingreso}</span>
                <span className="text-xl font-bold text-primary/40">{t('agentes.calculator.perMonth')}</span>
              </div>
              <p className="mt-4 text-xs text-text-muted">{t('agentes.calculator.disclaimer')}</p>
            </div>
          </div>
          <div className="p-10 md:p-16 text-white" style={{ background: 'linear-gradient(135deg, #000f22 0%, #0a2540 100%)' }}>
            <h3 className="text-xl font-bold mb-8">{t('agentes.calculator.quickRef')}</h3>
            <div className="space-y-1">
              {tablaIngresos.map((row) => (
                <div
                  key={row.clientes}
                  className={`flex justify-between items-center py-4 border-b border-white/10 ${row.destacado ? 'bg-white/5 px-4 -mx-4 rounded-xl' : ''}`}
                >
                  <span className={`font-medium ${row.destacado ? 'text-white' : 'text-white/70'}`}>{row.clientes} {t('agentes.calculator.activeClients')}</span>
                  <span className="text-xl font-bold">{row.monto}</span>
                </div>
              ))}
            </div>
            <p className="mt-10 text-xs opacity-60 italic">{t('agentes.calculator.estimateNote')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function HerramientasSection() {
  const { t } = useTranslation()
  const { ref, isVisible } = useScrollReveal(0.05)
  const herramientas = t('agentes.tools.items', { returnObjects: true }).map((h, i) => ({ ...herramientasMeta[i], ...h }))
  return (
    <section className="py-24 bg-background-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-headline text-4xl font-extrabold text-primary mb-6">{t('agentes.tools.title')}</h2>
          <p className="text-text-muted text-lg">{t('agentes.tools.subtitle')}</p>
        </div>
        <div ref={ref} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal ${isVisible ? 'visible' : ''}`}>
          {herramientas.map((h, i) => (
            <div
              key={i}
              className={`p-8 bg-surface-container-lowest border-b-4 ${h.color} rounded-2xl shadow-soft hover:-translate-y-1 transition-transform stagger-${Math.min(i + 1, 5)} ${h.pronto ? 'opacity-75' : ''}`}
            >
              <div className="flex items-start justify-between mb-6">
                <span className={`material-symbols-outlined text-4xl ${h.iconColor}`}>{h.icon}</span>
                {h.pronto && (
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Próximamente</span>
                )}
              </div>
              <h4 className="font-headline font-bold text-xl text-primary mb-2">{h.title}</h4>
              <p className="text-sm text-text-muted">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function VlapexSection() {
  const { t } = useTranslation()
  const { ref, isVisible } = useScrollReveal(0.05)
  return (
    <section className="py-24 bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div ref={ref} className={`grid lg:grid-cols-2 items-center gap-16 reveal ${isVisible ? 'visible' : ''}`}>
          <div className="relative flex justify-center">
            <div className="relative w-64 h-[520px] bg-black rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden">
              <div className="absolute top-0 w-full h-6 bg-slate-800 flex justify-center items-end pb-1">
                <div className="w-20 h-4 bg-black rounded-full" />
              </div>
              <div className="p-5 pt-10 bg-white h-full">
                <div className="flex justify-between items-center mb-6">
                  <div className="w-8 h-8 rounded-full bg-slate-100" />
                  <div className="w-24 h-3 bg-slate-100 rounded-full" />
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/10 rounded-xl border border-secondary/20">
                    <div className="w-20 h-2 bg-secondary/40 rounded-full mb-2" />
                    <div className="w-12 h-4 bg-secondary rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-20 bg-slate-50 rounded-xl" />
                    <div className="h-20 bg-slate-50 rounded-xl" />
                  </div>
                  <div className="space-y-2 mt-6">
                    <div className="w-full h-2 bg-slate-100 rounded-full" />
                    <div className="w-full h-2 bg-slate-100 rounded-full" />
                    <div className="w-2/3 h-2 bg-slate-100 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] -z-10" />
          </div>
          <div className="text-white space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-sm font-bold border border-white/20">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              {t('agentes.vlapex.badge')}
            </div>
            <h2 className="font-headline font-extrabold leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}>
              {t('agentes.vlapex.title', { defaultValue: '' }).split('VLAPEX')[0]}<span className="text-secondary">VLAPEX</span>
            </h2>
            <p className="text-white/70 leading-relaxed max-w-xl" style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)' }}>
              {t('agentes.vlapex.desc')}
            </p>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div>
                <span className="block text-3xl font-bold mb-1">RTD</span>
                <span className="text-sm opacity-60 uppercase tracking-widest">{t('agentes.vlapex.rtd')}</span>
              </div>
              <div>
                <span className="block text-3xl font-bold mb-1">100%</span>
                <span className="text-sm opacity-60 uppercase tracking-widest">{t('agentes.vlapex.digitalNative')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function RegistroSection() {
  const { t } = useTranslation()
  const { ref, isVisible } = useScrollReveal(0.05)
  return (
    <section id="registro" className="py-24 bg-surface-container-low">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div ref={ref} className={`bg-surface-container-lowest rounded-[2.5rem] p-10 md:p-16 shadow-2xl relative reveal ${isVisible ? 'visible' : ''}`}>
          <div className="text-center space-y-8">
            <h2 className="font-headline text-4xl font-extrabold text-primary">{t('agentes.register.title')}</h2>
            <p className="text-text-muted text-lg max-w-xl mx-auto">
              {t('agentes.register.subtitle')}
            </p>
            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="font-headline font-bold text-secondary">1</span>
                </div>
                <p className="text-xs font-bold text-primary">{t('agentes.register.step1')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="font-headline font-bold text-secondary">2</span>
                </div>
                <p className="text-xs font-bold text-primary">{t('agentes.register.step2')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="font-headline font-bold text-secondary">3</span>
                </div>
                <p className="text-xs font-bold text-primary">{t('agentes.register.step3')}</p>
              </div>
            </div>
            <Link
              to="/registro-agente"
              className="inline-flex items-center gap-3 text-white py-5 px-12 rounded-2xl font-headline font-bold text-lg hover:opacity-90 transition-all shadow-xl active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #000f22 0%, #0a2540 100%)' }}
            >
              <span className="material-symbols-outlined">person_add</span>
              {t('agentes.register.startBtn')}
            </Link>
            <p className="text-xs text-text-muted italic">
              {t('agentes.register.disclaimer')}
            </p>
          </div>
          <div className="absolute -top-10 -right-10 hidden lg:flex w-24 h-24 rounded-full items-center justify-center text-white shadow-xl rotate-12" style={{ background: 'linear-gradient(135deg, #000f22 0%, #0a2540 100%)' }}>
            <span className="material-symbols-outlined text-4xl">edit_note</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function AgentesPage() {
  return (
    <main style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
      <HeroAgentes />
      <ValoresSection />
      <CalculadoraSection />
      <HerramientasSection />
      <VlapexSection />
      <RegistroSection />
    </main>
  )
}
