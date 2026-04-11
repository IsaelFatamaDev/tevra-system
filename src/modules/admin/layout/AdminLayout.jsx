import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import { useAuth } from '../../../core/contexts/AuthContext'

const pageMeta = {
  '/admin':               { title: 'Dashboard',      icon: 'space_dashboard' },
  '/admin/users':         { title: 'Usuarios',        icon: 'group' },
  '/admin/agents':        { title: 'Agentes',         icon: 'handshake' },
  '/admin/products':      { title: 'Productos',       icon: 'inventory_2' },
  '/admin/categories':    { title: 'Categorías',      icon: 'category' },
  '/admin/brands':        { title: 'Marcas',          icon: 'storefront' },
  '/admin/orders':        { title: 'Pedidos',         icon: 'receipt_long' },
  '/admin/reviews':       { title: 'Reseñas',         icon: 'star_rate' },
  '/admin/reports':       { title: 'Analítica',       icon: 'query_stats' },
  '/admin/communications':{ title: 'Campañas',        icon: 'campaign' },
  '/admin/settings':      { title: 'Configuración',   icon: 'tune' },
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
    <div className="min-h-screen" style={{ backgroundColor: '#f4f6f9' }}>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-65">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="h-14 flex items-center justify-between px-4 lg:px-6">
            {/* Left: hamburger + breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-text-muted hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">menu</span>
              </button>
              {meta.title && (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:flex w-7 h-7 rounded-lg items-center justify-center"
                    style={{ background: 'rgba(255,107,107,0.08)' }}>
                    <span className="material-symbols-outlined text-[15px] text-secondary"
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                      {meta.icon}
                    </span>
                  </span>
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-text-muted font-medium">
                    <span>TeVra</span>
                    <span className="text-outline-variant">/</span>
                    <span className="text-on-background font-bold">{meta.title}</span>
                  </div>
                  <h1 className="sm:hidden text-sm font-bold text-on-background">{meta.title}</h1>
                </div>
              )}
            </div>

            {/* Right: notifications + user */}
            <div className="flex items-center gap-1.5">
              <button className="relative p-2 rounded-xl text-text-muted hover:bg-surface-container-low hover:text-on-background transition-colors">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full ring-2 ring-white notification-pulse" />
              </button>

              <div className="w-px h-5 bg-outline-variant/20 mx-1" />

              <div className="flex items-center gap-2.5 pl-1">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.firstName} className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm" />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[11px] shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #0a2540 0%, #1a3a5a 100%)' }}>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-[13px] font-semibold text-on-background leading-tight">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-text-muted capitalize leading-tight">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="ml-1 p-2 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
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
