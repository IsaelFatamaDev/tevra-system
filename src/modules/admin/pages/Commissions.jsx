// BUG-11 FIX: Admin Commissions Management Page
// Allows approving (pending → approved) and marking as paid (approved → paid)
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../core/contexts/ToastContext'
import dashboardService from '../services/dashboard.service'
import Pagination from '../../../core/components/Pagination'

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-blue-50 text-blue-700 border-blue-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}

const STATUS_LABELS = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  paid: 'Pagado',
  cancelled: 'Cancelado',
}

const ITEMS_PER_PAGE = 15

export default function AdminCommissions() {
  const { t } = useTranslation()
  const { addToast } = useToast()
  const [commissions, setCommissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [saving, setSaving] = useState({})

  const fetchData = useCallback(() => {
    setLoading(true)
    dashboardService.getAllCommissions({ status: statusFilter || undefined })
      .then(data => setCommissions(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching commissions', err))
      .finally(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => { setPage(1); fetchData() }, [fetchData])

  const total = commissions.length
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const paginated = commissions.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const totalPending = commissions.filter(c => c.status === 'pending').reduce((s, c) => s + Number(c.amount), 0)
  const totalApproved = commissions.filter(c => c.status === 'approved').reduce((s, c) => s + Number(c.amount), 0)
  const totalPaid = commissions.filter(c => c.status === 'paid').reduce((s, c) => s + Number(c.amount), 0)

  const handleApprove = async (id) => {
    setSaving(prev => ({ ...prev, [id]: 'approving' }))
    try {
      await dashboardService.approveCommission(id)
      addToast('Comisión aprobada')
      fetchData()
    } catch (err) {
      console.error(err)
      addToast('Error al aprobar comisión', 'error')
    }
    setSaving(prev => ({ ...prev, [id]: null }))
  }

  const handlePaid = async (id) => {
    if (!window.confirm('¿Marcar esta comisión como pagada? Esta acción no se puede deshacer.')) return
    setSaving(prev => ({ ...prev, [id]: 'paying' }))
    try {
      await dashboardService.markCommissionPaid(id)
      addToast('Comisión marcada como pagada')
      fetchData()
    } catch (err) {
      console.error(err)
      addToast('Error al marcar como pagado', 'error')
    }
    setSaving(prev => ({ ...prev, [id]: null }))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5 platform-enter">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[#134074]">Gestión de Comisiones</h2>
        <p className="text-sm text-[#134074] mt-0.5">Aprueba y registra pagos de comisiones a agentes</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pendientes', value: `$${totalPending.toFixed(2)}`, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', icon: 'pending_actions' },
          { label: 'Aprobadas', value: `$${totalApproved.toFixed(2)}`, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', icon: 'verified' },
          { label: 'Pagadas', value: `$${totalPaid.toFixed(2)}`, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', icon: 'payments' },
        ].map((m, i) => (
          <div key={i} className={`${m.bg} border rounded-xl p-4 flex items-center gap-3`}>
            <span className={`material-symbols-outlined text-2xl ${m.color}`}>{m.icon}</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#13315C] mb-0.5">{m.label}</p>
              <p className={`text-xl font-extrabold ${m.color}`}>{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#C5D8E8]/20 p-4 flex gap-2 flex-wrap">
        {['', 'pending', 'approved', 'paid'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === s ? 'bg-[#134074] text-[#EEF4ED]' : 'bg-[#EEF4ED]/50 text-[#134074] hover:bg-[#EEF4ED] border border-[#C5D8E8]/20'}`}>
            {s === '' ? 'Todos' : STATUS_LABELS[s] || s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#C5D8E8]/20 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#C5D8E8]/20 border-t-[#8DA9C4] rounded-full animate-spin" /></div>
        ) : commissions.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-3xl text-[#13315C]">payments</span>
            <p className="text-sm text-[#134074] mt-2">No hay comisiones que mostrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#EEF4ED]/30 text-[11px] font-bold text-[#134074] uppercase tracking-wider border-b border-[#C5D8E8]/10">
                <tr>
                  <th className="px-5 py-3">Agente</th>
                  <th className="px-5 py-3">Pedido</th>
                  <th className="px-5 py-3">Comisión</th>
                  <th className="px-5 py-3">Tasa</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5D8E8]/10">
                {paginated.map(c => (
                  <tr key={c.id} className="hover:bg-[#EEF4ED]/20 transition-colors">
                    <td className="px-5 py-3 font-medium text-[#134074]">
                      {c.agentId ? c.agentId.slice(0, 8) : '—'}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-[#13315C]">
                      {c.orderId ? c.orderId.slice(0, 8) : '—'}
                    </td>
                    <td className="px-5 py-3 font-extrabold text-emerald-700 text-base">
                      ${Number(c.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-[#134074]">{c.rate || 12}%</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${STATUS_COLORS[c.status] || 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#13315C]">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        {c.status === 'pending' && (
                          <button onClick={() => handleApprove(c.id)} disabled={!!saving[c.id]}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1">
                            {saving[c.id] === 'approving'
                              ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              : <span className="material-symbols-outlined text-[14px]">verified</span>}
                            Aprobar
                          </button>
                        )}
                        {c.status === 'approved' && (
                          <button onClick={() => handlePaid(c.id)} disabled={!!saving[c.id]}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1">
                            {saving[c.id] === 'paying'
                              ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              : <span className="material-symbols-outlined text-[14px]">payments</span>}
                            Marcar pagado
                          </button>
                        )}
                        {(c.status === 'paid' || c.status === 'cancelled') && (
                          <span className="text-xs text-[#13315C]">{c.status === 'paid' ? `Pagado ${c.paidAt ? new Date(c.paidAt).toLocaleDateString('es-PE') : ''}` : 'Cancelado'}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-[#C5D8E8]/10 flex justify-between items-center">
          <span className="text-xs text-[#134074]">Total: <strong>{total}</strong> comisiones</span>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
        </div>
      </div>
    </div>
  )
}
