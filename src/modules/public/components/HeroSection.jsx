import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useScrollReveal from '../../../core/hooks/useScrollReveal'

export default function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="tevra-hero-gradient flex items-center overflow-hidden" style={{ minHeight: '100svh', paddingTop: 'clamp(4rem, 10vh, 6rem)' }}>
      <div className="tevra-hero-overlay" />

      {/* Decorative glow */}
      <div className="absolute top-1/4 right-0 w-150 h-150 rounded-full bg-secondary/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-100 h-100 rounded-full bg-secondary-light/10 blur-[100px] pointer-events-none" />

      <div className="w-full h-full max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10 py-8 lg:py-0" style={{ minHeight: 'inherit' }}>
        <div className="space-y-5 sm:space-y-8 py-6 lg:py-12 animate-[slide-left_1s_cubic-bezier(0.16,1,0.3,1)_0.3s_both]">

          <div className="flex items-center gap-4 mb-2">
            <div className="w-px h-8 bg-tevra-gold/40" />
            <Link to="/como-funciona" className="inline-flex items-center gap-2 px-3 py-1.5 bg-tevra-gold/10 rounded-full border border-tevra-gold/30 hover:bg-tevra-gold/20 transition-colors">
              <span className="w-2 h-2 bg-tevra-gold rounded-full animate-pulse" />
              <span className="text-tevra-gold text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
                {t('home.hero.badge')}
              </span>
            </Link>
          </div>

          <h1 className="font-headline font-extrabold text-[#EEF4ED] leading-[1.1] tracking-tight" style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)' }}>
            {t('home.hero.title').split('<coral>')[0]}
            <span className="text-tevra-gold drop-shadow-lg">
              {t('home.hero.title').split('<coral>')[1]?.split('</coral>')[0]}
            </span>
            {t('home.hero.title').split('</coral>')[1]}
          </h1>

          <p className="text-[#F4E9CD]/65 leading-relaxed max-w-lg" style={{ fontSize: 'clamp(0.95rem, 2vw, 1.25rem)' }}>
            {t('home.hero.subtitle')}
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-4 pt-2">
            <Link
              to="/catalogo"
              className="btn-gold"
              style={{ padding: 'clamp(0.75rem, 2vh, 1.1rem) clamp(1.5rem, 3vw, 2.25rem)', fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}
            >
              {t('home.hero.exploreCatalog')}
            </Link>
            <Link
              to="/cotizar-link"
              className="btn-ghost flex items-center gap-2"
              style={{ padding: 'clamp(0.75rem, 2vh, 1.1rem) clamp(1.5rem, 3vw, 2.25rem)', fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)' }}>link</span>
              {t('home.hero.quoteLink')}
            </Link>
          </div>

          <div className="flex gap-8 sm:gap-10 pt-4 sm:pt-8 items-center">
            <div className="flex flex-col">
              <span className="text-[#F4E9CD] font-black" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>10k+</span>
              <span className="text-[#C5D8E8] text-[10px] sm:text-xs uppercase tracking-widest">{t('home.hero.shipments')}</span>
            </div>
            <div className="w-px h-10 bg-[#8DA9C4]/40" />
            <div className="flex flex-col">
              <span className="text-[#F4E9CD] font-black" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>4.9/5</span>
              <span className="text-[#C5D8E8] text-[10px] sm:text-xs uppercase tracking-widest">{t('home.hero.rating')}</span>
            </div>
          </div>
        </div>

        <div className="relative hidden lg:flex items-center justify-center animate-[slide-right_1s_cubic-bezier(0.16,1,0.3,1)_0.5s_both]">
          <div className="absolute inset-0 bg-[#8DA9C4]/12 blur-[100px] rounded-full scale-75" />
          <div className="absolute w-[110%] h-[110%] rounded-[2.5rem] bg-[#F4E9CD]/5 border border-secondary-light/15 rotate-2 scale-95" />
          <div className="relative z-10 rounded-4xl overflow-hidden shadow-[0_32px_80px_rgba(19, 64, 116,0.55)] border border-secondary-light/20 hover:scale-[1.02] transition-transform duration-700" style={{ maxHeight: '65vh', aspectRatio: '1/1' }}>
            <img
              className="w-full h-full object-cover object-center"
              src="/LogoHome.png"
              alt="Productos premium desde USA"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#134074]/50 via-transparent to-transparent" />
          </div>
          <div className="absolute bottom-6 left-6 right-6 z-20 bg-[#134074]/80 backdrop-blur-md rounded-2xl px-5 py-3 border border-tevra-gold/30 flex items-center gap-3">
            <span className="w-3 h-3 bg-tevra-gold rounded-full animate-pulse shrink-0" />
            <span className="text-tevra-gold text-xs font-bold uppercase tracking-widest">{t('home.hero.guarantee')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
