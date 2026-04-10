import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../core/contexts/AuthContext'

const navSections = [
  {
    title: 'General',
    items: [
      { to: '/admin', icon: 'space_dashboard', label: 'Dashboard', end: true },
      { to: '/admin/reports', icon: 'query_stats', label: 'Analítica' },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { to: '/admin/users', icon: 'group', label: 'Usuarios' },
      { to: '/admin/agents', icon: 'handshake', label: 'Agentes' },
      { to: '/admin/products', icon: 'inventory_2', label: 'Productos' },
      { to: '/admin/categories', icon: 'category', label: 'Categorías' },
      { to: '/admin/brands', icon: 'storefront', label: 'Marcas' },
      { to: '/admin/orders', icon: 'receipt_long', label: 'Pedidos' },
    ],
  },
  {
    title: 'Engagement',
    items: [
      { to: '/admin/reviews', icon: 'star_rate', label: 'Reseñas' },
      { to: '/admin/communications', icon: 'campaign', label: 'Campañas' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { to: '/admin/settings', icon: 'tune', label: 'Configuración' },
    ],
  },
]

export default function AdminSidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed top-0 left-0 z-50 h-screen w-65 bg-[#0B1120] flex flex-col transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 h-17 border-b border-white/6">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <span className="text-white font-black text-sm">TV</span>
          </div>
          <div>
            <p className="font-headline text-[15px] font-extrabold text-white tracking-tight">TeVra</p>
            <p className="text-[10px] text-white/30 font-medium tracking-wide">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin">
          {navSections.map((section, idx) => (
            <div key={section.title} className={idx > 0 ? 'mt-5' : ''}>
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/25">{section.title}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${isActive
                        ? 'bg-sky-500/15 text-sky-400'
                        : 'text-white/45 hover:text-white/80 hover:bg-white/4'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? 'text-sky-400' : 'text-white/30 group-hover:text-white/60'}`}
                          style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          {item.icon}
                        </span>
                        {item.label}
                        {isActive && <span className="ml-auto w-1 h-4 rounded-full bg-sky-400" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-white/6 p-3">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/4 transition-colors">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-sky-500/20">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-white/25 capitalize truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Cerrar sesión">
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
