import { useState, useEffect, useRef } from 'react'
import api from '../../../core/services/api'

export default function AdminSettings() {
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
        <div className="w-8 h-8 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 platform-enter">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-on-background font-headline tracking-tight">Configuración</h2>
        <p className="text-sm text-text-muted mt-1">Ajustes generales de la plataforma.</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          Configuración guardada correctamente.
        </div>
      )}

      {/* Logo / Branding */}
      <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/30">
          <h3 className="font-bold text-on-background font-headline">Logo de la Marca</h3>
          <p className="text-xs text-text-muted mt-0.5">Se mostrará en el panel administrativo y documentos.</p>
        </div>
        <div className="p-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-xl bg-surface-container-low border border-outline-variant flex items-center justify-center overflow-hidden shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <span className="material-symbols-outlined text-text-muted text-3xl">image</span>
            )}
          </div>
          <div className="space-y-2">
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <div className="flex gap-2">
              <button type="button" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-1.5">
                {uploadingLogo ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Subiendo...</>
                ) : (
                  <><span className="material-symbols-outlined text-[16px]">upload</span> {logoUrl ? 'Cambiar Logo' : 'Subir Logo'}</>
                )}
              </button>
              {logoUrl && (
                <button type="button" onClick={handleRemoveLogo}
                  className="px-4 py-2 bg-secondary/10 text-secondary text-xs font-bold rounded-lg hover:bg-secondary/20 transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">delete</span> Eliminar
                </button>
              )}
            </div>
            <p className="text-xs text-text-muted">PNG, JPG o SVG (máx. 2 MB)</p>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/30">
          <h3 className="font-bold text-on-background font-headline">Datos de la Empresa</h3>
          <p className="text-xs text-text-muted mt-0.5">Información visible para los clientes.</p>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-text-muted mb-1.5">Nombre Comercial</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">Correo de Soporte</label>
            <input type="email" value={form.supportEmail} onChange={e => setForm({ ...form, supportEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">Teléfono de Soporte</label>
            <input type="tel" value={form.supportPhone} onChange={e => setForm({ ...form, supportPhone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">WhatsApp</label>
            <input type="tel" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">Moneda Principal</label>
            <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
              <option value="USD">USD - Dólar</option>
              <option value="PEN">PEN - Sol</option>
              <option value="MXN">MXN - Peso MX</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fiscal & Shipping */}
      <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/30">
          <h3 className="font-bold text-on-background font-headline">Datos Fiscales y Envío</h3>
          <p className="text-xs text-text-muted mt-0.5">Información utilizada en boletas, facturas y cálculos de envío.</p>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">RUC / Tax ID</label>
            <input type="text" value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="20600000000" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">Tasa de Envío Base (USD)</label>
            <input type="number" step="0.01" value={form.baseShippingRate} onChange={e => setForm({ ...form, baseShippingRate: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="5.00" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-text-muted mb-1.5">Dirección Fiscal</label>
            <input type="text" value={form.fiscalAddress} onChange={e => setForm({ ...form, fiscalAddress: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Av. Principal 123, Lima, Perú" />
          </div>
        </div>
      </div>

      {/* Social & Messaging */}
      <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/30">
          <h3 className="font-bold text-on-background font-headline">Redes Sociales y Comunicación</h3>
          <p className="text-xs text-text-muted mt-0.5">Links públicos y mensajes automatizados.</p>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">Instagram</label>
            <input type="url" value={form.instagramUrl} onChange={e => setForm({ ...form, instagramUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="https://instagram.com/tevra" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">Facebook</label>
            <input type="url" value={form.facebookUrl} onChange={e => setForm({ ...form, facebookUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="https://facebook.com/tevra" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">TikTok</label>
            <input type="url" value={form.tiktokUrl} onChange={e => setForm({ ...form, tiktokUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="https://tiktok.com/@tevra" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">Zona Horaria</label>
            <select value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
              <option value="America/Lima">America/Lima (UTC-5)</option>
              <option value="America/Bogota">America/Bogota (UTC-5)</option>
              <option value="America/Mexico_City">America/Mexico_City (UTC-6)</option>
              <option value="America/Santiago">America/Santiago (UTC-3)</option>
              <option value="America/Buenos_Aires">America/Buenos_Aires (UTC-3)</option>
              <option value="America/New_York">America/New_York (UTC-5)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-text-muted mb-1.5">Mensaje de Bienvenida para Agentes</label>
            <textarea value={form.welcomeMessage} onChange={e => setForm({ ...form, welcomeMessage: e.target.value })} rows={3}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" placeholder="¡Bienvenido al equipo de agentes de TeVra! Estamos emocionados de tenerte..." />
          </div>
        </div>
      </div>

      {/* Agent Limits */}
      <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/30">
          <h3 className="font-bold text-on-background font-headline">Configuración de Agentes</h3>
          <p className="text-xs text-text-muted mt-0.5">Límites y reglas para la red de agentes.</p>
        </div>
        <div className="p-6">
          <div className="max-w-xs">
            <label className="block text-xs font-bold text-text-muted mb-1.5">Máximo de Zonas por Agente</label>
            <input type="number" value={form.maxAgentZones} onChange={e => setForm({ ...form, maxAgentZones: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="3" />
          </div>
        </div>
      </div>

      {/* Commissions & Payments */}
      <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/30">
          <h3 className="font-bold text-on-background font-headline">Pagos y Comisiones</h3>
          <p className="text-xs text-text-muted mt-0.5">Configuración de transacciones y ganancias.</p>
        </div>
        <div className="p-6 space-y-5">
          <div className="max-w-xs">
            <label className="block text-xs font-bold text-text-muted mb-1.5">Comisión TeVra (%)</label>
            <input type="number" value={form.commissionPct} onChange={e => setForm({ ...form, commissionPct: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="15" />
          </div>
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">credit_card</span>
              </div>
              <div>
                <p className="font-bold text-sm text-on-background">Stripe</p>
                <p className="text-xs text-text-muted">Procesamiento de pagos con tarjeta.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={form.stripeEnabled} onChange={e => setForm({ ...form, stripeEnabled: e.target.checked })} />
              <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[18px]">account_balance_wallet</span>
              </div>
              <div>
                <p className="font-bold text-sm text-on-background">PayPal</p>
                <p className="text-xs text-text-muted">Pagos con cuenta PayPal.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={form.paypalEnabled} onChange={e => setForm({ ...form, paypalEnabled: e.target.checked })} />
              <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Plan Info */}
      {tenant && (
        <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/30">
            <h3 className="font-bold text-on-background font-headline">Plan Actual</h3>
          </div>
          <div className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">workspace_premium</span>
            </div>
            <div>
              <p className="font-bold text-on-background capitalize text-lg">{tenant.plan}</p>
              <p className="text-xs text-text-muted">Slug: {tenant.slug} · ID: {tenant.id?.slice(0, 8)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="bg-primary hover:bg-primary disabled:opacity-50 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 text-sm">
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
          ) : (
            <><span className="material-symbols-outlined text-[18px]">save</span> Guardar Cambios</>
          )}
        </button>
      </div>
    </div>
  )
}
