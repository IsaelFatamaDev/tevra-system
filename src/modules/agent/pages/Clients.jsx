import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import dashboardService from '../../admin/services/dashboard.service'

export default function AgentClients() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService.getAgentOrders()
      .then(data => {
        const list = data?.items || data?.data || (Array.isArray(data) ? data : [])
        setOrders(list)
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  // Extract unique clients from orders
  const clientsMap = new Map()
  orders.forEach(o => {
    if (o.customer?.id && !clientsMap.has(o.customer.id)) {
      const customerOrders = orders.filter(ord => ord.customer?.id === o.customer.id)
      clientsMap.set(o.customer.id, {
        ...o.customer,
        orderCount: customerOrders.length,
        totalSpent: customerOrders.reduce((sum, ord) => sum + parseFloat(ord.total || 0), 0),
        lastOrder: customerOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0],
      })
    }
  })
  const clients = Array.from(clientsMap.values())

  return (
    <div className="space-y-6 platform-enter">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-background">{t('agentDash.clients.title')}</h1>
        <p className="text-sm text-text-muted mt-1">{t('agentDash.clients.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-outline-variant/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] stat-card">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[20px]">group</span>
          </div>
          <p className="text-xl font-bold text-on-background">{clients.length}</p>
          <p className="text-xs text-text-muted mt-0.5">{t('agentDash.clients.totalClients')}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-outline-variant/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] stat-card">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[20px]">payments</span>
          </div>
          <p className="text-xl font-bold text-on-background">${clients.reduce((s, c) => s + c.totalSpent, 0).toLocaleString()}</p>
          <p className="text-xs text-text-muted mt-0.5">{t('agentDash.clients.totalSold')}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline-variant block mb-3">group</span>
          <h3 className="font-headline text-lg font-bold text-on-background mb-1">{t('agentDash.clients.noClients')}</h3>
          <p className="text-sm text-text-muted">{t('agentDash.clients.noClientsDesc')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map(client => (
            <div key={client.id} className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-background font-bold text-sm">
                  {client.firstName?.[0]}{client.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-on-background">{client.firstName} {client.lastName}</h3>
                  <p className="text-xs text-text-muted">{client.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-on-background">${client.totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-text-muted">{client.orderCount} {client.orderCount !== 1 ? t('agentDash.clients.orderPlural') : t('agentDash.clients.orderSingular')}</p>
                </div>
                {client.phone && (
                  <a
                    href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-[#25d366]/10 flex items-center justify-center text-[#25d366] hover:bg-[#25d366]/20 transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-lg">chat</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
