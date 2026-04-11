import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../core/contexts/AuthContext'

export default function ClientHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAgent = user?.role === 'agent'
  const basePath = isAgent ? '/agente' : '/mi-cuenta'

  const navItems = isAgent ? [
    { to: '/agente', label: 'Dashboard', end: true },
    { to: '/agente/pedidos', label: 'Pedidos' },
    { to: '/agente/comisiones', label: 'Comisiones' },
    { to: '/agente/clientes', label: 'Clientes' },
  ] : [
    { to: '/mi-cuenta', label: 'Dashboard', end: true },
    { to: '/mi-cuenta/pedidos', label: 'Pedidos' },
    { to: '/mi-cuenta/direcciones', label: 'Direcciones' },
    { to: '/mi-cuenta/seguridad', label: 'Seguridad' },
  ]

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-outline-variant/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-headline text-lg font-extrabold text-gray-900 tracking-tight">
            Te<span className="text-gray-500">Vra</span>
          </span>
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive
                    ? 'text-gray-900 bg-gray-100 font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-text-muted hover:text-on-background transition-colors">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <button className="relative w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-text-muted hover:text-on-background transition-colors">
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
          <div className="w-px h-6 bg-outline-variant/20 mx-1" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-xs">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <span className="hidden sm:block text-sm font-medium text-on-background">{user?.firstName}</span>
          </div>
          <button onClick={handleLogout} className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-red-500 transition-colors">
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
