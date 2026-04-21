import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useScrollReveal from '../../../core/hooks/useScrollReveal'

export default function FinalCTA() {
  const { ref, isVisible } = useScrollReveal(0.2)
  const { t } = useTranslation()

  return (
    <section className="max-w-7xl mx-auto px-8 mb-32">
      <div ref={ref} className={`relative overflow-hidden rounded-[40px] p-12 md:p-24 text-center shadow-2xl reveal-scale ${isVisible ? 'visible' : ''}`}
        style={{ background: 'linear-gradient(135deg, #031926 0%, #0d3349 50%, #468189 100%)' }}
      >
        {/* Decoraciones */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#468189]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary-light/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(rgba(244,233,205,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F4E9CD]/10 rounded-full border border-secondary-light/30 mb-8">
            <span className="w-2 h-2 bg-secondary-light rounded-full animate-pulse" />
            <span className="text-[#F4E9CD] text-[11px] font-bold uppercase tracking-widest">TeVra USA</span>
          </div>
          <h2 className="font-headline text-4xl md:text-6xl font-black text-[#F4E9CD] mb-8 leading-tight tracking-tighter">
            {t('home.cta.title')}
          </h2>
          <p className="text-[#F4E9CD]/75 text-xl mb-12 font-medium">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/catalogo"
              className="bg-[#F4E9CD] text-[#031926] px-10 py-5 rounded-2xl font-headline font-extrabold text-lg flex items-center justify-center gap-3 hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl"
            >
              {t('home.cta.exploreCatalog')}
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <Link
              to="/directorio-agentes"
              className="btn-ghost px-10 py-5 text-lg font-headline font-extrabold flex items-center justify-center gap-3"
            >
              {t('home.cta.talkToAgent')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
