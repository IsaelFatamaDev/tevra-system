import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../core/contexts/AuthContext'

export default function ClientHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAgent = user?.role === 'agent'

  const navItems = isAgent ? [
    { to: '/agente', label: 'Dashboard', icon: 'space_dashboard', end: true },
    { to: '/agente/pedidos', label: 'Pedidos', icon: 'receipt_long' },
    { to: '/agente/comisiones', label: 'Comisiones', icon: 'payments' },
    { to: '/agente/clientes', label: 'Clientes', icon: 'group' },
    { to: '/agente/seguridad', label: 'Seguridad', icon: 'shield' },
  ] : [
    { to: '/mi-cuenta', label: 'Inicio', icon: 'space_dashboard', end: true },
    { to: '/mi-cuenta/pedidos', label: 'Pedidos', icon: 'receipt_long' },
    { to: '/mi-cuenta/direcciones', label: 'Direcciones', icon: 'location_on' },
    { to: '/mi-cuenta/seguridad', label: 'Seguridad', icon: 'shield' },
  ]

  const roleLabel = isAgent ? 'Agente' : 'Mi Cuenta'
  const roleColor = isAgent ? 'from-emerald-500 to-teal-600' : 'from-primary to-primary-dark'

  return (
    <header className="sticky top-0 z-30 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      {/* Top accent bar */}
      <div className={`h-[3px] w-full bg-gradient-to-r ${roleColor}`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <NavLink to={isAgent ? '/agente' : '/mi-cuenta'} className="flex items-center gap-2 flex-shrink-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br ${roleColor} shadow-sm`}>
              <span className="text-white font-black text-[11px]">TV</span>
            </div>
            <span className="font-headline text-base font-extrabold text-on-background tracking-tight">
              Te<span className="text-secondary">Vra</span>
            </span>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-primary font-semibold bg-primary/5'
                      : 'text-text-muted hover:text-on-background hover:bg-surface-container-low'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`material-symbols-outlined text-[16px] ${isActive ? 'text-primary' : ''}`}
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-t-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right: User area */}
        <div className="flex items-center gap-2">
          {/* Role badge */}
          <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${roleColor}`}>
            {roleLabel}
          </span>

          <div className="w-px h-5 bg-outline-variant/20 mx-0.5" />

          {/* User avatar + name */}
          <div className="flex items-center gap-2">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.firstName} className="w-8 h-8 rounded-full object-cover ring-2 ring-outline-variant/20" />
            ) : (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[11px] bg-gradient-to-br ${roleColor}`}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <span className="hidden lg:block text-sm font-semibold text-on-background">{user?.firstName}</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Cerrar sesión"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-text-muted hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-outline-variant/10 bg-white px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/8 text-primary font-semibold'
                    : 'text-text-muted hover:bg-surface-container-low hover:text-on-background'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`material-symbols-outlined text-[18px] ${isActive ? 'text-primary' : 'text-text-muted'}`}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
          <div className="pt-2 mt-2 border-t border-outline-variant/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
