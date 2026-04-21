import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import agentsService from '../../public/services/agents.service'
import Pagination from '../../../core/components/Pagination'
import { useToast } from '../../../core/contexts/ToastContext'

const ITEMS_PER_PAGE = 10

export default function AdminAgents() {
  const { t } = useTranslation()

  const STATUS_CONFIG = {
    active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: t('admin.agents.statusActive') },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: t('admin.agents.statusPending') },
    inactive: { bg: 'bg-[#EBF2FA]', text: 'text-[#468189]', dot: 'bg-[#9DBEBB]', label: t('admin.agents.statusInactive') },
  }

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
  const [reviewApp, setReviewApp] = useState(null)
  const [rejectStep, setRejectStep] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')
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
    const timer = setTimeout(fetchAgents, search ? 350 : 0)
    fetchApplications()
    return () => clearTimeout(timer)
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
      addToast(t('admin.agents.statusUpdated'))
    } catch (err) {
      console.error(err)
      addToast(t('admin.agents.statusUpdateError'), 'error')
    }
    finally { setSaving(false) }
  }

  const handleApproveApp = async (app) => {
    setSaving(true)
    try {
      await agentsService.approveApplication(app.id)
      fetchApplications()
      fetchAgents()
      setReviewApp(null)
      addToast(t('admin.agents.applicationApproved'))
    } catch (err) {
      console.error(err)
      addToast(t('admin.agents.approveError'), 'error')
    }
    finally { setSaving(false) }
  }

  const handleRejectApp = async () => {
    if (!reviewApp || !rejectNotes.trim()) return
    setSaving(true)
    try {
      await agentsService.rejectApplication(reviewApp.id, rejectNotes.trim())
      fetchApplications()
      setReviewApp(null)
      setRejectStep(false)
      setRejectNotes('')
      addToast('Solicitud rechazada')
    } catch (err) {
      console.error(err)
      addToast('Error al rechazar la solicitud', 'error')
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
          <h2 className="text-xl font-semibold text-[#031926]">{t('admin.agents.title')}</h2>
          <p className="text-sm text-[#468189] mt-0.5">{t('admin.agents.subtitle')}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('admin.agents.active'), value: activeCount, icon: 'groups' },
          { label: t('admin.agents.pending'), value: pendingCount, icon: 'pending_actions' },
          { label: t('admin.agents.totalSales'), value: `$${totalRevenue.toLocaleString()}`, icon: 'payments' },
          { label: t('admin.agents.avgRating'), value: avgRating.toFixed(1), icon: 'star' },
        ].map((m, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-[#9DBEBB]/20 flex items-center gap-3 stat-card">
            <div className="w-9 h-9 rounded-lg bg-[#EBF2FA] text-[#468189] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
            </div>
            <div>
              <p className="text-xs text-[#468189]">{m.label}</p>
              <p className="text-lg font-semibold text-[#031926]">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Main Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#9DBEBB]/20 overflow-hidden">
          <div className="p-4 border-b border-[#9DBEBB]/10 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9DBEBB] text-[18px]">search</span>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('admin.agents.searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === key ? 'bg-[#031926] text-[#EBF2FA]' : 'bg-[#EBF2FA]/30 text-[#468189] hover:bg-[#EBF2FA] border border-[#9DBEBB]/20'}`}>
                  {cfg.label}
                </button>
              ))}
              {cities.length > 0 && (
                <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
                  className="px-3 py-1.5 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-xs font-medium text-[#468189] focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none">
                  <option value="">{t('admin.agents.allCities')}</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-[#9DBEBB]/20 border-t-[#468189] rounded-full animate-spin" /></div>
          ) : agents.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-3xl text-[#9DBEBB]">person_off</span>
              <p className="text-sm text-[#468189] mt-2">{t('admin.agents.noAgentsFound')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-150">
                <thead>
                  <tr className="bg-[#EBF2FA]/30 text-[11px] font-medium text-[#468189] uppercase tracking-wider border-b border-[#9DBEBB]/10">
                    <th className="px-5 py-3">{t('admin.table.agent')}</th>
                    <th className="px-5 py-3">{t('admin.table.location')}</th>
                    <th className="px-5 py-3">{t('admin.table.performance')}</th>
                    <th className="px-5 py-3">{t('admin.table.status')}</th>
                    <th className="px-5 py-3 text-right">{t('admin.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#9DBEBB]/10">
                  {paginated.map(a => {
                    const st = STATUS_CONFIG[a.status] || STATUS_CONFIG.active
                    const fullName = `${a.firstName || ''} ${a.lastName || ''}`.trim() || '—'
                    return (
                      <tr key={a.id} className={`hover:bg-[#EBF2FA]/30 transition-colors group ${a.status === 'inactive' ? 'opacity-60' : ''}`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {a.avatarUrl ? (
                              <img src={a.avatarUrl} alt={fullName} className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#EBF2FA] flex items-center justify-center text-[#468189] font-medium text-sm">
                                {(a.firstName?.[0] || '') + (a.lastName?.[0] || '')}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#031926]">{fullName}</p>
                              <p className="text-xs text-[#468189] truncate">{a.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-[#468189]">{a.city || '—'}</td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#031926]">{a.totalSales || 0} {t('admin.agents.salesCount')}</span>
                            {a.rating ? (
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-amber-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="text-xs text-[#468189]">{Number(a.rating).toFixed(1)}</span>
                              </div>
                            ) : <span className="text-xs text-[#9DBEBB]">{t('admin.agents.noRating')}</span>}
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
                            <button onClick={() => setViewAgent(a)} title={t('admin.agents.agentProfile')}
                              className="p-1.5 rounded-md hover:bg-[#EBF2FA] text-[#9DBEBB] hover:text-[#031926] transition-colors">
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                            <button onClick={() => { setStatusModal(a); setNewStatus(a.status) }} title={t('admin.agents.changeStatus')}
                              className="p-1.5 rounded-md hover:bg-[#EBF2FA] text-[#9DBEBB] hover:text-amber-600 transition-colors">
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
          <div className="px-5 py-3 border-t border-[#9DBEBB]/10 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs text-[#468189]">
              {t('admin.pagination.showing')} <span className="font-medium">{Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}-{Math.min(page * ITEMS_PER_PAGE, total)}</span> {t('admin.pagination.of')} <span className="font-medium">{total}</span> {t('admin.pagination.agents')}
            </span>
            <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Pending Applications */}
          <div className="bg-white p-4 rounded-xl border border-[#9DBEBB]/20">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold text-[#031926]">{t('admin.agents.pendingApplications')}</h4>
              {pendingCount > 0 && (
                <span className="bg-[#031926] text-[#EBF2FA] text-[10px] font-medium px-2 py-0.5 rounded-full">{pendingCount}</span>
              )}
            </div>
            <div className="space-y-2">
              {pendingApps.map(req => (
                <div key={req.id} className="flex gap-3 p-2.5 rounded-lg bg-[#EBF2FA]/30 hover:bg-[#EBF2FA] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#9DBEBB]/20 flex items-center justify-center text-[#468189] font-medium text-xs shrink-0">
                    {(req.fullName?.split(' ')[0]?.[0] || '') + (req.fullName?.split(' ')[1]?.[0] || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#031926] truncate">{req.fullName}</p>
                    <p className="text-[11px] text-[#468189]">{req.city}</p>
                  </div>
                  <button onClick={() => { setReviewApp(req); setRejectStep(false); setRejectNotes('') }}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#031926] text-[#F4E9CD] rounded-lg hover:bg-[#468189] transition-colors whitespace-nowrap shrink-0">
                    Ver
                  </button>
                </div>
              ))}
              {pendingCount === 0 && <p className="text-sm text-[#468189] text-center py-3">{t('admin.agents.noPendingApplications')}</p>}
            </div>
          </div>

        </div>
      </div>

      {/* Review Application Modal */}
      {reviewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#031926]/40 backdrop-blur-sm" onClick={() => { setReviewApp(null); setRejectStep(false); setRejectNotes('') }} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col relative z-10">

            {/* Header */}
            <div className="px-6 py-4 border-b border-[#9DBEBB]/10 flex justify-between items-center rounded-t-2xl bg-[#EBF2FA]/30">
              <div>
                <h3 className="text-base font-semibold text-[#031926]">
                  {rejectStep ? 'Motivo de rechazo' : 'Solicitud de agente'}
                </h3>
                <p className="text-xs text-[#468189] mt-0.5">{reviewApp.fullName}</p>
              </div>
              <button onClick={() => { setReviewApp(null); setRejectStep(false); setRejectNotes('') }}
                className="p-2 hover:bg-[#EBF2FA] rounded-full transition-colors text-[#9DBEBB]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {!rejectStep ? (
                <>
                  {/* Personal info grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#EBF2FA]/40 rounded-xl border border-[#9DBEBB]/10">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9DBEBB] mb-0.5">Nombre completo</p>
                      <p className="text-sm font-semibold text-[#031926]">{reviewApp.fullName}</p>
                    </div>
                    <div className="p-3 bg-[#EBF2FA]/40 rounded-xl border border-[#9DBEBB]/10">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9DBEBB] mb-0.5">DNI / Documento</p>
                      <p className="text-sm font-semibold text-[#031926]">{reviewApp.dni || '—'}</p>
                    </div>
                    <div className="p-3 bg-[#EBF2FA]/40 rounded-xl border border-[#9DBEBB]/10">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9DBEBB] mb-0.5">Correo</p>
                      <p className="text-sm text-[#031926] break-all">{reviewApp.email}</p>
                    </div>
                    <div className="p-3 bg-[#EBF2FA]/40 rounded-xl border border-[#9DBEBB]/10">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9DBEBB] mb-0.5">WhatsApp</p>
                      <p className="text-sm text-[#031926]">{reviewApp.whatsapp || '—'}</p>
                    </div>
                    <div className="p-3 bg-[#EBF2FA]/40 rounded-xl border border-[#9DBEBB]/10">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9DBEBB] mb-0.5">Ciudad</p>
                      <p className="text-sm font-semibold text-[#031926]">{reviewApp.city || '—'}</p>
                    </div>
                    <div className="p-3 bg-[#EBF2FA]/40 rounded-xl border border-[#9DBEBB]/10">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9DBEBB] mb-0.5">Fecha de solicitud</p>
                      <p className="text-sm text-[#031926]">
                        {reviewApp.createdAt ? new Date(reviewApp.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Motivation */}
                  {reviewApp.motivation && (
                    <div className="p-3 bg-[#EBF2FA]/40 rounded-xl border border-[#9DBEBB]/10">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9DBEBB] mb-1.5">Motivación</p>
                      <p className="text-sm text-[#031926] leading-relaxed">{reviewApp.motivation}</p>
                    </div>
                  )}

                  {/* Categories */}
                  {reviewApp.categories?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9DBEBB] mb-2">Categorías de interés</p>
                      <div className="flex flex-wrap gap-1.5">
                        {reviewApp.categories.map((cat, i) => (
                          <span key={i} className="px-2.5 py-1 bg-[#031926] text-[#F4E9CD] text-xs font-medium rounded-lg">{cat}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Coverage areas */}
                  {reviewApp.coverageAreas?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9DBEBB] mb-2">Zonas de cobertura</p>
                      <div className="flex flex-wrap gap-1.5">
                        {reviewApp.coverageAreas.map((area, i) => (
                          <span key={i} className="px-2.5 py-1 bg-[#EBF2FA] text-[#468189] text-xs font-medium rounded-lg border border-[#9DBEBB]/20">{area}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Reject step */
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="material-symbols-outlined text-red-500 text-[20px] shrink-0 mt-0.5">warning</span>
                    <p className="text-sm text-red-700 leading-relaxed">
                      Al rechazar esta solicitud, <strong>{reviewApp.fullName}</strong> recibirá un correo con el motivo indicado.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#468189] mb-1.5">
                      Motivo del rechazo <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectNotes}
                      onChange={e => setRejectNotes(e.target.value)}
                      rows={4}
                      placeholder="Explica detalladamente por qué se rechaza esta solicitud. El agente recibirá este mensaje en su correo."
                      className="w-full px-3 py-2.5 bg-[#EBF2FA]/30 border border-[#9DBEBB]/30 rounded-xl text-sm text-[#031926] placeholder-[#9DBEBB] focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none resize-none transition-all"
                    />
                    <p className="text-[11px] text-[#9DBEBB] mt-1">{rejectNotes.length} caracteres</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#9DBEBB]/10 flex justify-between items-center gap-3 rounded-b-2xl bg-[#EBF2FA]/20">
              {!rejectStep ? (
                <>
                  <button onClick={() => setRejectStep(true)}
                    className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    Rechazar
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => { setReviewApp(null); setRejectStep(false) }}
                      className="px-4 py-2 text-sm text-[#468189] bg-white border border-[#9DBEBB]/20 rounded-xl hover:bg-[#EBF2FA]/30 transition-colors">
                      Cerrar
                    </button>
                    <button onClick={() => handleApproveApp(reviewApp)} disabled={saving}
                      className="px-5 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                      {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[16px]">check_circle</span>}
                      Aprobar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => setRejectStep(false)}
                    className="px-4 py-2 text-sm text-[#468189] bg-white border border-[#9DBEBB]/20 rounded-xl hover:bg-[#EBF2FA]/30 transition-colors flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Volver
                  </button>
                  <button onClick={handleRejectApp} disabled={saving || !rejectNotes.trim()}
                    className="px-5 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[16px]">cancel</span>}
                    Confirmar rechazo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Agent Modal */}
      {viewAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#031926]/40 backdrop-blur-sm transition-opacity" onClick={() => setViewAgent(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl lg:max-w-2xl max-h-[85vh] flex flex-col relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-[#9DBEBB]/10 flex justify-between items-center bg-[#EBF2FA]/30/50 rounded-t-2xl">
              <h3 className="text-lg font-semibold text-[#031926]">{t('admin.agents.agentProfile')}</h3>
              <button onClick={() => setViewAgent(null)} className="p-2 hover:bg-[#EBF2FA] rounded-full transition-colors -mr-2 text-[#9DBEBB]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex items-center gap-4">
                {viewAgent.avatarUrl ? (
                  <img src={viewAgent.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover shadow-sm ring-1 ring-[#9DBEBB]/30" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-tevra-coral/10 text-tevra-coral flex items-center justify-center font-bold text-xl shadow-sm ring-1 ring-tevra-coral/20">
                    {(viewAgent.firstName?.[0] || '') + (viewAgent.lastName?.[0] || '')}
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-bold text-[#031926] leading-tight">{viewAgent.firstName} {viewAgent.lastName}</h4>
                  <p className="text-sm font-medium text-[#468189] mb-1">{viewAgent.email}</p>
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
                <div className="p-3 bg-[#EBF2FA]/30 rounded-xl border border-[#9DBEBB]/10"><p className="text-[11px] uppercase tracking-wider font-bold text-[#468189] mb-0.5">{t('admin.agents.totalSales')}</p><p className="font-bold text-[#031926] text-lg">{viewAgent.totalSales || 0}</p></div>
                <div className="p-3 bg-[#EBF2FA]/30 rounded-xl border border-[#9DBEBB]/10"><p className="text-[11px] uppercase tracking-wider font-bold text-[#468189] mb-0.5">{t('admin.agents.revenueRev')}</p><p className="font-bold text-emerald-600 text-lg">${Number(viewAgent.totalRevenue || 0).toLocaleString()}</p></div>
                <div className="p-3 bg-[#EBF2FA]/30 rounded-xl border border-[#9DBEBB]/10"><p className="text-[11px] uppercase tracking-wider font-bold text-[#468189] mb-0.5">{t('admin.agents.city')}</p><p className="font-semibold text-[#031926]">{viewAgent.city || '—'}</p></div>
                <div className="p-3 bg-[#EBF2FA]/30 rounded-xl border border-[#9DBEBB]/10"><p className="text-[11px] uppercase tracking-wider font-bold text-[#468189] mb-0.5">{t('admin.agents.agreedCommission')}</p><p className="font-semibold text-[#031926]">{viewAgent.commissionRate || 0}%</p></div>
                {viewAgent.referralCode && <div className="p-3 bg-[#EBF2FA]/30 rounded-xl border border-[#9DBEBB]/10"><p className="text-[11px] uppercase tracking-wider font-bold text-[#468189] mb-0.5">{t('admin.agents.referralCode')}</p><p className="font-mono font-bold text-sm text-[#031926]">{viewAgent.referralCode}</p></div>}
                {viewAgent.createdAt && <div className="p-3 bg-[#EBF2FA]/30 rounded-xl border border-[#9DBEBB]/10"><p className="text-[11px] uppercase tracking-wider font-bold text-[#468189] mb-0.5">{t('admin.agents.memberSince')}</p><p className="font-semibold text-sm text-[#031926]">{new Date(viewAgent.createdAt).toLocaleDateString('es-PE')}</p></div>}
              </div>

              {viewAgent.zones?.length > 0 && (
                <div className="p-4 bg-[#EBF2FA]/30 border border-[#9DBEBB]/10 rounded-xl">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-[#468189] mb-2">{t('admin.agents.coverageZones')}</p>
                  <div className="flex flex-wrap gap-1.5">{viewAgent.zones.map((z, i) => <span key={i} className="px-2.5 py-1 bg-white text-[#031926] text-xs font-semibold rounded-lg shadow-sm border border-[#9DBEBB]/20">{z}</span>)}</div>
                </div>
              )}
              {viewAgent.bio && <div className="p-4 bg-[#EBF2FA]/30 border border-[#9DBEBB]/10 rounded-xl"><p className="text-[11px] uppercase tracking-wider font-bold text-[#468189] mb-1.5">{t('admin.agents.bio')}</p><p className="text-sm text-[#031926] leading-relaxed">{viewAgent.bio}</p></div>}
              {viewAgent.specializationCategories?.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-[#468189] mb-2">{t('admin.agents.specialties')}</p>
                  <div className="flex flex-wrap gap-2">
                    {viewAgent.specializationCategories.map((cat, i) => (
                      <span key={i} className="px-3 py-1 bg-[#031926] text-[#EBF2FA] text-xs font-medium rounded-lg shadow-sm">{cat}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-[#9DBEBB]/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-b-2xl">
              <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center sm:justify-start">
                {viewAgent.phone && (
                  <a href={`https://wa.me/${viewAgent.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                    className="px-4 py-2 bg-[#25D366]/10 text-[#075E54] hover:bg-[#25D366]/20 font-bold text-sm rounded-xl transition-colors flex items-center gap-1.5 flex-1 sm:flex-none justify-center">
                    <span className="material-symbols-outlined text-[16px]">chat</span> {t('admin.agents.whatsapp')}
                  </a>
                )}
                <button onClick={() => { setViewAgent(null); setStatusModal(viewAgent); setNewStatus(viewAgent.status) }}
                  className="px-4 py-2 bg-[#EBF2FA] text-[#031926] font-bold text-sm rounded-xl hover:bg-[#9DBEBB]/20 transition-colors flex items-center gap-1.5 shadow-sm flex-1 sm:flex-none justify-center">
                  <span className="material-symbols-outlined text-[16px]">shield_person</span> {t('admin.agents.changeStatus')}
                </button>
              </div>
              <button onClick={() => setViewAgent(null)} className="w-full sm:w-auto px-6 py-2 font-semibold text-[#468189] bg-white hover:bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-xl transition-colors shadow-sm text-sm">{t('admin.agents.closeProfile')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#031926]/40 backdrop-blur-sm transition-opacity" onClick={() => setStatusModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-[#9DBEBB]/10 flex justify-between items-start bg-[#EBF2FA]/30/50 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-semibold text-[#031926]">{t('admin.agents.updateStatus')}</h3>
                <p className="text-sm font-medium text-[#468189] mt-0.5">{statusModal.firstName} {statusModal.lastName}</p>
              </div>
              <button onClick={() => setStatusModal(null)} className="p-2 hover:bg-[#EBF2FA] rounded-full transition-colors -mr-3 text-[#9DBEBB]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-2.5">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button key={key} onClick={() => setNewStatus(key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${newStatus === key ? 'bg-[#031926] text-[#EBF2FA] border-[#031926] shadow-md ring-1 ring-[#031926] ring-offset-1' : 'bg-white border-[#9DBEBB]/20 text-[#031926] hover:border-[#9DBEBB]/40 hover:bg-[#EBF2FA]/30'}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${newStatus === key ? 'bg-white' : cfg.dot} ring-2 ${newStatus === key ? 'ring-white/30' : 'ring-transparent'}`} />
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#9DBEBB]/10 flex justify-end gap-3 bg-[#EBF2FA]/30/50 rounded-b-2xl">
              <button onClick={() => setStatusModal(null)} className="px-4 py-2 bg-white border border-[#9DBEBB]/20 text-sm font-medium text-[#468189] hover:bg-[#EBF2FA]/30 hover:text-[#031926] rounded-xl transition-colors shadow-sm">{t('common.cancel')}</button>
              <button onClick={handleChangeStatus} disabled={saving || newStatus === statusModal.status}
                className="px-6 py-2 text-sm font-semibold bg-tevra-coral text-[#EBF2FA] rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none flex items-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? t('common.saving') : t('admin.agents.confirmStatus')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
