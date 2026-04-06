import { Link } from 'react-router-dom'
import useScrollReveal from '../../hooks/useScrollReveal'

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] hero-gradient flex items-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="space-y-8 py-12 animate-[slide-left_1s_cubic-bezier(0.16,1,0.3,1)_0.3s_both]">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-white text-[11px] font-bold uppercase tracking-widest">
              Servicio Premium 2026
            </span>
          </div>

          <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
            Lo que quieras de <span className="text-secondary">USA</span>, en la puerta de tu casa.
          </h1>

          <p className="text-white/70 text-xl max-w-lg leading-relaxed">
            Accede a las mejores tiendas del mundo sin complicaciones. Productos 100% originales con logistica asegurada de puerta a puerta.
          </p>

          <div className="flex flex-wrap gap-5 pt-4">
            <Link
              to="/catalogo"
              className="bg-secondary text-white px-10 py-5 rounded-2xl font-headline font-bold text-lg shadow-xl shadow-secondary/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-secondary/40 transition-all duration-300"
            >
              Explorar Catalogo
            </Link>
            <button className="glass-card text-white px-10 py-5 rounded-2xl font-headline font-bold text-lg hover:bg-white/10 transition-all duration-300">
              Cotizar Link
            </button>
          </div>

          <div className="flex gap-10 pt-12 items-center">
            <div className="flex flex-col">
              <span className="text-white font-black text-2xl">10k+</span>
              <span className="text-white/50 text-xs uppercase tracking-widest">Envios Exitosos</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-white font-black text-2xl">4.9/5</span>
              <span className="text-white/50 text-xs uppercase tracking-widest">Calificacion</span>
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block animate-[slide-right_1s_cubic-bezier(0.16,1,0.3,1)_0.5s_both]">
          <div className="absolute -inset-20 bg-secondary/10 blur-[120px] rounded-full" />
          <img
            className="relative z-10 w-full transform drop-shadow-[0_20px_60px_rgba(10,37,64,0.3)] hover:scale-105 transition-transform duration-700"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDJ9-i5TKpvJCiOd1RqoQk3J8swgyDaPV_2WPnpzRJomq757yjmRyBa6wOSisMTs7OpI1qj27L-TkC0mOakFRwTfPlHlU6uzpSZGsn7Or29XzdZIVoMdtzVLWQxRUCpphXwDgkIaOn5A2sxGLvTd_PIKBar6z7OqSBLgZYdAmjfeYNZ_ZriCTksLG_f0GJk0lYjPjjbe9un3JVaQ_WgJJy47oHTvKe4gCsyGPLTneqtjhqZu8pz_y4df5fQucgJxdW6lmcyPB4o_BI"
            alt="MacBook Pro and iPhone floating with soft premium lighting"
          />
        </div>
      </div>
    </section>
  )
}
