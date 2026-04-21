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
            <div className="w-px h-8 bg-secondary-light/40" />
            <Link to="/como-funciona" className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/20 rounded-full border border-secondary-light/30 hover:bg-secondary/30 transition-colors">
              <span className="w-2 h-2 bg-secondary-light rounded-full animate-pulse" />
              <span className="text-[#F4E9CD] text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
                {t('home.hero.badge')}
              </span>
            </Link>
          </div>

          <h1 className="font-headline font-extrabold text-[#F4E9CD] leading-[1.1] tracking-tight" style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)' }}>
            {t('home.hero.title').split('<coral>')[0]}
            <span className="text-secondary-light">
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
              className="btn-primary"
              style={{ padding: 'clamp(0.75rem, 2vh, 1.1rem) clamp(1.5rem, 3vw, 2.25rem)', fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}
            >
              {t('home.hero.exploreCatalog')}
            </Link>
            <Link
              to="/directorio-agentes"
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
              <span className="text-[#9DBEBB] text-[10px] sm:text-xs uppercase tracking-widest">{t('home.hero.shipments')}</span>
            </div>
            <div className="w-px h-10 bg-[#468189]/40" />
            <div className="flex flex-col">
              <span className="text-[#F4E9CD] font-black" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>4.9/5</span>
              <span className="text-[#9DBEBB] text-[10px] sm:text-xs uppercase tracking-widest">{t('home.hero.rating')}</span>
            </div>
          </div>
        </div>

        <div className="relative hidden lg:flex items-center justify-center animate-[slide-right_1s_cubic-bezier(0.16,1,0.3,1)_0.5s_both]">
          <div className="absolute inset-0 bg-[#468189]/12 blur-[100px] rounded-full scale-75" />
          <div className="absolute w-[110%] h-[110%] rounded-[2.5rem] bg-[#F4E9CD]/5 border border-secondary-light/15 rotate-2 scale-95" />
          <div className="relative z-10 rounded-4xl overflow-hidden shadow-[0_32px_80px_rgba(3,25,38,0.55)] border border-secondary-light/20 hover:scale-[1.02] transition-transform duration-700" style={{ maxHeight: '65vh', aspectRatio: '1/1' }}>
            <img
              className="w-full h-full object-cover object-center"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDJ9-i5TKpvJCiOd1RqoQk3J8swgyDaPV_2WPnpzRJomq757yjmRyBa6wOSisMTs7OpI1qj27L-TkC0mOakFRwTfPlHlU6uzpSZGsn7Or29XzdZIVoMdtzVLWQxRUCpphXwDgkIaOn5A2sxGLvTd_PIKBar6z7OqSBLgZYdAmjfeYNZ_ZriCTksLG_f0GJk0lYjPjjbe9un3JVaQ_WgJJy47oHTvKe4gCsyGPLTneqtjhqZu8pz_y4df5fQucgJxdW6lmcyPB4o_BI"
              alt="Productos premium desde USA"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#031926]/50 via-transparent to-transparent" />
          </div>
          <div className="absolute bottom-6 left-6 right-6 z-20 bg-[#031926]/60 backdrop-blur-md rounded-2xl px-5 py-3 border border-secondary-light/20 flex items-center gap-3">
            <span className="w-3 h-3 bg-secondary-light rounded-full animate-pulse shrink-0" />
            <span className="text-[#F4E9CD] text-xs font-bold uppercase tracking-widest">{t('home.hero.guarantee')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
