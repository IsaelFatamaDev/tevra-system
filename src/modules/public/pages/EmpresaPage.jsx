import { Link } from 'react-router-dom'
import useScrollReveal from '../../../core/hooks/useScrollReveal'

const stats = [
  { valor: '2', label: 'Hubs en USA', sub: 'California & Miami', icon: 'location_on' },
  { valor: '12+', label: 'Años de socio logístico', sub: 'Experiencia probada', icon: 'workspace_premium' },
  { valor: '2', label: 'Vuelos/semana a Perú', sub: 'Salidas garantizadas', icon: 'flight' },
  { valor: 'LLC', label: 'Registro legal USA', sub: 'California, EIN federal', icon: 'gavel' },
]

const pasos = [
  { n: '01', icon: 'person', titulo: 'Tu cliente quiere un producto', desc: 'Un amigo, familiar o seguidor te dice qué quiere: Nike, iPhone, perfume, ropa de marca... cualquier producto disponible en tiendas de Estados Unidos.' },
  { n: '02', icon: 'receipt_long', titulo: 'Tú tomas el pedido', desc: 'Le indicas el precio (producto + tu comisión + envío). Si acepta, el cliente te paga a ti directamente. Él es TU cliente, no de TeVra.' },
  { n: '03', icon: 'send', titulo: 'Reportas el pedido a TeVra', desc: 'Nos envías el detalle: producto, talla/color/modelo y comprobante de pago. Nosotros nos encargamos del resto.' },
  { n: '04', icon: 'storefront', titulo: 'TeVra compra en USA', desc: 'Vamos a la tienda, outlet o proveedor mayorista y compramos exactamente lo que tu cliente pidió. Tomamos foto como comprobante.' },
  { n: '05', icon: 'flight_takeoff', titulo: 'TeVra envía a Perú', desc: 'El producto va a nuestro socio logístico en Miami. Lo embarcan en el próximo vuelo a Perú, 2 salidas por semana. Viaja asegurado.' },
  { n: '06', icon: 'fact_check', titulo: 'Llega a Perú y pasa aduana', desc: 'Nuestro socio logístico tiene oficina en Lima y se encarga del desaduanaje. Tú no haces ningún trámite con aduanas ni SUNAT.' },
  { n: '07', icon: 'home_pin', titulo: 'Tú entregas al cliente', desc: 'El producto llega a la oficina en Lima. Tú lo recoges y lo entregas. Pedido completado. Tiempo estimado: 5 a 10 días hábiles.' },
]

const ventajas = [
  { icon: 'route', titulo: 'Acceso directo sin intermediarios', desc: 'Trabajamos con un socio logístico en Miami con licencias propias para embarcar carga. Sin intermediarios de por medio — vamos directo a la fuente.' },
  { icon: 'location_city', titulo: 'Dos hubs en Estados Unidos', desc: 'Operamos desde California y Miami. Siempre buscamos el mejor precio disponible en ambas costas para tu cliente.' },
  { icon: 'balance', titulo: 'Empresa legal registrada', desc: 'TeVra es una LLC registrada en California con número EIN federal. No somos informales — esto le da confianza a ti y a tus clientes.' },
  { icon: 'security', titulo: 'Envío asegurado', desc: 'Cada envío viaja con seguro de carga. Si algo se pierde o daña, está cubierto. Tu reputación y la del cliente están protegidas.' },
  { icon: 'verified_user', titulo: 'Aduana resuelta', desc: 'Nuestro socio tiene 12+ años manejando aduana peruana. Ellos se encargan de todo el proceso de liberación. Tú no tramitas nada.' },
  { icon: 'new_releases', titulo: 'Productos 100% originales', desc: 'Todo lo que vendemos es nuevo, sellado y original de fábrica. Sin réplicas, sin segunda mano. La calidad es nuestra prioridad.' },
]

const desafios = [
  { icon: 'schedule', titulo: 'Los tiempos pueden variar', desc: 'El estimado es 5–10 días hábiles, pero puede extenderse por demoras en vuelos, revisión física en aduana o feriados. Siempre comunicamos el estado.' },
  { icon: 'block', titulo: 'No todos los productos se pueden enviar', desc: 'Líquidos inflamables, baterías sueltas de litio, alimentos perecibles y productos con homologación especial tienen restricciones. Consulta antes.' },
  { icon: 'person_raised_hand', titulo: 'El éxito depende de ti', desc: 'TeVra da infraestructura y respaldo, pero los clientes los consigues tú. Si no te mueves, no vendes. Es una oportunidad, no un ingreso garantizado.' },
  { icon: 'currency_exchange', titulo: 'Manejo de dinero con responsabilidad', desc: 'Tu cliente te confía su dinero. Esa confianza es sagrada. Cada centavo debe manejarse con total transparencia y seriedad.' },
]

function StatCard({ stat, i }) {
  const { ref, isVisible } = useScrollReveal(0.05)
  return (
    <div ref={ref} className={`bg-white/5 border border-white/10 rounded-3xl p-8 text-center hover:bg-white/10 transition-all reveal stagger-${i + 1} ${isVisible ? 'visible' : ''}`}>
      <span className="material-symbols-outlined text-secondary text-3xl mb-3 block">{stat.icon}</span>
      <span className="font-headline font-black text-white block" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>{stat.valor}</span>
      <span className="font-bold text-white text-sm block mt-1">{stat.label}</span>
      <span className="text-white/40 text-xs">{stat.sub}</span>
    </div>
  )
}

export default function EmpresaPage() {
  const { ref: misionRef, isVisible: misionVisible } = useScrollReveal(0.05)
  const { ref: pasosRef, isVisible: pasosVisible } = useScrollReveal(0.01)
  const { ref: ventajasRef, isVisible: ventajasVisible } = useScrollReveal(0.01)
  const { ref: desafiosRef, isVisible: desafiosVisible } = useScrollReveal(0.01)

  return (
    <main className="min-h-screen bg-background-cream" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
      <section className="tevra-hero-gradient py-20 sm:py-28 overflow-hidden">
        <div className="tevra-hero-overlay" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="max-w-3xl hero-enter">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-6">
              <span className="w-2 h-2 bg-mint rounded-full animate-pulse" />
              <span className="text-white text-[11px] font-bold uppercase tracking-widest">TeVra LLC · California, USA</span>
            </div>
            <h1 className="font-headline font-extrabold text-white leading-tight tracking-tight mb-6" style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4rem)' }}>
              Tu puente hacia<br /><span className="text-tevra-coral">Estados Unidos</span>
            </h1>
            <p className="text-white/70 leading-relaxed max-w-2xl" style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
              Somos una empresa legalmente registrada en California dedicada a la compra, venta y distribución de productos tecnológicos y de marca original desde USA hacia Latinoamérica.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s, i) => <StatCard key={s.label} stat={s} i={i} />)}
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-background-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div ref={misionRef} className={`grid lg:grid-cols-2 gap-8 lg:gap-12 reveal ${misionVisible ? 'visible' : ''}`}>
            <div className="bg-primary rounded-3xl p-10 sm:p-14 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/10 blur-[80px] rounded-full" />
              <span className="inline-block px-3 py-1 bg-secondary/20 text-secondary text-xs font-bold uppercase tracking-widest rounded-full mb-6">Misión</span>
              <h2 className="font-headline font-extrabold text-white text-2xl sm:text-3xl mb-6 leading-tight">
                Conectar Latinoamérica con lo mejor de USA
              </h2>
              <p className="text-white/70 leading-relaxed">
                Conectar a consumidores y emprendedores de Latinoamérica con productos tecnológicos y de marca originales desde Estados Unidos, a través de una red confiable de agentes comerciales independientes, ofreciendo precios accesibles, envíos seguros y un servicio transparente que genera valor para todos.
              </p>
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-white/50 text-sm italic">
                  "En palabras simples: hacemos que cualquier persona en Perú pueda comprar productos de USA a precios justos, de manera segura, a través de alguien de confianza."
                </p>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-3xl p-10 sm:p-14 border border-outline-variant/20">
              <span className="inline-block px-3 py-1 bg-mint/20 text-mint text-xs font-bold uppercase tracking-widest rounded-full mb-6">Visión</span>
              <h2 className="font-headline font-extrabold text-primary text-2xl sm:text-3xl mb-6 leading-tight">
                La red de importación más grande de América
              </h2>
              <p className="text-text-muted leading-relaxed">
                Ser la red de importación y distribución más grande y confiable entre Estados Unidos y Latinoamérica, potenciada por tecnología propia, donde cada agente tenga la oportunidad de construir su propio negocio con el respaldo de una empresa sólida en USA.
              </p>
              <div className="mt-8 p-6 bg-surface-container rounded-2xl">
                <p className="text-primary font-medium text-sm leading-relaxed">
                  <span className="font-black">Piensa en el modelo Uber, pero para importaciones.</span> Uber no tiene autos propios — conecta conductores con pasajeros. TeVra conecta agentes locales con el mercado de USA.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-headline font-extrabold text-primary tracking-tight mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
              Cómo funciona el proceso
            </h2>
            <p className="text-text-muted">7 pasos simples desde que tu cliente pide hasta que recibe en casa.</p>
          </div>
          <div ref={pasosRef} className={`relative reveal ${pasosVisible ? 'visible' : ''}`}>
            <div className="hidden lg:block absolute left-8 top-8 bottom-8 w-0.5 bg-outline-variant/30" />
            <div className="space-y-4">
              {pasos.map((paso, i) => (
                <div key={paso.n} className={`bg-surface-container-lowest rounded-3xl p-6 sm:p-8 lg:pl-20 relative flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-soft hover:shadow-premium transition-all duration-300 stagger-${Math.min(i + 1, 5)}`}>
                  <div className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary items-center justify-center z-10">
                    <span className="text-white text-xs font-black">{paso.n}</span>
                  </div>
                  <div className="flex lg:hidden w-10 h-10 rounded-2xl bg-primary items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-black">{paso.n}</span>
                  </div>
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl items-center justify-center hidden sm:flex flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">{paso.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-headline font-bold text-primary text-base mb-1">{paso.titulo}</h4>
                    <p className="text-text-muted text-sm leading-relaxed">{paso.desc}</p>
                  </div>
                  {paso.n === '07' && (
                    <div className="flex-shrink-0 hidden lg:flex items-center gap-2 px-4 py-2 bg-mint/15 rounded-full border border-mint/30">
                      <span className="w-2 h-2 bg-mint rounded-full" />
                      <span className="text-xs font-bold text-mint">5–10 días hábiles</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-background-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-headline font-extrabold text-primary tracking-tight mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
              Ventajas del modelo TeVra
            </h2>
            <p className="text-text-muted">Lo que nos diferencia de cualquier otro courier o personal shopper.</p>
          </div>
          <div ref={ventajasRef} className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 reveal ${ventajasVisible ? 'visible' : ''}`}>
            {ventajas.map((v, i) => (
              <div key={v.titulo} className={`bg-surface-container-lowest rounded-3xl p-8 shadow-soft hover:-translate-y-1 hover:shadow-premium transition-all duration-300 stagger-${Math.min(i + 1, 5)}`}>
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary text-xl">{v.icon}</span>
                </div>
                <h4 className="font-headline font-bold text-primary mb-3">{v.titulo}</h4>
                <p className="text-text-muted text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-2xl mb-14">
            <span className="inline-block px-3 py-1 bg-accent-gold/20 text-accent-gold text-xs font-bold uppercase tracking-widest rounded-full mb-5">Transparencia total</span>
            <h2 className="font-headline font-extrabold text-primary tracking-tight mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
              Desafíos que debes conocer
            </h2>
            <p className="text-text-muted">No pintamos un mundo perfecto. Todo negocio tiene desafíos y queremos que los conozcas antes de empezar.</p>
          </div>
          <div ref={desafiosRef} className={`grid grid-cols-1 sm:grid-cols-2 gap-6 reveal ${desafiosVisible ? 'visible' : ''}`}>
            {desafios.map((d, i) => (
              <div key={d.titulo} className={`bg-surface-container-lowest rounded-3xl p-8 border-l-4 border-accent-gold shadow-soft stagger-${i + 1}`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-accent-gold/10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-accent-gold text-lg">{d.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-primary mb-2">{d.titulo}</h4>
                    <p className="text-text-muted text-sm leading-relaxed">{d.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center relative z-10">
          <h2 className="font-headline font-extrabold text-white tracking-tight mb-5" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            ¿Quieres ser parte de la red?
          </h2>
          <p className="text-white/70 mb-10 max-w-xl mx-auto" style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)' }}>
            Únete como agente TeVra. Sin inversión, sin jefe, sin límites. Empieza a generar ingresos conectando a tus contactos con productos de USA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/agentes" className="px-10 py-4 bg-secondary text-white rounded-2xl font-headline font-bold text-lg shadow-xl shadow-secondary/30 hover:-translate-y-1 transition-all">
              Quiero ser agente
            </Link>
            <Link to="/tracking" className="px-10 py-4 glass-card text-white rounded-2xl font-headline font-bold text-lg hover:bg-white/10 transition-all">
              Seguir mi pedido
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
