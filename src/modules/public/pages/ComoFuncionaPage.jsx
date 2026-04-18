import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useScrollReveal from '../../../core/hooks/useScrollReveal'

const STEP_META = [
  { icon: 'search', color: 'bg-secondary text-white', n: '01' },
  { icon: 'link', color: 'bg-primary text-white', n: '02' },
  { icon: 'support_agent', color: 'bg-mint text-primary', n: '03' },
  { icon: 'payments', color: 'bg-accent-gold text-primary', n: '04' },
  { icon: 'flight_takeoff', color: 'bg-secondary text-white', n: '05' },
  { icon: 'home_pin', color: 'bg-primary text-white', n: '06' },
]

export default function ComoFuncionaPage() {
  const { t } = useTranslation()
  const { ref: stepsRef, isVisible: stepsVisible } = useScrollReveal(0.05)
  const { ref: faqRef, isVisible: faqVisible } = useScrollReveal(0.05)
  const [openFaq, setOpenFaq] = useState(null)

  const steps = t('howItWorks.steps.items', { returnObjects: true })
  const faqs = t('howItWorks.faq.items', { returnObjects: true })

  return (
    <main className="min-h-screen bg-background-cream" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
      <section className="tevra-hero-gradient py-16 sm:py-20 overflow-hidden">
        <div className="tevra-hero-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center hero-enter">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-5">
                <span className="w-2 h-2 bg-tevra-coral rounded-full animate-pulse" />
                <span className="text-white text-[11px] font-bold uppercase tracking-widest">{t('howItWorks.badge')}</span>
              </div>
              <h1 className="font-headline font-extrabold text-white tracking-tight mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                {t('howItWorks.title')}
              </h1>
              <p className="text-white/70 mb-8" style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)' }}>
                {t('howItWorks.subtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/catalogo" className="px-8 py-4 bg-secondary text-white rounded-2xl font-headline font-bold hover:-translate-y-0.5 transition-all shadow-lg shadow-secondary/30">
                  {t('howItWorks.exploreCta')}
                </Link>
                <Link to="/agentes" className="px-8 py-4 glass-card text-white rounded-2xl font-headline font-bold hover:bg-white/10 transition-all">
                  {t('howItWorks.agentCta')}
                </Link>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-3 gap-3">
              {[
                { icon: 'local_shipping', val: '5–10', sub: t('howItWorks.stats.days') },
                { icon: 'verified', val: '100%', sub: t('howItWorks.stats.originals') },
                { icon: 'gavel', val: 'LLC', sub: t('howItWorks.stats.registered') },
                { icon: 'support_agent', val: '24/7', sub: t('howItWorks.stats.support') },
                { icon: 'security', val: '$', sub: t('howItWorks.stats.insured') },
                { icon: 'public', val: 'USA', sub: t('howItWorks.stats.coverage') },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 border border-white/15 rounded-2xl p-4 text-center">
                  <span className="material-symbols-outlined text-secondary text-2xl mb-1 block">{s.icon}</span>
                  <span className="block font-black text-white text-lg">{s.val}</span>
                  <span className="text-white/50 text-[10px] uppercase tracking-wide">{s.sub}</span>
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
              {t('howItWorks.steps.title')}
            </h2>
            <p className="text-text-muted">{t('howItWorks.steps.subtitle')}</p>
          </div>
          <div ref={stepsRef} className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 reveal ${stepsVisible ? 'visible' : ''}`}>
            {Array.isArray(steps) && steps.map((step, i) => (
              <div key={i} className={`bg-surface-container-lowest rounded-3xl p-8 shadow-soft hover:-translate-y-1 hover:shadow-premium transition-all duration-300 stagger-${Math.min(i + 1, 5)}`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-12 h-12 ${STEP_META[i].color} rounded-2xl flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-xl">{STEP_META[i].icon}</span>
                  </div>
                  <span className="font-headline font-black text-outline/40 text-2xl">{STEP_META[i].n}</span>
                </div>
                <h3 className="font-headline font-bold text-primary text-lg mb-2">{step.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <h2 className="font-headline font-extrabold text-primary text-3xl mb-10 text-center">{t('howItWorks.faq.title')}</h2>
          <div ref={faqRef} className={`space-y-3 reveal ${faqVisible ? 'visible' : ''}`}>
            {Array.isArray(faqs) && faqs.map((faq, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/20 shadow-soft">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-headline font-bold text-primary text-sm sm:text-base">{faq.q}</span>
                  <span
                    className="material-symbols-outlined text-outline shrink-0 ml-3 transition-transform duration-300"
                    style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >expand_more</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-text-muted text-sm leading-relaxed border-t border-outline-variant/15 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <h2 className="font-headline font-extrabold text-white text-2xl sm:text-3xl mb-4">{t('howItWorks.cta.title')}</h2>
          <p className="text-white/60 mb-8">{t('howItWorks.cta.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/catalogo" className="px-10 py-4 bg-secondary text-white rounded-2xl font-headline font-bold hover:-translate-y-0.5 transition-all shadow-xl shadow-secondary/30">
              {t('howItWorks.exploreCta')}
            </Link>
            <Link to="/tracking" className="px-10 py-4 glass-card text-white rounded-2xl font-headline font-bold hover:bg-white/10 transition-all">
              {t('howItWorks.trackCta')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
