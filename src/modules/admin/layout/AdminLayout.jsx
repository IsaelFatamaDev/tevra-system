import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AdminSidebar from './AdminSidebar'
import { useAuth } from '../../../core/contexts/AuthContext'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const pageMeta = {
    '/admin': { title: t('admin.sidebar.nav.dashboard'), icon: 'space_dashboard' },
    '/admin/users': { title: t('admin.sidebar.nav.users'), icon: 'group' },
    '/admin/agents': { title: t('admin.sidebar.nav.agents'), icon: 'handshake' },
    '/admin/products': { title: t('admin.sidebar.nav.products'), icon: 'inventory_2' },
    '/admin/categories': { title: t('admin.sidebar.nav.categories'), icon: 'category' },
    '/admin/brands': { title: t('admin.sidebar.nav.brands'), icon: 'storefront' },
    '/admin/orders': { title: t('admin.sidebar.nav.orders'), icon: 'receipt_long' },
    '/admin/reviews': { title: t('admin.sidebar.nav.reviews'), icon: 'star_rate' },
    '/admin/reports': { title: t('admin.sidebar.nav.analytics'), icon: 'query_stats' },
    '/admin/communications': { title: t('admin.sidebar.nav.campaigns'), icon: 'campaign' },
    '/admin/settings': { title: t('admin.sidebar.nav.settings'), icon: 'tune' },
  }

  const meta = pageMeta[location.pathname] || { title: '', icon: 'home' }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#EEF4ED]/20">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 bg-white border-b border-[#C5D8E8]/20">
          <div className="h-14 flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-[#134074] hover:bg-[#C5D8E8]/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">menu</span>
              </button>
              {meta.title && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#134074]">{meta.icon}</span>
                  <h1 className="text-sm font-semibold text-[#134074]">{meta.title}</h1>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#134074] hover:bg-[#C5D8E8]/20 hover:text-[#134074] transition-colors text-sm font-medium"
                title="Ir al sitio web"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                Sitio web
              </Link>

              <div className="w-px h-5 bg-[#C5D8E8]/30 mx-1.5" />

              <div className="flex items-center gap-2 pl-1">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.firstName} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#8DA9C4]/15 flex items-center justify-center text-[#134074] font-semibold text-[11px]">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-[13px] font-medium text-[#134074] leading-tight">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-[#134074] capitalize leading-tight">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="ml-1 p-2 rounded-lg text-[#13315C] hover:text-red-500 hover:bg-red-50 transition-colors"
                title={t('common.logout')}
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

