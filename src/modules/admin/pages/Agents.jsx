import { useState, useEffect, useCallback } from 'react'
import agentsService from '../../public/services/agents.service'
import Pagination from '../../../core/components/Pagination'
import { useToast } from '../../../core/contexts/ToastContext'

const ITEMS_PER_PAGE = 10

const STATUS_CONFIG = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Activo' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Pendiente' },
  inactive: { bg: 'bg-zinc-100', text: 'text-zinc-500', dot: 'bg-zinc-400', label: 'Inactivo' },
}

export default function AdminAgents() {
  const [agents, setAgents] = useState([])
  const [pendingApps, setPendingApps] = useState([])
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
  const { addToast } = useToast()

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

  const fetchApplications = useCallback(() => {
    agentsService.findAllApplications('pending')
      .then(data => {
        setPendingApps(Array.isArray(data) ? data : data?.items || [])
      })
      .catch(err => console.error('Error fetching applications', err))
  }, [])

  useEffect(() => {
    agentsService.getCities().then(data => setCities(Array.isArray(data) ? data : [])).catch(() => { })
  }, [])

  useEffect(() => {
    setPage(1)
    const t = setTimeout(fetchAgents, search ? 350 : 0)
    fetchApplications()
    return () => clearTimeout(t)
  }, [search, statusFilter, cityFilter, fetchAgents, fetchApplications])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const paginated = agents.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleChangeStatus = async () => {
    if (!statusModal || !newStatus || newStatus === statusModal.status) return
    setSaving(true)
    try {
      await agentsService.updateStatus(statusModal.id, newStatus)
      fetchAgents()
      setStatusModal(null)
      addToast('Estado del agente actualizado exitosamente')
    } catch (err) { 
      console.error(err)
      addToast('Error al actualizar estado', 'error')
    }
    finally { setSaving(false) }
  }

  const handleApproveApp = async (id) => {
    setSaving(true)
    try {
      await agentsService.approveApplication(id)
      fetchApplications()
      fetchAgents()
      addToast('Solicitud aprobada exitosamente')
    } catch (err) { 
      console.error(err)
      addToast('Error al aprobar solicitud', 'error')
    }
    finally { setSaving(false) }
  }

  const activeCount = agents.filter(a => a.status === 'active').length
  const pendingCount = pendingApps.length
  const totalRevenue = agents.reduce((s, a) => s + Number(a.totalRevenue || 0), 0)
  const avgRating = agents.length ? (agents.reduce((s, a) => s + Number(a.rating || 0), 0) / agents.length) : 0

  return (
    <div className="max-w-7xl mx-auto space-y-5 platform-enter">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Gestión de Agentes</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Monitorea el rendimiento y las solicitudes de tus embajadores.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Activos', value: activeCount, icon: 'groups' },
          { label: 'Pendientes', value: pendingCount, icon: 'pending_actions' },
          { label: 'Ventas Totales', value: `$${totalRevenue.toLocaleString()}`, icon: 'payments' },
          { label: 'Rating Promedio', value: avgRating.toFixed(1), icon: 'star' },
        ].map((m, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center gap-3 stat-card">
            <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
            </div>
            <div>
              <p className="text-xs text-zinc-500">{m.label}</p>
              <p className="text-lg font-semibold text-zinc-900">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Main Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">search</span>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar agente..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === key ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200'}`}>
                  {cfg.label}
                </button>
              ))}
              {cities.length > 0 && (
                <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
                  className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-600 focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none">
                  <option value="">Todas las ciudades</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" /></div>
          ) : agents.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-3xl text-zinc-300">person_off</span>
              <p className="text-sm text-zinc-500 mt-2">No se encontraron agentes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-zinc-50 text-[11px] font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-100">
                    <th className="px-5 py-3">Agente</th>
                    <th className="px-5 py-3">Ubicación</th>
                    <th className="px-5 py-3">Rendimiento</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {paginated.map(a => {
                    const st = STATUS_CONFIG[a.status] || STATUS_CONFIG.active
                    const fullName = `${a.firstName || ''} ${a.lastName || ''}`.trim() || '—'
                    return (
                      <tr key={a.id} className={`hover:bg-zinc-50 transition-colors group ${a.status === 'inactive' ? 'opacity-60' : ''}`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {a.avatarUrl ? (
                              <img src={a.avatarUrl} alt={fullName} className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-medium text-sm">
                                {(a.firstName?.[0] || '') + (a.lastName?.[0] || '')}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-zinc-900">{fullName}</p>
                              <p className="text-xs text-zinc-500 truncate">{a.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-zinc-500">{a.city || '—'}</td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-zinc-900">{a.totalSales || 0} ventas</span>
                            {a.rating ? (
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-amber-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="text-xs text-zinc-500">{Number(a.rating).toFixed(1)}</span>
                              </div>
                            ) : <span className="text-xs text-zinc-400">Sin rating</span>}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 ${st.bg} ${st.text} text-[11px] font-medium rounded-md`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setViewAgent(a)} title="Ver perfil"
                              className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors">
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                            <button onClick={() => { setStatusModal(a); setNewStatus(a.status) }} title="Cambiar estado"
                              className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-amber-600 transition-colors">
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
          <div className="px-5 py-3 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs text-zinc-500">
              Mostrando <span className="font-medium">{Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}-{Math.min(page * ITEMS_PER_PAGE, total)}</span> de <span className="font-medium">{total}</span> agentes
            </span>
            <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Pending Applications */}
          <div className="bg-white p-4 rounded-xl border border-zinc-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold text-zinc-900">Solicitudes Pendientes</h4>
              {pendingCount > 0 && (
                <span className="bg-zinc-900 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">{pendingCount}</span>
              )}
            </div>
            <div className="space-y-2">
              {pendingApps.map(req => (
                <div key={req.id} className="flex gap-3 p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-medium text-xs shrink-0">
                    {(req.fullName?.split(' ')[0]?.[0] || '') + (req.fullName?.split(' ')[1]?.[0] || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{req.fullName}</p>
                    <p className="text-[11px] text-zinc-500">{req.city}</p>
                  </div>
                  <button onClick={() => handleApproveApp(req.id)} disabled={saving}
                    className="p-1.5 rounded-md hover:bg-emerald-50 text-zinc-400 hover:text-emerald-600 transition-colors disabled:opacity-50" title="Aprobar">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  </button>
                </div>
              ))}
              {pendingCount === 0 && <p className="text-sm text-zinc-500 text-center py-3">No hay solicitudes pendientes</p>}
            </div>
          </div>

          {/* Promo Card */}
          <div className="bg-zinc-900 p-5 rounded-xl text-white">
            <h4 className="font-semibold text-sm leading-tight mb-1.5">Potencia tus Agentes</h4>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">Descarga la nueva guía de capacitación para mejorar el promedio de ventas por agente.</p>
            <button className="bg-white text-zinc-900 px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-zinc-100 transition-colors">
              <span className="material-symbols-outlined text-[14px]">download</span> Descargar Manual
            </button>
          </div>
        </div>
      </div>

      {/* View Agent Modal */}
      {viewAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity" onClick={() => setViewAgent(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl lg:max-w-2xl max-h-[85vh] flex flex-col relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50 rounded-t-2xl">
              <h3 className="text-lg font-semibold text-zinc-900">Perfil del Agente</h3>
              <button onClick={() => setViewAgent(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors -mr-2 text-zinc-400">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex items-center gap-4">
                {viewAgent.avatarUrl ? (
                  <img src={viewAgent.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover shadow-sm ring-1 ring-zinc-200" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-tevra-coral/10 text-tevra-coral flex items-center justify-center font-bold text-xl shadow-sm ring-1 ring-tevra-coral/20">
                    {(viewAgent.firstName?.[0] || '') + (viewAgent.lastName?.[0] || '')}
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-bold text-zinc-900 leading-tight">{viewAgent.firstName} {viewAgent.lastName}</h4>
                  <p className="text-sm font-medium text-zinc-500 mb-1">{viewAgent.email}</p>
                  {/* Status badge */}
                  {(() => {
                    const st = STATUS_CONFIG[viewAgent.status] || STATUS_CONFIG.active; return (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 ${st.bg} ${st.text} text-[11px] font-bold uppercase tracking-wider rounded-full`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                      </span>
                    )
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100"><p className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 mb-0.5">Ventas Totales</p><p className="font-bold text-zinc-900 text-lg">{viewAgent.totalSales || 0}</p></div>
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100"><p className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 mb-0.5">Ingresos (Rev)</p><p className="font-bold text-emerald-600 text-lg">${Number(viewAgent.totalRevenue || 0).toLocaleString()}</p></div>
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100"><p className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 mb-0.5">Ciudad</p><p className="font-semibold text-zinc-800">{viewAgent.city || '—'}</p></div>
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100"><p className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 mb-0.5">Comisión Pactada</p><p className="font-semibold text-zinc-800">{viewAgent.commissionRate || 0}%</p></div>
                {viewAgent.referralCode && <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100"><p className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 mb-0.5">Cód. Referido</p><p className="font-mono font-bold text-sm text-zinc-900">{viewAgent.referralCode}</p></div>}
                {viewAgent.createdAt && <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100"><p className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 mb-0.5">Miembro Desde</p><p className="font-semibold text-sm text-zinc-900">{new Date(viewAgent.createdAt).toLocaleDateString('es-PE')}</p></div>}
              </div>

              {viewAgent.zones?.length > 0 && (
                <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 mb-2">Zonas de Cobertura</p>
                  <div className="flex flex-wrap gap-1.5">{viewAgent.zones.map((z, i) => <span key={i} className="px-2.5 py-1 bg-white text-zinc-700 text-xs font-semibold rounded-lg shadow-sm border border-zinc-200">{z}</span>)}</div>
                </div>
              )}
              {viewAgent.bio && <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl"><p className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 mb-1.5">Biografía / Perfil</p><p className="text-sm text-zinc-700 leading-relaxed">{viewAgent.bio}</p></div>}
              {viewAgent.specializationCategories?.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 mb-2">Especialidades</p>
                  <div className="flex flex-wrap gap-2">
                    {viewAgent.specializationCategories.map((cat, i) => (
                      <span key={i} className="px-3 py-1 bg-zinc-900 text-white text-xs font-medium rounded-lg shadow-sm">{cat}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-b-2xl">
              <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center sm:justify-start">
                {viewAgent.phone && (
                  <a href={`https://wa.me/${viewAgent.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                    className="px-4 py-2 bg-[#25D366]/10 text-[#075E54] hover:bg-[#25D366]/20 font-bold text-sm rounded-xl transition-colors flex items-center gap-1.5 flex-1 sm:flex-none justify-center">
                    <span className="material-symbols-outlined text-[16px]">chat</span> WhatsApp
                  </a>
                )}
                <button onClick={() => { setViewAgent(null); setStatusModal(viewAgent); setNewStatus(viewAgent.status) }}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 font-bold text-sm rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-1.5 shadow-sm flex-1 sm:flex-none justify-center">
                  <span className="material-symbols-outlined text-[16px]">shield_person</span> Modificar Estado
                </button>
              </div>
              <button onClick={() => setViewAgent(null)} className="w-full sm:w-auto px-6 py-2 font-semibold text-zinc-600 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl transition-colors shadow-sm text-sm">Cerrar Perfil</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity" onClick={() => setStatusModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-start bg-zinc-50/50 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">Actualizar Estado</h3>
                <p className="text-sm font-medium text-zinc-500 mt-0.5">{statusModal.firstName} {statusModal.lastName}</p>
              </div>
              <button onClick={() => setStatusModal(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors -mr-3 text-zinc-400">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 gap-2.5">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button key={key} onClick={() => setNewStatus(key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${newStatus === key ? 'bg-zinc-900 text-white border-zinc-900 shadow-md ring-1 ring-zinc-900 ring-offset-1' : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${newStatus === key ? 'bg-white' : cfg.dot} ring-2 ${newStatus === key ? 'ring-white/30' : 'ring-transparent'}`} />
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50/50 rounded-b-2xl">
              <button onClick={() => setStatusModal(null)} className="px-4 py-2 bg-white border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-colors shadow-sm">Cancelar</button>
              <button onClick={handleChangeStatus} disabled={saving || newStatus === statusModal.status}
                className="px-6 py-2 text-sm font-semibold bg-tevra-coral text-white rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none flex items-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? 'Guardando...' : 'Confirmar Estado'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
