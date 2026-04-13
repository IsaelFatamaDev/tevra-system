import { useTranslation } from 'react-i18next'
import useScrollReveal from '../../../core/hooks/useScrollReveal'

const stepIcons = ['find_in_page', 'chat_bubble', 'inventory_2']
const stepNumbers = ['01', '02', '03']

export default function StepsSection() {
  const { t } = useTranslation()
  const { ref: titleRef, isVisible: titleVisible } = useScrollReveal()
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal(0.1)

  const steps = t('home.steps.steps', { returnObjects: true })

  return (
    <section className="py-32 bg-background-cream">
      <div className="max-w-7xl mx-auto px-8">
        <div ref={titleRef} className={`max-w-2xl mb-20 reveal ${titleVisible ? 'visible' : ''}`}>
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-primary mb-6 tracking-tight">
            {t('home.steps.title')}
          </h2>
          <p className="text-text-muted text-lg leading-relaxed">
            {t('home.steps.subtitle')}
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={stepNumbers[i]}
              className={`bg-surface-container-lowest p-12 rounded-3xl shadow-soft hover:shadow-premium hover:-translate-y-2 transition-all duration-500 group reveal ${gridVisible ? 'visible' : ''} stagger-${i + 1}`}
            >
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary transition-colors duration-500">
                <span className="material-symbols-outlined text-3xl text-primary group-hover:text-white transition-colors">
                  {stepIcons[i]}
                </span>
              </div>
              <span className="text-secondary font-bold text-xs uppercase tracking-widest block mb-4">
                {t('home.steps.step')} {stepNumbers[i]}
              </span>
              <h3 className="font-headline font-extrabold text-2xl mb-4 text-primary">
                {step.title}
              </h3>
              <p className="text-text-muted leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
