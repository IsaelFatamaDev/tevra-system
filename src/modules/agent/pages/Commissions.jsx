import { useState, useEffect } from 'react'
import dashboardService from '../../admin/services/dashboard.service'
import Pagination from '../../../core/components/Pagination'

const ITEMS_PER_PAGE = 10

export default function AgentCommissions() {
  const [commissions, setCommissions] = useState([])
  const [summary, setSummary] = useState({ totalEarned: 0, totalPaid: 0, totalPending: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [viewCommission, setViewCommission] = useState(null)

  useEffect(() => {
    dashboardService.getMyCommissions()
      .then(data => {
        const cData = data?.data || data
        setCommissions(cData?.commissions || (Array.isArray(cData) ? cData : []))
        if (cData?.summary) setSummary(cData.summary)
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? commissions : commissions.filter(c => c.status === filter)

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="space-y-6 platform-enter">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-background">Mis Comisiones</h1>
        <p className="text-sm text-text-muted mt-1">Resumen y detalle de tus ganancias</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Ganado', value: `$${Number(summary.totalEarned || 0).toLocaleString()}`, icon: 'account_balance_wallet', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Pagado', value: `$${Number(summary.totalPaid || 0).toLocaleString()}`, icon: 'check_circle', color: 'text-blue-600 bg-blue-50' },
          { label: 'Pendiente', value: `$${Number(summary.totalPending || 0).toLocaleString()}`, icon: 'pending', color: 'text-amber-600 bg-amber-50' },
          { label: 'Movimientos', value: summary.count || commissions.length, icon: 'receipt', color: 'text-primary bg-primary/10' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-outline-variant/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] stat-card">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
            </div>
            <p className="text-xl font-bold text-on-background">{s.value}</p>
            <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'Todas' },
          { value: 'pending', label: 'Pendientes' },
          { value: 'approved', label: 'Aprobadas' },
          { value: 'paid', label: 'Pagadas' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f.value ? 'bg-primary text-white' : 'bg-white text-text-muted hover:bg-surface-container-high border border-outline-variant'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline-variant block mb-3">account_balance_wallet</span>
          <h3 className="font-headline text-lg font-bold text-on-background mb-1">Sin comisiones</h3>
          <p className="text-sm text-text-muted">Aún no tienes comisiones registradas</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs bg-surface-container-low">
                  <th className="text-left px-5 py-3 font-medium">Fecha</th>
                  <th className="text-left px-3 py-3 font-medium">Pedido</th>
                  <th className="text-right px-3 py-3 font-medium">Monto</th>
                  <th className="text-right px-3 py-3 font-medium">Tasa</th>
                  <th className="text-center px-3 py-3 font-medium">Estado</th>
                  <th className="text-center px-3 py-3 font-medium">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((c, i) => (
                  <tr key={c.id || i} className="border-t border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors cursor-pointer" onClick={() => setViewCommission(c)}>
                    <td className="px-5 py-3 text-text-muted text-xs">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-PE') : '—'}</td>
                    <td className="px-3 py-3 font-mono text-xs text-on-background">{c.orderId?.slice(0, 8) || '—'}</td>
                    <td className="px-3 py-3 text-right font-bold text-on-background">${parseFloat(c.amount || 0).toLocaleString()}</td>
                    <td className="px-3 py-3 text-right text-text-muted">{c.rate ? `${c.rate}%` : '—'}</td>
                    <td className="text-center px-3 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                        c.status === 'approved' ? 'bg-blue-50 text-blue-700' :
                          c.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                            'bg-amber-50 text-amber-700'
                        }`}>
                        {c.status === 'paid' ? 'Pagada' : c.status === 'approved' ? 'Aprobada' : c.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button onClick={(e) => { e.stopPropagation(); setViewCommission(c) }} className="p-1 rounded-lg hover:bg-surface-container-high text-text-muted hover:text-on-background transition-colors">
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
        </div>
      )}

      {/* Commission Detail Modal */}
      {viewCommission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-sm">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-on-background font-headline">Detalle de Comisión</h3>
              <button onClick={() => setViewCommission(null)} className="p-1 hover:bg-gray-100 rounded-lg"><span className="material-symbols-outlined text-text-muted">close</span></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${viewCommission.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : viewCommission.status === 'approved' ? 'bg-blue-50 text-blue-700' : viewCommission.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                  {viewCommission.status === 'paid' ? 'Pagada' : viewCommission.status === 'approved' ? 'Aprobada' : viewCommission.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                </span>
                <span className="text-xs text-text-muted">{viewCommission.createdAt ? new Date(viewCommission.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</span>
              </div>
              <div className="text-center py-3">
                <p className="text-3xl font-black text-on-background">${parseFloat(viewCommission.amount || 0).toLocaleString()}</p>
                <p className="text-sm text-text-muted mt-1">Comisión ganada</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-outline-variant/30">
                  <span className="text-text-muted">Pedido</span>
                  <span className="font-mono font-bold text-on-background">{viewCommission.orderId?.slice(0, 8) || '—'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-outline-variant/30">
                  <span className="text-text-muted">Tasa de comisión</span>
                  <span className="font-bold text-on-background">{viewCommission.rate ? `${viewCommission.rate}%` : '—'}</span>
                </div>
                {viewCommission.orderTotal && (
                  <div className="flex justify-between py-2 border-b border-outline-variant/30">
                    <span className="text-text-muted">Total del pedido</span>
                    <span className="font-bold text-on-background">${parseFloat(viewCommission.orderTotal).toLocaleString()}</span>
                  </div>
                )}
                {viewCommission.paidAt && (
                  <div className="flex justify-between py-2 border-b border-outline-variant/30">
                    <span className="text-text-muted">Fecha de pago</span>
                    <span className="font-bold text-on-background">{new Date(viewCommission.paidAt).toLocaleDateString('es-PE')}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setViewCommission(null)} className="px-4 py-2 text-sm font-medium text-text-muted hover:bg-gray-50 rounded-lg transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
