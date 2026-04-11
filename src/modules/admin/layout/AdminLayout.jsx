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
    <div className="min-h-screen bg-gray-50/80">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-65">
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-xl border-b border-gray-200/60 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            {pageTitle && (
              <h1 className="hidden sm:block text-sm font-bold text-gray-800">{pageTitle}</h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-[11px]">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="hidden sm:block">
                <p className="text-[13px] font-semibold text-gray-800 leading-tight">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-gray-400 capitalize leading-tight">{user?.role?.replace('_', ' ')}</p>
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
