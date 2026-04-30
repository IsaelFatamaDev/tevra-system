import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../../core/services/api'

export default function EmailVerifiedPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('loading') // loading | success | error

  useEffect(() => {
    if (!token) {
      setStatus('success')
      return
    }
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-background-cream flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="min-h-screen bg-background-cream flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-red-500 text-5xl">error</span>
          </div>
          <h1 className="font-headline font-extrabold text-2xl text-primary">{t('emailVerified.errorTitle')}</h1>
          <p className="text-text-muted">{t('emailVerified.errorDesc')}</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors">
            <span className="material-symbols-outlined text-lg">login</span>
            {t('emailVerified.goLogin')}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background-cream flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100">
          <span className="material-symbols-outlined text-emerald-500 text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
        </div>

        <div className="space-y-2">
          <h1 className="font-headline font-extrabold text-3xl text-primary">{t('emailVerified.title')}</h1>
          <p className="text-text-muted leading-relaxed">{t('emailVerified.desc')}</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-emerald-600 text-xl shrink-0">check_circle</span>
          <p className="text-sm font-medium text-emerald-800">{t('emailVerified.accountReady')}</p>
        </div>

        <Link
          to="/login"
          className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-dark transition-all shadow-lg hover:-translate-y-0.5"
        >
          <span className="material-symbols-outlined">login</span>
          {t('emailVerified.loginBtn')}
        </Link>

        <p className="text-xs text-text-muted">
          {t('emailVerified.footer')}
        </p>
      </div>
    </main>
  )
}
