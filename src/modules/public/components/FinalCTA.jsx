import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useScrollReveal from '../../../core/hooks/useScrollReveal'

export default function FinalCTA() {
  const { ref, isVisible } = useScrollReveal(0.2)
  const { t } = useTranslation()

  return (
    <section className="max-w-7xl mx-auto px-8 mb-32">
      <div ref={ref} className={`bg-secondary rounded-[40px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-secondary/40 reveal-scale ${isVisible ? 'visible' : ''}`}>
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="font-headline text-4xl md:text-6xl font-black text-white mb-8 leading-tight tracking-tighter">
            {t('home.cta.title')}
          </h2>
          <p className="text-white/90 text-xl mb-12 font-medium">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/catalogo"
              className="bg-primary text-white px-12 py-6 rounded-2xl font-headline font-extrabold text-xl flex items-center justify-center gap-3 hover:scale-105 transition-all duration-300 shadow-xl"
            >
              {t('home.cta.exploreCatalog')}
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <Link
              to="/directorio-agentes"
              className="bg-white text-secondary px-12 py-6 rounded-2xl font-headline font-extrabold text-xl hover:bg-white/90 transition-all duration-300 shadow-xl flex items-center justify-center gap-3"
            >
              {t('home.cta.talkToAgent')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
