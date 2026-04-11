import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import { useAuth } from '../../../core/contexts/AuthContext'

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/users': 'Usuarios',
  '/admin/agents': 'Agentes',
  '/admin/products': 'Productos',
  '/admin/categories': 'Categorías',
  '/admin/brands': 'Marcas',
  '/admin/orders': 'Pedidos',
  '/admin/reviews': 'Reseñas',
  '/admin/reports': 'Analítica',
  '/admin/communications': 'Campañas',
  '/admin/settings': 'Configuración',
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()
  const pageTitle = pageTitles[location.pathname] || ''

  return (
    <div className="min-h-screen bg-surface-container-low/80">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-65">
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-xl border-b border-outline-variant/60 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-text-muted hover:bg-surface-container-high hover:text-on-background transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            {pageTitle && (
              <h1 className="hidden sm:block text-sm font-bold text-on-background">{pageTitle}</h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl bg-surface-container-low text-text-muted hover:bg-surface-container-high hover:text-on-background transition-colors">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <div className="w-px h-6 bg-surface-container-high mx-1" />
            <div className="flex items-center gap-2.5">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.firstName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[11px]">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-[13px] font-semibold text-on-background leading-tight">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-text-muted capitalize leading-tight">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
