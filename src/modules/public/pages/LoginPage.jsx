import { useState, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../core/contexts/AuthContext'
import { getDashboardPath } from '../../../core/utils/roles'
import { useFieldAvailability } from '../../../core/hooks/useFieldAvailability'
import { useTranslation } from 'react-i18next'

const COUNTRY_CODES = [
  { code: '+51', flag: '🇵🇪', name: 'PE' },
  { code: '+57', flag: '🇨🇴', name: 'CO' },
  { code: '+52', flag: '🇲🇽', name: 'MX' },
  { code: '+54', flag: '🇦🇷', name: 'AR' },
  { code: '+56', flag: '🇨🇱', name: 'CL' },
  { code: '+55', flag: '🇧🇷', name: 'BR' },
  { code: '+593', flag: '🇪🇨', name: 'EC' },
  { code: '+591', flag: '🇧🇴', name: 'BO' },
  { code: '+1', flag: '🇺🇸', name: 'US' },
  { code: '+34', flag: '🇪🇸', name: 'ES' },
]

function detectCountryCode() {
  const lang = navigator.language || navigator.languages?.[0] || 'es-PE'
  const map = { PE: '+51', CO: '+57', MX: '+52', AR: '+54', CL: '+56', BR: '+55', EC: '+593', BO: '+591', US: '+1', ES: '+34' }
  const country = lang.split('-')[1]?.toUpperCase()
  return map[country] || '+51'
}

function getPasswordStrength(pw) {
  if (pw.length < 6) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dialCode, setDialCode] = useState(detectCountryCode)
  const [phoneLocal, setPhoneLocal] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const phone = phoneLocal ? `${dialCode}${phoneLocal.replace(/^0/, '')}` : ''
  const pwStrength = isSignUp ? getPasswordStrength(password) : 0
  const pwLabels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte']
  const pwColors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500']

  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const availabilityFields = useMemo(() => (
    isSignUp ? { email, phone, whatsapp: phone } : {}
  ), [isSignUp, email, phone])

  const { availabilityErrors, checking } = useFieldAvailability(availabilityFields)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) return setError(t('auth.errors.emailRequired'))
    if (!/\S+@\S+\.\S+/.test(email)) return setError(t('auth.errors.emailInvalid'))
    if (!password) return setError(t('auth.errors.passwordRequired'))
    if (isSignUp && password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    if (!isSignUp && password.length < 6) return setError(t('auth.errors.passwordLength'))
    if (isSignUp && getPasswordStrength(password) < 2) return setError('La contraseña es muy débil. Agrega números o mayúsculas.')
    if (isSignUp) {
      if (!firstName.trim()) return setError(t('auth.errors.firstNameRequired'))
      if (!lastName.trim()) return setError(t('auth.errors.lastNameRequired'))
    }

    setLoading(true)
    try {
      let loggedUser
      if (isSignUp) {
        const isChecking = Object.values(checking).some(Boolean)
        if (isChecking) {
          setError('Verificando disponibilidad, intenta en un momento…')
          setLoading(false)
          return
        }
        if (Object.keys(availabilityErrors).length > 0) {
          const raw = Object.values(availabilityErrors)[0]
          const avMsg = Array.isArray(raw) ? raw[0] : raw
          setError(typeof avMsg === 'string' && avMsg.trim() ? avMsg : t('auth.errors.generic'))
          setLoading(false)
          return
        }
        loggedUser = await register({ email, password, firstName, lastName, phone })
      } else {
        loggedUser = await login(email, password)
      }

      const searchParams = new URLSearchParams(location.search)
      const redirectTo = searchParams.get('redirect')

      if (redirectTo) {
        navigate(redirectTo, { replace: true })
      } else {
        navigate(getDashboardPath(loggedUser?.role), { replace: true })
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message
      setError(typeof msg === 'string' && msg.trim() ? msg : t('auth.errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row-reverse">

      {/* ── PANEL DERECHO: Branding (fondo blanco) ── */}
      <div
        className="hidden lg:flex relative overflow-hidden flex-col lg:w-[45%] xl:w-[46%] lg:min-h-screen"
        style={{ background: '#ffffff' }}
      >
        {/* Subtle light sweep */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f5fafa 40%, #edf6f6 70%, #ffffff 100%)',
            backgroundSize: '300% 300%',
            animation: 'gradientShift 8s ease infinite',
          }}
        />
        <style>{`
          @keyframes gradientShift {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>

        {/* Accent left border */}
        <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(70,129,137,0.3) 40%, rgba(70,129,137,0.3) 60%, transparent 100%)' }} />

        {/* Centered brand */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-12">
          <div className="flex flex-col items-center gap-7">

            {/* Logo */}
            <img src="/LogoTevra.png" alt="TeVra" className="w-44 h-44 xl:w-52 xl:h-52 object-contain" />

            {/* Brand name */}
            <div className="text-center">
              <h1 className="font-headline font-black text-[#031926] leading-none" style={{ fontSize: '56px', letterSpacing: '-2.5px' }}>
                Te<span style={{ color: '#468189' }}>Vra</span>
              </h1>
              <p className="mt-3 text-[#031926]/30 text-[10px] font-bold uppercase tracking-[0.55em]">
                Importaciones · Premium
              </p>
            </div>

            {/* Divider */}
            <div className="w-8 h-px" style={{ background: 'rgba(70,129,137,0.4)' }} />

            {/* Tagline */}
            <p className="text-center text-[#031926]/50 text-sm leading-7 max-w-55">
              Productos originales desde<br />
              <span className="text-[#031926]/75 font-medium">Estados Unidos</span><br />
              con tracking en tiempo real.
            </p>

          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 flex items-center justify-center pb-10 pt-6">
          <p className="text-[#031926]/20 text-[11px] font-medium tracking-wider">tevra.ddns.net</p>
        </div>
      </div>

      {/* ── PANEL IZQUIERDO: Formulario (gradiente oscuro) ── */}
      <div
        className="flex-1 flex flex-col justify-center items-center min-h-dvh px-5 py-10 sm:px-8 md:px-12 lg:px-14 xl:px-20 overflow-y-auto"
        style={{ background: 'linear-gradient(135deg, #031926 0%, #062c3d 45%, #0d4a5a 75%, #031926 100%)' }}
      >
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8 self-start">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center border border-white/20">
            <span className="text-white font-black text-[10px]">TV</span>
          </div>
          <span className="font-headline font-extrabold text-xl text-white">
            Te<span className="text-secondary-light">Vra</span>
          </span>
        </div>

        <div className="w-full max-w-105 space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
              {isSignUp ? t('auth.createAccount') : t('auth.welcome')}
            </h2>
            <p className="text-secondary-light text-sm">
              {isSignUp ? t('auth.registerSubtitle') : t('auth.loginSubtitle')}
            </p>
          </div>

          {/* Toggle tabs */}
          <div className="flex bg-white/10 p-1 rounded-2xl gap-1">
            <button
              onClick={() => { setIsSignUp(false); setError('') }}
              className={`flex-1 py-2.5 rounded-xl font-headline font-bold text-sm transition-all duration-200 ${!isSignUp
                ? 'bg-white text-[#031926] shadow-md'
                : 'text-white/60 hover:text-white'
                }`}
            >
              {t('auth.signIn')}
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError('') }}
              className={`flex-1 py-2.5 rounded-xl font-headline font-bold text-sm transition-all duration-200 ${isSignUp
                ? 'bg-white text-[#031926] shadow-md'
                : 'text-white/60 hover:text-white'
                }`}
            >
              {t('auth.register')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && typeof error === 'string' && error.trim() && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-900/30 border border-red-400/30 rounded-2xl text-red-300 text-sm">
                <span className="material-symbols-outlined text-base shrink-0">error</span>
                {error}
              </div>
            )}

            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/50">{t('auth.firstName')}</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">person</span>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Carlos"
                        className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/15 rounded-2xl text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 focus:bg-white/15 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/50">{t('auth.lastName')}</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">badge</span>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Mendez"
                        className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/15 rounded-2xl text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 focus:bg-white/15 transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/50">{t('auth.phone')}</label>
                  <div className={`flex bg-white/10 border rounded-2xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-white/20 focus-within:border-white/30 focus-within:bg-white/15 ${availabilityErrors.phone || availabilityErrors.whatsapp ? 'border-red-400/60' : 'border-white/15'}`}>
                    <select
                      value={dialCode}
                      onChange={e => setDialCode(e.target.value)}
                      className="bg-white/15 border-r border-white/10 px-3 py-3 text-sm text-white focus:outline-none cursor-pointer shrink-0"
                    >
                      {COUNTRY_CODES.map(c => (
                        <option key={c.code} value={c.code} className="bg-[#062c3d] text-white">
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={phoneLocal}
                      onChange={e => setPhoneLocal(e.target.value.replace(/[^0-9 \-]/g, ''))}
                      placeholder="999 123 456"
                      className="flex-1 px-3 py-3 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
                    />
                    {checking.phone && <span className="self-center mr-3 w-3.5 h-3.5 border-2 border-secondary/40 border-t-secondary rounded-full animate-spin shrink-0" />}
                  </div>
                  {(availabilityErrors.phone || availabilityErrors.whatsapp) && (
                    <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">error</span>
                      {availabilityErrors.phone || availabilityErrors.whatsapp}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                {t('auth.email')}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">mail</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className={`w-full pl-10 pr-3 py-3 bg-white/10 border rounded-2xl text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 focus:bg-white/15 transition-all ${isSignUp && availabilityErrors.email ? 'border-red-400/60' : 'border-white/15'}`}
                />
                {isSignUp && checking.email && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-secondary/40 border-t-secondary rounded-full animate-spin" />}
              </div>
              {isSignUp && availabilityErrors.email && (
                <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {availabilityErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                {t('auth.password')}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/15 rounded-2xl text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 focus:bg-white/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {isSignUp && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(n => (
                      <div
                        key={n}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${n <= pwStrength ? pwColors[pwStrength] : 'bg-white/20'}`}
                      />
                    ))}
                  </div>
                  {pwStrength > 0 && (
                    <p className={`text-[11px] font-semibold ${pwStrength >= 3 ? 'text-emerald-600' : pwStrength === 2 ? 'text-yellow-600' : 'text-red-500'}`}>
                      Contraseña {pwLabels[pwStrength]}
                    </p>
                  )}
                </div>
              )}
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-white/30 accent-secondary-light" />
                  <span className="text-xs text-white/50">{t('auth.rememberMe')}</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-secondary-light hover:text-secondary-light/80 transition-colors"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-1 bg-white hover:bg-white/90 disabled:opacity-50 text-[#031926] font-headline font-bold text-sm uppercase tracking-wider rounded-2xl transition-all duration-200 shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_32px_rgba(255,255,255,0.15)] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSignUp ? 'person_add' : 'login'}
              </span>
              {loading
                ? (isSignUp ? t('auth.creatingAccount') : t('auth.signingIn'))
                : (isSignUp ? t('auth.createFree') : t('auth.login'))}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/15" />
            <span className="text-xs text-white/40 font-medium whitespace-nowrap">{t('auth.orContinueWith')}</span>
            <div className="flex-1 h-px bg-white/15" />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <button className="flex items-center justify-center gap-2 py-3 bg-white/10 border border-white/15 rounded-2xl hover:border-white/30 hover:bg-white/15 transition-all text-sm font-medium text-white">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-white/10 border border-white/15 rounded-2xl hover:border-white/30 hover:bg-white/15 transition-all text-sm font-medium text-white">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <span>Apple</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-white/10 border border-white/15 rounded-2xl hover:border-white/30 hover:bg-white/15 transition-all text-sm font-medium text-white">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#F25022" d="M1 1h10v10H1z" />
                <path fill="#00A4EF" d="M13 1h10v10H13z" />
                <path fill="#7FBA00" d="M1 13h10v10H1z" />
                <path fill="#FFB900" d="M13 13h10v10H13z" />
              </svg>
              <span>Microsoft</span>
            </button>
          </div>

          <p className="text-center text-sm text-white/50">
            {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}{' '}
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              className="font-semibold text-secondary-light hover:text-secondary-light/80 transition-colors"
            >
              {isSignUp ? t('auth.signIn') : t('auth.createFree')}
            </button>
          </p>

          <div className="pt-2 border-t border-white/10">
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-1.5 text-white/40 hover:text-white font-medium text-xs py-2 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              {t('auth.backToHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
