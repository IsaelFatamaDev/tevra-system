import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useScrollReveal from '../../../core/hooks/useScrollReveal'

const statIcons = ['location_on', 'workspace_premium', 'flight', 'gavel']

const stepMeta = [
  { n: '01', icon: 'person' },
  { n: '02', icon: 'receipt_long' },
  { n: '03', icon: 'send' },
  { n: '04', icon: 'storefront' },
  { n: '05', icon: 'flight_takeoff' },
  { n: '06', icon: 'fact_check' },
  { n: '07', icon: 'home_pin' },
]

const ventajaIcons = ['route', 'location_city', 'balance', 'security', 'verified_user', 'new_releases']

const desafioIcons = ['schedule', 'block', 'person_raised_hand', 'currency_exchange']

function StatCard({ stat, i }) {
  const { ref, isVisible } = useScrollReveal(0.05)
  return (
    <div ref={ref} className={`bg-white/5 border border-white/10 rounded-3xl p-8 text-center hover:bg-white/10 transition-all reveal stagger-${i + 1} ${isVisible ? 'visible' : ''}`}>
      <span className="material-symbols-outlined text-secondary text-3xl mb-3 block">{stat.icon}</span>
      <span className="font-headline font-black text-white block" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>{stat.valor}</span>
      <span className="font-bold text-white text-sm block mt-1">{stat.label}</span>
      <span className="text-white/40 text-xs">{stat.sub}</span>
    </div>
  )
}

export default function EmpresaPage() {
  const { ref: misionRef, isVisible: misionVisible } = useScrollReveal(0.05)
  const { ref: pasosRef, isVisible: pasosVisible } = useScrollReveal(0.01)
  const { ref: ventajasRef, isVisible: ventajasVisible } = useScrollReveal(0.01)
  const { ref: desafiosRef, isVisible: desafiosVisible } = useScrollReveal(0.01)

  const { t } = useTranslation()
  const stats = t('empresa.stats', { returnObjects: true }).map((s, i) => ({ ...s, icon: statIcons[i] }))
  const pasos = t('empresa.process.steps', { returnObjects: true }).map((s, i) => ({ ...s, ...stepMeta[i] }))
  const ventajas = t('empresa.advantages.items', { returnObjects: true }).map((v, i) => ({ ...v, icon: ventajaIcons[i] }))
  const desafios = t('empresa.challenges.items', { returnObjects: true }).map((d, i) => ({ ...d, icon: desafioIcons[i] }))

  return (
    <main className="min-h-screen bg-background-cream" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
      <section className="tevra-hero-gradient py-20 sm:py-28 overflow-hidden">
        <div className="tevra-hero-overlay" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="max-w-3xl hero-enter">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-6">
              <span className="w-2 h-2 bg-mint rounded-full animate-pulse" />
              <span className="text-white text-[11px] font-bold uppercase tracking-widest">{t('empresa.hero.badge')}</span>
            </div>
            <h1 className="font-headline font-extrabold text-white leading-tight tracking-tight mb-6" style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4rem)' }}>
              {t('empresa.hero.title')}
            </h1>
            <p className="text-white/70 leading-relaxed max-w-2xl" style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
              {t('empresa.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s, i) => <StatCard key={s.label} stat={s} i={i} />)}
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-background-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div ref={misionRef} className={`grid lg:grid-cols-2 gap-8 lg:gap-12 reveal ${misionVisible ? 'visible' : ''}`}>
            <div className="bg-primary rounded-3xl p-10 sm:p-14 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/10 blur-[80px] rounded-full" />
              <span className="inline-block px-3 py-1 bg-secondary/20 text-secondary text-xs font-bold uppercase tracking-widest rounded-full mb-6">{t('empresa.mission.badge')}</span>
              <h2 className="font-headline font-extrabold text-white text-2xl sm:text-3xl mb-6 leading-tight">
                {t('empresa.mission.title')}
              </h2>
              <p className="text-white/70 leading-relaxed">
                {t('empresa.mission.desc')}
              </p>
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-white/50 text-sm italic">
                  {t('empresa.mission.quote')}
                </p>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-3xl p-10 sm:p-14 border border-outline-variant/20">
              <span className="inline-block px-3 py-1 bg-mint/20 text-mint text-xs font-bold uppercase tracking-widest rounded-full mb-6">{t('empresa.vision.badge')}</span>
              <h2 className="font-headline font-extrabold text-primary text-2xl sm:text-3xl mb-6 leading-tight">
                {t('empresa.vision.title')}
              </h2>
              <p className="text-text-muted leading-relaxed">
                {t('empresa.vision.desc')}
              </p>
              <div className="mt-8 p-6 bg-surface-container rounded-2xl">
                <p className="text-primary font-medium text-sm leading-relaxed">
                  <span className="font-black">{t('empresa.vision.uber')}</span>{t('empresa.vision.uberDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-headline font-extrabold text-primary tracking-tight mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
              {t('empresa.process.title')}
            </h2>
            <p className="text-text-muted">{t('empresa.process.subtitle')}</p>
          </div>
          <div ref={pasosRef} className={`relative reveal ${pasosVisible ? 'visible' : ''}`}>
            <div className="hidden lg:block absolute left-8 top-8 bottom-8 w-0.5 bg-outline-variant/30" />
            <div className="space-y-4">
              {pasos.map((paso, i) => (
                <div key={paso.n} className={`bg-surface-container-lowest rounded-3xl p-6 sm:p-8 lg:pl-20 relative flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-soft hover:shadow-premium transition-all duration-300 stagger-${Math.min(i + 1, 5)}`}>
                  <div className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary items-center justify-center z-10">
                    <span className="text-white text-xs font-black">{paso.n}</span>
                  </div>
                  <div className="flex lg:hidden w-10 h-10 rounded-2xl bg-primary items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-black">{paso.n}</span>
                  </div>
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl items-center justify-center hidden sm:flex flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">{paso.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-headline font-bold text-primary text-base mb-1">{paso.titulo}</h4>
                    <p className="text-text-muted text-sm leading-relaxed">{paso.desc}</p>
                  </div>
                  {paso.n === '07' && (
                    <div className="flex-shrink-0 hidden lg:flex items-center gap-2 px-4 py-2 bg-mint/15 rounded-full border border-mint/30">
                      <span className="w-2 h-2 bg-mint rounded-full" />
                      <span className="text-xs font-bold text-mint">{t('empresa.process.businessDays')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-background-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-headline font-extrabold text-primary tracking-tight mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
              {t('empresa.advantages.title')}
            </h2>
            <p className="text-text-muted">{t('empresa.advantages.subtitle')}</p>
          </div>
          <div ref={ventajasRef} className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 reveal ${ventajasVisible ? 'visible' : ''}`}>
            {ventajas.map((v, i) => (
              <div key={v.titulo} className={`bg-surface-container-lowest rounded-3xl p-8 shadow-soft hover:-translate-y-1 hover:shadow-premium transition-all duration-300 stagger-${Math.min(i + 1, 5)}`}>
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary text-xl">{v.icon}</span>
                </div>
                <h4 className="font-headline font-bold text-primary mb-3">{v.titulo}</h4>
                <p className="text-text-muted text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-2xl mb-14">
            <span className="inline-block px-3 py-1 bg-accent-gold/20 text-accent-gold text-xs font-bold uppercase tracking-widest rounded-full mb-5">{t('empresa.challenges.badge')}</span>
            <h2 className="font-headline font-extrabold text-primary tracking-tight mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
              {t('empresa.challenges.title')}
            </h2>
            <p className="text-text-muted">{t('empresa.challenges.subtitle')}</p>
          </div>
          <div ref={desafiosRef} className={`grid grid-cols-1 sm:grid-cols-2 gap-6 reveal ${desafiosVisible ? 'visible' : ''}`}>
            {desafios.map((d, i) => (
              <div key={d.titulo} className={`bg-surface-container-lowest rounded-3xl p-8 border-l-4 border-accent-gold shadow-soft stagger-${i + 1}`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-accent-gold/10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-accent-gold text-lg">{d.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-primary mb-2">{d.titulo}</h4>
                    <p className="text-text-muted text-sm leading-relaxed">{d.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center relative z-10">
          <h2 className="font-headline font-extrabold text-white tracking-tight mb-5" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            {t('empresa.joinCta.title')}
          </h2>
          <p className="text-white/70 mb-10 max-w-xl mx-auto" style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)' }}>
            {t('empresa.joinCta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/agentes" className="px-10 py-4 bg-secondary text-white rounded-2xl font-headline font-bold text-lg shadow-xl shadow-secondary/30 hover:-translate-y-1 transition-all">
              {t('empresa.joinCta.becomeAgent')}
            </Link>
            <Link to="/tracking" className="px-10 py-4 glass-card text-white rounded-2xl font-headline font-bold text-lg hover:bg-white/10 transition-all">
              {t('empresa.joinCta.trackOrder')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
