import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Panel izquierdo - Branding (desktop) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 hero-gradient relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-grid-pattern opacity-15" />

        {/* Esferas decorativas */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-secondary/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-md h-112 bg-mint/8 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-10 w-48 h-48 bg-accent-gold/6 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col items-center gap-10 px-12 text-center max-w-lg">
          {/* Logo con fondo circular grande */}
          <div className="w-44 h-44 xl:w-52 xl:h-52 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center shadow-[0_0_100px_rgba(255,107,107,0.2)] animate-[scale-in_0.8s_ease-out]">
            <img
              src="/LogoTevra.png"
              alt="TeVra"
              className="w-28 h-28 xl:w-36 xl:h-36 object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]"
            />
          </div>

          <div className="animate-[fade-up_0.8s_ease-out_0.2s_both]">
            <h1 className="font-headline text-5xl xl:text-6xl font-extrabold text-white tracking-tighter">
              Te<span className="text-secondary">Vra</span>
            </h1>
            <p className="mt-3 text-white/40 text-xs font-semibold uppercase tracking-[0.35em]">
              Importaciones Premium desde USA
            </p>
          </div>

          {/* Beneficios */}
          <div className="mt-4 space-y-5 w-full animate-[fade-up_0.8s_ease-out_0.5s_both]">
            <div className="flex items-center gap-4 text-left glass-card rounded-xl px-5 py-4">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary text-lg">verified</span>
              </div>
              <p className="text-white/70 text-sm leading-snug">Productos 100% originales importados desde Estados Unidos</p>
            </div>
            <div className="flex items-center gap-4 text-left glass-card rounded-xl px-5 py-4">
              <div className="w-10 h-10 rounded-full bg-mint/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-mint text-lg">local_shipping</span>
              </div>
              <p className="text-white/70 text-sm leading-snug">Seguimiento en tiempo real de puerta a puerta</p>
            </div>
            <div className="flex items-center gap-4 text-left glass-card rounded-xl px-5 py-4">
              <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-accent-gold text-lg">support_agent</span>
              </div>
              <p className="text-white/70 text-sm leading-snug">Red de agentes certificados con atención personalizada</p>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-[55%] xl:w-1/2 flex flex-col justify-center items-center px-5 py-10 sm:px-8 md:px-16 bg-background-cream min-h-screen">
        <div className="w-full max-w-md space-y-7">
          {/* Logo móvil con fondo circular */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-2">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-primary/8 border border-primary/10 flex items-center justify-center shadow-[0_0_50px_rgba(10,37,64,0.08)]">
              <img src="/LogoTevra.png" alt="TeVra" className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
            </div>
            <h1 className="font-headline text-2xl font-extrabold text-primary tracking-tighter">
              Te<span className="text-secondary">Vra</span>
            </h1>
          </div>

          {/* Encabezado */}
          <div className="text-center lg:text-left">
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-on-background">
              {isSignUp ? 'Crea tu cuenta' : 'Bienvenido de vuelta'}
            </h2>
            <p className="mt-1.5 text-text-muted text-sm">
              {isSignUp
                ? 'Regístrate para acceder a productos exclusivos'
                : 'Ingresa tus credenciales para continuar'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-surface-container-low p-1 rounded-2xl">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2.5 rounded-xl font-headline font-bold text-sm transition-all ${!isSignUp
                  ? 'bg-surface-container-lowest text-primary shadow-soft'
                  : 'text-text-muted hover:text-primary'
                }`}
            >
              Ingresar
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2.5 rounded-xl font-headline font-bold text-sm transition-all ${isSignUp
                  ? 'bg-surface-container-lowest text-primary shadow-soft'
                  : 'text-text-muted hover:text-primary'
                }`}
            >
              Crear cuenta
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Nombre completo
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/60 text-[18px]">person</span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Carlos Mendez"
                    className="w-full pl-11 pr-4 py-3.5 bg-surface border border-outline-variant/30 rounded-xl text-sm text-on-background placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Correo electrónico
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/60 text-[18px]">mail</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-surface border border-outline-variant/30 rounded-xl text-sm text-on-background placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Contraseña
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/60 text-[18px]">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 bg-surface border border-outline-variant/30 rounded-xl text-sm text-on-background placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted/60 hover:text-on-background transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-outline-variant accent-secondary" />
                  <span className="text-xs text-text-muted">Recordarme</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-secondary hover:bg-secondary/90 disabled:opacity-50 text-white font-headline font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_20px_rgba(255,107,107,0.3)] hover:shadow-[0_6px_30px_rgba(255,107,107,0.4)] active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">
                    {isSignUp ? 'person_add' : 'login'}
                  </span>
                  {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-outline-variant/25" />
            <span className="text-xs text-text-muted font-medium">o continúa con</span>
            <div className="flex-1 h-px bg-outline-variant/25" />
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2.5 py-3 bg-surface border border-outline-variant/25 rounded-xl hover:bg-surface-container-low hover:border-outline-variant/40 transition-all text-sm font-medium text-on-background">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2.5 py-3 bg-surface border border-outline-variant/25 rounded-xl hover:bg-surface-container-low hover:border-outline-variant/40 transition-all text-sm font-medium text-on-background">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Apple
            </button>
          </div>

          {/* Toggle link */}
          <p className="text-center text-sm text-text-muted">
            {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-semibold text-secondary hover:text-secondary/80 transition-colors"
            >
              {isSignUp ? 'Inicia sesión' : 'Crear cuenta gratis'}
            </button>
          </p>

          {/* Volver al inicio */}
          <div className="pt-3 border-t border-outline-variant/15">
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 text-text-muted hover:text-primary font-medium text-xs py-2 transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
