import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { agentsService } from '../services/agents.service'
import productsService from '../services/products.service'
import { useFieldAvailability } from '../../../core/hooks/useFieldAvailability'

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
  const step1Valid = !isChecking && form.fullName.trim() && /^[0-9]{8,12}$/.test(form.dni.replace(/\s/g, '')) && form.email.includes('@') && form.whatsapp.trim().length >= 6 && form.city.trim() && form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && form.password === form.confirmPassword && !availabilityErrors.email && !availabilityErrors.whatsapp
  const step2Valid = form.categories.length > 0 && form.coverageAreas.length > 0

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')

    // Validations
    if (!form.fullName.trim()) { setError(t('agentRegistration.validationFullName')); setSubmitting(false); return }
    if (!/^[0-9]{8,12}$/.test(form.dni.replace(/\s/g, ''))) { setError(t('agentRegistration.validationId')); setSubmitting(false); return }
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
      const submitData = { ...rest, whatsapp: countryCode + form.whatsapp.replace(/^0+/, '') }
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
    <div className="min-h-screen bg-surface-container-low">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 max-w-full mx-auto">
          <button onClick={() => navigate('/')} className="text-2xl font-bold text-on-background tracking-tight">TeVra</button>
          <span className="text-text-muted font-semibold text-sm">{t('agentRegistration.stepOf', { current: step + 1, total: 3 })}</span>
        </div>
      </header>

      <div className="flex min-h-screen pt-20">
        {/* Sidebar */}
        <aside className="h-[calc(100vh-80px)] w-64 border-r border-outline-variant bg-white hidden lg:flex flex-col p-6 space-y-2 sticky top-20">
          <div className="mb-8">
            <h2 className="font-bold text-on-background text-xl">{t('agentRegistration.agentPortal')}</h2>
            <p className="text-text-muted text-xs uppercase tracking-wider">{t('agentRegistration.onboardingProgress')}</p>
          </div>

          <nav className="space-y-1">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${i === step
                  ? 'bg-primary text-white font-medium shadow-md'
                  : i < step || submitted
                    ? 'text-text-muted'
                    : 'text-outline'
                  }`}
              >
                <span className="material-symbols-outlined text-xl">{s.icon}</span>
                <span className="text-sm">{s.label}</span>
                {(i < step || submitted) && i !== step && (
                  <span className="material-symbols-outlined text-green-500 ml-auto text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                )}
              </div>
            ))}
          </nav>

          <div className="mt-auto p-4 bg-surface-container-low rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-on-background">{t('agentRegistration.progress')}</span>
              <span className="text-xs font-bold text-on-background">{progress}%</span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-6 md:px-12 py-12 max-w-4xl mx-auto">
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

  return (
    <>
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-on-background tracking-tight mb-4">
          {t('agentRegistration.step1Title')}
        </h1>
        <p className="text-lg text-text-muted max-w-2xl leading-relaxed">
          {t('agentRegistration.step1Subtitle')}
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Identity */}
        <div className="p-8 rounded-xl bg-white border border-outline-variant shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2 bg-surface-container rounded-lg">
              <span className="material-symbols-outlined text-on-background">id_card</span>
            </span>
            <h3 className="text-xl font-bold text-on-background">{t('agentRegistration.basicIdentity')}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-background">{t('agentRegistration.fullName')}</label>
              <input
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-gray-900 focus:ring-0 px-4 py-3 rounded-t-lg transition-all outline-none"
                placeholder={t('agentRegistration.fullNamePlaceholder')}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-background">{t('agentRegistration.idNumber')}</label>
              <input
                value={form.dni}
                onChange={(e) => set('dni', e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-gray-900 focus:ring-0 px-4 py-3 rounded-t-lg transition-all outline-none"
                placeholder={t('agentRegistration.idPlaceholder')}
                maxLength={8}
                type="text"
                inputMode="numeric"
              />
              {form.dni && form.dni.length !== 8 && (
                <p className="text-xs text-red-500 font-medium mt-1">{t('agentRegistration.idError')}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact */}
          <div className="p-8 rounded-xl bg-white border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="p-2 bg-amber-50 rounded-lg">
                <span className="material-symbols-outlined text-amber-700">contact_page</span>
              </span>
              <h3 className="text-xl font-bold text-on-background">{t('agentRegistration.contact')}</h3>
            </div>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-background uppercase tracking-wide">{t('agentRegistration.emailLabel')}</label>
                <div className="relative">
                  <input
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    className={`w-full bg-white border-b-2 focus:ring-0 px-4 py-3 rounded-t-lg transition-all outline-none ${availabilityErrors.email ? 'border-red-400' : 'border-outline-variant focus:border-gray-900'}`}
                    placeholder={t('agentRegistration.emailPlaceholder')}
                    type="email"
                  />
                  {checking.email && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />}
                </div>
                {availabilityErrors.email && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {availabilityErrors.email}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-background uppercase tracking-wide">{t('agentRegistration.whatsappLabel')}</label>
                <div className="relative flex gap-2">
                  <select
                    value={form.countryCode}
                    onChange={(e) => set('countryCode', e.target.value)}
                    className="bg-white border-b-2 border-outline-variant focus:border-gray-900 focus:ring-0 px-2 py-3 rounded-t-lg transition-all outline-none text-sm font-bold text-on-background shrink-0"
                    style={{ minWidth: '100px' }}
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <input
                      value={form.whatsapp}
                      onChange={(e) => set('whatsapp', e.target.value.replace(/[^0-9 ]/g, '').slice(0, 15))}
                      className={`w-full bg-white border-b-2 focus:ring-0 px-4 py-3 rounded-t-lg transition-all outline-none ${availabilityErrors.whatsapp ? 'border-red-400' : 'border-outline-variant focus:border-gray-900'}`}
                      placeholder="999 123 456"
                      type="tel"
                    />
                    {checking.whatsapp && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />}
                  </div>
                </div>
                {availabilityErrors.whatsapp && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {availabilityErrors.whatsapp}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* City */}
          <div className="p-8 rounded-xl bg-white border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="p-2 bg-red-50 rounded-lg">
                <span className="material-symbols-outlined text-red-500">location_on</span>
              </span>
              <h3 className="text-xl font-bold text-on-background">{t('agentRegistration.operationCity')}</h3>
            </div>
            <div className="space-y-1.5 relative" ref={cityRef}>
              <input
                value={form.city}
                onChange={(e) => handleCityInput(e.target.value)}
                onBlur={() => setTimeout(() => setCitySuggestions([]), 200)}
                className="w-full bg-white border-b-2 border-outline-variant focus:border-gray-900 focus:ring-0 px-4 py-3 rounded-t-lg transition-all outline-none"
                placeholder="Ej: Lima, Callao, Ventanilla..."
                autoComplete="off"
              />
              {citySuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 bg-white border border-outline-variant rounded-xl shadow-xl overflow-hidden mt-1">
                  {citySuggestions.map(city => (
                    <button
                      key={city}
                      type="button"
                      onMouseDown={() => { set('city', city); setCitySuggestions([]) }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-on-background hover:bg-surface-container-low transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-sm text-outline">location_on</span>
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-4 text-xs text-outline">{t('agentRegistration.operationCityHint')}</p>
          </div>
        </div>

        {/* Account Credentials */}
        <div className="p-8 rounded-xl bg-white border border-outline-variant shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2 bg-indigo-50 rounded-lg">
              <span className="material-symbols-outlined text-indigo-700">lock</span>
            </span>
            <h3 className="text-xl font-bold text-on-background">{t('agentRegistration.accessCredentials')}</h3>
          </div>
          {generatedUsername && (
            <div className="mb-6 p-4 bg-surface-container-low rounded-xl border border-gray-100">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-1">{t('agentRegistration.yourUserWillBe')}</p>
              <p className="text-lg font-bold text-on-background font-mono">{form.email || generatedUsername}</p>
              <p className="text-xs text-outline mt-1">{t('agentRegistration.loginWithEmail')}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-background">{t('agentRegistration.password')}</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-gray-900 focus:ring-0 px-4 py-3 rounded-t-lg transition-all outline-none"
                placeholder={t('agentRegistration.passwordPlaceholder')}
              />
              <div className="flex gap-2 mt-2">
                <span className={`text-xs ${form.password.length >= 8 ? 'text-emerald-600' : 'text-outline'}`}>{t('agentRegistration.passwordReq8')}</span>
                <span className={`text-xs ${/[A-Z]/.test(form.password) ? 'text-emerald-600' : 'text-outline'}`}>{t('agentRegistration.passwordReqUpper')}</span>
                <span className={`text-xs ${/[0-9]/.test(form.password) ? 'text-emerald-600' : 'text-outline'}`}>{t('agentRegistration.passwordReqNumber')}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-background">{t('agentRegistration.confirmPassword')}</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => set('confirmPassword', e.target.value)}
                className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-gray-900 focus:ring-0 px-4 py-3 rounded-t-lg transition-all outline-none"
                placeholder={t('agentRegistration.confirmPasswordPlaceholder')}
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{t('agentRegistration.passwordsDontMatch')}</p>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && form.password.length >= 8 && (
                <p className="text-xs text-emerald-600 mt-1">{t('agentRegistration.passwordsMatch')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Trust section */}
        <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100">
          <span className="material-symbols-outlined text-emerald-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <div>
            <h4 className="font-bold text-on-background">{t('agentRegistration.dataProtected')}</h4>
            <p className="text-sm text-text-muted">
              {t('agentRegistration.dataProtectedDesc')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-8 flex justify-end items-center gap-6">
          <button type="button" onClick={() => window.history.back()} className="text-on-background font-bold hover:underline">
            {t('agentRegistration.cancel')}
          </button>
          <button
            type="button"
            disabled={!valid || isChecking}
            onClick={onNext}
            className="bg-primary text-white px-12 py-4 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isChecking ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                {t('agentRegistration.next')}
                <span className="material-symbols-outlined">arrow_forward</span>
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-7">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-on-background tracking-tight mb-3">{t('agentRegistration.step2Title')}</h1>
          <p className="text-text-muted text-lg leading-relaxed">{t('agentRegistration.step2Subtitle')}</p>
        </div>

        <div className="space-y-10">
          {/* Categories */}
          <div className="space-y-4">
            <label className="block font-bold text-on-background text-sm uppercase tracking-wider">{t('agentRegistration.categoriesLabel')}</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {apiCategories.map((cat) => (
                <label
                  key={cat}
                  className={`flex items-center p-4 rounded-xl bg-white border cursor-pointer transition-all ${form.categories.includes(cat) ? 'border-gray-900 ring-1 ring-gray-900' : 'border-outline-variant hover:border-gray-400'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={form.categories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="rounded text-on-background focus:ring-gray-900 mr-3 border-gray-300"
                  />
                  <span className="text-sm font-medium text-on-background">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Coverage Zones — free text with tags */}
          <div className="space-y-4">
            <label className="block font-bold text-on-background text-sm uppercase tracking-wider">{t('agentRegistration.coverageZones')}</label>
            <div className="flex gap-2">
              <input
                value={zoneInput}
                onChange={(e) => setZoneInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addZone() } }}
                className="flex-1 bg-white border-b-2 border-outline-variant focus:border-gray-900 focus:ring-0 px-4 py-3 rounded-t-lg transition-all outline-none text-sm"
                placeholder={t('agentRegistration.zoneInputPlaceholder')}
              />
              <button type="button" onClick={addZone} className="px-4 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">{t('agentRegistration.addZone')}</button>
            </div>
            {form.coverageAreas.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.coverageAreas.map((zone) => (
                  <span key={zone} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-full text-sm font-medium">
                    {zone}
                    <button type="button" onClick={() => removeZone(zone)} className="ml-1 hover:text-red-300 transition-colors">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-outline">{t('agentRegistration.zonesHint')}</p>
          </div>

          {/* Bio */}
          <div className="space-y-4">
            <label className="block font-bold text-on-background text-sm uppercase tracking-wider">{t('agentRegistration.bioLabel')}</label>
            <textarea
              value={form.motivation}
              onChange={(e) => set('motivation', e.target.value.slice(0, 500))}
              className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-gray-900 rounded-t-xl p-4 focus:ring-0 text-on-background placeholder:text-outline outline-none"
              placeholder={t('agentRegistration.bioPlaceholder')}
              rows={5}
            />
            <div className="flex justify-end">
              <span className="text-xs text-outline">{form.motivation.length} / 500 {t('agentRegistration.characters')}</span>
            </div>
          </div>

          {error && <p className="text-red-600 font-medium">{error}</p>}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-8">
            <button
              type="button"
              disabled={!valid || submitting}
              onClick={onSubmit}
              className="w-full sm:w-auto px-10 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? t('agentRegistration.submitting') : t('agentRegistration.submitApplication')}
            </button>
            <button type="button" onClick={onBack} className="w-full sm:w-auto px-10 py-4 text-on-background font-bold hover:underline">
              {t('agentRegistration.back')}
            </button>
          </div>
        </div>
      </div>

      {/* Tips Sidebar */}
      <div className="lg:col-span-5">
        <div className="sticky top-32">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-primary text-white flex items-center justify-center rounded-2xl mb-6">
              <span className="material-symbols-outlined">lightbulb</span>
            </div>
            <h3 className="font-bold text-2xl text-on-background mb-4">{t('agentRegistration.tipsTitle')}</h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <span className="text-red-500 font-bold text-xl">01</span>
                <div>
                  <p className="font-bold text-on-background mb-1">{t('agentRegistration.tip1Title')}</p>
                  <p className="text-text-muted text-sm leading-relaxed">{t('agentRegistration.tip1Desc')}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-red-500 font-bold text-xl">02</span>
                <div>
                  <p className="font-bold text-on-background mb-1">{t('agentRegistration.tip2Title')}</p>
                  <p className="text-text-muted text-sm leading-relaxed">{t('agentRegistration.tip2Desc')}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-red-500 font-bold text-xl">03</span>
                <div>
                  <p className="font-bold text-on-background mb-1">{t('agentRegistration.tip3Title')}</p>
                  <p className="text-text-muted text-sm leading-relaxed">{t('agentRegistration.tip3Desc')}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      {/* Left — Celebration */}
      <div className="lg:col-span-5 text-center lg:text-left space-y-6">
        <div className="w-24 h-24 lg:w-32 lg:h-32 bg-emerald-50 rounded-full flex items-center justify-center mx-auto lg:mx-0 shadow-sm border border-emerald-100/50">
          <span className="material-symbols-outlined text-6xl lg:text-7xl text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-extrabold text-on-background leading-tight tracking-tight">
          {t('agentRegistration.successTitle')}
        </h1>
        <p className="text-text-muted text-lg max-w-md mx-auto lg:mx-0">
          {t('agentRegistration.successDesc')}
        </p>
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-surface-container rounded-full border border-outline-variant">
          <span className="material-symbols-outlined text-blue-400 text-xl">verified</span>
          <span className="text-sm font-medium text-on-background uppercase tracking-wide">{t('agentRegistration.adminReview')}</span>
        </div>
      </div>

      {/* Right — Status Card */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-on-background">{t('agentRegistration.applicationStatus')}</h2>
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{t('agentRegistration.statusPending')}</span>
          </div>

          <div className="flex items-start gap-4 p-4 bg-surface-container-low rounded-xl border border-gray-100">
            <span className="material-symbols-outlined text-amber-500 mt-1">schedule</span>
            <div>
              <p className="font-bold text-on-background">{t('agentRegistration.statusInReview')}</p>
              <p className="text-sm text-text-muted">{t('agentRegistration.reviewTime')}</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-8 space-y-6">
            <h3 className="text-lg font-bold text-on-background border-l-4 border-red-400 pl-4">{t('agentRegistration.nextSteps')}</h3>
            <div className="space-y-4">
              {nextSteps.map((stepLabel, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</div>
                  <div className="flex-1 border-b border-gray-100 pb-2">
                    <p className="text-gray-700 font-medium group-hover:text-on-background transition-colors">{stepLabel}</p>
                  </div>
                  <span className="material-symbols-outlined text-gray-300">{i === 0 ? 'done' : 'hourglass_empty'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <button
              onClick={onBack}
              className="w-full py-4 border-2 border-gray-900 text-on-background font-bold rounded-xl hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
            >
              {t('agentRegistration.backToCatalog')}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
