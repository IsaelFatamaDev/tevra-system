import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageTransition from './PageTransition'
import LanguageSwitcher from './LanguageSwitcher'
import { useCart } from '../hooks/useCart'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showTransition, setShowTransition] = useState(false)
  const navigate = useNavigate()
  const { getCount } = useCart()
  const cartCount = getCount()
  const { t } = useTranslation()

  const navLinks = [
    { label: t('nav.buy'), href: '/catalogo' },
    { label: t('nav.agents'), href: '/agentes' },
    { label: t('nav.company'), href: '/empresa' },
    { label: t('nav.tracking'), href: '/tracking' },
  ]

  const handleLoginClick = useCallback((e) => {
    e.preventDefault()
    setShowTransition(true)
  }, [])

  const handleTransitionDone = useCallback(() => {
    setShowTransition(false)
    navigate('/login')
  }, [navigate])

  return (
    <>
      {showTransition && <PageTransition onDone={handleTransitionDone} />}
      <nav className="fixed top-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-8 py-3 max-w-7xl mx-auto w-full">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-headline font-extrabold text-2xl tracking-tight text-primary select-none">
              Te<span className="text-secondary">Vra</span>
            </span>
          </Link>

          <div className="hidden md:flex gap-10 items-center font-headline text-[13px] font-bold uppercase tracking-widest">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-text-muted hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/20">
              <span className="material-symbols-outlined text-text-muted text-sm mr-2">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 focus:outline-none text-xs w-40 text-on-background placeholder:text-text-muted"
                placeholder={t('nav.searchPlaceholder')}
                type="text"
              />
            </div>

            <LanguageSwitcher variant="dark" />

            <div className="flex gap-4">
              <span className="material-symbols-outlined text-primary cursor-pointer hover:text-secondary transition-colors">favorite</span>
              <button onClick={handleLoginClick}>
                <span className="material-symbols-outlined text-primary cursor-pointer hover:text-secondary transition-colors">person</span>
              </button>
              <Link to="/carrito" className="relative">
                <span className="material-symbols-outlined text-primary cursor-pointer hover:text-secondary transition-colors">shopping_bag</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-secondary text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>

            <button
              className="md:hidden text-primary"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-surface-container-lowest border-t border-outline-variant/20 px-8 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block font-headline text-sm font-bold uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2">
              <LanguageSwitcher variant="dark" />
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
