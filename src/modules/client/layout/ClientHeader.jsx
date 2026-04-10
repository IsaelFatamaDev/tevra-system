import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../core/contexts/AuthContext'

export default function ClientHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/mi-cuenta', label: 'Pedidos', end: true },
    { to: '/mi-cuenta/pagos', label: 'Pagos' },
    { to: '/mi-cuenta/soporte', label: 'Soporte' },
  ]

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-outline-variant/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-headline text-lg font-extrabold text-primary tracking-tight">
            Te<span className="text-secondary">Vra</span>
          </span>
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive
                    ? 'text-primary bg-primary/5 font-bold'
                    : 'text-text-muted hover:text-primary'
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
            <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center text-secondary font-bold text-xs">
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
