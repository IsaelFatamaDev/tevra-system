import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useScrollReveal from '../../../core/hooks/useScrollReveal'

const categories = [
  {
    key: 'apple',
    subtitle: 'Novedades y Lanzamientos',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlAolvtQrnBA84nRbJ8SQBKojwVQpcDYsm4tsb63fP_AX2-j8OwI05fSESFQ8aTRlLYlSKRSSVWqmsXsmjhD9aCLEqlXiXBgAhYl15bjMzlSPR4uiZQPaiDb4YcyzXJiFDJqumcfYwxcfS56BZfJMuGDQeRSuKxjGioudaJAbTWg4VwLJcbygu3qDjpP84S20wUVeZg4WJwfc4xrWF8WP2T4ObT9iHdupwBLg03Axtff2kIACbBk39pC4Ar-UzxXxDukKIYGgkfpSv',
    large: true,
    title: 'Ecosistema Apple',
  },
  {
    key: 'sneakers',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6A_gryKaa05VzQZGwHx_DQmOvpWl7ZBHk-V9NdTG7QAQYe18oeYneENicTPWXFhYSLdYrPLfrEEok6_MG0ydaOj1asMyAwNyE7ocrLImVeA81pl5je64K8GNB_WjXLvGchlnLQHomZBOf6gA_fYy0lfpHXGXmJcStunDBowkFpNEEWnsTqyb9qJ-_OAmdJz4Hhw_WR5vINo7HUC_Y5r-GrXRu9qJ0LPIwnfw1OS4ZcbtLnDTX-y_jJyy4tZlki_npplRaZnn0zQgY',
    title: 'Sneakers',
  },
  {
    key: 'watches',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAF2a4C6IdlPZU6nTa42sl__6A1RfwJ2vVxtKUUKs9bjcFmJcH1nlJ3q5dOWuGbQZtMiSk7E2tGDeHHZDKwKz5dZJCwrfnMyOCGlzvIzQnM5ZrmRdj6fstNwMJJFolAzZvQFp2TmSYtnQQwcRD5dAV2SIqy43SApAPbIALV4-v3lsE-oU31t3Sq1_9jK7Muz6XxDgy5bSTIGtfL4KuEHWyfGAc8LlYzrNAh9k2Wlbi0vkaAHh7hurl-UOQJjdl4-VWNfOu9Rcz3dWfy',
    title: 'Relojería',
  },
  {
    key: 'audio',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgQUsyn24QGTcy2xVEZCpPQZg1cPeLnL7y1N71kZX5LJ8Q2sKGqzZ_PMfZ97VHoD5SvofPdPpsGSBZNkP97GH-5GudKY9_wwK1uD-6EO1NJQiH6Lg8qcTsp-aeWDZW97fKeLpHieWvUaC01l7gblaap4rZnIvtWjiPZS_Cx9w3jh0mCRo517bGYFryrhpyi2VcfbE7IuTycEP7vrSk_6_h_Y0K_vOtb2fLcKR2yJKmIY1ye8B1FqujyNdfOu4at4-af-KzWWdDoZmU',
    wide: true,
    title: 'Audio & Tech High-End',
  },
]

export default function CategoriesGrid() {
  const { t } = useTranslation()
  const { ref: titleRef, isVisible: titleVisible } = useScrollReveal()
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal(0.05)

  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div ref={titleRef} className={`flex justify-between items-end mb-16 reveal ${titleVisible ? 'visible' : ''}`}>
          <div>
            <h2 className="font-headline text-4xl font-extrabold text-[#031926] tracking-tight">
              {t('home.categories.title')}
            </h2>
            <p className="text-text-muted mt-2">{t('home.categories.subtitle')}</p>
          </div>
          <Link
            to="/catalogo"
            className="hidden md:inline font-headline font-bold text-[#468189] border-b-2 border-[#468189] pb-1 hover:text-[#031926] transition-all"
          >
            {t('home.categories.seeAll')}
          </Link>
        </div>

        <div ref={gridRef} className={`grid grid-cols-1 md:grid-cols-4 gap-6 reveal-scale ${gridVisible ? 'visible' : ''}`}>
          {categories.map((cat) => {
            if (cat.large) {
              return (
                <div
                  key={cat.key}
                  className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-3xl aspect-4/5 md:aspect-auto"
                >
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    src={cat.image}
                    alt={cat.title}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#031926]/90 via-[#031926]/20 to-transparent flex flex-col justify-end p-10">
                    <h4 className="text-[#F4E9CD] font-headline font-extrabold text-3xl">{cat.title}</h4>
                    <p className="text-[#F4E9CD]/70 mt-2">{cat.subtitle}</p>
                    <button className="mt-6 w-fit bg-[#F4E9CD] text-[#031926] px-6 py-3 rounded-xl font-bold text-sm opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500">
                      {t('home.categories.explore')}
                    </button>
                  </div>
                </div>
              )
            }

            if (cat.wide) {
              return (
                <div key={cat.key} className="md:col-span-2 relative group overflow-hidden rounded-3xl h-64">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    src={cat.image}
                    alt={cat.title}
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-[#031926]/80 to-transparent flex items-center p-10">
                    <h4 className="text-[#F4E9CD] font-headline font-extrabold text-2xl">{cat.title}</h4>
                  </div>
                </div>
              )
            }

            return (
              <div key={cat.key} className="relative group overflow-hidden rounded-3xl h-64">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  src={cat.image}
                  alt={cat.title}
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-end p-6">
                  <h4 className="text-white font-headline font-bold text-xl">{cat.title}</h4>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
