import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import useScrollReveal from '../../../core/hooks/useScrollReveal'
import agentImage from '../../../assets/AgentImage.png'

const valores = [
  {
    icon: 'person_celebrate',
    color: 'bg-secondary',
    title: 'Tu propio negocio',
    desc: 'Sin jefe, sin horario, sin oficina. Tú gestionas tu tiempo y el crecimiento de tu red de clientes con total libertad.',
  },
  {
    icon: 'account_balance_wallet',
    color: 'bg-primary',
    title: 'Cero inversión',
    desc: 'El cliente paga primero. No arriesgas capital propio ni necesitas stock físico. TeVra se encarga de la logística.',
  },
  {
    icon: 'trending_up',
    color: 'bg-accent-gold',
    title: 'Sin techo',
    desc: 'Ganas del 10–15% por venta realizada. No hay límites en tus comisiones; tú decides cuánto quieres ganar cada mes.',
  },
]

const herramientas = [
  { icon: 'language', color: 'border-secondary', iconColor: 'text-secondary', title: 'Perfil en la web', desc: 'Tu propia página profesional dentro de TeVra para generar confianza inmediata.' },
  { icon: 'link', color: 'border-primary', iconColor: 'text-primary', title: 'Link personalizado', desc: 'Comparte tu enlace único por WhatsApp y redes para rastrear cada una de tus ventas.' },
  { icon: 'auto_stories', color: 'border-secondary', iconColor: 'text-secondary', title: 'Catálogo actualizado', desc: 'Acceso a todos nuestros productos con descripciones y materiales de venta listos.' },
  { icon: 'school', color: 'border-primary', iconColor: 'text-primary', title: 'Capacitación', desc: 'Aprende técnicas de venta consultiva y manejo de clientes con nuestros expertos.' },
  { icon: 'support_agent', color: 'border-secondary', iconColor: 'text-secondary', title: 'Soporte prioritario', desc: 'Atención prioritaria para resolver dudas tuyas o de tus clientes en minutos.' },
  { icon: 'dashboard', color: 'border-outline-variant', iconColor: 'text-outline', title: 'Dashboard', desc: 'Un panel avanzado para visualizar analíticas de tus clientes y pedidos.', pronto: true },
]

const tablaIngresos = [
  { clientes: 5, monto: '$90' },
  { clientes: 10, monto: '$216' },
  { clientes: 20, monto: '$450', destacado: true },
  { clientes: 30, monto: '$720' },
  { clientes: 50, monto: '$1,260' },
]

function HeroAgentes() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32" style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ae2f34 100%)' }}>
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid md:grid-cols-12 gap-12 items-center hero-enter">
          <div className="md:col-span-7 space-y-6 sm:space-y-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-widest backdrop-blur-sm">
              Oportunidad TeVra
            </span>
            <h1
              className="font-headline font-extrabold text-white leading-[1.1] tracking-tight"
              style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)' }}
            >
              Convierte tu Red de Contactos en Ingresos
            </h1>
            <p className="text-white/90 font-medium max-w-xl" style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}>
              Sé agente TeVra. Sin inversión. Sin jefe. Sin límites.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
              <Link
                to="/registro-agente"
                className="px-10 py-4 bg-white text-primary rounded-2xl font-headline font-bold text-lg hover:bg-surface-container-lowest transition-all shadow-xl shadow-black/10 active:scale-95"
                style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.125rem)' }}
              >
                Quiero unirme
              </Link>
              <div className="text-white/80 text-sm font-medium leading-relaxed">
                <span className="block">Es gratis.</span>
                <span className="block">Sin inversión inicial.</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block md:col-span-5 relative">
            <div className="absolute inset-0 bg-white/10 rounded-3xl rotate-3 scale-105 blur-2xl" />
            <img
              src={agentImage}
              alt="Agente TeVra"
              className="relative rounded-3xl shadow-2xl object-cover w-full border-8 border-white/10"
              style={{ aspectRatio: '4/5' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function ValoresSection() {
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal(0.01)
  return (
    <section className="py-24 bg-background-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div ref={gridRef} className={`grid md:grid-cols-3 gap-8 reveal ${gridVisible ? 'visible' : ''}`}>
          {valores.map((v, i) => (
            <div key={v.title} className={`group p-10 bg-surface-container-low rounded-3xl hover:bg-surface-container-highest transition-all duration-300 stagger-${i + 1}`}>
              <div className={`w-14 h-14 ${v.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg`}>
                <span className="material-symbols-outlined text-white text-3xl">{v.icon}</span>
              </div>
              <h3 className="font-headline text-2xl font-bold text-primary mb-4">{v.title}</h3>
              <p className="text-text-muted leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CalculadoraSection() {
  const [clientes, setClientes] = useState(15)
  const ingreso = Math.round(clientes * 18)
  const { ref, isVisible } = useScrollReveal(0.05)

  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div ref={ref} className={`bg-surface-container-lowest rounded-[2rem] shadow-xl overflow-hidden grid lg:grid-cols-2 reveal ${isVisible ? 'visible' : ''}`}>
          <div className="p-10 md:p-16 space-y-10">
            <div>
              <h2 className="font-headline text-4xl font-extrabold text-primary mb-4">Calcula tu potencial</h2>
              <p className="text-text-muted">Desliza para ver cuánto puedes generar mensualmente basándote en tu red de contactos.</p>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold uppercase tracking-widest text-primary/60">¿Cuántos clientes puedes tener?</span>
                <span className="text-3xl font-bold text-primary">{clientes}</span>
              </div>
              <input
                className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-secondary"
                type="range" min="5" max="50" step="1"
                value={clientes}
                onChange={(e) => setClientes(Number(e.target.value))}
              />
              <div className="flex justify-between text-xs text-outline font-bold">
                <span>5 CLIENTES</span>
                <span>50 CLIENTES</span>
              </div>
            </div>
            <div className="bg-surface-container rounded-2xl p-8 border border-outline-variant/20">
              <p className="text-primary/70 text-sm font-semibold mb-2">Estimación de ganancias</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-secondary">${ingreso}</span>
                <span className="text-xl font-bold text-primary/40">/mes</span>
              </div>
              <p className="mt-4 text-xs text-text-muted">Basado en un promedio de compra estándar por cliente activo.</p>
            </div>
          </div>
          <div className="p-10 md:p-16 text-white" style={{ background: 'linear-gradient(135deg, #000f22 0%, #0a2540 100%)' }}>
            <h3 className="text-xl font-bold mb-8">Tabla de referencia rápida</h3>
            <div className="space-y-1">
              {tablaIngresos.map((row) => (
                <div
                  key={row.clientes}
                  className={`flex justify-between items-center py-4 border-b border-white/10 ${row.destacado ? 'bg-white/5 px-4 -mx-4 rounded-xl' : ''}`}
                >
                  <span className={`font-medium ${row.destacado ? 'text-white' : 'text-white/70'}`}>{row.clientes} clientes activos</span>
                  <span className="text-xl font-bold">{row.monto}</span>
                </div>
              ))}
            </div>
            <p className="mt-10 text-xs opacity-60 italic">* Estimaciones basadas en promedios históricos. Los resultados individuales pueden variar.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function HerramientasSection() {
  const { ref, isVisible } = useScrollReveal(0.05)
  return (
    <section className="py-24 bg-background-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-headline text-4xl font-extrabold text-primary mb-6">Herramientas que recibes</h2>
          <p className="text-text-muted text-lg">Te proporcionamos todo el ecosistema digital necesario para que empieces a vender desde el primer día.</p>
        </div>
        <div ref={ref} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal ${isVisible ? 'visible' : ''}`}>
          {herramientas.map((h, i) => (
            <div
              key={h.title}
              className={`p-8 bg-surface-container-lowest border-b-4 ${h.color} rounded-2xl shadow-soft hover:-translate-y-1 transition-transform stagger-${Math.min(i + 1, 5)} ${h.pronto ? 'opacity-75' : ''}`}
            >
              <div className="flex items-start justify-between mb-6">
                <span className={`material-symbols-outlined text-4xl ${h.iconColor}`}>{h.icon}</span>
                {h.pronto && (
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Próximamente</span>
                )}
              </div>
              <h4 className="font-headline font-bold text-xl text-primary mb-2">{h.title}</h4>
              <p className="text-sm text-text-muted">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function VlapexSection() {
  const { ref, isVisible } = useScrollReveal(0.05)
  return (
    <section className="py-24 bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div ref={ref} className={`grid lg:grid-cols-2 items-center gap-16 reveal ${isVisible ? 'visible' : ''}`}>
          <div className="relative flex justify-center">
            <div className="relative w-64 h-[520px] bg-black rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden">
              <div className="absolute top-0 w-full h-6 bg-slate-800 flex justify-center items-end pb-1">
                <div className="w-20 h-4 bg-black rounded-full" />
              </div>
              <div className="p-5 pt-10 bg-white h-full">
                <div className="flex justify-between items-center mb-6">
                  <div className="w-8 h-8 rounded-full bg-slate-100" />
                  <div className="w-24 h-3 bg-slate-100 rounded-full" />
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/10 rounded-xl border border-secondary/20">
                    <div className="w-20 h-2 bg-secondary/40 rounded-full mb-2" />
                    <div className="w-12 h-4 bg-secondary rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-20 bg-slate-50 rounded-xl" />
                    <div className="h-20 bg-slate-50 rounded-xl" />
                  </div>
                  <div className="space-y-2 mt-6">
                    <div className="w-full h-2 bg-slate-100 rounded-full" />
                    <div className="w-full h-2 bg-slate-100 rounded-full" />
                    <div className="w-2/3 h-2 bg-slate-100 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] -z-10" />
          </div>
          <div className="text-white space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-sm font-bold border border-white/20">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              TECNOLOGÍA PROPIA
            </div>
            <h2 className="font-headline font-extrabold leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}>
              Estamos construyendo <span className="text-secondary">VLAPEX</span>
            </h2>
            <p className="text-white/70 leading-relaxed max-w-xl" style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)' }}>
              La app que te permitirá gestionar pedidos y ver comisiones en tiempo real. Un centro de mando digital diseñado para que operes tu negocio desde la palma de tu mano. Los primeros agentes tendrán acceso prioritario.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div>
                <span className="block text-3xl font-bold mb-1">RTD</span>
                <span className="text-sm opacity-60 uppercase tracking-widest">Real-Time Data</span>
              </div>
              <div>
                <span className="block text-3xl font-bold mb-1">100%</span>
                <span className="text-sm opacity-60 uppercase tracking-widest">Digital Native</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function RegistroSection() {
  const { ref, isVisible } = useScrollReveal(0.05)
  return (
    <section id="registro" className="py-24 bg-surface-container-low">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div ref={ref} className={`bg-surface-container-lowest rounded-[2.5rem] p-10 md:p-16 shadow-2xl relative reveal ${isVisible ? 'visible' : ''}`}>
          <div className="text-center space-y-8">
            <h2 className="font-headline text-4xl font-extrabold text-primary">Únete a la Red TeVra</h2>
            <p className="text-text-muted text-lg max-w-xl mx-auto">
              Completa el proceso de registro en 3 simples pasos y un asesor se pondrá en contacto contigo para tu entrevista inicial.
            </p>
            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="font-headline font-bold text-secondary">1</span>
                </div>
                <p className="text-xs font-bold text-primary">Datos personales</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="font-headline font-bold text-secondary">2</span>
                </div>
                <p className="text-xs font-bold text-primary">Perfil profesional</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="font-headline font-bold text-secondary">3</span>
                </div>
                <p className="text-xs font-bold text-primary">Confirmación</p>
              </div>
            </div>
            <Link
              to="/registro-agente"
              className="inline-flex items-center gap-3 text-white py-5 px-12 rounded-2xl font-headline font-bold text-lg hover:opacity-90 transition-all shadow-xl active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #000f22 0%, #0a2540 100%)' }}
            >
              <span className="material-symbols-outlined">person_add</span>
              Comenzar registro
            </Link>
            <p className="text-xs text-text-muted italic">
              Proceso 100% online. Sin inversión inicial.
            </p>
          </div>
          <div className="absolute -top-10 -right-10 hidden lg:flex w-24 h-24 rounded-full items-center justify-center text-white shadow-xl rotate-12" style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ae2f34 100%)' }}>
            <span className="material-symbols-outlined text-4xl">edit_note</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function AgentesPage() {
  return (
    <main style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
      <HeroAgentes />
      <ValoresSection />
      <CalculadoraSection />
      <HerramientasSection />
      <VlapexSection />
      <RegistroSection />
    </main>
  )
}
