const brands = ['AMAZON', 'APPLE', 'EBAY', 'WALMART', 'NIKE', 'BEST BUY', 'TARGET', 'COSTCO']

const badges = [
  { icon: 'verified_user', label: 'LLC REGISTERED IN CALIFORNIA' },
  { icon: 'local_shipping', label: 'ENVIO 100% GARANTIZADO' },
  { icon: 'payments', label: 'PAGO SEGURO' },
]

export default function TrustBar() {
  return (
    <div className="bg-surface-container-lowest py-12 border-b border-outline-variant/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="relative overflow-hidden mask-gradient">
          <div
            className="flex gap-16 items-center whitespace-nowrap animate-[marquee_20s_linear_infinite]"
            style={{ width: 'max-content' }}
          >
            {[...brands, ...brands].map((brand, i) => (
              <span key={`${brand}-${i}`} className="text-xl font-black text-primary opacity-40 grayscale select-none">
                {brand}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-outline-variant/10 flex flex-wrap justify-center gap-12 text-sm font-bold text-primary/60 tracking-tight">
          {badges.map((badge) => (
            <div key={badge.icon} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">{badge.icon}</span>
              {badge.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
