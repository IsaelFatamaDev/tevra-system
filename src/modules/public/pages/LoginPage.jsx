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
    <div className="min-h-dvh flex flex-col lg:flex-row">
      <div
        className="hidden lg:flex relative overflow-hidden items-center justify-center lg:w-[42%] xl:w-[45%] lg:min-h-screen"
        style={{ background: 'linear-gradient(135deg, #031926 0%, #0d3349 40%, #468189 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(70,129,137,0.15)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(119,172,162,0.1)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,233,205,0.05)_0%,transparent_40%)]" />
        </div>

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-md gap-4 sm:gap-5 lg:gap-8">
          <div className="relative">
            <div className="absolute w-32 h-32 sm:w-36 sm:h-36 lg:w-52 lg:h-52 xl:w-60 xl:h-60 -inset-2 rounded-full border border-white/3 animate-[spin_25s_linear_infinite]" />
            <div className="absolute w-36 h-36 sm:w-40 sm:h-40 lg:w-56 lg:h-56 xl:w-64 xl:h-64 -inset-4 rounded-full border border-secondary/6 animate-[spin_35s_linear_infinite_reverse]" />
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-secondary/20 via-transparent to-secondary-light/15 blur-3xl scale-150" />

            <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-40 lg:h-40 xl:w-48 xl:h-48 rounded-full overflow-hidden bg-white/5 backdrop-blur-xl border border-white/8 flex items-center justify-center shadow-[0_0_60px_rgba(70,129,137,0.15),0_0_0_1px_rgba(255,255,255,0.04)]">
              <div className="absolute inset-0.5 rounded-full bg-linear-to-br from-white/6 to-transparent" />
              <img
                src="/LogoTevra.png"
                alt="TeVra"
                className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-26 lg:h-26 xl:w-32 xl:h-32 object-contain rounded-full"
              />
            </div>
          </div>

          <div>
            <h1 className="font-headline text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-extrabold text-[#F4E9CD] tracking-tighter">
              Te<span className="bg-linear-to-r from-secondary-light to-secondary-pale bg-clip-text text-transparent">Vra</span>
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2 lg:mt-4">
              <div className="w-6 lg:w-10 h-px bg-linear-to-r from-transparent to-white/15" />
              <p className="text-white/30 text-[8px] sm:text-[9px] lg:text-[11px] font-bold uppercase tracking-[0.3em] lg:tracking-[0.4em]">
                {t('auth.premiumImports')}
              </p>
              <div className="w-6 lg:w-10 h-px bg-linear-to-l from-transparent to-white/15" />
            </div>
          </div>

          <div className="hidden lg:flex flex-col gap-3 w-full mt-2">
            {[
              { icon: 'verified', bg: 'rgba(70,129,137,0.2)', color: 'text-[#77ACA2]', text: t('auth.features.originals') },
              { icon: 'local_shipping', bg: 'rgba(119,172,162,0.2)', color: 'text-[#9DBEBB]', text: t('auth.features.tracking') },
              { icon: 'support_agent', bg: 'rgba(244,233,205,0.1)', color: 'text-[#F4E9CD]', text: t('auth.features.agents') },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4 text-left bg-white/3 backdrop-blur-sm border border-white/5 rounded-xl px-5 py-3.5 hover:bg-white/6 transition-all duration-300 group">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: f.bg }}
                >
                  <span className={`material-symbols-outlined ${f.color} text-lg`}>{f.icon}</span>
                </div>
                <p className="text-white/45 text-[13px] leading-snug group-hover:text-white/60 transition-colors duration-300">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-5 py-6 sm:px-8 sm:py-8 md:px-12 lg:px-16 bg-[#F4E9CD]/30 overflow-y-auto">
        <div className="w-full max-w-105 space-y-5 sm:space-y-6">
          <div className="text-center lg:text-left">
            <h2 className="font-headline text-xl sm:text-2xl lg:text-3xl font-bold text-[#031926] leading-tight">
              {isSignUp ? t('auth.createAccount') : t('auth.welcome')}
            </h2>
            <p className="mt-1 text-text-muted text-xs sm:text-sm">
              {isSignUp ? t('auth.registerSubtitle') : t('auth.loginSubtitle')}
            </p>
          </div>

          <div className="flex bg-[#9DBEBB]/20 p-1 rounded-2xl">
            <button
              onClick={() => { setIsSignUp(false); setError('') }}
              className={`flex-1 py-2 sm:py-2.5 rounded-xl font-headline font-bold text-xs sm:text-sm transition-all ${!isSignUp
                ? 'bg-white text-[#031926] shadow-soft'
                : 'text-[#468189] hover:text-[#031926]'
                }`}
            >
              {t('auth.signIn')}
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError('') }}
              className={`flex-1 py-2 sm:py-2.5 rounded-xl font-headline font-bold text-xs sm:text-sm transition-all ${isSignUp
                ? 'bg-white text-[#031926] shadow-soft'
                : 'text-[#468189] hover:text-[#031926]'
                }`}
            >
              {t('auth.register')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            {error && typeof error === 'string' && error.trim() && (
              <div className="flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm">
                <span className="material-symbols-outlined text-base shrink-0">error</span>
                {error}
              </div>
            )}

            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-text-muted">{t('auth.firstName')}</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/60 text-[16px] sm:text-[18px]">person</span>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Carlos"
                        className="w-full pl-9 sm:pl-11 pr-3 py-3 sm:py-3.5 bg-white border border-[#9DBEBB]/40 rounded-xl text-xs sm:text-sm text-[#031926] placeholder:text-[#9DBEBB]/60 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-text-muted">{t('auth.lastName')}</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/60 text-[16px] sm:text-[18px]">badge</span>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Mendez"
                        className="w-full pl-9 sm:pl-11 pr-3 py-3 sm:py-3.5 bg-white border border-[#9DBEBB]/40 rounded-xl text-xs sm:text-sm text-[#031926] placeholder:text-[#9DBEBB]/60 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-text-muted">{t('auth.phone')}</label>
                  <div className={`flex bg-white border rounded-xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-secondary/30 focus-within:border-secondary ${availabilityErrors.phone || availabilityErrors.whatsapp ? 'border-red-400' : 'border-[#9DBEBB]/40'}`}>
                    <select
                      value={dialCode}
                      onChange={e => setDialCode(e.target.value)}
                      className="bg-[#F4E9CD]/50 border-r border-[#9DBEBB]/30 px-2 py-3 sm:py-3.5 text-xs sm:text-sm text-[#031926] focus:outline-none cursor-pointer shrink-0"
                    >
                      {COUNTRY_CODES.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={phoneLocal}
                      onChange={e => setPhoneLocal(e.target.value.replace(/[^0-9 \-]/g, ''))}
                      placeholder="999 123 456"
                      className="flex-1 px-3 py-3 sm:py-3.5 bg-transparent text-xs sm:text-sm text-[#031926] placeholder:text-[#9DBEBB]/60 focus:outline-none"
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

            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-text-muted">
                {t('auth.email')}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/60 text-[16px] sm:text-[18px]">mail</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className={`w-full pl-9 sm:pl-11 pr-3 py-3 sm:py-3.5 bg-white border rounded-xl text-xs sm:text-sm text-[#031926] placeholder:text-[#9DBEBB]/60 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all ${isSignUp && availabilityErrors.email ? 'border-red-400' : 'border-[#9DBEBB]/40'}`}
                />
                {isSignUp && checking.email && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-secondary/40 border-t-secondary rounded-full animate-spin" />}
              </div>
              {isSignUp && availabilityErrors.email && (
                <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">error</span>
                  {availabilityErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-text-muted">
                {t('auth.password')}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/60 text-[16px] sm:text-[18px]">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 sm:pl-11 pr-11 py-3 sm:py-3.5 bg-white border border-[#9DBEBB]/40 rounded-xl text-xs sm:text-sm text-[#031926] placeholder:text-[#9DBEBB]/60 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted/60 hover:text-on-background transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {/* Password strength (sign-up only) */}
              {isSignUp && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(n => (
                      <div
                        key={n}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= pwStrength ? pwColors[pwStrength] : 'bg-[#9DBEBB]/20'}`}
                      />
                    ))}
                  </div>
                  {pwStrength > 0 && (
                    <p className={`text-[10px] font-semibold ${pwStrength >= 3 ? 'text-emerald-600' : pwStrength === 2 ? 'text-yellow-600' : 'text-red-500'}`}>
                      Contraseña {pwLabels[pwStrength]}
                    </p>
                  )}
                </div>
              )}
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-outline-variant accent-secondary" />
                  <span className="text-[10px] sm:text-xs text-text-muted">{t('auth.rememberMe')}</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] sm:text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 mt-1 bg-[#031926] hover:bg-[#468189] disabled:opacity-50 text-[#F4E9CD] font-headline font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_20px_rgba(3,25,38,0.3)] hover:shadow-[0_6px_30px_rgba(70,129,137,0.4)] active:scale-[0.98]"
            >
              <>
                <span className="material-symbols-outlined text-base">
                  {isSignUp ? 'person_add' : 'login'}
                </span>
                {loading
                  ? (isSignUp ? t('auth.creatingAccount') : t('auth.signingIn'))
                  : (isSignUp ? t('auth.createFree') : t('auth.login'))}
              </>
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#9DBEBB]/30" />
            <span className="text-[10px] sm:text-xs text-[#468189] font-medium whitespace-nowrap">{t('auth.orContinueWith')}</span>
            <div className="flex-1 h-px bg-[#9DBEBB]/30" />
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            <button className="flex items-center justify-center gap-1.5 py-2.5 sm:py-3 bg-white border border-[#9DBEBB]/30 rounded-xl hover:bg-[#F4E9CD]/50 hover:border-[#9DBEBB]/60 transition-all text-xs font-medium text-[#031926]">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="hidden sm:inline">Google</span>
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2.5 sm:py-3 bg-white border border-[#9DBEBB]/30 rounded-xl hover:bg-[#F4E9CD]/50 hover:border-[#9DBEBB]/60 transition-all text-xs font-medium text-[#031926]">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <span className="hidden sm:inline">Apple</span>
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2.5 sm:py-3 bg-white border border-[#9DBEBB]/30 rounded-xl hover:bg-[#F4E9CD]/50 hover:border-[#9DBEBB]/60 transition-all text-xs font-medium text-[#031926]">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#F25022" d="M1 1h10v10H1z" />
                <path fill="#00A4EF" d="M13 1h10v10H13z" />
                <path fill="#7FBA00" d="M1 13h10v10H1z" />
                <path fill="#FFB900" d="M13 13h10v10H13z" />
              </svg>
              <span className="hidden sm:inline">Microsoft</span>
            </button>
          </div>

          <p className="text-center text-xs sm:text-sm text-text-muted">
            {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}{' '}
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              className="font-semibold text-secondary hover:text-secondary/80 transition-colors"
            >
              {isSignUp ? t('auth.signIn') : t('auth.createFree')}
            </button>
          </p>

          <div className="pt-2 border-t border-outline-variant/15">
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-1.5 text-text-muted hover:text-primary font-medium text-[10px] sm:text-xs py-1.5 transition-colors"
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
