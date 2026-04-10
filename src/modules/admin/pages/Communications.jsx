import { useState, useEffect } from 'react'
import campaignsService from '../services/campaigns.service'

export default function AdminCommunications() {
  const [campaigns, setCampaigns] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
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

  const channelIcons = { email: 'mail', whatsapp: 'chat', sms: 'sms', push: 'notifications' }
  const channelColors = { email: 'bg-sky-50 text-sky-600', whatsapp: 'bg-emerald-50 text-emerald-600', sms: 'bg-amber-50 text-amber-600', push: 'bg-violet-50 text-violet-600' }
  const STATUS_CONFIG = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Borrador' },
    scheduled: { bg: 'bg-sky-50', text: 'text-sky-700', label: 'Programada' },
    sending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Enviando' },
    sent: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Enviada' },
    paused: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Pausada' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelada' },
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-headline tracking-tight">Comunicaciones</h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona campañas de email, WhatsApp, SMS y push.</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition-all hover:scale-[1.02] active:scale-95 text-sm">
          <span className="material-symbols-outlined text-[18px]">campaign</span> Nueva Campaña
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Alcance Total', value: (stats?.totalReach || 0).toLocaleString(), icon: 'hub', color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Aperturas', value: (stats?.totalOpens || 0).toLocaleString(), icon: 'drafts', color: 'text-emerald-600', bg: 'bg-emerald-50', sub: `${stats?.avgOpenRate || 0}%` },
          { label: 'Clicks', value: (stats?.totalClicks || 0).toLocaleString(), icon: 'ads_click', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Campañas', value: campaigns.length, icon: 'campaign', color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map((m, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${m.bg} ${m.color} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-[20px]">{m.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{m.label}</p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-lg font-black text-gray-900 font-headline">{m.value}</p>
                {m.sub && <span className="text-xs font-bold text-emerald-600">{m.sub}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Campaigns List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 font-headline">Campañas Recientes</h3>

          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-[3px] border-sky-200 border-t-sky-600 rounded-full animate-spin" /></div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <span className="material-symbols-outlined text-4xl text-gray-300">campaign</span>
              <p className="text-sm text-gray-400 mt-2">No hay campañas creadas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((camp, i) => {
                const st = STATUS_CONFIG[camp.status] || STATUS_CONFIG.draft
                return (
                  <div key={camp.id || i} className="group bg-white p-4 rounded-xl border border-gray-200 transition-all hover:shadow-md flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${channelColors[camp.type] || 'bg-gray-100 text-gray-600'}`}>
                      <span className="material-symbols-outlined">{channelIcons[camp.type] || 'campaign'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                        <span className="text-[10px] text-gray-400">{new Date(camp.sentAt || camp.scheduledAt || camp.createdAt).toLocaleDateString('es-PE')}</span>
                      </div>
                      <h4 className="font-bold text-gray-800 truncate text-sm group-hover:text-sky-700 transition-colors">{camp.name}</h4>
                      <p className="text-xs text-gray-400 truncate">{(camp.recipientCount || 0).toLocaleString()} destinatarios · {camp.audienceType}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-sky-700">{(camp.openCount || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">aperturas</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Templates */}
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 font-headline mb-3">Plantillas Rápidas</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: 'loyalty', label: 'Oferta', color: 'text-sky-500', hover: 'hover:bg-sky-50' },
                { icon: 'waving_hand', label: 'Bienvenida', color: 'text-emerald-500', hover: 'hover:bg-emerald-50' },
                { icon: 'local_shipping', label: 'Envío', color: 'text-amber-500', hover: 'hover:bg-amber-50' },
                { icon: 'reviews', label: 'Reseña', color: 'text-violet-500', hover: 'hover:bg-violet-50' },
              ].map((t, i) => (
                <button key={i} className={`bg-gray-50 border border-gray-100 p-3 rounded-xl text-center ${t.hover} transition-colors`}>
                  <span className={`material-symbols-outlined text-2xl mb-1 ${t.color}`}>{t.icon}</span>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">{t.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Segmentation */}
          <div className="bg-sky-700 text-white p-5 rounded-xl shadow-lg overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-base font-bold font-headline mb-2">Segmentación</h3>
              <p className="text-white/70 text-xs mb-4">Apunta tu próxima campaña con precisión.</p>
              <div className="space-y-2">
                {[
                  { label: 'Clientes VIP', count: '2.4k' },
                  { label: 'Inactivos (30d+)', count: '1.1k' },
                  { label: 'Leads (Lima)', count: '432' },
                ].map((seg, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-medium py-2 border-b border-white/10 last:border-transparent">
                    <span>{seg.label}</span>
                    <span className="bg-white/10 text-white px-2 py-0.5 rounded text-[10px] font-bold">{seg.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
          </div>

          {/* Deliverability */}
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-emerald-500 text-[18px]">mail_lock</span>
              <h3 className="font-bold text-gray-800 text-sm">Deliverability</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }}></div>
              </div>
              <span className="font-black text-sky-700 text-sm">98%</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Reputación de dominio excelente.</p>
          </div>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 font-headline">Nueva Campaña</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-gray-100 rounded-lg"><span className="material-symbols-outlined text-gray-400">close</span></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Nombre de Campaña</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Black Friday 2024"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Canal</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none">
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                    <option value="push">Push</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Audiencia</label>
                  <select value={form.audienceType} onChange={e => setForm({ ...form, audienceType: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none">
                    <option value="all">Todos</option>
                    <option value="vip">VIP</option>
                    <option value="agents">Agentes</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Destinatarios Estimados</label>
                <input type="number" value={form.recipientCount} onChange={e => setForm({ ...form, recipientCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Mensaje</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3} placeholder="Escribe el contenido de la campaña..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none resize-none" />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={handleCreate} disabled={saving || !form.name}
                className="px-5 py-2 text-sm font-bold bg-sky-600 text-white rounded-lg hover:bg-sky-500 disabled:opacity-40 transition-colors">
                {saving ? 'Creando...' : 'Crear Campaña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
