import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'

export default function VerificationBanner() {
  const { user, resendVerificationEmail } = useAuth()
  const { t } = useTranslation()
  const [status, setStatus] = useState('idle') // idle | sending | sent

  if (!user || user.emailVerified !== false) return null

  const handleResend = async () => {
    setStatus('sending')
    try {
      await resendVerificationEmail()
      setStatus('sent')
    } catch {
      setStatus('idle')
    }
  }

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-center gap-3 text-sm">
      <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0">mail</span>
      <p className="text-amber-800 font-medium">{t('verifyBanner.message')}</p>
      <button
        onClick={handleResend}
        disabled={status !== 'idle'}
        className="ml-2 px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-60 shrink-0"
      >
        {status === 'sending'
          ? t('verifyBanner.resending')
          : status === 'sent'
          ? t('verifyBanner.sent')
          : t('verifyBanner.resend')}
      </button>
    </div>
  )
}
