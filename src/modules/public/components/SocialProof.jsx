import useScrollReveal from '../../../core/hooks/useScrollReveal'

const recentSales = [
  {
    name: 'iPad Pro M4',
    location: 'Enviado a Lima, Miraflores',
    price: '$999',
    time: 'Hace 2 horas',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHFHCEIufTnLk9BLdwapoU9_pvCaEo5SMJpqw8gcVmLHOnBlhmFEYEZeJ5RQxaHSSFlxnlYIiHfN11sAvw0qv9-MRkTP0e3B4rjz97-r1QAIYx5F1XDw_8yHMYopgWroWqbXW0KhIkGz7tFmktAL8lYuxlmG_nbSRX3lykZQNwdN9qWAWHKfyYLBP8G3twonk6dhxfEjXNgpLZ5_WnZO_RDSskhSyZIumTSSyo_FI0YG1TJkClQZbcsf_C7Zr6vV_BME84n1zJPgk7',
  },
  {
    name: 'Nike Air Force 1',
    location: 'Enviado a Arequipa',
    price: '$110',
    time: 'Hace 5 horas',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD47Pc4QhdiDw6ZiT41e0erq82c30co7oSp3XO1_hAs0ceKqDK7xtOSYMjSoMrMQMstGdfv3MHKqg4AIbHqRU_87UZ_aQGxZuZsKRWfZt6su6bv7Tvvp3_CBaG73XqLh_r8HnvOFDR-wUwZSHQIVH-VwAbg5Bfm4Kuit-wmpAWZ1f02A8y4TNt2Z2EywtuTrBYu05pgdVzkRBLEHrc0L0cgQOGT0dOzIiACiEvNlNj0kFORfS-cQlOSLDOojTNoDuNPpvkn6w9_RizW',
  },
]

const agents = [
  {
    initials: 'AV',
    name: 'Andrea Valdivia',
    info: 'Lima · 1,240 gestiones exitosas',
    stars: 5,
    color: 'bg-secondary/20 border-secondary',
  },
  {
    initials: 'CM',
    name: 'Carlos Mendez',
    info: 'Trujillo · 850 gestiones exitosas',
    stars: 4,
    color: 'bg-blue-500/20 border-blue-500',
  },
]

export default function SocialProof() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollReveal()
  const { ref: leftRef, isVisible: leftVisible } = useScrollReveal(0.1)
  const { ref: rightRef, isVisible: rightVisible } = useScrollReveal(0.1)

  return (
    <section className="py-32 bg-background-cream">
      <div className="max-w-7xl mx-auto px-8">
        <div ref={titleRef} className={`text-center mb-20 reveal ${titleVisible ? 'visible' : ''}`}>
          <h2 className="font-headline text-4xl font-extrabold text-primary mb-4">Comunidad TeVra</h2>
          <p className="text-text-muted">Cientos de usuarios y agentes conectando cada dia.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div ref={leftRef} className={`bg-surface-container-lowest p-10 rounded-3xl shadow-soft reveal-left ${leftVisible ? 'visible' : ''}`}>
            <h3 className="font-headline font-extrabold text-xl mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">flash_on</span>
              Ventas Recientes
            </h3>
            <div className="space-y-6">
              {recentSales.map((sale) => (
                <div
                  key={sale.name}
                  className="flex items-center gap-4 p-4 hover:bg-surface-container-low rounded-2xl transition-colors border border-transparent hover:border-outline-variant/20"
                >
                  <div className="w-14 h-14 rounded-xl bg-surface-container-low overflow-hidden flex-shrink-0">
                    <img alt={sale.name} className="w-full h-full object-cover" src={sale.image} />
                  </div>
                  <div className="flex-grow">
                    <div className="font-bold text-primary">{sale.name}</div>
                    <div className="text-xs text-text-muted">{sale.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-secondary font-black text-lg">{sale.price}</div>
                    <div className="text-[10px] uppercase font-bold text-text-muted/50">{sale.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div ref={rightRef} className={`bg-primary p-10 rounded-3xl shadow-soft text-white relative overflow-hidden reveal-right ${rightVisible ? 'visible' : ''}`}>
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <span className="material-symbols-outlined text-[120px]">support_agent</span>
            </div>
            <h3 className="font-headline font-extrabold text-xl mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">stars</span>
              Agentes Certificados
            </h3>
            <div className="space-y-6 relative z-10">
              {agents.map((agent) => (
                <div
                  key={agent.initials}
                  className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center gap-5 hover:bg-white/10 transition-colors"
                >
                  <div className={`w-16 h-16 rounded-full ${agent.color} border-2 flex items-center justify-center font-black text-xl`}>
                    {agent.initials}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{agent.name}</div>
                    <div className="text-white/60 text-sm">{agent.info}</div>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`material-symbols-outlined text-secondary text-sm ${i < agent.stars ? 'fill-icon' : ''}`}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
