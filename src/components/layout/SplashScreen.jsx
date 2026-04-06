import { useState, useEffect } from 'react'

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState('loading')

  useEffect(() => {
    // Bloquea el scroll y asegura que inicie arriba
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    const t1 = setTimeout(() => setPhase('welcome'), 1200)
    const t2 = setTimeout(() => setPhase('exit'), 2600)
    const t3 = setTimeout(() => {
      document.body.style.overflow = 'unset';
      onFinish();
    }, 3200)
    return () => { 
      clearTimeout(t1); 
      clearTimeout(t2); 
      clearTimeout(t3);
      document.body.style.overflow = 'unset';
    }
  }, [onFinish])

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center hero-gradient transition-opacity duration-500 ${phase === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div
          className={`transition-all duration-700 ${phase === 'loading'
            ? 'scale-75 opacity-0 translate-y-8'
            : 'scale-100 opacity-100 translate-y-0'
            }`}
        >
          <div className="w-44 h-44 md:w-52 md:h-52 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-[0_0_80px_rgba(255,107,107,0.25)]">
            <img
              src="/LogoTevra.png"
              alt="TeVra"
              className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-[0_0_60px_rgba(255,107,107,0.3)]"
            />
          </div>
        </div>

        <div
          className={`transition-all duration-700 delay-200 ${phase === 'loading'
            ? 'opacity-0 translate-y-6'
            : 'opacity-100 translate-y-0'
            }`}
        >
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-white tracking-tighter">
            Te<span className="text-secondary">Vra</span>
          </h1>
        </div>

        <div
          className={`transition-all duration-700 delay-500 ${phase === 'welcome' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          <p className="text-white/60 text-sm font-medium uppercase tracking-[0.3em]">
            Importaciones Premium desde USA
          </p>
        </div>

        <div className={`mt-4 transition-all duration-500 ${phase === 'loading' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full animate-[loading_1.2s_ease-in-out]" />
          </div>
        </div>
      </div>
    </div>
  )
}
