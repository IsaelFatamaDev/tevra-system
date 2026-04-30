import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useScrollReveal from '../../../core/hooks/useScrollReveal'

const STEP_META = [
  { icon: 'search', color: 'bg-secondary', text: 'text-white' },
  { icon: 'link', color: 'bg-primary', text: 'text-[#EBF2FA]' },
  { icon: 'support_agent', color: 'bg-secondary-light', text: 'text-primary' },
  { icon: 'payments', color: 'bg-secondary-pale', text: 'text-primary' },
  { icon: 'flight_takeoff', color: 'bg-secondary', text: 'text-white' },
  { icon: 'home_pin', color: 'bg-primary', text: 'text-[#EBF2FA]' },
]

export default function HowItWorksSection() {
  const { t } = useTranslation()
  const { ref: titleRef, isVisible: titleVisible } = useScrollReveal()
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal(0.05)

  const steps = t('home.steps.items', { returnObjects: true })
  if (!Array.isArray(steps)) return null

  return (
    <section className="py-28 bg-[#EBF2FA]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div ref={titleRef} className={`text-center max-w-2xl mx-auto mb-16 reveal ${titleVisible ? 'visible' : ''}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20 mb-4">
            <span className="material-symbols-outlined text-secondary text-sm">route</span>
            <span className="text-secondary text-[11px] font-black uppercase tracking-widest">
              {t('howItWorks.badge')}
            </span>
          </div>
          <h2 className="font-headline font-extrabold text-primary tracking-tight mb-3" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
            {t('home.steps.title')}
          </h2>
          <p className="text-text-muted">{t('home.steps.subtitle')}</p>
        </div>

        <div ref={gridRef} className={`grid sm:grid-cols-1 md:grid-cols-3 gap-5 reveal ${gridVisible ? 'visible' : ''}`}>
          {steps.map((step, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl p-7 shadow-soft border border-[#9DBEBB]/20 hover:-translate-y-1 hover:shadow-premium transition-all duration-300 stagger-${Math.min(i + 1, 5)} flex gap-4`}
            >
              <div className={`w-11 h-11 ${STEP_META[i].color} ${STEP_META[i].text} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
                <span className="material-symbols-outlined text-xl">{STEP_META[i].icon}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-headline font-bold text-primary text-base mb-1">{step.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-12">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-[#EBF2FA] rounded-2xl font-headline font-bold hover:bg-secondary transition-colors shadow-md text-sm"
          >
            {t('howItWorks.exploreCta')}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
          <Link
            to="/directorio-agentes"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary border border-primary/20 rounded-2xl font-headline font-bold hover:bg-primary/5 transition-colors shadow-md text-sm"
          >
            <span className="material-symbols-outlined text-base">support_agent</span>
            {t('howItWorks.agentCta')}
          </Link>
        </div>
      </div>
    </section>
  )
}
