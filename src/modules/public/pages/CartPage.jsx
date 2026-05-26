import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../../core/hooks/useCart'
import { useAuth } from '../../../core/contexts/AuthContext'

/* ─── Helpers ──────────────────────────────────────────────────────── */
const FMT_SOLES = (usd) => {
  const s = Number(usd || 0) * 3.80
  return `S/ ${s.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
const FMT_USD = (usd) => `$${Number(usd || 0).toFixed(2)} USD`

/* ─── Cart Item Card ───────────────────────────────────────────────── */
function CartItem({ item, onRemove, onUpdate }) {
  const { t } = useTranslation()
  const priceSoles = Number(item.price || 0) * 3.80
  const totalSoles = priceSoles * item.qty

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex gap-5 hover:shadow-sm transition-shadow">
      {/* Image */}
      <Link to={`/catalogo/${item.slug || item.productId}`} className="shrink-0">
        <div className="w-28 h-28 rounded-xl bg-[#F8F8F8] flex items-center justify-center overflow-hidden border border-slate-100">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-contain p-2 mix-blend-multiply"
            />
          ) : (
            <span className="material-symbols-outlined text-3xl text-slate-200">image</span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {item.brand && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{item.brand}</p>
            )}
            <Link
              to={`/catalogo/${item.slug || item.productId}`}
              className="text-[14px] font-semibold text-[#007185] hover:text-[#C45500] leading-snug block line-clamp-2"
            >
              {item.name}
            </Link>
          </div>
          <button
            onClick={() => onRemove(item.productId)}
            title={t('cart.remove')}
            className="shrink-0 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>

        {/* Price + Qty row */}
        <div className="flex items-center justify-between gap-4 mt-auto flex-wrap">
          {/* Qty selector */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <button
              onClick={() => onUpdate(item.productId, item.qty - 1)}
              disabled={item.qty <= 1}
              className="w-9 h-9 flex items-center justify-center text-slate-600 font-bold hover:bg-slate-100 disabled:opacity-30 transition-colors text-[18px]"
            >
              −
            </button>
            <span className="w-10 text-center text-[14px] font-bold text-slate-900 border-x border-slate-200">{item.qty}</span>
            <button
              onClick={() => onUpdate(item.productId, item.qty + 1)}
              className="w-9 h-9 flex items-center justify-center text-slate-600 font-bold hover:bg-slate-100 transition-colors text-[18px]"
            >
              +
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-[18px] font-bold text-slate-900 leading-none">
              S/ {totalSoles.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {item.qty > 1 && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                S/ {priceSoles.toLocaleString('es-PE', { minimumFractionDigits: 2 })} × {item.qty}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                          */
/* ═══════════════════════════════════════════════════════════════════ */
export default function CartPage() {
  const { items, removeItem, updateQty, getSubtotal, getCount, selectedAgent } = useCart()
  const { t }             = useTranslation()
  const { isAuthenticated } = useAuth()
  const navigate          = useNavigate()

  const subtotalUsd    = getSubtotal()
  const subtotalSoles  = subtotalUsd * 3.80
  const itemCount      = getCount()

  const handleCheckout = (e) => {
    if (!isAuthenticated) {
      e.preventDefault()
      navigate('/login?redirect=' + encodeURIComponent(selectedAgent ? '/cotizar' : '/directorio-agentes'))
    }
  }

  /* ── Empty cart ── */
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center" style={{ paddingTop: 'clamp(3.5rem,8vh,5rem)' }}>
        <div className="text-center max-w-sm px-6">
          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-5xl text-slate-300">shopping_cart</span>
          </div>
          <h1 className="text-[24px] font-bold text-slate-900 mb-2">{t('cart.emptyTitle')}</h1>
          <p className="text-slate-500 text-[14px] leading-relaxed mb-8">{t('cart.emptyDesc')}</p>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#FFD814] hover:bg-[#F7CA00] text-slate-900 font-bold text-[14px] rounded-full border border-[#FCD200] shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            {t('cart.goToCatalog')}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA]" style={{ paddingTop: 'clamp(3.5rem,8vh,5rem)' }}>

      {/* ── Header strip ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900">{t('cart.title')}</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">
              {itemCount} {itemCount === 1 ? t('cart.product') : t('cart.products')}
            </p>
          </div>
          <Link
            to="/catalogo"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-[#007185] hover:text-[#C45500] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>

      {/* ── Main layout ──────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* Left — Items list */}
          <div>
            {/* Progress indicator */}
            <div className="flex items-center gap-3 mb-6 p-4 bg-white border border-slate-200 rounded-xl text-[13px]">
              <div className="flex items-center gap-2 text-[#007185] font-semibold">
                <div className="w-6 h-6 rounded-full bg-[#007185] text-white flex items-center justify-center text-[11px] font-black">1</div>
                {t('cart.title')}
              </div>
              <span className="material-symbols-outlined text-slate-300 text-[16px]">chevron_right</span>
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center text-[11px] font-black text-slate-400">2</div>
                {t('cart.chooseAgent')}
              </div>
              <span className="material-symbols-outlined text-slate-300 text-[16px]">chevron_right</span>
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center text-[11px] font-black text-slate-400">3</div>
                {t('cart.quoteWhatsApp')}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              {items.map(item => (
                <CartItem
                  key={item.productId}
                  item={item}
                  onRemove={removeItem}
                  onUpdate={updateQty}
                />
              ))}
            </div>

            {/* Trust badges row */}
            <div className="grid grid-cols-3 gap-4 mt-8 p-5 bg-white border border-slate-200 rounded-2xl">
              {[
                { icon: 'verified', label: t('cart.badge1Label'), sub: t('cart.badge1Sub') },
                { icon: 'local_shipping', label: t('cart.badge2Label'), sub: t('cart.badge2Sub') },
                { icon: 'lock', label: t('cart.badge3Label'), sub: t('cart.badge3Sub') },
              ].map(b => (
                <div key={b.label} className="flex flex-col items-center text-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-[#007185]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#007185] text-[20px]">{b.icon}</span>
                  </div>
                  <p className="text-[12px] font-bold text-slate-800">{b.label}</p>
                  <p className="text-[11px] text-slate-400">{b.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Order Summary */}
          <div className="sticky top-24">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

              {/* Summary header */}
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
                <h2 className="text-[16px] font-bold text-slate-900">{t('cart.summary')}</h2>
              </div>

              <div className="p-6 space-y-5">

                {/* Line items */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-slate-600">{t('cart.subtotal')} ({itemCount} {t('cart.items')})</span>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        S/ {subtotalSoles.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[11px] text-slate-400">{FMT_USD(subtotalUsd)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-slate-600">{t('cart.estimatedShipping')}</span>
                    <span className="text-[13px] font-bold text-[#007600]">{t('cart.quoteWithAgent')}</span>
                  </div>
                </div>

                {/* Divider + Total */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[13px] text-slate-500">{t('cart.estimatedTotal')}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{t('cart.withoutShipping')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[26px] font-bold text-slate-900 leading-none">
                        S/ {subtotalSoles.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[12px] text-slate-400 mt-0.5">{FMT_USD(subtotalUsd)}</p>
                    </div>
                  </div>
                </div>

                {/* Selected Agent */}
                {selectedAgent ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-emerald-700 text-[20px]">support_agent</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-emerald-900 truncate">{selectedAgent.name}</p>
                      <p className="text-[11px] text-emerald-700">{selectedAgent.city}</p>
                    </div>
                    <Link
                      to="/directorio-agentes"
                      className="text-[11px] text-[#007185] font-bold hover:underline shrink-0"
                    >
                      {t('cart.changeAgent')}
                    </Link>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">info</span>
                    <p className="text-[12px] text-amber-800 leading-relaxed">
                      {t('cart.noAgentSelected')}
                    </p>
                  </div>
                )}

                {/* Main CTA */}
                <Link
                  to={selectedAgent ? '/cotizar' : '/directorio-agentes'}
                  onClick={handleCheckout}
                  className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-slate-900 py-4 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 border border-[#FCD200] transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {!isAuthenticated ? 'login' : selectedAgent ? 'chat' : 'group'}
                  </span>
                  {!isAuthenticated
                    ? t('cart.loginToContinue')
                    : selectedAgent
                      ? t('cart.quoteWhatsApp')
                      : t('cart.chooseAgent')
                  }
                </Link>

                {/* Secondary: go to catalog */}
                <Link
                  to="/catalogo"
                  className="w-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 py-3 rounded-full font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">storefront</span>
                  {t('cart.continueShopping')}
                </Link>

                {/* Guarantee note */}
                <div className="flex items-center gap-2 text-[12px] text-slate-500 pt-1">
                  <span className="material-symbols-outlined text-[16px] text-emerald-500 shrink-0">verified_user</span>
                  <p>{t('cart.originalsGuarantee')}</p>
                </div>

              </div>
            </div>

            {/* Recommended actions */}
            <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">{t('cart.howItWorks')}</p>
              <div className="space-y-4">
                {[
                  { step: '1', icon: 'storefront',    text: t('cart.step1') },
                  { step: '2', icon: 'support_agent', text: t('cart.step2') },
                  { step: '3', icon: 'chat',          text: t('cart.step3') },
                  { step: '4', icon: 'flight',        text: t('cart.step4') },
                ].map(s => (
                  <div key={s.step} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#007185]/10 flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-black text-[#007185]">{s.step}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400 text-[16px]">{s.icon}</span>
                      <p className="text-[12px] text-slate-600">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
