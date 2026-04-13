import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'

export default function Footer() {
  const { t } = useTranslation()

  const footerSections = [
    {
      title: t('footer.sections.buy.title'),
      links: [
        { label: t('footer.sections.buy.howItWorks'), href: '/como-funciona' },
        { label: t('footer.sections.buy.quoter'), href: '/cotizador' },
        { label: t('footer.sections.buy.usaStores'), href: '/tiendas' },
      ],
    },
    {
      title: t('footer.sections.about.title'),
      links: [
        { label: t('footer.sections.about.mission'), href: '/mision' },
        { label: t('footer.sections.about.becomeAgent'), href: '/ser-agente' },
        { label: t('footer.sections.about.contact'), href: '/contacto' },
      ],
    },
  ]

  return (
    <footer className="bg-primary text-white pt-24 pb-12 w-full">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-12 gap-16 border-b border-white/5 pb-20">
        <div className="md:col-span-4">
          <span className="font-headline font-extrabold text-3xl tracking-tight text-white select-none block mb-8">
            Te<span className="text-secondary">Vra</span>
          </span>
          <p className="text-white/50 leading-relaxed mb-6">
            {t('footer.tagline')}
          </p>
          <div className="flex items-center gap-4 mb-4">
            <LanguageSwitcher variant="light" />
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">public</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">share</span>
            </div>
          </div>
        </div>

        {footerSections.map((section) => (
          <div key={section.title} className="md:col-span-2">
            <h5 className="font-headline font-bold mb-8 uppercase tracking-widest text-[11px] text-secondary">
              {section.title}
            </h5>
            <ul className="space-y-4 text-white/60 font-medium">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="md:col-span-4">
          <h5 className="font-headline font-bold mb-8 uppercase tracking-widest text-[11px] text-secondary">
            {t('footer.newsletter')}
          </h5>
          <p className="text-white/50 text-sm mb-6">
            {t('footer.newsletterDesc')}
          </p>
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
            <input
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm flex-grow px-4 text-white placeholder:text-white/40"
              placeholder={t('footer.emailPlaceholder')}
              type="email"
            />
            <button className="bg-secondary px-6 py-3 rounded-lg font-bold text-sm hover:bg-secondary/90 transition-colors">
              {t('footer.joinBtn')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-12 flex flex-wrap justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-white/30">
        <p>{t('footer.copyright')}</p>
        <div className="flex gap-8">
          <Link to="/terminos" className="hover:text-secondary transition-colors">{t('footer.terms')}</Link>
          <Link to="/privacidad" className="hover:text-secondary transition-colors">{t('footer.privacy')}</Link>
        </div>
      </div>
    </footer>
  )
}
