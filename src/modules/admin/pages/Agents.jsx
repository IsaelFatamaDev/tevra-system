import { useState, useEffect, useCallback } from 'react'
import agentsService from '../../public/services/agents.service'
import Pagination from '../../../core/components/Pagination'

const ITEMS_PER_PAGE = 10

const STATUS_CONFIG = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Activo' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Pendiente' },
  inactive: { bg: 'bg-surface-container-high', text: 'text-text-muted', dot: 'bg-outline', label: 'Inactivo' },
}

export default function AdminAgents() {
  const [agents, setAgents] = useState([])
  const [total, setTotal] = useState(0)
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [page, setPage] = useState(1)
  const [viewAgent, setViewAgent] = useState(null)
  const [statusModal, setStatusModal] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchAgents = useCallback(() => {
    setLoading(true)
    agentsService.findAll({ search: search || undefined, status: statusFilter || undefined, city: cityFilter || undefined })
      .then(data => {
        const list = Array.isArray(data) ? data : data?.items || []
        setAgents(list)
        setTotal(list.length)
      })
      .catch(err => console.error('Error fetching agents', err))
      .finally(() => setLoading(false))
  }, [search, statusFilter, cityFilter])

  useEffect(() => {
    agentsService.getCities().then(data => setCities(Array.isArray(data) ? data : [])).catch(() => {})
  }, [])

  useEffect(() => {
    setPage(1)
    const t = setTimeout(fetchAgents, search ? 350 : 0)
    return () => clearTimeout(t)
  }, [search, statusFilter, cityFilter])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const paginated = agents.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

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
    <div className="max-w-7xl mx-auto space-y-6 platform-enter">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-on-background font-headline tracking-tight">Gestión de Agentes</h2>
          <p className="text-sm text-text-muted mt-1">Monitorea el rendimiento y las solicitudes de tus embajadores.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Activos', value: activeCount, icon: 'groups', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pendientes', value: pendingCount, icon: 'pending_actions', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Ventas Totales', value: `$${totalRevenue.toLocaleString()}`, icon: 'payments', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Rating Promedio', value: avgRating.toFixed(1), icon: 'star', color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map((m, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-outline-variant/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-4 stat-card">
            <div className={`w-11 h-11 rounded-xl ${m.bg} ${m.color} flex items-center justify-center flex-shrink-0`}>
              <span className="material-symbols-outlined text-[22px]">{m.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{m.label}</p>
              <p className="text-xl font-black text-on-background font-headline">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-4 border-b border-outline-variant/10 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">search</span>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar agente..."
                className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${statusFilter === key ? `${cfg.bg} ${cfg.text} ring-1 ring-current` : 'bg-surface-container-low text-text-muted hover:bg-surface-container-high border border-outline-variant'}`}>
                  {cfg.label}
                </button>
              ))}
              {cities.length > 0 && (
                <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
                  className="px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-[11px] font-bold text-text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option value="">Todas las ciudades</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" /></div>
          ) : agents.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-4xl text-outline-variant">person_off</span>
              <p className="text-sm text-text-muted mt-2">No se encontraron agentes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-[#f8fafc] text-[11px] font-bold text-text-muted uppercase tracking-wider border-b border-outline-variant/10">
                    <th className="px-5 py-3">Agente</th>
                    <th className="px-5 py-3">Ubicación</th>
                    <th className="px-5 py-3">Rendimiento</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/8">
                  {paginated.map(a => {
                    const st = STATUS_CONFIG[a.status] || STATUS_CONFIG.active
                    const fullName = `${a.firstName || ''} ${a.lastName || ''}`.trim() || '—'
                    return (
                      <tr key={a.id} className={`hover:bg-surface-container-low/50 transition-colors group ${a.status === 'inactive' ? 'opacity-60' : ''}`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {a.avatarUrl ? (
                              <img src={a.avatarUrl} alt={fullName} className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                {(a.firstName?.[0] || '') + (a.lastName?.[0] || '')}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-on-background">{fullName}</p>
                              <p className="text-xs text-text-muted truncate">{a.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-text-muted">{a.city || '—'}</td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-on-background">{a.totalSales || 0} ventas</span>
                            {a.rating ? (
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-amber-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="text-xs font-bold text-text-muted">{Number(a.rating).toFixed(1)}</span>
                              </div>
                            ) : <span className="text-xs text-outline-variant">Sin rating</span>}
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
                              className="p-1.5 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-colors">
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                            <button onClick={() => { setStatusModal(a); setNewStatus(a.status) }} title="Cambiar estado"
                              className="p-1.5 rounded-lg hover:bg-amber-50 text-text-muted hover:text-amber-600 transition-colors">
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
          <div className="px-5 py-3 border-t border-outline-variant/30 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs text-text-muted">
              Mostrando <span className="font-bold text-text-muted">{Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}-{Math.min(page * ITEMS_PER_PAGE, total)}</span> de <span className="font-bold text-text-muted">{total}</span> agentes
            </span>
            <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending Applications */}
          <div className="bg-white p-5 rounded-xl border border-outline-variant">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-headline font-bold text-on-background">Solicitudes Pendientes</h4>
              {pendingCount > 0 && (
                <span className="bg-secondary text-white text-[10px] font-black px-2 py-0.5 rounded-full">{pendingCount}</span>
              )}
            </div>
            <div className="space-y-3">
              {agents.filter(a => a.status === 'pending').map(req => (
                <div key={req.id} className="flex gap-3 p-3 rounded-xl bg-surface-container-low hover:bg-amber-50/50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                    {(req.firstName?.[0] || '') + (req.lastName?.[0] || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-background truncate">{req.firstName} {req.lastName}</p>
                    <p className="text-[11px] text-text-muted">{req.city}</p>
                  </div>
                  <button onClick={() => { setStatusModal(req); setNewStatus('active') }}
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-text-muted hover:text-emerald-600 transition-colors" title="Aprobar">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  </button>
                </div>
              ))}
              {pendingCount === 0 && <p className="text-sm text-text-muted text-center py-3">No hay solicitudes pendientes</p>}
            </div>
          </div>

          {/* Promo Card */}
          <div className="bg-linear-to-br from-primary to-primary-dark p-6 rounded-xl text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <h4 className="font-headline font-bold text-base leading-tight mb-2">Potencia tus Agentes</h4>
              <p className="text-xs text-white/70 leading-relaxed mb-4">Descarga la nueva guía de capacitación para mejorar el promedio de ventas por agente.</p>
              <button className="bg-white text-primary px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-white/90 transition-colors">
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
            <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="text-lg font-bold text-on-background font-headline">Perfil del Agente</h3>
              <button onClick={() => setViewAgent(null)} className="p-1 hover:bg-surface-container-high rounded-lg"><span className="material-symbols-outlined text-text-muted">close</span></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                {viewAgent.avatarUrl ? (
                  <img src={viewAgent.avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {(viewAgent.firstName?.[0] || '') + (viewAgent.lastName?.[0] || '')}
                  </div>
                )}
                <div>
                  <p className="text-base font-bold text-on-background">{viewAgent.firstName} {viewAgent.lastName}</p>
                  <p className="text-sm text-text-muted">{viewAgent.email}</p>
                  {viewAgent.phone && <p className="text-xs text-text-muted">{viewAgent.phone}</p>}
                </div>
              </div>

              {/* Status badge */}
              {(() => {
                const st = STATUS_CONFIG[viewAgent.status] || STATUS_CONFIG.active; return (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${st.bg} ${st.text} text-[11px] font-bold rounded-full`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                  </span>
                )
              })()}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-surface-container-low rounded-lg"><p className="text-[11px] text-text-muted font-semibold mb-0.5">Ciudad</p><p className="font-bold">{viewAgent.city || '—'}</p></div>
                <div className="p-3 bg-surface-container-low rounded-lg"><p className="text-[11px] text-text-muted font-semibold mb-0.5">Comisión</p><p className="font-bold">{viewAgent.commissionRate || 0}%</p></div>
                <div className="p-3 bg-surface-container-low rounded-lg"><p className="text-[11px] text-text-muted font-semibold mb-0.5">Ventas</p><p className="font-bold">{viewAgent.totalSales || 0}</p></div>
                <div className="p-3 bg-surface-container-low rounded-lg"><p className="text-[11px] text-text-muted font-semibold mb-0.5">Revenue</p><p className="font-bold text-emerald-600">${Number(viewAgent.totalRevenue || 0).toLocaleString()}</p></div>
                {viewAgent.referralCode && <div className="p-3 bg-surface-container-low rounded-lg"><p className="text-[11px] text-text-muted font-semibold mb-0.5">Código Referido</p><p className="font-bold font-mono text-xs">{viewAgent.referralCode}</p></div>}
                {viewAgent.createdAt && <div className="p-3 bg-surface-container-low rounded-lg"><p className="text-[11px] text-text-muted font-semibold mb-0.5">Registro</p><p className="font-bold text-xs">{new Date(viewAgent.createdAt).toLocaleDateString('es-PE')}</p></div>}
              </div>

              {viewAgent.zones?.length > 0 && (
                <div className="p-3 bg-surface-container-low rounded-lg">
                  <p className="text-[11px] text-text-muted font-semibold mb-1">Zonas</p>
                  <div className="flex flex-wrap gap-1">{viewAgent.zones.map((z, i) => <span key={i} className="px-2 py-0.5 bg-white text-on-background text-[11px] font-medium rounded border border-outline-variant">{z}</span>)}</div>
                </div>
              )}
              {viewAgent.bio && <div className="p-3 bg-surface-container-low rounded-lg"><p className="text-[11px] text-text-muted font-semibold mb-1">Biografía</p><p className="text-sm text-text-muted">{viewAgent.bio}</p></div>}
              {viewAgent.specializationCategories?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {viewAgent.specializationCategories.map((cat, i) => (
                    <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-full">{cat}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-outline-variant/30 flex justify-between items-center">
              <div className="flex gap-2">
                {viewAgent.phone && (
                  <a href={`https://wa.me/${viewAgent.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">chat</span> WhatsApp
                  </a>
                )}
                <button onClick={() => { setViewAgent(null); setStatusModal(viewAgent); setNewStatus(viewAgent.status) }}
                  className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">sync</span> Estado
                </button>
              </div>
              <button onClick={() => setViewAgent(null)} className="px-4 py-1.5 text-sm font-medium text-text-muted hover:bg-surface-container-high rounded-lg transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-outline-variant/30">
              <h3 className="text-lg font-bold text-on-background font-headline">Cambiar Estado</h3>
              <p className="text-sm text-text-muted mt-0.5">{statusModal.firstName} {statusModal.lastName}</p>
            </div>
            <div className="p-5 space-y-2">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => setNewStatus(key)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold transition-all border ${newStatus === key ? `${cfg.bg} ${cfg.text} border-current` : 'border-outline-variant/30 text-text-muted hover:bg-surface-container-low'}`}>
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-outline-variant/30 flex justify-end gap-2">
              <button onClick={() => setStatusModal(null)} className="px-4 py-2 text-sm font-medium text-text-muted hover:bg-surface-container-high rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleChangeStatus} disabled={saving || newStatus === statusModal.status}
                className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary disabled:opacity-40 transition-colors">
                {saving ? 'Guardando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
