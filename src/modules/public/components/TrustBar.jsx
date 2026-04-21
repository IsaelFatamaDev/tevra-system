import { useTranslation } from 'react-i18next'

const brands = ['AMAZON', 'APPLE', 'EBAY', 'WALMART', 'NIKE', 'BEST BUY', 'TARGET', 'COSTCO']

export default function TrustBar() {
  const { t } = useTranslation()

  const badges = [
    { icon: 'verified_user', label: t('home.trust.registered') },
    { icon: 'local_shipping', label: t('home.trust.shipping') },
    { icon: 'payments', label: t('home.trust.payment') },
  ]

  return (
    <div className="bg-white py-10 border-b border-[#9DBEBB]/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="relative overflow-hidden mask-gradient">
          <div
            className="flex gap-16 items-center whitespace-nowrap animate-[marquee_20s_linear_infinite]"
            style={{ width: 'max-content' }}
          >
            {[...brands, ...brands].map((brand, i) => (
              <span key={`${brand}-${i}`} className="text-lg font-black text-[#031926] opacity-30 select-none tracking-widest">
                {brand}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-[#9DBEBB]/20 flex flex-wrap justify-center gap-10 text-sm font-bold text-[#031926]/50 tracking-tight">
          {badges.map((badge) => (
            <div key={badge.icon} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#468189]/10 flex items-center justify-center group-hover:bg-[#468189]/20 transition-colors">
                <span className="material-symbols-outlined text-[#468189] text-[18px]">{badge.icon}</span>
              </div>
              <span className="text-text-muted">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
