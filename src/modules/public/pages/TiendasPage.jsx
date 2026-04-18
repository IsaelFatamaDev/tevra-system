import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useScrollReveal from '../../../core/hooks/useScrollReveal'

const STORES = [
  { name: 'Amazon', categoryKey: 'general', icon: '🛒', url: 'https://www.amazon.com', color: 'bg-amber-50 border-amber-200', tagColor: 'bg-accent-gold text-primary' },
  { name: 'Nike', categoryKey: 'clothing', icon: '👟', url: 'https://www.nike.com', color: 'bg-surface-container-low border-outline-variant/30', tagColor: 'bg-primary text-white' },
  { name: 'Sephora', categoryKey: 'beauty', icon: '💄', url: 'https://www.sephora.com', color: 'bg-pink-50 border-pink-200', tagColor: 'bg-secondary text-white' },
  { name: 'Apple', categoryKey: 'electronics', icon: '🍎', url: 'https://www.apple.com', color: 'bg-surface-container-low border-outline-variant/30', tagColor: 'bg-on-background text-white' },
  { name: 'Zara', categoryKey: 'fashion', icon: '👗', url: 'https://www.zara.com/us', color: 'bg-surface-container-low border-outline-variant/30', tagColor: 'bg-primary text-white' },
  { name: 'Best Buy', categoryKey: 'electronics', icon: '🖥️', url: 'https://www.bestbuy.com', color: 'bg-blue-50 border-blue-200', tagColor: 'bg-primary text-white' },
  { name: 'Bath & Body Works', categoryKey: 'beautyHome', icon: '🕯️', url: 'https://www.bathandbodyworks.com', color: 'bg-purple-50 border-purple-200', tagColor: 'bg-mint text-primary' },
  { name: 'Target', categoryKey: 'general', icon: '🎯', url: 'https://www.target.com', color: 'bg-red-50 border-red-200', tagColor: 'bg-secondary text-white' },
  { name: 'Adidas', categoryKey: 'clothing', icon: '🏃', url: 'https://www.adidas.com', color: 'bg-surface-container-low border-outline-variant/30', tagColor: 'bg-primary text-white' },
]

export default function TiendasPage() {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState('all')
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal(0.05)

  const categoryFilters = t('stores.categoryFilters', { returnObjects: true })
  const storeItems = t('stores.items', { returnObjects: true })

  const filtered = activeCategory === 'all'
    ? STORES
    : STORES.filter(s => s.categoryKey === activeCategory)

  return (
    <main className="min-h-screen bg-background-cream" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
      <section className="tevra-hero-gradient py-16 sm:py-20 overflow-hidden">
        <div className="tevra-hero-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 hero-enter">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-5">
            <span className="w-2 h-2 bg-tevra-coral rounded-full animate-pulse" />
            <span className="text-white text-[11px] font-bold uppercase tracking-widest">{t('stores.badge')}</span>
          </div>
          <h1 className="font-headline font-extrabold text-white tracking-tight mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            {t('stores.title')}
          </h1>
          <p className="text-white/70 max-w-2xl mb-6" style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)' }}>
            {t('stores.subtitle')}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full">
              <span className="material-symbols-outlined text-mint text-sm">verified</span>
              <span className="text-white text-xs font-bold">{t('stores.originalsOnly')}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full">
              <span className="material-symbols-outlined text-secondary text-sm">local_shipping</span>
              <span className="text-white text-xs font-bold">{t('stores.deliveryInDays')}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-[clamp(3.5rem,8vh,5rem)] z-40 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            {Array.isArray(categoryFilters) && categoryFilters.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${activeCategory === cat.key ? 'bg-primary text-white shadow-md' : 'bg-surface-container text-text-muted hover:bg-surface-container-high'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <p className="text-text-muted text-sm mb-8">
          <span className="font-bold text-primary">{filtered.length}</span> {t('stores.storesAvailable')}
        </p>
        <div ref={gridRef} className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-6 reveal ${gridVisible ? 'visible' : ''}`}>
          {filtered.map((store, i) => {
            const storeData = Array.isArray(storeItems) ? storeItems[STORES.indexOf(store)] : null
            return (
              <div key={store.name} className={`bg-surface-container-lowest rounded-3xl overflow-hidden border shadow-soft hover:-translate-y-1.5 hover:shadow-premium transition-all duration-300 stagger-${Math.min(i + 1, 5)} ${store.color}`}>
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{store.icon}</div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${store.tagColor}`}>{storeData?.tag || ''}</span>
                  </div>
                  <h3 className="font-headline font-extrabold text-2xl text-primary mb-1">{store.name}</h3>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">{storeData?.category || ''}</p>
                  <p className="text-text-muted text-sm leading-relaxed mb-6">{storeData?.desc || ''}</p>
                  <Link
                    to="/agentes"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-2xl font-headline font-bold text-sm hover:bg-secondary transition-colors shadow-md"
                  >
                    <span className="material-symbols-outlined text-base">support_agent</span>
                    {t('stores.orderViaAgent')}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-16 bg-primary rounded-3xl p-10 sm:p-14 text-white text-center">
          <span className="material-symbols-outlined text-5xl text-secondary mb-4 block">add_circle</span>
          <h3 className="font-headline font-extrabold text-2xl sm:text-3xl mb-3">{t('stores.anyStore.title')}</h3>
          <p className="text-white/60 max-w-lg mx-auto mb-8">{t('stores.anyStore.desc')}</p>
          <Link to="/cotizar" className="inline-flex items-center gap-2 px-10 py-4 bg-secondary text-white rounded-2xl font-headline font-bold hover:-translate-y-0.5 transition-all shadow-xl shadow-secondary/30">
            <span className="material-symbols-outlined">link</span>
            {t('stores.anyStore.cta')}
          </Link>
        </div>
      </section>
    </main>
  )
}
