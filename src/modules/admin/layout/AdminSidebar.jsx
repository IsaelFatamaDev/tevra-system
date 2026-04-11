import { NavLink, useNavigate } from 'react-router-dom'
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed top-0 left-0 z-50 h-screen w-65 flex flex-col transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(180deg, #0d1520 0%, #111318 40%, #0f1218 100%)' }}>

        {/* Top accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-secondary/60 via-secondary to-transparent flex-shrink-0" />

        {/* Brand */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06] flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)' }}>
            <span className="text-white font-black text-sm tracking-tight">TV</span>
          </div>
          <div>
            <p className="font-headline text-[15px] font-extrabold text-white tracking-tight">TeVra</p>
            <p className="text-[10px] text-white/30 font-medium tracking-widest uppercase">Admin Panel</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto lg:hidden p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto sidebar-scroll">
          {navSections.map((section, idx) => (
            <div key={section.title} className={idx > 0 ? 'mt-6' : ''}>
              <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/20">{section.title}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 relative overflow-hidden ${isActive
                        ? 'text-white'
                        : 'text-white/40 hover:text-white/75 hover:bg-white/[0.04]'
                      }`
                    }
                    style={({ isActive }) => isActive ? {
                      background: 'linear-gradient(90deg, rgba(255,107,107,0.12) 0%, rgba(255,107,107,0.04) 60%, transparent 100%)',
                    } : {}}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-secondary" />
                        )}
                        <span
                          className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? 'text-secondary' : 'text-white/25 group-hover:text-white/50'}`}
                          style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          {item.icon}
                        </span>
                        <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-white/[0.06] p-3 flex-shrink-0">
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(255,107,107,0.3) 0%, rgba(255,107,107,0.15) 100%)', border: '1px solid rgba(255,107,107,0.2)' }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate leading-tight">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-white/25 capitalize truncate leading-tight">{user?.role?.replace('_', ' ')}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
              title="Cerrar sesión"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
