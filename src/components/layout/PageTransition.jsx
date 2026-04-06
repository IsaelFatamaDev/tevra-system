import { useState, useEffect } from 'react'

export default function PageTransition({ onDone }) {
     const [phase, setPhase] = useState('enter')

     useEffect(() => {
          const t1 = setTimeout(() => setPhase('show'), 50)
          const t2 = setTimeout(() => setPhase('exit'), 1000)
          const t3 = setTimeout(() => onDone(), 1500)
          return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
     }, [onDone])

     return (
          <div
               className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center hero-gradient transition-opacity duration-400 ${phase === 'enter' ? 'opacity-0' : phase === 'exit' ? 'opacity-0' : 'opacity-100'
                    }`}
          >
               <div className="absolute inset-0 bg-grid-pattern opacity-15" />

               <div className="relative z-10 flex flex-col items-center gap-5">
                    <div className={`transition-all duration-500 ${phase === 'show' ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                         }`}>
                         <div className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-[0_0_60px_rgba(255,107,107,0.25)]">
                              <img
                                   src="/LogoTevra.png"
                                   alt="TeVra"
                                   className="w-20 h-20 object-contain"
                              />
                         </div>
                    </div>

                    <div className={`transition-all duration-500 delay-100 ${phase === 'show' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                         }`}>
                         <h1 className="font-headline text-2xl font-extrabold text-white tracking-tighter">
                              Te<span className="text-secondary">Vra</span>
                         </h1>
                    </div>
               </div>
          </div>
     )
}
