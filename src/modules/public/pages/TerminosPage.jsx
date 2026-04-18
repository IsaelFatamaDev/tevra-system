import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function TerminosPage() {
  const { t } = useTranslation()

  const sections = [
    { key: 's1' },
    { key: 's2', hasList: true },
    { key: 's3' },
    { key: 's4', hasList: true },
    { key: 's5' },
    { key: 's6' },
    { key: 's7' },
    { key: 's8' },
    { key: 's9' },
    { key: 's10', hasEmail: 'legal@tevra.com' },
  ]

  return (
    <main className="min-h-screen bg-background-cream" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
      <section className="tevra-hero-gradient py-14 overflow-hidden">
        <div className="tevra-hero-overlay" />
        <div className="max-w-4xl mx-auto px-4 sm:px-8 relative z-10 hero-enter">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-5">
            <span className="w-2 h-2 bg-tevra-coral rounded-full animate-pulse" />
            <span className="text-white text-[11px] font-bold uppercase tracking-widest">{t('terminos.badge')}</span>
          </div>
          <h1 className="font-headline font-extrabold text-white tracking-tight mb-3" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
            {t('terminos.title')}
          </h1>
          <p className="text-white/60 text-sm">{t('terminos.lastUpdate')}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="bg-surface-container-lowest rounded-3xl p-8 sm:p-12 shadow-soft space-y-10 text-on-background">
          {sections.map(({ key, hasList, hasEmail }) => {
            const items = hasList ? t(`terminos.${key}.items`, { returnObjects: true }) : null
            return (
              <section key={key} className="space-y-4">
                <h2 className="font-headline font-bold text-2xl text-primary">{t(`terminos.${key}.title`)}</h2>
                <p className="text-text-muted leading-relaxed">{t(`terminos.${key}.content`)}</p>
                {Array.isArray(items) && (
                  <ul className="list-disc list-inside space-y-2 text-text-muted ml-4">
                    {items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                )}
                {hasEmail && (
                  <p className="text-text-muted">
                    <a href={`mailto:${hasEmail}`} className="text-secondary font-medium hover:underline">{hasEmail}</a>
                  </p>
                )}
              </section>
            )
          })}

          <div className="pt-6 border-t border-outline-variant/20 flex flex-wrap gap-4">
            <Link to="/privacidad" className="text-sm font-bold text-secondary hover:underline">{t('terminos.privacyLink')}</Link>
            <Link to="/" className="text-sm text-text-muted hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              {t('terminos.backHome')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
