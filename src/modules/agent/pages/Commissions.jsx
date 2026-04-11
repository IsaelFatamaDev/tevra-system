import { useState, useEffect } from 'react'
import dashboardService from '../../admin/services/dashboard.service'

export default function AgentCommissions() {
  const [commissions, setCommissions] = useState([])
  const [summary, setSummary] = useState({ totalEarned: 0, totalPaid: 0, totalPending: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-gray-900">Mis Comisiones</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen y detalle de tus ganancias</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Ganado', value: `$${Number(summary.totalEarned || 0).toLocaleString()}`, icon: 'account_balance_wallet', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Pagado', value: `$${Number(summary.totalPaid || 0).toLocaleString()}`, icon: 'check_circle', color: 'text-blue-600 bg-blue-50' },
          { label: 'Pendiente', value: `$${Number(summary.totalPending || 0).toLocaleString()}`, icon: 'pending', color: 'text-amber-600 bg-amber-50' },
          { label: 'Total Movimientos', value: summary.count || commissions.length, icon: 'receipt', color: 'text-gray-600 bg-gray-100' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
              <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
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
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f.value ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 block mb-3">account_balance_wallet</span>
          <h3 className="font-headline text-lg font-bold text-gray-900 mb-1">Sin comisiones</h3>
          <p className="text-sm text-gray-500">Aún no tienes comisiones registradas</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium">Fecha</th>
                  <th className="text-left px-3 py-3 font-medium">Pedido</th>
                  <th className="text-right px-3 py-3 font-medium">Monto</th>
                  <th className="text-right px-3 py-3 font-medium">Tasa</th>
                  <th className="text-center px-3 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id || i} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-gray-500 text-xs">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-PE') : '—'}</td>
                    <td className="px-3 py-3 font-mono text-xs text-gray-900">{c.orderId?.slice(0, 8) || '—'}</td>
                    <td className="px-3 py-3 text-right font-bold text-gray-900">${parseFloat(c.amount || 0).toLocaleString()}</td>
                    <td className="px-3 py-3 text-right text-gray-500">{c.rate ? `${c.rate}%` : '—'}</td>
                    <td className="text-center px-3 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                          c.status === 'approved' ? 'bg-blue-50 text-blue-700' :
                            c.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                              'bg-amber-50 text-amber-700'
                        }`}>
                        {c.status === 'paid' ? 'Pagada' : c.status === 'approved' ? 'Aprobada' : c.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
