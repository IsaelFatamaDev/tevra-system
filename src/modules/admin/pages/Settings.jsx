import { useState, useEffect, useRef } from 'react'
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
  const [form, setForm] = useState({
    name: '', supportEmail: '', supportPhone: '', whatsapp: '', currency: 'USD', commissionPct: '',
    stripeEnabled: false, paypalEnabled: false,
    fiscalAddress: '', taxId: '', baseShippingRate: '', welcomeMessage: '',
    instagramUrl: '', facebookUrl: '', tiktokUrl: '', timezone: 'America/Lima', maxAgentZones: '',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 platform-enter">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">{t('admin.settings.title')}</h2>
        <p className="text-sm text-zinc-500 mt-0.5">{t('admin.settings.subtitle')}</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {t('admin.settings.savedSuccess')}
        </div>
      )}

      {/* Logo / Branding */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-900 text-sm">{t('admin.settings.brandLogo')}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{t('admin.settings.logoHint')}</p>
        </div>
        <div className="p-5 flex items-center gap-5">
          <div className="w-20 h-20 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <span className="material-symbols-outlined text-zinc-300 text-3xl">image</span>
            )}
          </div>
          <div className="space-y-2">
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <div className="flex gap-2">
              <button type="button" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}
                className="px-3.5 py-2 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-1.5">
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
            <p className="text-xs text-zinc-400">{t('admin.settings.logoFileHint')}</p>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-900 text-sm">{t('admin.settings.companyData')}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{t('admin.settings.companyDataHint')}</p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-zinc-500 mb-1">{t('admin.settings.commercialName')}</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">{t('admin.settings.supportEmail')}</label>
            <input type="email" value={form.supportEmail} onChange={e => setForm({ ...form, supportEmail: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">{t('admin.settings.supportPhone')}</label>
            <input type="tel" value={form.supportPhone} onChange={e => setForm({ ...form, supportPhone: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">{t('admin.settings.whatsapp')}</label>
            <input type="tel" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">{t('admin.settings.mainCurrency')}</label>
            <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all">
              <option value="USD">{t('admin.settings.currencyUSD')}</option>
              <option value="PEN">{t('admin.settings.currencyPEN')}</option>
              <option value="MXN">{t('admin.settings.currencyMXN')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fiscal & Shipping */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-900 text-sm">{t('admin.settings.fiscalShipping')}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{t('admin.settings.fiscalHint')}</p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">{t('admin.settings.taxId')}</label>
            <input type="text" value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" placeholder="20600000000" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">{t('admin.settings.baseShippingRate')}</label>
            <input type="number" step="0.01" value={form.baseShippingRate} onChange={e => setForm({ ...form, baseShippingRate: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" placeholder="5.00" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-zinc-500 mb-1">{t('admin.settings.fiscalAddress')}</label>
            <input type="text" value={form.fiscalAddress} onChange={e => setForm({ ...form, fiscalAddress: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" placeholder="Av. Principal 123, Lima, Perú" />
          </div>
        </div>
      </div>

      {/* Social & Messaging */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-900 text-sm">{t('admin.settings.socialComm')}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{t('admin.settings.socialHint')}</p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">{t('admin.settings.instagram')}</label>
            <input type="url" value={form.instagramUrl} onChange={e => setForm({ ...form, instagramUrl: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" placeholder="https://instagram.com/tevra" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">{t('admin.settings.facebook')}</label>
            <input type="url" value={form.facebookUrl} onChange={e => setForm({ ...form, facebookUrl: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" placeholder="https://facebook.com/tevra" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">{t('admin.settings.tiktok')}</label>
            <input type="url" value={form.tiktokUrl} onChange={e => setForm({ ...form, tiktokUrl: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" placeholder="https://tiktok.com/@tevra" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">{t('admin.settings.timezone')}</label>
            <select value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all">
              <option value="America/Lima">America/Lima (UTC-5)</option>
              <option value="America/Bogota">America/Bogota (UTC-5)</option>
              <option value="America/Mexico_City">America/Mexico_City (UTC-6)</option>
              <option value="America/Santiago">America/Santiago (UTC-3)</option>
              <option value="America/Buenos_Aires">America/Buenos_Aires (UTC-3)</option>
              <option value="America/New_York">America/New_York (UTC-5)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-zinc-500 mb-1">{t('admin.settings.agentWelcomeMessage')}</label>
            <textarea value={form.welcomeMessage} onChange={e => setForm({ ...form, welcomeMessage: e.target.value })} rows={3}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all resize-none" placeholder="¡Bienvenido al equipo de agentes de TeVra! Estamos emocionados de tenerte..." />
          </div>
        </div>
      </div>

      {/* Agent Limits */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-900 text-sm">{t('admin.settings.agentConfig')}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{t('admin.settings.agentConfigHint')}</p>
        </div>
        <div className="p-5">
          <div className="max-w-xs">
            <label className="block text-xs font-medium text-zinc-500 mb-1">{t('admin.settings.maxAgentZones')}</label>
            <input type="number" value={form.maxAgentZones} onChange={e => setForm({ ...form, maxAgentZones: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" placeholder="3" />
          </div>
        </div>
      </div>

      {/* Commissions & Payments */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-900 text-sm">{t('admin.settings.paymentsCommissions')}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{t('admin.settings.paymentsHint')}</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="max-w-xs">
            <label className="block text-xs font-medium text-zinc-500 mb-1">{t('admin.settings.tevraCommissionPct')}</label>
            <input type="number" value={form.commissionPct} onChange={e => setForm({ ...form, commissionPct: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" placeholder="15" />
          </div>
          <div className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-lg border border-zinc-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-zinc-600 text-[18px]">credit_card</span>
              </div>
              <div>
                <p className="font-medium text-sm text-zinc-900">{t('admin.settings.stripe')}</p>
                <p className="text-xs text-zinc-500">{t('admin.settings.stripeDesc')}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={form.stripeEnabled} onChange={e => setForm({ ...form, stripeEnabled: e.target.checked })} />
              <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-900"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-lg border border-zinc-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-zinc-600 text-[18px]">account_balance_wallet</span>
              </div>
              <div>
                <p className="font-medium text-sm text-zinc-900">{t('admin.settings.paypal')}</p>
                <p className="text-xs text-zinc-500">{t('admin.settings.paypalDesc')}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={form.paypalEnabled} onChange={e => setForm({ ...form, paypalEnabled: e.target.checked })} />
              <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-900"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Plan Info */}
      {tenant && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-100">
            <h3 className="font-semibold text-zinc-900 text-sm">{t('admin.settings.currentPlan')}</h3>
          </div>
          <div className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-zinc-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-zinc-600 text-xl">workspace_premium</span>
            </div>
            <div>
              <p className="font-semibold text-zinc-900 capitalize text-lg">{tenant.plan}</p>
              <p className="text-xs text-zinc-500">Slug: {tenant.slug} · ID: {tenant.id?.slice(0, 8)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
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
