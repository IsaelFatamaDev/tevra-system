import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { agentsService } from '../services/agents.service'
import productsService from '../services/products.service'
import { useFieldAvailability } from '../../../core/hooks/useFieldAvailability'

const STEPS = [
  { icon: 'person', label: 'Información Personal' },
  { icon: 'work', label: 'Perfil Profesional' },
  { icon: 'check_circle', label: 'Confirmación' },
]

export default function AgentRegistrationPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    dni: '',
    email: '',
    whatsapp: '',
    city: '',
    password: '',
    confirmPassword: '',
    categories: [],
    coverageAreas: [],
    motivation: '',
  })

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const availabilityFields = useMemo(() => ({
    email: form.email,
    whatsapp: form.whatsapp,
  }), [form.email, form.whatsapp])

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
  const step1Valid = form.fullName.trim() && /^[0-9]{8}$/.test(form.dni.trim()) && form.email.includes('@') && form.whatsapp.trim().length >= 7 && form.city.trim() && form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && form.password === form.confirmPassword && !availabilityErrors.email && !availabilityErrors.whatsapp
  const step2Valid = form.categories.length > 0 && form.coverageAreas.length > 0

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')

    // Validations
    if (!form.fullName.trim()) { setError('El nombre completo es obligatorio.'); setSubmitting(false); return }
    if (!/^[0-9]{8}$/.test(form.dni.trim())) { setError('El número de ID debe tener exactamente 8 dígitos.'); setSubmitting(false); return }
    if (!form.email.trim() || !form.email.includes('@')) { setError('Ingresa un correo electr\u00f3nico v\u00e1lido.'); setSubmitting(false); return }
    if (!form.whatsapp.trim() || form.whatsapp.trim().length < 7) { setError('Ingresa un n\u00famero de WhatsApp v\u00e1lido.'); setSubmitting(false); return }
    if (!form.city.trim()) { setError('La ciudad de operaci\u00f3n es obligatoria.'); setSubmitting(false); return }
    if (form.password.length < 8) { setError('La contrase\u00f1a debe tener al menos 8 caracteres.'); setSubmitting(false); return }
    if (!/[A-Z]/.test(form.password)) { setError('La contrase\u00f1a debe tener al menos 1 may\u00fascula.'); setSubmitting(false); return }
    if (!/[0-9]/.test(form.password)) { setError('La contrase\u00f1a debe tener al menos 1 n\u00famero.'); setSubmitting(false); return }
    if (form.password !== form.confirmPassword) { setError('Las contrase\u00f1as no coinciden.'); setSubmitting(false); return }
    if (form.categories.length === 0) { setError('Selecciona al menos una categor\u00eda.'); setSubmitting(false); return }
    if (form.coverageAreas.length === 0) { setError('Agrega al menos una zona de cobertura.'); setSubmitting(false); return }

    try {
      const { confirmPassword, ...submitData } = form
      await agentsService.submitApplication(submitData)
      setSubmitted(true)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al enviar la solicitud')
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
          <span className="text-text-muted font-semibold text-sm">Paso {step + 1} de 3</span>
        </div>
      </header>

      <div className="flex min-h-screen pt-20">
        {/* Sidebar */}
        <aside className="h-[calc(100vh-80px)] w-64 border-r border-outline-variant bg-white hidden lg:flex flex-col p-6 space-y-2 sticky top-20">
          <div className="mb-8">
            <h2 className="font-bold text-on-background text-xl">Agent Portal</h2>
            <p className="text-text-muted text-xs uppercase tracking-wider">Onboarding Progress</p>
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
              <span className="text-xs font-bold text-on-background">Progreso</span>
              <span className="text-xs font-bold text-on-background">{progress}%</span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-6 md:px-12 py-12 max-w-4xl mx-auto">
          {step === 0 && <Step1 form={form} set={set} onNext={() => setStep(1)} valid={step1Valid} generatedUsername={generatedUsername} availabilityErrors={availabilityErrors} checking={checking} />}
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
function Step1({ form, set, onNext, valid, generatedUsername, availabilityErrors, checking }) {
  return (
    <>
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-on-background tracking-tight mb-4">
          Información Personal
        </h1>
        <p className="text-lg text-text-muted max-w-2xl leading-relaxed">
          Comienza tu camino como Agente Verificado TeVra. Esta información nos permite crear un ecosistema de confianza para todos nuestros usuarios.
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Identity */}
        <div className="p-8 rounded-xl bg-white border border-outline-variant shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2 bg-surface-container rounded-lg">
              <span className="material-symbols-outlined text-on-background">id_card</span>
            </span>
            <h3 className="text-xl font-bold text-on-background">Identidad Básica</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-background">Nombre Completo</label>
              <input
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-gray-900 focus:ring-0 px-4 py-3 rounded-t-lg transition-all outline-none"
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-background">Número de ID (DNI)</label>
              <input
                value={form.dni}
                onChange={(e) => set('dni', e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-gray-900 focus:ring-0 px-4 py-3 rounded-t-lg transition-all outline-none"
                placeholder="Exactamente 8 dígitos"
                maxLength={8}
                type="text"
                inputMode="numeric"
              />
              {form.dni && form.dni.length !== 8 && (
                <p className="text-xs text-red-500 font-medium mt-1">El ID debe tener 8 dígitos.</p>
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
              <h3 className="text-xl font-bold text-on-background">Contacto</h3>
            </div>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-background uppercase tracking-wide">Correo Electrónico</label>
                <div className="relative">
                  <input
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    className={`w-full bg-white border-b-2 focus:ring-0 px-4 py-3 rounded-t-lg transition-all outline-none ${availabilityErrors.email ? 'border-red-400' : 'border-outline-variant focus:border-gray-900'}`}
                    placeholder="email@ejemplo.com"
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
                <label className="text-xs font-bold text-on-background uppercase tracking-wide">WhatsApp</label>
                <div className="relative">
                  <input
                    value={form.whatsapp}
                    onChange={(e) => set('whatsapp', e.target.value.replace(/[^0-9+\- ]/g, '').slice(0, 20))}
                    className={`w-full bg-white border-b-2 focus:ring-0 px-4 py-3 rounded-t-lg transition-all outline-none ${availabilityErrors.whatsapp ? 'border-red-400' : 'border-outline-variant focus:border-gray-900'}`}
                    placeholder="+1 555 123 4567"
                    type="tel"
                  />
                  {checking.whatsapp && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />}
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
              <h3 className="text-xl font-bold text-on-background">Ciudad de Operación</h3>
            </div>
            <div className="space-y-1.5">
              <input
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                className="w-full bg-white border-b-2 border-outline-variant focus:border-gray-900 focus:ring-0 px-4 py-3 rounded-t-lg transition-all outline-none"
                placeholder="Ej. Los Angeles, Miami, Lima..."
              />
            </div>
            <p className="mt-4 text-xs text-outline">Escribe la ciudad donde operarás como agente TeVra.</p>
          </div>
        </div>

        {/* Account Credentials */}
        <div className="p-8 rounded-xl bg-white border border-outline-variant shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2 bg-indigo-50 rounded-lg">
              <span className="material-symbols-outlined text-indigo-700">lock</span>
            </span>
            <h3 className="text-xl font-bold text-on-background">Credenciales de Acceso</h3>
          </div>
          {generatedUsername && (
            <div className="mb-6 p-4 bg-surface-container-low rounded-xl border border-gray-100">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-1">Tu usuario será</p>
              <p className="text-lg font-bold text-on-background font-mono">{form.email || generatedUsername}</p>
              <p className="text-xs text-outline mt-1">Usarás tu correo electrónico para iniciar sesión</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-background">Contraseña</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-gray-900 focus:ring-0 px-4 py-3 rounded-t-lg transition-all outline-none"
                placeholder="Mín. 8 caracteres"
              />
              <div className="flex gap-2 mt-2">
                <span className={`text-xs ${form.password.length >= 8 ? 'text-emerald-600' : 'text-outline'}`}>✓ 8+ caracteres</span>
                <span className={`text-xs ${/[A-Z]/.test(form.password) ? 'text-emerald-600' : 'text-outline'}`}>✓ 1 mayúscula</span>
                <span className={`text-xs ${/[0-9]/.test(form.password) ? 'text-emerald-600' : 'text-outline'}`}>✓ 1 número</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-background">Confirmar Contraseña</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => set('confirmPassword', e.target.value)}
                className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-gray-900 focus:ring-0 px-4 py-3 rounded-t-lg transition-all outline-none"
                placeholder="Repite la contraseña"
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && form.password.length >= 8 && (
                <p className="text-xs text-emerald-600 mt-1">✓ Contraseñas coinciden</p>
              )}
            </div>
          </div>
        </div>

        {/* Trust section */}
        <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100">
          <span className="material-symbols-outlined text-emerald-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <div>
            <h4 className="font-bold text-on-background">Tus datos están protegidos</h4>
            <p className="text-sm text-text-muted">
              Utilizamos encriptación de grado bancario para tu información personal. Tu DNI solo se usa para verificación de identidad.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-8 flex justify-end items-center gap-6">
          <button type="button" onClick={() => window.history.back()} className="text-on-background font-bold hover:underline">
            Cancelar
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={onNext}
            className="bg-primary text-white px-12 py-4 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </>
  )
}

/* =========== STEP 2: Professional Profile =========== */
function Step2({ form, toggleCategory, toggleCoverage, set, onBack, onSubmit, submitting, error, valid }) {
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
          <h1 className="text-4xl font-extrabold text-on-background tracking-tight mb-3">Perfil Profesional</h1>
          <p className="text-text-muted text-lg leading-relaxed">Configura tu perfil comercial para conectar con los clientes adecuados.</p>
        </div>

        <div className="space-y-10">
          {/* Categories */}
          <div className="space-y-4">
            <label className="block font-bold text-on-background text-sm uppercase tracking-wider">Categorías que manejas</label>
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
            <label className="block font-bold text-on-background text-sm uppercase tracking-wider">Zonas de cobertura</label>
            <div className="flex gap-2">
              <input
                value={zoneInput}
                onChange={(e) => setZoneInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addZone() } }}
                className="flex-1 bg-white border-b-2 border-outline-variant focus:border-gray-900 focus:ring-0 px-4 py-3 rounded-t-lg transition-all outline-none text-sm"
                placeholder="Escribe una zona y presiona Enter o Agregar"
              />
              <button type="button" onClick={addZone} className="px-4 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">Agregar</button>
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
            <p className="text-xs text-outline">Agrega las áreas, barrios o ciudades donde puedes operar.</p>
          </div>

          {/* Bio */}
          <div className="space-y-4">
            <label className="block font-bold text-on-background text-sm uppercase tracking-wider">Cuéntale a tus clientes quién eres</label>
            <textarea
              value={form.motivation}
              onChange={(e) => set('motivation', e.target.value.slice(0, 500))}
              className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-gray-900 rounded-t-xl p-4 focus:ring-0 text-on-background placeholder:text-outline outline-none"
              placeholder="Escribe una breve descripción sobre tu experiencia y cómo puedes ayudar..."
              rows={5}
            />
            <div className="flex justify-end">
              <span className="text-xs text-outline">{form.motivation.length} / 500 caracteres</span>
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
              {submitting ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
            <button type="button" onClick={onBack} className="w-full sm:w-auto px-10 py-4 text-on-background font-bold hover:underline">
              Volver
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
            <h3 className="font-bold text-2xl text-on-background mb-4">Consejos para un perfil premium</h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <span className="text-red-500 font-bold text-xl">01</span>
                <div>
                  <p className="font-bold text-on-background mb-1">Sé específico</p>
                  <p className="text-text-muted text-sm leading-relaxed">Menciona marcas específicas que conoces bien. La especialización transmite confianza inmediata.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-red-500 font-bold text-xl">02</span>
                <div>
                  <p className="font-bold text-on-background mb-1">Tu experiencia local</p>
                  <p className="text-text-muted text-sm leading-relaxed">Menciona por qué conoces bien tu zona de cobertura. Conocer los mejores accesos y horarios es clave.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-red-500 font-bold text-xl">03</span>
                <div>
                  <p className="font-bold text-on-background mb-1">Tono profesional</p>
                  <p className="text-text-muted text-sm leading-relaxed">Mantén un lenguaje amable pero profesional. Eres el embajador de las compras de tu cliente.</p>
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      {/* Left — Celebration */}
      <div className="lg:col-span-5 text-center lg:text-left space-y-6">
        <div className="w-24 h-24 lg:w-32 lg:h-32 bg-emerald-50 rounded-full flex items-center justify-center mx-auto lg:mx-0 shadow-sm border border-emerald-100/50">
          <span className="material-symbols-outlined text-6xl lg:text-7xl text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-extrabold text-on-background leading-tight tracking-tight">
          Solicitud Enviada con Éxito ✓
        </h1>
        <p className="text-text-muted text-lg max-w-md mx-auto lg:mx-0">
          Tu viaje como agente en TeVra ha comenzado. Hemos recibido tus datos y pronto estarás conectando con marcas premium.
        </p>
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-surface-container rounded-full border border-outline-variant">
          <span className="material-symbols-outlined text-blue-400 text-xl">verified</span>
          <span className="text-sm font-medium text-on-background uppercase tracking-wide">Un Administrador revisará tu perfil personalmente.</span>
        </div>
      </div>

      {/* Right — Status Card */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-on-background">Estado de Solicitud</h2>
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Pendiente</span>
          </div>

          <div className="flex items-start gap-4 p-4 bg-surface-container-low rounded-xl border border-gray-100">
            <span className="material-symbols-outlined text-amber-500 mt-1">schedule</span>
            <div>
              <p className="font-bold text-on-background">Estado: En Revisión</p>
              <p className="text-sm text-text-muted">Aproximadamente 24-48 horas hábiles para la validación inicial.</p>
            </div>
          </div>

          {/* Próximos Pasos */}
          <div className="mt-8 space-y-6">
            <h3 className="text-lg font-bold text-on-background border-l-4 border-red-400 pl-4">Próximos Pasos</h3>
            <div className="space-y-4">
              {['Verificación de identidad', 'Entrevista breve vía WhatsApp', 'Activación de perfil'].map((step, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</div>
                  <div className="flex-1 border-b border-gray-100 pb-2">
                    <p className="text-gray-700 font-medium group-hover:text-on-background transition-colors">{step}</p>
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
              Volver al Catálogo
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
