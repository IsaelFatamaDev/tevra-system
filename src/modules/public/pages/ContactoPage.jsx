import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TEVRA_SUPPORT_WHATSAPP, TEVRA_INSTAGRAM_URL } from '../../../core/config/constants'
export default function ContactoPage() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  const contactMethods = [
    {
      icon: 'mail',
      color: 'bg-secondary/10 text-secondary',
      title: t('contact.methods.email.title'),
      value: 'soporte@tevra.com',
      link: 'mailto:soporte@tevra.com',
    },
    {
      icon: 'chat',
      color: 'bg-mint/10 text-mint',
      title: 'WhatsApp',
      value: t('contact.methods.whatsapp.value'),
      link: `https://wa.me/${TEVRA_SUPPORT_WHATSAPP.replace(/\D/g, '')}`,
    },
    {
      icon: 'public',
      color: 'bg-accent-gold/10 text-accent-gold',
      title: t('contact.methods.social.title'),
      value: '@tevra.tech',
      link: TEVRA_INSTAGRAM_URL,
    },
  ]

  return (
    <main className="min-h-screen bg-background-cream" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
      <section className="tevra-hero-gradient py-16 sm:py-20 overflow-hidden">
        <div className="tevra-hero-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 hero-enter">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-5">
            <span className="w-2 h-2 bg-tevra-coral rounded-full animate-pulse" />
            <span className="text-white text-[11px] font-bold uppercase tracking-widest">{t('contact.badge')}</span>
          </div>
          <h1 className="font-headline font-extrabold text-white tracking-tight mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            {t('contact.title')}
          </h1>
          <p className="text-white/70 max-w-xl" style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)' }}>
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact methods */}
          <div className="space-y-5">
            <h2 className="font-headline font-bold text-2xl text-primary mb-6">{t('contact.howToReach')}</h2>
            {contactMethods.map((m) => (
              <a key={m.title} href={m.link} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-soft hover:-translate-y-0.5 hover:shadow-premium transition-all duration-300 group">
                <div className={`w-12 h-12 ${m.color} rounded-2xl flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-xl">{m.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-muted">{m.title}</p>
                  <p className="font-bold text-primary group-hover:text-secondary transition-colors">{m.value}</p>
                </div>
                <span className="material-symbols-outlined text-outline ml-auto">arrow_forward</span>
              </a>
            ))}

            <div className="p-6 bg-primary rounded-2xl text-white mt-8">
              <span className="material-symbols-outlined text-3xl text-secondary mb-3 block">schedule</span>
              <h4 className="font-headline font-bold text-lg mb-2">{t('contact.hours.title')}</h4>
              <p className="text-white/70 text-sm">{t('contact.hours.weekdays')}</p>
              <p className="text-white/70 text-sm">{t('contact.hours.saturday')}</p>
              <p className="text-white/50 text-xs mt-2">{t('contact.hours.timezone')}</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-surface-container-lowest rounded-3xl p-8 sm:p-10 shadow-soft border border-outline-variant/20">
              {sent ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-20 h-20 bg-mint/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-5xl text-mint" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <h3 className="font-headline font-extrabold text-2xl text-primary">{t('contact.sent.title')}</h3>
                  <p className="text-text-muted max-w-sm mx-auto">{t('contact.sent.desc')}</p>
                  <button onClick={() => setSent(false)} className="mt-4 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-secondary transition-colors">
                    {t('contact.sent.another')}
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-headline font-bold text-2xl text-primary mb-6">{t('contact.form.title')}</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wide text-text-muted">{t('contact.form.name')}</label>
                        <input
                          value={form.name} required
                          onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                          className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-4 py-3 rounded-t-lg outline-none text-on-background transition-colors"
                          placeholder={t('contact.form.namePlaceholder')}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wide text-text-muted">{t('contact.form.email')}</label>
                        <input
                          type="email" value={form.email} required
                          onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                          className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-4 py-3 rounded-t-lg outline-none text-on-background transition-colors"
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wide text-text-muted">{t('contact.form.subject')}</label>
                      <select
                        value={form.subject} required
                        onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))}
                        className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-4 py-3 rounded-t-lg outline-none text-on-background transition-colors"
                      >
                        <option value="">{t('contact.form.subjectPlaceholder')}</option>
                        <option>{t('contact.form.subjects.order')}</option>
                        <option>{t('contact.form.subjects.agent')}</option>
                        <option>{t('contact.form.subjects.payment')}</option>
                        <option>{t('contact.form.subjects.tracking')}</option>
                        <option>{t('contact.form.subjects.other')}</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wide text-text-muted">{t('contact.form.message')}</label>
                      <textarea
                        value={form.message} required rows={5}
                        onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                        className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-4 py-3 rounded-t-xl outline-none text-on-background transition-colors"
                        placeholder={t('contact.form.messagePlaceholder')}
                      />
                    </div>
                    <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-headline font-bold text-sm hover:bg-secondary transition-colors shadow-lg flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-base">send</span>
                      {t('contact.form.send')}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
