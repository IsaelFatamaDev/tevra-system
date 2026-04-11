import { useState, useEffect } from 'react'
import dashboardService from '../../admin/services/dashboard.service'

export default function AgentClients() {
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
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-gray-900">Mis Clientes</h1>
        <p className="text-sm text-gray-500 mt-1">Clientes que han comprado a través de ti</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-gray-400 text-lg">group</span>
            <span className="text-xs text-gray-500 font-medium">Total Clientes</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{clients.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-gray-400 text-lg">payments</span>
            <span className="text-xs text-gray-500 font-medium">Total Vendido</span>
          </div>
          <p className="text-xl font-bold text-gray-900">${clients.reduce((s, c) => s + c.totalSpent, 0).toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 block mb-3">group</span>
          <h3 className="font-headline text-lg font-bold text-gray-900 mb-1">Sin clientes aún</h3>
          <p className="text-sm text-gray-500">Cuando tus clientes realicen pedidos, aparecerán aquí</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map(client => (
            <div key={client.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-sm">
                  {client.firstName?.[0]}{client.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{client.firstName} {client.lastName}</h3>
                  <p className="text-xs text-gray-500">{client.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${client.totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{client.orderCount} pedido{client.orderCount !== 1 ? 's' : ''}</p>
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
