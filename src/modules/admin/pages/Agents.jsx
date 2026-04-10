import { useState, useEffect } from 'react'
import agentsService from '../../public/services/agents.service'

const STATUS_CONFIG = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Activo' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Pendiente' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', label: 'Inactivo' },
}

export default function AdminAgents() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [viewAgent, setViewAgent] = useState(null)
  const [statusModal, setStatusModal] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchAgents = () => {
    setLoading(true)
    agentsService.findAll()
      .then(data => setAgents(Array.isArray(data) ? data : data?.items || []))
      .catch(err => console.error('Error fetching agents', err))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchAgents() }, [])

  const cities = [...new Set(agents.map(a => a.city).filter(Boolean))]

  const filtered = agents.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q || `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q)
    const matchStatus = !statusFilter || a.status === statusFilter
    const matchCity = !cityFilter || a.city === cityFilter
    return matchSearch && matchStatus && matchCity
  })

  const handleChangeStatus = async () => {
    if (!statusModal || !newStatus) return
    setSaving(true)
    try {
      await agentsService.updateStatus(statusModal.id, newStatus)
      fetchAgents()
      setStatusModal(null)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const activeCount = agents.filter(a => a.status === 'active').length
  const pendingCount = agents.filter(a => a.status === 'pending').length
  const totalRevenue = agents.reduce((s, a) => s + Number(a.totalRevenue || 0), 0)
  const avgRating = agents.length ? (agents.reduce((s, a) => s + Number(a.rating || 0), 0) / agents.length) : 0

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-headline tracking-tight">Gestión de Agentes</h2>
          <p className="text-sm text-gray-500 mt-1">Monitorea el rendimiento y las solicitudes de tus embajadores.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Activos', value: activeCount, icon: 'groups', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pendientes', value: pendingCount, icon: 'pending_actions', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Ventas Totales', value: `$${totalRevenue.toLocaleString()}`, icon: 'payments', color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Rating Promedio', value: avgRating.toFixed(1), icon: 'star', color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map((m, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${m.bg} ${m.color} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-[20px]">{m.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{m.label}</p>
              <p className="text-lg font-black text-gray-900 font-headline">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar agente..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${statusFilter === key ? `${cfg.bg} ${cfg.text} ring-1 ring-current` : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
                  {cfg.label}
                </button>
              ))}
              {cities.length > 0 && (
                <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-500 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none">
                  <option value="">Todas las ciudades</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-[3px] border-sky-200 border-t-sky-600 rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-4xl text-gray-300">person_off</span>
              <p className="text-sm text-gray-400 mt-2">No se encontraron agentes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-5 py-3">Agente</th>
                    <th className="px-5 py-3">Ubicación</th>
                    <th className="px-5 py-3">Rendimiento</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(a => {
                    const st = STATUS_CONFIG[a.status] || STATUS_CONFIG.active
                    const fullName = `${a.firstName || ''} ${a.lastName || ''}`.trim() || '—'
                    return (
                      <tr key={a.id} className={`hover:bg-gray-50/50 transition-colors group ${a.status === 'inactive' ? 'opacity-60' : ''}`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {a.avatarUrl ? (
                              <img src={a.avatarUrl} alt={fullName} className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-sky-50 flex items-center justify-center text-sky-700 font-bold text-sm">
                                {(a.firstName?.[0] || '') + (a.lastName?.[0] || '')}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-800">{fullName}</p>
                              <p className="text-xs text-gray-400 truncate">{a.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-500">{a.city || '—'}</td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800">{a.totalSales || 0} ventas</span>
                            {a.rating ? (
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-amber-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="text-xs font-bold text-gray-500">{Number(a.rating).toFixed(1)}</span>
                              </div>
                            ) : <span className="text-xs text-gray-300">Sin rating</span>}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${st.bg} ${st.text} text-[11px] font-bold rounded-full`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setViewAgent(a)} title="Ver perfil"
                              className="p-1.5 rounded-lg hover:bg-sky-50 text-gray-400 hover:text-sky-600 transition-colors">
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                            <button onClick={() => { setStatusModal(a); setNewStatus(a.status) }} title="Cambiar estado"
                              className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors">
                              <span className="material-symbols-outlined text-[18px]">sync</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-400">
              Mostrando <span className="font-bold text-gray-600">{filtered.length}</span> de <span className="font-bold text-gray-600">{agents.length}</span> agentes
            </span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending Applications */}
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-headline font-bold text-gray-800">Solicitudes Pendientes</h4>
              {pendingCount > 0 && (
                <span className="bg-secondary text-white text-[10px] font-black px-2 py-0.5 rounded-full">{pendingCount}</span>
              )}
            </div>
            <div className="space-y-3">
              {agents.filter(a => a.status === 'pending').map(req => (
                <div key={req.id} className="flex gap-3 p-3 rounded-xl bg-gray-50 hover:bg-amber-50/50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                    {(req.firstName?.[0] || '') + (req.lastName?.[0] || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{req.firstName} {req.lastName}</p>
                    <p className="text-[11px] text-gray-400">{req.city}</p>
                  </div>
                  <button onClick={() => { setStatusModal(req); setNewStatus('active') }}
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors" title="Aprobar">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  </button>
                </div>
              ))}
              {pendingCount === 0 && <p className="text-sm text-gray-400 text-center py-3">No hay solicitudes pendientes</p>}
            </div>
          </div>

          {/* Promo Card */}
          <div className="bg-linear-to-br from-slate-900 to-slate-800 p-6 rounded-xl text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <h4 className="font-headline font-bold text-base leading-tight mb-2">Potencia tus Agentes</h4>
              <p className="text-xs text-white/70 leading-relaxed mb-4">Descarga la nueva guía de capacitación para mejorar el promedio de ventas por agente.</p>
              <button className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-white/90 transition-colors">
                <span className="material-symbols-outlined text-[16px]">download</span> Descargar Manual
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-secondary rounded-full blur-2xl opacity-40"></div>
          </div>
        </div>
      </div>

      {/* View Agent Modal */}
      {viewAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 font-headline">Perfil del Agente</h3>
              <button onClick={() => setViewAgent(null)} className="p-1 hover:bg-gray-100 rounded-lg"><span className="material-symbols-outlined text-gray-400">close</span></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-700 font-bold text-lg">
                  {(viewAgent.firstName?.[0] || '') + (viewAgent.lastName?.[0] || '')}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-800">{viewAgent.firstName} {viewAgent.lastName}</p>
                  <p className="text-sm text-gray-400">{viewAgent.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-[11px] text-gray-400 font-semibold mb-0.5">Ciudad</p><p className="font-bold">{viewAgent.city}</p></div>
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-[11px] text-gray-400 font-semibold mb-0.5">Comisión</p><p className="font-bold">{viewAgent.commissionRate}%</p></div>
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-[11px] text-gray-400 font-semibold mb-0.5">Ventas</p><p className="font-bold">{viewAgent.totalSales}</p></div>
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-[11px] text-gray-400 font-semibold mb-0.5">Revenue</p><p className="font-bold text-emerald-600">${Number(viewAgent.totalRevenue || 0).toLocaleString()}</p></div>
              </div>
              {viewAgent.bio && <div className="p-3 bg-gray-50 rounded-lg"><p className="text-[11px] text-gray-400 font-semibold mb-1">Biografía</p><p className="text-sm text-gray-600">{viewAgent.bio}</p></div>}
              {viewAgent.specializationCategories?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {viewAgent.specializationCategories.map((cat, i) => (
                    <span key={i} className="px-2 py-1 bg-sky-50 text-sky-700 text-[11px] font-bold rounded-full">{cat}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 font-headline">Cambiar Estado</h3>
              <p className="text-sm text-gray-400 mt-0.5">{statusModal.firstName} {statusModal.lastName}</p>
            </div>
            <div className="p-5 space-y-2">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => setNewStatus(key)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold transition-all border ${newStatus === key ? `${cfg.bg} ${cfg.text} border-current` : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}>
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setStatusModal(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleChangeStatus} disabled={saving || newStatus === statusModal.status}
                className="px-4 py-2 text-sm font-bold bg-sky-600 text-white rounded-lg hover:bg-sky-500 disabled:opacity-40 transition-colors">
                {saving ? 'Guardando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
