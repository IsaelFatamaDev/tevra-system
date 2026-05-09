import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../core/contexts/AuthContext'
import LanguageSwitcher from '../../../core/components/LanguageSwitcher'

export default function ClientHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useTranslation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAgent = user?.role === 'agent'

  const navItems = isAgent ? [
    { to: '/agente', label: t('agentDash.header.dashboard'), icon: 'space_dashboard', end: true },
    { to: '/agente/pedidos', label: t('agentDash.header.orders'), icon: 'receipt_long' },
    { to: '/agente/comisiones', label: t('agentDash.header.commissions'), icon: 'payments' },
    { to: '/agente/clientes', label: t('agentDash.header.clients'), icon: 'group' },
    { to: '/agente/seguridad', label: t('agentDash.header.security'), icon: 'shield' },
  ] : [
    { to: '/mi-cuenta', label: t('client.header.dashboard'), icon: 'space_dashboard', end: true },
    { to: '/mi-cuenta/pedidos', label: t('client.header.orders'), icon: 'receipt_long' },
    { to: '/mi-cuenta/direcciones', label: t('client.header.addresses'), icon: 'location_on' },
    { to: '/mi-cuenta/seguridad', label: t('client.header.security'), icon: 'shield' },
  ]

  const roleLabel = isAgent ? t('agentDash.header.agentLabel') : t('client.header.myAccount')
  const roleColor = isAgent ? 'from-[#8DA9C4] to-[#A5C0D8]' : 'from-[#134074] to-[#13315C]'

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#C5D8E8]/20 shadow-[0_1px_3px_rgba(19, 64, 116,0.06)]">
      <div className={`h-0.75 w-full bg-linear-to-r ${roleColor}`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <NavLink to={isAgent ? '/agente' : '/mi-cuenta'} className="flex items-center gap-2 shrink-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-linear-to-br ${roleColor} shadow-sm`}>
              <span className="text-white font-black text-[11px]">TV</span>
            </div>
            <span className="font-headline font-extrabold text-xl tracking-tight text-[#134074] select-none">
              TeVra
            </span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive
                    ? 'text-[#134074] font-semibold bg-[#8DA9C4]/8'
                    : 'text-[#8DA9C4] hover:text-[#134074] hover:bg-[#C5D8E8]/15'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`material-symbols-outlined text-[16px] ${isActive ? 'text-[#134074]' : ''}`}
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#8DA9C4] rounded-t-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[#8DA9C4] hover:bg-[#C5D8E8]/15 hover:text-[#134074] transition-colors font-medium text-sm"
            title={!isAgent ? "Seguir a comprar" : "Ir al sitio web"}
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            {!isAgent && <span>Seguir a comprar</span>}
          </Link>
          <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-linear-to-r ${roleColor}`}>
            {roleLabel}
          </span>

          <LanguageSwitcher variant="dark" />

          <div className="w-px h-5 bg-[#C5D8E8]/30 mx-0.5" />

          <div className="flex items-center gap-2">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.firstName} className="w-8 h-8 rounded-full object-cover ring-2 ring-[#C5D8E8]/30" />
            ) : (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[11px] bg-linear-to-br ${roleColor}`}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <span className="hidden lg:block text-sm font-semibold text-[#134074]">{user?.firstName}</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-[#C5D8E8] hover:text-red-500 hover:bg-red-50 transition-colors"
            title={t('common.logout')}
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-[#8DA9C4] hover:bg-[#C5D8E8]/15 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#C5D8E8]/20 bg-white px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                  ? 'bg-[#8DA9C4]/10 text-[#134074] font-semibold'
                  : 'text-[#8DA9C4] hover:bg-[#C5D8E8]/15 hover:text-[#134074]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`material-symbols-outlined text-[18px] ${isActive ? 'text-[#134074]' : 'text-[#8DA9C4]'}`}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
          <div className="pt-2 mt-2 border-t border-[#C5D8E8]/20">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              {t('common.logout')}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
