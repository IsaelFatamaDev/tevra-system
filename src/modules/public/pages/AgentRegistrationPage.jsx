import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { agentsService } from '../services/agents.service'
import productsService from '../services/products.service'
import { useFieldAvailability } from '../../../core/hooks/useFieldAvailability'
import LanguageSwitcher from '../../../core/components/LanguageSwitcher'

const COUNTRY_CODES = [
  { code: '+51', flag: '🇵🇪', name: 'Perú' },
  { code: '+1', flag: '🇺🇸', name: 'USA / Canadá' },
  { code: '+52', flag: '🇲🇽', name: 'México' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
]

const PERU_CITIES = [
  'Lima', 'Callao', 'Ventanilla', 'San Juan de Lurigancho', 'San Martín de Porres',
  'Ate', 'Comas', 'Villa El Salvador', 'Villa María del Triunfo', 'Los Olivos',
  'Puente Piedra', 'San Juan de Miraflores', 'Chorrillos', 'Carabayllo', 'Surco',
  'Miraflores', 'San Isidro', 'Lince', 'La Molina', 'Arequipa', 'Trujillo',
  'Chiclayo', 'Piura', 'Cusco', 'Iquitos', 'Huancayo', 'Tacna',
]

export default function AgentRegistrationPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const STEPS = [
    { icon: 'person', label: t('agentRegistration.step1Label') },
    { icon: 'work', label: t('agentRegistration.step2Label') },
    { icon: 'check_circle', label: t('agentRegistration.step3Label') },
  ]

  const [form, setForm] = useState({
    fullName: '',
    dni: '',
    email: '',
    countryCode: '+51',
    whatsapp: '',
    city: '',
    password: '',
    confirmPassword: '',
    categories: [],
    coverageAreas: [],
    motivation: '',
  })

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const fullWhatsapp = form.countryCode + form.whatsapp.replace(/^0+/, '')
  const availabilityFields = useMemo(() => ({
    email: form.email,
    whatsapp: fullWhatsapp,
  }), [form.email, fullWhatsapp])

  const { availabilityErrors, checking } = useFieldAvailability(availabilityFields)

  const generatedUsername = form.fullName.trim()
    ? form.fullName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    : ''

  const toggleCategory = (cat) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat],
    }))
  }

  const toggleCoverage = (zone) => {
    setForm(prev => ({
      ...prev,
      coverageAreas: prev.coverageAreas.includes(zone)
        ? prev.coverageAreas.filter(z => z !== zone)
        : [...prev.coverageAreas, zone],
    }))
  }

  // Validation
  const isChecking = checking.email || checking.whatsapp
  const step1Valid = !isChecking && form.fullName.trim() && /^[A-Z0-9]{8}$/i.test(form.dni.replace(/\s/g, '')) && form.email.includes('@') && form.whatsapp.trim().length >= 6 && form.city.trim() && form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && form.password === form.confirmPassword && !availabilityErrors.email && !availabilityErrors.whatsapp
  const step2Valid = form.categories.length > 0 && form.coverageAreas.length > 0

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')

    // Validations
    if (!form.fullName.trim()) { setError(t('agentRegistration.validationFullName')); setSubmitting(false); return }
    if (!/^[A-Z0-9]{8}$/i.test(form.dni.replace(/\s/g, ''))) { setError(t('agentRegistration.validationId')); setSubmitting(false); return }
    if (!form.email.trim() || !form.email.includes('@')) { setError(t('agentRegistration.validationEmail')); setSubmitting(false); return }
    if (!form.whatsapp.trim() || form.whatsapp.trim().length < 6) { setError(t('agentRegistration.validationWhatsapp')); setSubmitting(false); return }
    if (!form.city.trim()) { setError(t('agentRegistration.validationCity')); setSubmitting(false); return }
    if (form.password.length < 8) { setError(t('agentRegistration.validationPassword8')); setSubmitting(false); return }
    if (!/[A-Z]/.test(form.password)) { setError(t('agentRegistration.validationPasswordUpper')); setSubmitting(false); return }
    if (!/[0-9]/.test(form.password)) { setError(t('agentRegistration.validationPasswordNumber')); setSubmitting(false); return }
    if (form.password !== form.confirmPassword) { setError(t('agentRegistration.validationPasswordMatch')); setSubmitting(false); return }
    if (form.categories.length === 0) { setError(t('agentRegistration.validationCategories')); setSubmitting(false); return }
    if (form.coverageAreas.length === 0) { setError(t('agentRegistration.validationCoverage')); setSubmitting(false); return }

    try {
      const { confirmPassword, countryCode, ...rest } = form
      const fullPhone = countryCode + form.whatsapp.replace(/^0+/, '')
      const submitData = { ...rest, whatsapp: fullPhone, phone: fullPhone }
      await agentsService.submitApplication(submitData)
      setSubmitted(true)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('agentRegistration.submitError'))
    } finally {
      setSubmitting(false)
    }
  }

  const progress = submitted ? 100 : step === 0 ? 25 : 50

  return (
    <div className="min-h-screen" style={{ background: '#F4F6F8' }}>
      <header className="fixed top-0 w-full z-50 bg-[#031926]/95 backdrop-blur-md border-b border-white/10">
        <div className="flex justify-between items-center px-6 py-4 max-w-full mx-auto">
          <button onClick={() => navigate('/')} className="font-headline font-black text-xl text-white tracking-tight">
            Te<span style={{ color: '#77ACA2' }}>Vra</span>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-white/40 font-semibold text-sm hidden sm:block">{t('agentRegistration.stepOf', { current: step + 1, total: 3 })}</span>
            <LanguageSwitcher variant="light" />
          </div>
        </div>
      </header>

      <div className="flex min-h-screen pt-16">
        <aside
          className="hidden lg:flex flex-col w-72 sticky top-16 h-[calc(100vh-64px)] p-8"
          style={{ background: 'linear-gradient(160deg, #031926 0%, #062c3d 50%, #0a3d52 100%)' }}
        >
          <div className="mb-10">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{t('agentRegistration.agentPortal')}</p>
            <h2 className="font-headline font-extrabold text-white text-2xl leading-tight">{t('agentRegistration.onboardingProgress')}</h2>
          </div>

          <nav className="space-y-2 flex-1">
            {STEPS.map((s, i) => {
              const isDone = (i < step || submitted) && i !== step
              const isActive = i === step
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${isActive
                    ? 'bg-white/15 border border-white/20 shadow-lg'
                    : isDone
                      ? 'opacity-70'
                      : 'opacity-40'
                    }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-[#468189]' : isDone ? 'bg-emerald-500/30' : 'bg-white/10'
                    }`}>
                    {isDone
                      ? <span className="material-symbols-outlined text-emerald-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      : <span className="material-symbols-outlined text-white text-lg">{s.icon}</span>
                    }
                  </div>
                  <div>
                    <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-white' : 'text-white/70'}`}>{s.label}</p>
                    {isActive && <p className="text-[10px] text-white/40 mt-0.5">En progreso</p>}
                    {isDone && <p className="text-[10px] text-emerald-400/70 mt-0.5">Completado</p>}
                  </div>
                </div>
              )
            })}
          </nav>

          <div className="mt-auto">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-white/60 uppercase tracking-wider">{t('agentRegistration.progress')}</span>
                <span className="text-sm font-black text-white">{progress}%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #468189, #77ACA2)' }} />
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 sm:px-8 md:px-12 py-10">
          {step === 0 && <Step1 form={form} set={set} onNext={() => setStep(1)} valid={step1Valid} generatedUsername={generatedUsername} availabilityErrors={availabilityErrors} checking={checking} isChecking={isChecking} />}
          {step === 1 && !submitted && (
            <Step2
              form={form}
              toggleCategory={toggleCategory}
              toggleCoverage={toggleCoverage}
              set={set}
              onBack={() => setStep(0)}
              onSubmit={handleSubmit}
              submitting={submitting}
              error={error}
              valid={step2Valid}
            />
          )}
          {step === 2 && submitted && <Step3 onBack={() => navigate('/catalogo')} />}
        </main>
      </div>
    </div>
  )
}

/* =========== STEP 1: Personal Info =========== */
function Step1({ form, set, onNext, valid, generatedUsername, availabilityErrors, checking, isChecking }) {
  const { t } = useTranslation()
  const [citySuggestions, setCitySuggestions] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const cityRef = useRef(null)

  const handleCityInput = (value) => {
    set('city', value)
    if (value.trim().length >= 1) {
      const filtered = PERU_CITIES.filter(c => c.toLowerCase().includes(value.toLowerCase()))
      setCitySuggestions(filtered.slice(0, 6))
    } else {
      setCitySuggestions([])
    }
  }

  const inputCls = (hasError) =>
    `w-full px-4 py-3 rounded-xl border text-sm text-on-background placeholder:text-text-muted/50 bg-white focus:outline-none focus:ring-2 transition-all ${hasError
      ? 'border-red-400 focus:ring-red-200'
      : 'border-gray-200 focus:ring-[#468189]/20 focus:border-[#468189]'
    }`

  return (
    <>
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#468189]/10 border border-[#468189]/20 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#468189]" />
          <span className="text-[#468189] text-[11px] font-bold uppercase tracking-widest">Paso 1 de 3</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#031926] tracking-tight mb-3">
          {t('agentRegistration.step1Title')}
        </h1>
        <p className="text-base text-gray-500 max-w-xl leading-relaxed">
          {t('agentRegistration.step1Subtitle')}
        </p>
      </div>

      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
            <div className="w-9 h-9 rounded-xl bg-[#031926] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">id_card</span>
            </div>
            <h3 className="font-bold text-[#031926] text-base">{t('agentRegistration.basicIdentity')}</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('agentRegistration.fullName')}</label>
              <input
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                className={inputCls(false)}
                placeholder={t('agentRegistration.fullNamePlaceholder')}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('agentRegistration.idNumber')}</label>
              <input
                value={form.dni}
                onChange={(e) => set('dni', e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8))}
                className={inputCls(form.dni && !/^[A-Z0-9]{8}$/.test(form.dni))}
                placeholder="Ej: A1234567"
                maxLength={8}
                type="text"
                autoCapitalize="characters"
              />
              {form.dni && !/^[A-Z0-9]{8}$/.test(form.dni) && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">error</span>
                  Exactamente 8 caracteres alfanuméricos
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600 text-[18px]">contact_page</span>
              </div>
              <h3 className="font-bold text-[#031926] text-base">{t('agentRegistration.contact')}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('agentRegistration.emailLabel')}</label>
                <div className="relative">
                  <input
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    className={inputCls(availabilityErrors.email)}
                    placeholder={t('agentRegistration.emailPlaceholder')}
                    type="email"
                  />
                  {checking.email && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-[#468189]/30 border-t-[#468189] rounded-full animate-spin" />}
                </div>
                {availabilityErrors.email && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">error</span>
                    {availabilityErrors.email}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t('agentRegistration.whatsappLabel')}
                  <span className="ml-1.5 text-[10px] font-semibold text-[#468189] normal-case tracking-normal">· también tu teléfono de contacto</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.countryCode}
                    onChange={(e) => set('countryCode', e.target.value)}
                    className="px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold text-[#031926] focus:outline-none focus:ring-2 focus:ring-[#468189]/20 focus:border-[#468189] transition-all shrink-0"
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <input
                      value={form.whatsapp}
                      onChange={(e) => set('whatsapp', e.target.value.replace(/[^0-9 ]/g, '').slice(0, 15))}
                      className={inputCls(availabilityErrors.whatsapp)}
                      placeholder="999 123 456"
                      type="tel"
                    />
                    {checking.whatsapp && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-[#468189]/30 border-t-[#468189] rounded-full animate-spin" />}
                  </div>
                </div>
                {availabilityErrors.whatsapp && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">error</span>
                    {availabilityErrors.whatsapp}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-[18px]">location_on</span>
              </div>
              <h3 className="font-bold text-[#031926] text-base">{t('agentRegistration.operationCity')}</h3>
            </div>
            <div className="p-6">
              <div className="space-y-1.5 relative" ref={cityRef}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('agentRegistration.operationCity')}</label>
                <input
                  value={form.city}
                  onChange={(e) => handleCityInput(e.target.value)}
                  onBlur={() => setTimeout(() => setCitySuggestions([]), 200)}
                  className={inputCls(false)}
                  placeholder="Ej: Lima, Callao, Ventanilla..."
                  autoComplete="off"
                />
                {citySuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden mt-1">
                    {citySuggestions.map(city => (
                      <button
                        key={city}
                        type="button"
                        onMouseDown={() => { set('city', city); setCitySuggestions([]) }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#031926] hover:bg-gray-50 transition-colors text-left"
                      >
                        <span className="material-symbols-outlined text-sm text-[#468189]">location_on</span>
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-3 text-xs text-gray-400">{t('agentRegistration.operationCityHint')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-600 text-[18px]">lock</span>
            </div>
            <h3 className="font-bold text-[#031926] text-base">{t('agentRegistration.accessCredentials')}</h3>
          </div>
          <div className="p-6 space-y-5">
            {generatedUsername && (
              <div className="p-4 bg-[#468189]/5 rounded-xl border border-[#468189]/15 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#468189] text-xl">alternate_email</span>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('agentRegistration.yourUserWillBe')}</p>
                  <p className="font-bold text-[#031926] font-mono text-sm mt-0.5">{form.email || generatedUsername}</p>
                </div>
              </div>
            )}

            {/* Password input + strength */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('agentRegistration.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  className={inputCls(false) + ' pr-12'}
                  placeholder={t('agentRegistration.passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#468189] transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>

              {/* Strength bar */}
              {form.password.length > 0 && (() => {
                const reqs = [form.password.length >= 8, /[A-Z]/.test(form.password), /[0-9]/.test(form.password)]
                const met = reqs.filter(Boolean).length
                const barColor = met === 1 ? 'bg-red-400' : met === 2 ? 'bg-amber-400' : 'bg-emerald-500'
                const label = met === 1 ? t('agentRegistration.passwordStrengthWeak') : met === 2 ? t('agentRegistration.passwordStrengthMedium') : t('agentRegistration.passwordStrengthStrong')
                const labelColor = met === 1 ? 'text-red-500' : met === 2 ? 'text-amber-500' : 'text-emerald-600'
                return (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < met ? barColor : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className={`text-[11px] font-bold ${labelColor}`}>{t('agentRegistration.passwordStrengthLabel', { level: label })}</p>
                  </div>
                )
              })()}
            </div>

            {/* Requirements grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { ok: form.password.length >= 8, icon: 'pin', label: t('agentRegistration.passwordReq8') },
                { ok: /[A-Z]/.test(form.password), icon: 'title', label: t('agentRegistration.passwordReqUpper') },
                { ok: /[0-9]/.test(form.password), icon: 'tag', label: t('agentRegistration.passwordReqNumber') },
              ].map(({ ok, icon, label }) => (
                <div key={label} className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-200 ${ok ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                  <span className={`material-symbols-outlined text-[22px] transition-colors ${ok ? 'text-emerald-500' : 'text-gray-400'}`} style={{ fontVariationSettings: ok ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
                  <p className={`text-[11px] font-bold text-center leading-tight ${ok ? 'text-emerald-700' : 'text-gray-400'}`}>{label}</p>
                </div>
              ))}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('agentRegistration.confirmPassword')}</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                  className={inputCls(form.confirmPassword && form.password !== form.confirmPassword) + ' pr-12'}
                  placeholder={t('agentRegistration.confirmPasswordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#468189] transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">error</span>
                  {t('agentRegistration.passwordsDontMatch')}
                </p>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && form.password.length >= 8 && (
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                  {t('agentRegistration.passwordsMatch')}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
          <span className="material-symbols-outlined text-emerald-600 text-3xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <div>
            <h4 className="font-bold text-[#031926] text-sm">{t('agentRegistration.dataProtected')}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{t('agentRegistration.dataProtectedDesc')}</p>
          </div>
        </div>

        <div className="pt-4 flex justify-between items-center gap-4">
          <button type="button" onClick={() => window.history.back()} className="text-sm text-gray-400 font-semibold hover:text-[#031926] transition-colors">
            {t('agentRegistration.cancel')}
          </button>
          <button
            type="button"
            disabled={!valid || isChecking}
            onClick={onNext}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: !valid || isChecking ? undefined : 'linear-gradient(135deg, #031926 0%, #0a3d52 100%)', color: 'white' }}
          >
            {isChecking ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {t('agentRegistration.checkingAvailability')}
              </>
            ) : (
              <>
                {t('agentRegistration.next')}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}

/* =========== STEP 2: Professional Profile =========== */
function Step2({ form, toggleCategory, toggleCoverage, set, onBack, onSubmit, submitting, error, valid }) {
  const { t } = useTranslation()
  const [apiCategories, setApiCategories] = useState([])
  const [zoneInput, setZoneInput] = useState('')

  useEffect(() => {
    productsService.getCategories()
      .then(data => {
        const cats = Array.isArray(data) ? data : data?.items || []
        setApiCategories(cats.map(c => c.name))
      })
      .catch(() => setApiCategories(['Electronics', 'Fashion', 'Apple', 'Beauty', 'Home']))
  }, [])

  const addZone = () => {
    const zone = zoneInput.trim()
    if (zone && !form.coverageAreas.includes(zone)) {
      set('coverageAreas', [...form.coverageAreas, zone])
    }
    setZoneInput('')
  }

  const removeZone = (zone) => {
    set('coverageAreas', form.coverageAreas.filter(z => z !== zone))
  }

  return (
    <>
      {/* Page header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#468189]/10 border border-[#468189]/20 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#468189]" />
          <span className="text-[#468189] text-[11px] font-bold uppercase tracking-widest">Paso 2 de 3</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#031926] tracking-tight mb-3">{t('agentRegistration.step2Title')}</h1>
        <p className="text-base text-gray-500 max-w-xl leading-relaxed">{t('agentRegistration.step2Subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-5">
          {/* Categories */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-violet-600 text-[18px]">category</span>
              </div>
              <h3 className="font-bold text-[#031926] text-base">{t('agentRegistration.categoriesLabel')}</h3>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-3">
              {apiCategories.map((cat) => (
                <label
                  key={cat}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${form.categories.includes(cat)
                    ? 'border-[#468189] bg-[#468189]/5 ring-1 ring-[#468189]/30'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${form.categories.includes(cat) ? 'bg-[#468189] border-[#468189]' : 'border-gray-300'
                    }`}>
                    {form.categories.includes(cat) && <span className="material-symbols-outlined text-white text-[11px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>check</span>}
                  </div>
                  <input type="checkbox" checked={form.categories.includes(cat)} onChange={() => toggleCategory(cat)} className="sr-only" />
                  <span className="text-sm font-semibold text-[#031926]">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Coverage */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
              <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-sky-600 text-[18px]">map</span>
              </div>
              <h3 className="font-bold text-[#031926] text-base">{t('agentRegistration.coverageZones')}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <input
                  value={zoneInput}
                  onChange={(e) => setZoneInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addZone() } }}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#031926] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#468189]/20 focus:border-[#468189] transition-all"
                  placeholder={t('agentRegistration.zoneInputPlaceholder')}
                />
                <button
                  type="button"
                  onClick={addZone}
                  className="px-5 py-3 rounded-xl font-bold text-sm text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #031926 0%, #0a3d52 100%)' }}
                >
                  {t('agentRegistration.addZone')}
                </button>
              </div>
              {form.coverageAreas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.coverageAreas.map((zone) => (
                    <span key={zone} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-[#031926] text-white">
                      <span className="material-symbols-outlined text-[13px] text-secondary-light">location_on</span>
                      {zone}
                      <button type="button" onClick={() => removeZone(zone)} className="ml-1 hover:text-red-300 transition-colors">
                        <span className="material-symbols-outlined text-[13px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400">{t('agentRegistration.zonesHint')}</p>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600 text-[18px]">edit_note</span>
              </div>
              <h3 className="font-bold text-[#031926] text-base">{t('agentRegistration.bioLabel')}</h3>
            </div>
            <div className="p-6">
              <textarea
                value={form.motivation}
                onChange={(e) => set('motivation', e.target.value.slice(0, 500))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#031926] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#468189]/20 focus:border-[#468189] transition-all resize-none"
                placeholder={t('agentRegistration.bioPlaceholder')}
                rows={5}
              />
              <div className="flex justify-end mt-2">
                <span className={`text-xs font-semibold ${form.motivation.length > 450 ? 'text-amber-500' : 'text-gray-400'}`}>
                  {form.motivation.length} / 500 {t('agentRegistration.characters')}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-semibold">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex justify-between items-center gap-4">
            <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 font-semibold hover:text-[#031926] transition-colors">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              {t('agentRegistration.back')}
            </button>
            <button
              type="button"
              disabled={!valid || submitting}
              onClick={onSubmit}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-white transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: !valid || submitting ? '#9ca3af' : 'linear-gradient(135deg, #031926 0%, #0a3d52 100%)' }}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {t('agentRegistration.submitting')}
                </>
              ) : (
                <>
                  {t('agentRegistration.submitApplication')}
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tips sidebar */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="px-6 py-5" style={{ background: 'linear-gradient(160deg, #031926 0%, #062c3d 100%)' }}>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-secondary-light text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              </div>
              <h3 className="font-bold text-white text-lg">{t('agentRegistration.tipsTitle')}</h3>
              <p className="text-white/40 text-xs mt-1">Para maximizar tu perfil</p>
            </div>
            <div className="bg-white p-6 space-y-5">
              {[
                { num: '01', title: t('agentRegistration.tip1Title'), desc: t('agentRegistration.tip1Desc') },
                { num: '02', title: t('agentRegistration.tip2Title'), desc: t('agentRegistration.tip2Desc') },
                { num: '03', title: t('agentRegistration.tip3Title'), desc: t('agentRegistration.tip3Desc') },
              ].map(({ num, title, desc }) => (
                <div key={num} className="flex gap-4">
                  <span className="text-[#468189] font-black text-lg shrink-0">{num}</span>
                  <div>
                    <p className="font-bold text-[#031926] text-sm mb-1">{title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* =========== STEP 3: Confirmation =========== */
function Step3({ onBack }) {
  const { t } = useTranslation()

  const nextSteps = [
    t('agentRegistration.nextStep1'),
    t('agentRegistration.nextStep2'),
    t('agentRegistration.nextStep3'),
  ]

  return (
    <>
      <div className="mb-10 text-center">
        <div className="inline-flex w-20 h-20 rounded-full items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #031926 0%, #0a3d52 100%)' }}>
          <span className="material-symbols-outlined text-5xl text-secondary-light" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#031926] tracking-tight mb-3">
          {t('agentRegistration.successTitle')}
        </h1>
        <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed">
          {t('agentRegistration.successDesc')}
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-4">
        {/* Status card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="font-bold text-[#031926] text-base">{t('agentRegistration.applicationStatus')}</h2>
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest">{t('agentRegistration.statusPending')}</span>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <span className="material-symbols-outlined text-amber-500 mt-0.5">schedule</span>
              <div>
                <p className="font-bold text-[#031926] text-sm">{t('agentRegistration.statusInReview')}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t('agentRegistration.reviewTime')}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#031926] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#468189] inline-block" />
                {t('agentRegistration.nextSteps')}
              </h3>
              <div className="space-y-3">
                {nextSteps.map((stepLabel, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${i === 0 ? 'bg-[#031926] text-white' : 'bg-gray-100 text-gray-400'
                      }`}>{i + 1}</div>
                    <p className={`text-sm font-semibold flex-1 ${i === 0 ? 'text-[#031926]' : 'text-gray-400'}`}>{stepLabel}</p>
                    <span className="material-symbols-outlined text-sm text-gray-300">{i === 0 ? 'done' : 'hourglass_empty'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg"
          style={{ background: 'linear-gradient(135deg, #031926 0%, #0a3d52 100%)' }}
        >
          {t('agentRegistration.backToCatalog')}
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </>
  )
}
