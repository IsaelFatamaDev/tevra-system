import { useTranslation } from 'react-i18next'

/**
 * LanguageSwitcher – pill toggle between ES and EN.
 * Pass variant="light" for dark backgrounds (Navbar/Footer),
 * variant="dark" (default) for light backgrounds (Admin/Client headers).
 */
export default function LanguageSwitcher({ variant = 'dark' }) {
  const { i18n } = useTranslation()
  const current = i18n.language?.startsWith('en') ? 'en' : 'es'

  const toggle = () => {
    const next = current === 'es' ? 'en' : 'es'
    i18n.changeLanguage(next)
  }

  const isLight = variant === 'light'

  return (
    <button
      onClick={toggle}
      aria-label="Switch language"
      className={`
        flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest
        border transition-all duration-200 select-none
        ${isLight
          ? 'border-white/20 text-white/80 hover:text-white hover:bg-white/10'
          : 'border-outline-variant/30 text-text-muted hover:text-primary hover:bg-surface-container-low'
        }
      `}
    >
      <span className="text-xs">🌐</span>
      {current === 'es' ? 'EN' : 'ES'}
    </button>
  )
}
