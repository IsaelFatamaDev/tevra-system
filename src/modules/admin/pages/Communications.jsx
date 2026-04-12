import { useState, useEffect } from 'react'
import campaignsService from '../services/campaigns.service'
import Pagination from '../../../core/components/Pagination'

const ITEMS_PER_PAGE = 8

export default function AdminCommunications() {
  const [campaigns, setCampaigns] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'email', message: '', audienceType: 'all', recipientCount: 100 })

  const fetchData = () => {
    setLoading(true)
    Promise.all([campaignsService.findAll(), campaignsService.getStats()])
      .then(([campData, statsData]) => {
        setCampaigns(Array.isArray(campData) ? campData : campData?.campaigns || [])
        setStats(statsData)
      })
      .catch(err => console.error('Error fetching campaigns', err))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [])

  const handleCreate = async () => {
    setSaving(true)
    try {
      await campaignsService.create(form)
      setShowCreate(false)
      setForm({ name: '', type: 'email', message: '', audienceType: 'all', recipientCount: 100 })
      fetchData()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const TEMPLATES = {
    Oferta: { name: 'Oferta Especial', type: 'email', message: '🎉 ¡Aprovecha nuestra oferta exclusiva! Descuentos de hasta 50% en productos seleccionados. ¡Solo por tiempo limitado!', audienceType: 'all', recipientCount: 500 },
    Bienvenida: { name: 'Bienvenida Nuevo Cliente', type: 'email', message: '👋 ¡Bienvenido a TeVra! Estamos encantados de tenerte. Explora nuestro catálogo y encuentra los mejores productos con la asesoría de nuestros agentes.', audienceType: 'all', recipientCount: 100 },
    Envío: { name: 'Actualización de Envío', type: 'whatsapp', message: '📦 Tu pedido ha sido enviado y está en camino. Puedes rastrear tu paquete con el número de seguimiento adjunto. ¡Gracias por tu compra!', audienceType: 'all', recipientCount: 200 },
    Reseña: { name: 'Solicitar Reseña', type: 'email', message: '⭐ ¿Qué te pareció tu compra? Tu opinión nos ayuda a mejorar. Déjanos una reseña y participa en nuestros sorteos mensuales.', audienceType: 'all', recipientCount: 300 },
  }

  const applyTemplate = (label) => {
    const tpl = TEMPLATES[label]
    if (tpl) {
      setForm(tpl)
      setShowCreate(true)
    }
  }

  const totalPages = Math.ceil(campaigns.length / ITEMS_PER_PAGE)
  const paginatedCampaigns = campaigns.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const channelIcons = { email: 'mail', whatsapp: 'chat', sms: 'sms', push: 'notifications' }
  const channelColors = { email: 'bg-zinc-100 text-zinc-600', whatsapp: 'bg-zinc-100 text-zinc-600', sms: 'bg-zinc-100 text-zinc-600', push: 'bg-zinc-100 text-zinc-600' }
  const STATUS_CONFIG = {
    draft: { bg: 'bg-zinc-100', text: 'text-zinc-500', label: 'Borrador' },
    scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Programada' },
    sending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Enviando' },
    sent: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Enviada' },
    paused: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Pausada' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelada' },
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5 platform-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Comunicaciones</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Gestiona campañas de email, WhatsApp, SMS y push.</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors text-sm">
          <span className="material-symbols-outlined text-[16px]">campaign</span> Nueva Campaña
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Alcance Total', value: (stats?.totalReach || 0).toLocaleString(), icon: 'hub' },
          { label: 'Aperturas', value: (stats?.totalOpens || 0).toLocaleString(), icon: 'drafts', sub: `${stats?.avgOpenRate || 0}%` },
          { label: 'Clicks', value: (stats?.totalClicks || 0).toLocaleString(), icon: 'ads_click' },
          { label: 'Campañas', value: campaigns.length, icon: 'campaign' },
        ].map((m, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center gap-3 stat-card">
            <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
            </div>
            <div>
              <p className="text-xs text-zinc-500">{m.label}</p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-lg font-semibold text-zinc-900">{m.value}</p>
                {m.sub && <span className="text-xs font-medium text-emerald-600">{m.sub}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Campaigns List */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900">Campañas Recientes</h3>

          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" /></div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
              <span className="material-symbols-outlined text-3xl text-zinc-300">campaign</span>
              <p className="text-sm text-zinc-500 mt-2">No hay campañas creadas</p>
            </div>
          ) : (
            <div className="space-y-2">
              {paginatedCampaigns.map((camp, i) => {
                const st = STATUS_CONFIG[camp.status] || STATUS_CONFIG.draft
                return (
                  <div key={camp.id || i} className="group bg-white p-3.5 rounded-xl border border-zinc-200 transition-all hover:border-zinc-300 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${channelColors[camp.type] || 'bg-zinc-100 text-zinc-500'}`}>
                      <span className="material-symbols-outlined text-[18px]">{channelIcons[camp.type] || 'campaign'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${st.bg} ${st.text}`}>{st.label}</span>
                        <span className="text-[10px] text-zinc-400">{new Date(camp.sentAt || camp.scheduledAt || camp.createdAt).toLocaleDateString('es-PE')}</span>
                      </div>
                      <h4 className="font-medium text-zinc-900 truncate text-sm">{camp.name}</h4>
                      <p className="text-xs text-zinc-500 truncate">{(camp.recipientCount || 0).toLocaleString()} destinatarios · {camp.audienceType}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-zinc-900">{(camp.openCount || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-zinc-500">aperturas</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Quick Templates */}
          <div className="bg-white p-4 rounded-xl border border-zinc-200">
            <h3 className="text-sm font-semibold text-zinc-900 mb-3">Plantillas Rápidas</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: 'loyalty', label: 'Oferta' },
                { icon: 'waving_hand', label: 'Bienvenida' },
                { icon: 'local_shipping', label: 'Envío' },
                { icon: 'reviews', label: 'Reseña' },
              ].map((t, i) => (
                <button key={i} onClick={() => applyTemplate(t.label)} className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-center hover:bg-zinc-100 transition-colors">
                  <span className="material-symbols-outlined text-xl mb-1 text-zinc-600">{t.icon}</span>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase">{t.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Segmentation */}
          <div className="bg-zinc-900 text-white p-4 rounded-xl overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-sm font-semibold mb-1.5">Segmentación</h3>
              <p className="text-white/60 text-xs mb-3">Apunta tu próxima campaña con precisión.</p>
              <div className="space-y-2">
                {[
                  { label: 'Clientes VIP', count: '2.4k' },
                  { label: 'Inactivos (30d+)', count: '1.1k' },
                  { label: 'Leads (Lima)', count: '432' },
                ].map((seg, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-medium py-2 border-b border-white/10 last:border-transparent">
                    <span>{seg.label}</span>
                    <span className="bg-white/10 text-white px-2 py-0.5 rounded text-[10px] font-medium">{seg.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Deliverability */}
          <div className="bg-white p-4 rounded-xl border border-zinc-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-emerald-500 text-[18px]">mail_lock</span>
              <h3 className="font-semibold text-zinc-900 text-sm">Deliverability</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }}></div>
              </div>
              <span className="font-semibold text-zinc-900 text-sm">98%</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">Reputación de dominio excelente.</p>
          </div>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-base font-semibold text-zinc-900">Nueva Campaña</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-zinc-100 rounded-md"><span className="material-symbols-outlined text-zinc-400 text-[18px]">close</span></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Nombre de Campaña</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Black Friday 2024"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Canal</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none">
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                    <option value="push">Push</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Audiencia</label>
                  <select value={form.audienceType} onChange={e => setForm({ ...form, audienceType: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none">
                    <option value="all">Todos</option>
                    <option value="vip">VIP</option>
                    <option value="agents">Agentes</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Destinatarios Estimados</label>
                <input type="number" value={form.recipientCount} onChange={e => setForm({ ...form, recipientCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Mensaje</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3} placeholder="Escribe el contenido de la campaña..."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none resize-none" />
              </div>
            </div>
            <div className="p-4 border-t border-zinc-100 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleCreate} disabled={saving || !form.name}
                className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-40 transition-colors">
                {saving ? 'Creando...' : 'Crear Campaña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
