import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useCart } from '../../../core/hooks/useCart'

export default function CartPage() {
  const { items, removeItem, updateQty, getSubtotal, getCount, selectedAgent } = useCart()
  const { t } = useTranslation()

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background-cream flex items-center justify-center" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
        <div className="text-center space-y-6">
          <span className="material-symbols-outlined text-7xl text-outline-variant/40 block">shopping_cart</span>
          <h1 className="font-headline font-extrabold text-3xl text-primary">{t('cart.emptyTitle')}</h1>
          <p className="text-text-muted max-w-md">{t('cart.emptyDesc')}</p>
          <Link to="/catalogo" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-headline font-bold hover:bg-primary-dark transition-colors shadow-lg">
            <span className="material-symbols-outlined">storefront</span>
            {t('cart.goToCatalog')}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background-cream" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-headline font-extrabold text-3xl text-primary">{t('cart.title')}</h1>
            <p className="text-text-muted text-sm mt-1">{getCount()} {getCount() === 1 ? t('cart.product') : t('cart.products')}</p>
          </div>
          <Link to="/catalogo" className="flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            {t('cart.continueShopping')}
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.productId} className="bg-surface-container-lowest rounded-2xl p-5 flex gap-5 shadow-soft">
                <Link to={`/catalogo/${item.slug || item.productId}`} className="shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl bg-surface-container-low" />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-surface-container-low flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-outline-variant">image</span>
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {item.brand && <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{item.brand}</p>}
                      <Link to={`/catalogo/${item.slug || item.productId}`} className="font-headline font-bold text-primary text-base leading-tight hover:text-secondary transition-colors">
                        {item.name}
                      </Link>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="text-text-muted hover:text-red-500 transition-colors shrink-0">
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                  <div className="flex items-end justify-between mt-4">
                    <div className="flex items-center gap-1 bg-surface-container rounded-xl">
                      <button
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        disabled={item.qty <= 1}
                        className="w-9 h-9 flex items-center justify-center text-primary font-bold disabled:opacity-30 hover:bg-surface-container-high rounded-l-xl transition-colors"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-bold text-primary text-sm">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        className="w-9 h-9 flex items-center justify-center text-primary font-bold hover:bg-surface-container-high rounded-r-xl transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-black text-lg text-primary">${(item.price * item.qty).toFixed(0)} <span className="text-xs font-bold text-text-muted">USD</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-soft sticky top-28 space-y-6">
              <h2 className="font-headline font-bold text-lg text-primary">{t('cart.summary')}</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">{t('cart.subtotal')} ({getCount()} {t('cart.items')})</span>
                  <span className="font-bold text-primary">${getSubtotal().toFixed(0)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">{t('cart.estimatedShipping')}</span>
                  <span className="text-xs font-bold text-mint">{t('cart.quoteWithAgent')}</span>
                </div>
                <div className="border-t border-outline-variant/20 pt-3 flex justify-between">
                  <span className="font-bold text-primary">{t('cart.estimatedTotal')}</span>
                  <span className="font-black text-xl text-secondary">${getSubtotal().toFixed(0)}</span>
                </div>
              </div>

              {/* Agent info if selected */}
              {selectedAgent && (
                <div className="bg-surface-container rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">support_agent</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-primary truncate">{selectedAgent.name}</p>
                    <p className="text-[10px] text-text-muted">{selectedAgent.city}</p>
                  </div>
                  <Link to="/directorio-agentes" className="text-[10px] text-secondary font-bold ml-auto shrink-0">{t('cart.changeAgent')}</Link>
                </div>
              )}

              <Link
                to={selectedAgent ? '/cotizar' : '/directorio-agentes'}
                className="w-full bg-primary text-white py-4 rounded-2xl font-headline font-bold text-sm flex items-center justify-center gap-2 hover:bg-secondary transition-colors shadow-lg"
              >
                <span className="material-symbols-outlined text-base">
                  {selectedAgent ? 'send' : 'group'}
                </span>
                {selectedAgent ? t('cart.quoteWhatsApp') : t('cart.chooseAgent')}
              </Link>

              <div className="flex items-start gap-2 text-xs text-text-muted">
                <span className="material-symbols-outlined text-sm text-mint shrink-0">verified_user</span>
                <p>{t('cart.originalsGuarantee')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
