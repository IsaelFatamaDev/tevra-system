import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function SplashScreen({ onFinish }) {
     const { t } = useTranslation()
     const [phase, setPhase] = useState('loading')

     useEffect(() => {
          document.body.style.overflow = 'hidden'
          window.scrollTo(0, 0)

          const t1 = setTimeout(() => setPhase('welcome'), 1200)
          const t2 = setTimeout(() => setPhase('exit'), 2600)
          const t3 = setTimeout(() => {
               document.body.style.overflow = 'unset'
               onFinish()
          }, 3200)
          return () => {
               clearTimeout(t1)
               clearTimeout(t2)
               clearTimeout(t3)
               document.body.style.overflow = 'unset'
          }
     }, [onFinish])

     return (
          <div
               className={`fixed inset-0 z-9999 flex flex-col items-center justify-center transition-opacity duration-500 ${phase === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
               style={{ background: 'linear-gradient(135deg, #0a2540 0%, #0d1b2a 30%, #1a1a2e 60%, #0a2540 100%)' }}
          >
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,107,107,0.08)_0%,transparent_50%)]" />
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(46,213,115,0.06)_0%,transparent_50%)]" />
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.04)_0%,transparent_40%)]" />
               <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                         backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                         backgroundSize: '50px 50px',
                    }}
               />

               <div className="relative z-10 flex flex-col items-center gap-8">
                    <div
                         className={`transition-all duration-700 ${phase === 'loading' ? 'scale-75 opacity-0 translate-y-8' : 'scale-100 opacity-100 translate-y-0'}`}
                    >
                         <div className="relative flex items-center justify-center">
                              <div className="absolute w-52 h-52 md:w-60 md:h-60 rounded-full border border-white/4 animate-[spin_20s_linear_infinite]" />
                              <div className="absolute w-60 h-60 md:w-72 md:h-72 rounded-full border border-secondary/[0.08] animate-[spin_30s_linear_infinite_reverse]" />
                              <div className="absolute w-44 h-44 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-secondary/15 via-transparent to-mint/10 blur-3xl" />

                              <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] flex items-center justify-center shadow-[0_0_80px_rgba(255,107,107,0.12),0_0_0_1px_rgba(255,255,255,0.05)]">
                                   <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-white/[0.08] to-transparent" />
                                   <img
                                        src="/LogoTevra.png"
                                        alt="TeVra"
                                        className="relative w-24 h-24 md:w-30 md:h-30 object-contain rounded-full"
                                   />
                              </div>
                         </div>
                    </div>

                    <div
                         className={`transition-all duration-700 delay-200 flex flex-col items-center ${phase === 'loading' ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'}`}
                    >
                         <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-white tracking-tighter">
                              Te<span className="bg-gradient-to-r from-secondary to-[#ff8a8a] bg-clip-text text-transparent">Vra</span>
                         </h1>
                    </div>

                    <div
                         className={`transition-all duration-700 delay-500 ${phase === 'welcome' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                         <div className="flex items-center gap-3">
                              <div className="w-8 h-px bg-gradient-to-r from-transparent to-white/20" />
                              <p className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">
                                   {t('splash.tagline')}
                              </p>
                              <div className="w-8 h-px bg-gradient-to-l from-transparent to-white/20" />
                         </div>
                    </div>

                    <div className={`mt-4 transition-all duration-500 ${phase === 'loading' ? 'opacity-100' : 'opacity-0'}`}>
                         <div className="relative w-48 h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
                              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-secondary to-[#ff8a8a] rounded-full animate-[loading_1.2s_ease-in-out]" />
                         </div>
                    </div>
               </div>
          </div>
     )
}
