import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function WhatsAppButton() {
  const { t } = useTranslation()

  return (
    <Link
      to="/directorio-agentes"
      className="fixed bottom-10 right-10 w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center shadow-premium z-50 hover:scale-110 active:scale-95 transition-all group"
    >
      <span className="material-symbols-outlined text-3xl fill-icon">chat</span>
      <span className="absolute right-20 bg-[#EBF2FA] text-[#031926] px-4 py-2 rounded-xl text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {t('whatsapp.needHelp')}
      </span>
    </Link>
  )
}
