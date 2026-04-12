import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import { useAuth } from '../../../core/contexts/AuthContext'

const pageMeta = {
  '/admin': { title: 'Dashboard', icon: 'space_dashboard' },
  '/admin/users': { title: 'Usuarios', icon: 'group' },
  '/admin/agents': { title: 'Agentes', icon: 'handshake' },
  '/admin/products': { title: 'Productos', icon: 'inventory_2' },
  '/admin/categories': { title: 'Categorías', icon: 'category' },
  '/admin/brands': { title: 'Marcas', icon: 'storefront' },
  '/admin/orders': { title: 'Pedidos', icon: 'receipt_long' },
  '/admin/reviews': { title: 'Reseñas', icon: 'star_rate' },
  '/admin/reports': { title: 'Analítica', icon: 'query_stats' },
  '/admin/communications': { title: 'Campañas', icon: 'campaign' },
  '/admin/settings': { title: 'Configuración', icon: 'tune' },
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const meta = pageMeta[location.pathname] || { title: '', icon: 'home' }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-60">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-zinc-200">
          <div className="h-14 flex items-center justify-between px-4 lg:px-6">
            {/* Left: hamburger + breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">menu</span>
              </button>
              {meta.title && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-zinc-400">{meta.icon}</span>
                  <h1 className="text-sm font-semibold text-zinc-900">{meta.title}</h1>
                </div>
              )}
            </div>

            {/* Right: notifications + user */}
            <div className="flex items-center gap-1">
              <button className="relative p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              </button>

              <div className="w-px h-5 bg-zinc-200 mx-1.5" />

              <div className="flex items-center gap-2 pl-1">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.firstName} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-semibold text-[11px]">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-[13px] font-medium text-zinc-900 leading-tight">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-zinc-400 capitalize leading-tight">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="ml-1 p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Cerrar sesión"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6 platform-enter">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
