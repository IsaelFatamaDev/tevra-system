import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../../core/services/api'

export default function AdminSettings() {
  const { t } = useTranslation()
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [logoUrl, setLogoUrl] = useState(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoInputRef = useRef(null)

  const [waStatus, setWaStatus] = useState('unknown')
  const [waQrCode, setWaQrCode] = useState(null)
  const [waLoading, setWaLoading] = useState(false)
  const [waError, setWaError] = useState(null)
  const waIntervalRef = useRef(null)
  const [form, setForm] = useState({
    name: '', supportEmail: '', supportPhone: '', whatsapp: '', currency: 'USD', commissionPct: '',
    stripeEnabled: false, paypalEnabled: false,
    fiscalAddress: '', taxId: '', baseShippingRate: '', welcomeMessage: '',
    instagramUrl: '', facebookUrl: '', tiktokUrl: '', timezone: 'America/Lima', maxAgentZones: '',
    grossMarginPct: '30', agentCommissionPct: '12', etcCommissionPct: '3',
    exchangeRateBuy: '3.72', exchangeRateSell: '3.78',
  })

  useEffect(() => {
    api.get('/tenants/current/info')
      .then(data => {
        setTenant(data)
        setLogoUrl(data.settings?.logoUrl || null)
        setForm({
          name: data.name || '',
          supportEmail: data.settings?.supportEmail || '',
          supportPhone: data.settings?.supportPhone || '',
          whatsapp: data.settings?.whatsapp || '',
          currency: data.settings?.currency || 'USD',
          commissionPct: data.settings?.commissionPct || '',
          grossMarginPct: data.settings?.grossMarginPct ?? '30',
          agentCommissionPct: data.settings?.agentCommissionPct ?? '12',
          etcCommissionPct: data.settings?.etcCommissionPct ?? '3',
          exchangeRateBuy: data.settings?.exchangeRateBuy ?? '3.72',
          exchangeRateSell: data.settings?.exchangeRateSell ?? '3.78',
          stripeEnabled: data.settings?.stripeEnabled || false,
          paypalEnabled: data.settings?.paypalEnabled || false,
          fiscalAddress: data.settings?.fiscalAddress || '',
          taxId: data.settings?.taxId || '',
          baseShippingRate: data.settings?.baseShippingRate || '',
          welcomeMessage: data.settings?.welcomeMessage || '',
          instagramUrl: data.settings?.instagramUrl || '',
          facebookUrl: data.settings?.facebookUrl || '',
          tiktokUrl: data.settings?.tiktokUrl || '',
          timezone: data.settings?.timezone || 'America/Lima',
          maxAgentZones: data.settings?.maxAgentZones || '',
        })
      })
      .catch(err => console.error('Error fetching tenant', err))
      .finally(() => setLoading(false))
  }, [])

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.upload('/media/upload?entityType=tenant_logo', fd)
      const url = res.url || res.publicUrl
      setLogoUrl(url)
      // Persist immediately
      const { name, ...settings } = form
      await api.put('/tenants/current/settings', { name, settings: { ...settings, logoUrl: url } })
    } catch (err) { console.error('Logo upload failed', err) }
    finally { setUploadingLogo(false); if (logoInputRef.current) logoInputRef.current.value = '' }
  }

  const handleRemoveLogo = async () => {
    setLogoUrl(null)
    const { name, ...settings } = form
    await api.put('/tenants/current/settings', { name, settings: { ...settings, logoUrl: null } })
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    try {
      const { name, ...settings } = form
      await api.put('/tenants/current/settings', { name, settings: { ...settings, logoUrl } })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  /* ── WhatsApp functions ── */
  const checkWaStatus = useCallback(async () => {
    try {
      const data = await api.get('/whatsapp/status')
      const state = data?.instance?.state || data?.state || 'close'
      setWaStatus(state)
      if (state === 'open') {
        setWaQrCode(null)
        if (waIntervalRef.current) { clearInterval(waIntervalRef.current); waIntervalRef.current = null }
      }
    } catch { setWaStatus('unknown') }
  }, [])

  const handleWaConnect = async () => {
    setWaLoading(true)
    setWaError(null)
    try {
      // Try to create instance first (idempotent)
      try { await api.post('/whatsapp/instance') } catch { /* may already exist */ }
      // Get QR code
      const data = await api.get('/whatsapp/qrcode')
      const qr = data?.base64 || data?.qrcode?.base64 || data?.code || null
      if (qr) {
        setWaQrCode(qr.startsWith('data:') ? qr : `data:image/png;base64,${qr}`)
        setWaStatus('connecting')
        // Start polling for connection
        if (waIntervalRef.current) clearInterval(waIntervalRef.current)
        waIntervalRef.current = setInterval(checkWaStatus, 5000)
      } else {
        setWaError(t('admin.settings.waQrError'))
      }
    } catch (err) {
      setWaError(err?.response?.data?.message || err.message || 'Error connecting')
    } finally { setWaLoading(false) }
  }

  const handleWaDisconnect = async () => {
    setWaLoading(true)
    try {
      await api.delete('/whatsapp/logout')
      setWaStatus('close')
      setWaQrCode(null)
    } catch (err) { setWaError(err.message) }
    finally { setWaLoading(false) }
  }

  // Check WA status on mount + cleanup
  useEffect(() => {
    checkWaStatus()
    return () => { if (waIntervalRef.current) clearInterval(waIntervalRef.current) }
  }, [checkWaStatus])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-[#9DBEBB]/20 border-t-[#468189] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 platform-enter">
      <div>
        <h2 className="text-xl font-semibold text-[#031926]">{t('admin.settings.title')}</h2>
        <p className="text-sm text-[#468189] mt-0.5">{t('admin.settings.subtitle')}</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {t('admin.settings.savedSuccess')}
        </div>
      )}

      {/* Logo / Branding */}
      <div className="bg-white rounded-xl border border-[#9DBEBB]/20 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#9DBEBB]/10">
          <h3 className="font-semibold text-[#031926] text-sm">{t('admin.settings.brandLogo')}</h3>
          <p className="text-xs text-[#468189] mt-0.5">{t('admin.settings.logoHint')}</p>
        </div>
        <div className="p-5 flex items-center gap-5">
          <div className="w-20 h-20 rounded-lg bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 flex items-center justify-center overflow-hidden shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <span className="material-symbols-outlined text-[#9DBEBB] text-3xl">image</span>
            )}
          </div>
          <div className="space-y-2">
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <div className="flex gap-2">
              <button type="button" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}
                className="px-3.5 py-2 bg-[#031926] text-[#EBF2FA] text-xs font-medium rounded-lg hover:bg-primary-mid transition-colors disabled:opacity-50 flex items-center gap-1.5">
                {uploadingLogo ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('common.saving')}</>
                ) : (
                  <><span className="material-symbols-outlined text-[16px]">upload</span> {logoUrl ? t('admin.settings.changeLogo') : t('admin.settings.uploadLogo')}</>
                )}
              </button>
              {logoUrl && (
                <button type="button" onClick={handleRemoveLogo}
                  className="px-3.5 py-2 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">delete</span> {t('common.delete')}
                </button>
              )}
            </div>
            <p className="text-xs text-[#9DBEBB]">{t('admin.settings.logoFileHint')}</p>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-white rounded-xl border border-[#9DBEBB]/20 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#9DBEBB]/10">
          <h3 className="font-semibold text-[#031926] text-sm">{t('admin.settings.companyData')}</h3>
          <p className="text-xs text-[#468189] mt-0.5">{t('admin.settings.companyDataHint')}</p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.commercialName')}</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.supportEmail')}</label>
            <input type="email" value={form.supportEmail} onChange={e => setForm({ ...form, supportEmail: e.target.value })}
              className="w-full px-3 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.supportPhone')}</label>
            <input type="tel" value={form.supportPhone} onChange={e => setForm({ ...form, supportPhone: e.target.value })}
              className="w-full px-3 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.whatsapp')}</label>
            <input type="tel" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full px-3 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.mainCurrency')}</label>
            <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
              className="w-full px-3 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all">
              <option value="USD">{t('admin.settings.currencyUSD')}</option>
              <option value="PEN">{t('admin.settings.currencyPEN')}</option>
              <option value="MXN">{t('admin.settings.currencyMXN')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fiscal & Shipping */}
      <div className="bg-white rounded-xl border border-[#9DBEBB]/20 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#9DBEBB]/10">
          <h3 className="font-semibold text-[#031926] text-sm">{t('admin.settings.fiscalShipping')}</h3>
          <p className="text-xs text-[#468189] mt-0.5">{t('admin.settings.fiscalHint')}</p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.taxId')}</label>
            <input type="text" value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value })}
              className="w-full px-3 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" placeholder="20600000000" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.baseShippingRate')}</label>
            <input type="number" step="0.01" value={form.baseShippingRate} onChange={e => setForm({ ...form, baseShippingRate: e.target.value })}
              className="w-full px-3 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" placeholder="5.00" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.fiscalAddress')}</label>
            <input type="text" value={form.fiscalAddress} onChange={e => setForm({ ...form, fiscalAddress: e.target.value })}
              className="w-full px-3 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" placeholder="Av. Principal 123, Lima, Perú" />
          </div>
        </div>
      </div>

      {/* Social & Messaging */}
      <div className="bg-white rounded-xl border border-[#9DBEBB]/20 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#9DBEBB]/10">
          <h3 className="font-semibold text-[#031926] text-sm">{t('admin.settings.socialComm')}</h3>
          <p className="text-xs text-[#468189] mt-0.5">{t('admin.settings.socialHint')}</p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.instagram')}</label>
            <input type="url" value={form.instagramUrl} onChange={e => setForm({ ...form, instagramUrl: e.target.value })}
              className="w-full px-3 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" placeholder="https://instagram.com/tevra" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.facebook')}</label>
            <input type="url" value={form.facebookUrl} onChange={e => setForm({ ...form, facebookUrl: e.target.value })}
              className="w-full px-3 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" placeholder="https://facebook.com/tevra" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.tiktok')}</label>
            <input type="url" value={form.tiktokUrl} onChange={e => setForm({ ...form, tiktokUrl: e.target.value })}
              className="w-full px-3 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" placeholder="https://tiktok.com/@tevra" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.timezone')}</label>
            <select value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}
              className="w-full px-3 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all">
              <option value="America/Lima">America/Lima (UTC-5)</option>
              <option value="America/Bogota">America/Bogota (UTC-5)</option>
              <option value="America/Mexico_City">America/Mexico_City (UTC-6)</option>
              <option value="America/Santiago">America/Santiago (UTC-3)</option>
              <option value="America/Buenos_Aires">America/Buenos_Aires (UTC-3)</option>
              <option value="America/New_York">America/New_York (UTC-5)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.agentWelcomeMessage')}</label>
            <textarea value={form.welcomeMessage} onChange={e => setForm({ ...form, welcomeMessage: e.target.value })} rows={3}
              className="w-full px-3 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all resize-none" placeholder="¡Bienvenido al equipo de agentes de TeVra! Estamos emocionados de tenerte..." />
          </div>
        </div>
      </div>

      {/* Agent Limits */}
      <div className="bg-white rounded-xl border border-[#9DBEBB]/20 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#9DBEBB]/10">
          <h3 className="font-semibold text-[#031926] text-sm">{t('admin.settings.agentConfig')}</h3>
          <p className="text-xs text-[#468189] mt-0.5">{t('admin.settings.agentConfigHint')}</p>
        </div>
        <div className="p-5">
          <div className="max-w-xs">
            <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.maxAgentZones')}</label>
            <input type="number" value={form.maxAgentZones} onChange={e => setForm({ ...form, maxAgentZones: e.target.value })}
              className="w-full px-3 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" placeholder="3" />
          </div>
        </div>
      </div>

      {/* Commissions & Payments */}
      <div className="bg-white rounded-xl border border-[#9DBEBB]/20 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#9DBEBB]/10">
          <h3 className="font-semibold text-[#031926] text-sm">{t('admin.settings.paymentsCommissions')}</h3>
          <p className="text-xs text-[#468189] mt-0.5">{t('admin.settings.paymentsHint')}</p>
        </div>
        <div className="p-5 space-y-5">

          {/* Dynamic Commission Model */}
          <div className="p-4 bg-[#EBF2FA]/40 rounded-xl border border-[#9DBEBB]/20 space-y-4">
            <div>
              <p className="text-xs font-bold text-[#031926] uppercase tracking-wider">{t('admin.settings.commissionModelTitle')}</p>
              <p className="text-xs text-[#468189] mt-0.5">{t('admin.settings.commissionModelHint')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.grossMarginPct')}</label>
                <div className="relative">
                  <input type="number" step="0.1" min="0" max="100" value={form.grossMarginPct}
                    onChange={e => setForm({ ...form, grossMarginPct: e.target.value })}
                    className="w-full px-3 py-2 pr-7 bg-white border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" placeholder="30" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9DBEBB] font-bold">%</span>
                </div>
                <p className="text-[10px] text-[#9DBEBB] mt-1">{t('admin.settings.grossMarginHint')}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.agentCommissionPct')}</label>
                <div className="relative">
                  <input type="number" step="0.1" min="0" max="100" value={form.agentCommissionPct}
                    onChange={e => setForm({ ...form, agentCommissionPct: e.target.value })}
                    className="w-full px-3 py-2 pr-7 bg-white border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" placeholder="12" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9DBEBB] font-bold">%</span>
                </div>
                <p className="text-[10px] text-[#9DBEBB] mt-1">{t('admin.settings.agentCommissionHint')}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.etcCommissionPct')}</label>
                <div className="relative">
                  <input type="number" step="0.1" min="0" max="100" value={form.etcCommissionPct}
                    onChange={e => setForm({ ...form, etcCommissionPct: e.target.value })}
                    className="w-full px-3 py-2 pr-7 bg-white border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" placeholder="3" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9DBEBB] font-bold">%</span>
                </div>
                <p className="text-[10px] text-[#9DBEBB] mt-1">{t('admin.settings.etcCommissionHint')}</p>
              </div>
            </div>

            {/* Exchange Rates */}
            <div>
              <p className="text-xs font-bold text-[#031926] mb-2">{t('admin.settings.exchangeRateTitle')}</p>
              <div className="grid grid-cols-2 gap-4 max-w-xs">
                <div>
                  <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.exchangeRateBuy')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#9DBEBB] font-bold">S/</span>
                    <input type="number" step="0.01" value={form.exchangeRateBuy}
                      onChange={e => setForm({ ...form, exchangeRateBuy: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" placeholder="3.72" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.exchangeRateSell')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#9DBEBB] font-bold">S/</span>
                    <input type="number" step="0.01" value={form.exchangeRateSell}
                      onChange={e => setForm({ ...form, exchangeRateSell: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" placeholder="3.78" />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            {(() => {
              const margin = parseFloat(form.grossMarginPct) || 30
              const agentPct = parseFloat(form.agentCommissionPct) || 12
              const etcPct = parseFloat(form.etcCommissionPct) || 3
              const providerCost = 100
              const finalPrice = providerCost / (1 - margin / 100)
              const agentAmt = finalPrice * agentPct / 100
              const etcAmt = finalPrice * etcPct / 100
              const tevraAmt = finalPrice - providerCost - agentAmt - etcAmt
              return (
                <div className="mt-2 p-3 bg-white rounded-lg border border-[#9DBEBB]/20">
                  <p className="text-[10px] font-bold text-[#468189] uppercase tracking-wider mb-2">{t('admin.settings.commissionPreview')}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: t('admin.settings.commissionPreviewFinal'), value: `$${finalPrice.toFixed(2)}`, color: 'bg-[#031926] text-white' },
                      { label: t('admin.settings.commissionPreviewAgent'), value: `$${agentAmt.toFixed(2)} (${agentPct}%)`, color: 'bg-blue-50 text-blue-700' },
                      { label: t('admin.settings.commissionPreviewEtc'), value: `$${etcAmt.toFixed(2)} (${etcPct}%)`, color: 'bg-amber-50 text-amber-700' },
                      { label: t('admin.settings.commissionPreviewTevra'), value: `$${tevraAmt.toFixed(2)} (${(tevraAmt/finalPrice*100).toFixed(1)}%)`, color: 'bg-emerald-50 text-emerald-700' },
                    ].map(item => (
                      <div key={item.label} className={`p-2 rounded-lg text-center ${item.color}`}>
                        <p className="text-[10px] font-medium opacity-80">{item.label}</p>
                        <p className="text-xs font-bold mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>

          <div className="max-w-xs">
            <label className="block text-xs font-medium text-[#468189] mb-1">{t('admin.settings.tevraCommissionPct')}</label>
            <input type="number" value={form.commissionPct} onChange={e => setForm({ ...form, commissionPct: e.target.value })}
              className="w-full px-3 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" placeholder="15" />
          </div>
          <div className="flex items-center justify-between p-3.5 bg-[#EBF2FA]/30 rounded-lg border border-[#9DBEBB]/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#EBF2FA] rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[#468189] text-[18px]">credit_card</span>
              </div>
              <div>
                <p className="font-medium text-sm text-[#031926]">{t('admin.settings.stripe')}</p>
                <p className="text-xs text-[#468189]">{t('admin.settings.stripeDesc')}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={form.stripeEnabled} onChange={e => setForm({ ...form, stripeEnabled: e.target.checked })} />
              <div className="w-11 h-6 bg-[#9DBEBB]/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#031926]"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-3.5 bg-[#EBF2FA]/30 rounded-lg border border-[#9DBEBB]/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#EBF2FA] rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[#468189] text-[18px]">account_balance_wallet</span>
              </div>
              <div>
                <p className="font-medium text-sm text-[#031926]">{t('admin.settings.paypal')}</p>
                <p className="text-xs text-[#468189]">{t('admin.settings.paypalDesc')}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={form.paypalEnabled} onChange={e => setForm({ ...form, paypalEnabled: e.target.checked })} />
              <div className="w-11 h-6 bg-[#9DBEBB]/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#031926]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Plan Info */}
      {tenant && (
        <div className="bg-white rounded-xl border border-[#9DBEBB]/20 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#9DBEBB]/10">
            <h3 className="font-semibold text-[#031926] text-sm">{t('admin.settings.currentPlan')}</h3>
          </div>
          <div className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-[#EBF2FA] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[#468189] text-xl">workspace_premium</span>
            </div>
            <div>
              <p className="font-semibold text-[#031926] capitalize text-lg">{tenant.plan}</p>
              <p className="text-xs text-[#468189]">Slug: {tenant.slug} · ID: {tenant.id?.slice(0, 8)}</p>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Connection */}
      <div className="bg-white rounded-xl border border-[#9DBEBB]/20 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#9DBEBB]/10 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#031926] text-sm">{t('admin.settings.waTitle')}</h3>
            <p className="text-xs text-[#468189] mt-0.5">{t('admin.settings.waSubtitle')}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${waStatus === 'open' ? 'bg-emerald-50 text-emerald-700' :
              waStatus === 'connecting' ? 'bg-amber-50 text-amber-700' :
                'bg-[#EBF2FA] text-[#468189]'
            }`}>
            <span className={`w-2 h-2 rounded-full ${waStatus === 'open' ? 'bg-emerald-500' :
                waStatus === 'connecting' ? 'bg-amber-500 animate-pulse' :
                  'bg-[#9DBEBB]'
              }`} />
            {waStatus === 'open' ? t('admin.settings.waConnected') :
              waStatus === 'connecting' ? t('admin.settings.waConnecting') :
                t('admin.settings.waDisconnected')}
          </div>
        </div>
        <div className="p-5">
          {waError && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {waError}
            </div>
          )}

          {waStatus === 'open' ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-600 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#031926] text-sm">{t('admin.settings.waActiveTitle')}</p>
                <p className="text-xs text-[#468189] mt-0.5">{t('admin.settings.waActiveDesc')}</p>
              </div>
              <button onClick={handleWaDisconnect} disabled={waLoading}
                className="px-3.5 py-2 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <span className="material-symbols-outlined text-[16px]">link_off</span>
                {t('admin.settings.waDisconnect')}
              </button>
            </div>
          ) : waQrCode ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <p className="text-sm text-[#468189] font-medium text-center">{t('admin.settings.waScanQr')}</p>
              <div className="p-3 bg-white rounded-xl border-2 border-[#9DBEBB]/20 shadow-sm">
                <img src={waQrCode} alt="WhatsApp QR Code" className="w-56 h-56 object-contain" />
              </div>
              <p className="text-xs text-[#9DBEBB] text-center max-w-sm">{t('admin.settings.waScanHint')}</p>
              <button onClick={handleWaConnect} disabled={waLoading}
                className="text-xs text-[#468189] hover:text-[#031926] underline transition-colors">
                {t('admin.settings.waRefreshQr')}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-16 h-16 bg-[#EBF2FA]/30 rounded-2xl flex items-center justify-center border border-[#9DBEBB]/20">
                <span className="material-symbols-outlined text-[#9DBEBB] text-3xl">qr_code_2</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#031926]">{t('admin.settings.waNotConnected')}</p>
                <p className="text-xs text-[#9DBEBB] mt-1 max-w-sm">{t('admin.settings.waNotConnectedDesc')}</p>
              </div>
              <button onClick={handleWaConnect} disabled={waLoading}
                className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-[#EBF2FA] text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm">
                {waLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('common.loading')}</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">qr_code_scanner</span> {t('admin.settings.waConnect')}</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="bg-[#031926] hover:bg-primary-mid disabled:opacity-50 text-[#EBF2FA] px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('common.saving')}</>
          ) : (
            <><span className="material-symbols-outlined text-[18px]">save</span> {t('common.save')}</>
          )}
        </button>
      </div>
    </div>
  )
}
