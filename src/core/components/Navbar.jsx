import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import { useCart } from '../hooks/useCart'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const { getCount } = useCart()
  const cartCount = getCount()
  const { t } = useTranslation()

  const navLinks = [
    { label: t('nav.buy'), href: '/catalogo' },
    { label: t('nav.agents'), href: '/agentes' },
    { label: t('nav.company'), href: '/empresa' },
  ]

  const handleLoginClick = useCallback((e) => {
    e.preventDefault()
    navigate('/login')
  }, [navigate])

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-[#9DBEBB]/25 shadow-[0_1px_16px_rgba(3,25,38,0.06)]">
        <div className="flex justify-between items-center px-6 sm:px-8 py-3.5 max-w-7xl mx-auto w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#031926] to-[#468189] flex items-center justify-center shadow-sm">
              <span className="text-[#EBF2FA] font-black text-[10px] tracking-tight">TV</span>
            </div>
            <span className="font-headline font-extrabold text-xl tracking-tight text-[#031926] select-none">
              Te<span className="text-[#468189]">Vra</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex gap-1 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-4 py-2 rounded-lg font-headline text-[12px] font-bold uppercase tracking-widest text-text-muted hover:text-[#031926] hover:bg-[#EBF2FA] transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="dark" />

            <div className="flex items-center gap-2">
              <button
                onClick={handleLoginClick}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-[#468189] hover:bg-[#EBF2FA] transition-all duration-200"
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
              </button>
              <Link to="/carrito" className="relative w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-[#468189] hover:bg-[#EBF2FA] transition-all duration-200">
                <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 bg-[#468189] text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-sm ring-2 ring-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>

            <button
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[#031926] hover:bg-[#EBF2FA] transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span className="material-symbols-outlined text-[22px]">
                {mobileOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-[#9DBEBB]/25 px-6 py-5 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-4 py-2.5 rounded-lg font-headline text-sm font-bold uppercase tracking-widest text-text-muted hover:text-[#031926] hover:bg-[#EBF2FA] transition-all"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#9DBEBB]/20">
              <LanguageSwitcher variant="dark" />
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
