import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useScrollReveal from '../../../core/hooks/useScrollReveal'

export default function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="tevra-hero-gradient flex items-center overflow-hidden" style={{ minHeight: '100svh', paddingTop: 'clamp(4rem, 10vh, 6rem)' }}>
      <div className="tevra-hero-overlay" />

      <div className="w-full h-full max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10 py-8 lg:py-0" style={{ minHeight: 'inherit' }}>
        <div className="space-y-5 sm:space-y-8 py-6 lg:py-12 animate-[slide-left_1s_cubic-bezier(0.16,1,0.3,1)_0.3s_both]">

          <div className="flex items-center gap-4 mb-2">
            <div className="w-px h-8 bg-white/20" />
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
              <span className="w-2 h-2 bg-tevra-coral rounded-full animate-pulse" />
              <span className="text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
                {t('home.hero.badge')}
              </span>
            </div>
          </div>

          <h1 className="font-headline font-extrabold text-white leading-[1.1] tracking-tight" style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)' }}>
            {t('home.hero.title').split('<coral>')[0]}
            <span className="text-tevra-coral">
              {t('home.hero.title').split('<coral>')[1]?.split('</coral>')[0]}
            </span>
            {t('home.hero.title').split('</coral>')[1]}
          </h1>

          <p className="text-white/70 leading-relaxed max-w-lg" style={{ fontSize: 'clamp(0.95rem, 2vw, 1.25rem)' }}>
            {t('home.hero.subtitle')}
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-5 pt-2">
            <Link
              to="/catalogo"
              className="bg-tevra-coral text-white rounded-2xl font-headline font-bold shadow-tevra-coral transition-all duration-300 hover:-translate-y-1"
              style={{ padding: 'clamp(0.75rem, 2vh, 1.25rem) clamp(1.5rem, 3vw, 2.5rem)', fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)' }}
            >
              {t('home.hero.exploreCatalog')}
            </Link>
            <button
              className="glass-card text-white rounded-2xl font-headline font-bold hover:bg-white/10 transition-all duration-300"
              style={{ padding: 'clamp(0.75rem, 2vh, 1.25rem) clamp(1.5rem, 3vw, 2.5rem)', fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)' }}
            >
              {t('home.hero.quoteLink')}
            </button>
          </div>

          <div className="flex gap-8 sm:gap-10 pt-4 sm:pt-8 items-center">
            <div className="flex flex-col">
              <span className="text-white font-black" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>10k+</span>
              <span className="text-white/50 text-[10px] sm:text-xs uppercase tracking-widest">{t('home.hero.shipments')}</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-white font-black" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>4.9/5</span>
              <span className="text-white/50 text-[10px] sm:text-xs uppercase tracking-widest">{t('home.hero.rating')}</span>
            </div>
          </div>
        </div>

        <div className="relative hidden lg:flex items-center justify-center animate-[slide-right_1s_cubic-bezier(0.16,1,0.3,1)_0.5s_both]">
          <div className="absolute inset-0 bg-tevra-coral/10 blur-[100px] rounded-full scale-75" />
          <div className="absolute w-[110%] h-[110%] rounded-[2.5rem] bg-white/5 border border-white/10 rotate-2 scale-95" />
          <div className="relative z-10 rounded-4xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.45)] border border-white/10 hover:scale-[1.02] transition-transform duration-700" style={{ maxHeight: '65vh', aspectRatio: '1/1' }}>
            <img
              className="w-full h-full object-cover object-center"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDJ9-i5TKpvJCiOd1RqoQk3J8swgyDaPV_2WPnpzRJomq757yjmRyBa6wOSisMTs7OpI1qj27L-TkC0mOakFRwTfPlHlU6uzpSZGsn7Or29XzdZIVoMdtzVLWQxRUCpphXwDgkIaOn5A2sxGLvTd_PIKBar6z7OqSBLgZYdAmjfeYNZ_ZriCTksLG_f0GJk0lYjPjjbe9un3JVaQ_WgJJy47oHTvKe4gCsyGPLTneqtjhqZu8pz_y4df5fQucgJxdW6lmcyPB4o_BI"
              alt="Productos premium desde USA"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a2540]/40 via-transparent to-transparent" />
          </div>
          <div className="absolute bottom-6 left-6 right-6 z-20 bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/15 flex items-center gap-3">
            <span className="w-3 h-3 bg-mint rounded-full animate-pulse flex-shrink-0" />
            <span className="text-white text-xs font-bold uppercase tracking-widest">{t('home.hero.guarantee')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
