import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../core/contexts/AuthContext'
import LanguageSwitcher from '../../../core/components/LanguageSwitcher'

export default function AdminSidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const navSections = [
    {
      title: t('admin.sidebar.sections.general'),
      items: [
        { to: '/admin', icon: 'space_dashboard', label: t('admin.sidebar.nav.dashboard'), end: true },
        { to: '/admin/reports', icon: 'query_stats', label: t('admin.sidebar.nav.analytics') },
      ],
    },
    {
      title: t('admin.sidebar.sections.management'),
      items: [
        { to: '/admin/users', icon: 'group', label: t('admin.sidebar.nav.users') },
        { to: '/admin/agents', icon: 'handshake', label: t('admin.sidebar.nav.agents') },
        { to: '/admin/products', icon: 'inventory_2', label: t('admin.sidebar.nav.products') },
        { to: '/admin/categories', icon: 'category', label: t('admin.sidebar.nav.categories') },
        { to: '/admin/brands', icon: 'storefront', label: t('admin.sidebar.nav.brands') },
        { to: '/admin/orders', icon: 'receipt_long', label: t('admin.sidebar.nav.orders') },
      ],
    },
    {
      title: t('admin.sidebar.sections.engagement'),
      items: [
        { to: '/admin/reviews', icon: 'star_rate', label: t('admin.sidebar.nav.reviews') },
        { to: '/admin/communications', icon: 'campaign', label: t('admin.sidebar.nav.campaigns') },
      ],
    },
    {
      title: t('admin.sidebar.sections.system'),
      items: [
        { to: '/admin/settings', icon: 'tune', label: t('admin.sidebar.nav.settings') },
      ],
    },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed top-0 left-0 z-50 h-screen w-60 flex flex-col border-r border-[#9DBEBB]/20 transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: '#031926' }}>

        <div className="flex items-center gap-2.5 px-5 h-14 border-b border-[#EBF2FA]/8 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#468189] to-[#031926] flex items-center justify-center">
            <span className="text-[#EBF2FA] font-bold text-[10px] tracking-tight">TV</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#EBF2FA] tracking-tight">TeVra</p>
            <p className="text-[10px] text-[#9DBEBB] font-medium">{t('admin.sidebar.admin')}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto lg:hidden p-1 rounded-md text-[#9DBEBB] hover:text-[#EBF2FA] hover:bg-[#468189]/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <nav className="flex-1 py-3 px-3 overflow-y-auto sidebar-scroll">
          {navSections.map((section, idx) => (
            <div key={section.title} className={idx > 0 ? 'mt-5' : ''}>
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#9DBEBB]/60">{section.title}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${isActive
                        ? 'bg-[#468189]/25 text-[#EBF2FA]'
                        : 'text-[#9DBEBB] hover:text-[#EBF2FA] hover:bg-[#468189]/15'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`material-symbols-outlined text-[18px] ${isActive ? 'text-[#EBF2FA]' : 'text-[#9DBEBB]'}`}
                          style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#EBF2FA]/8 p-3 shrink-0 space-y-2">
          <div className="px-2">
            <LanguageSwitcher variant="dark" />
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#468189]/15 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-[#468189]/30 flex items-center justify-center text-[#EBF2FA] font-semibold text-xs shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#EBF2FA] truncate leading-tight">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-[#9DBEBB] capitalize truncate leading-tight">{user?.role?.replace('_', ' ')}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 rounded-md text-[#9DBEBB] hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
              title={t('common.logout')}
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
