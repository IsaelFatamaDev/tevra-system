import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../core/contexts/AuthContext'
import api from '../../../core/services/api'
import AvatarUpload from '../../../core/components/AvatarUpload'
import { useFieldAvailability } from '../../../core/hooks/useFieldAvailability'

export default function ClientSecurity() {
  const { t } = useTranslation()
  const { user, refreshUser } = useAuth()
  const [tab, setTab] = useState('profile')

  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '', whatsapp: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)
  const [profileErrors, setProfileErrors] = useState({})

  const availabilityFields = useMemo(() => ({ phone: profile.phone, whatsapp: profile.whatsapp }), [profile.phone, profile.whatsapp])
  const { availabilityErrors, checking } = useFieldAvailability(availabilityFields, user?.id)

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)
  const [pwErrors, setPwErrors] = useState({})
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || null)

  useEffect(() => {
    api.get('/users/me').then(data => {
      setProfile({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
      })
      if (data.avatarUrl) setAvatarUrl(data.avatarUrl)
    }).catch(() => { })
  }, [])

  const validateProfile = () => {
    const e = {}
    if (!profile.firstName.trim()) e.firstName = t('client.security.required')
    if (!profile.lastName.trim()) e.lastName = t('client.security.required')
    setProfileErrors(e)
    return Object.keys(e).length === 0
  }

  const handleProfileSave = async () => {
    if (!validateProfile()) return
    if (availabilityErrors.phone || availabilityErrors.whatsapp) {
      setProfileMsg({ type: 'error', text: availabilityErrors.phone || availabilityErrors.whatsapp })
      return
    }
    setProfileSaving(true)
    setProfileMsg(null)
    try {
      await api.put('/users/me', profile)
      setProfileMsg({ type: 'success', text: t('client.security.profileSaved') })
      if (refreshUser) refreshUser()
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || t('client.security.profileSaveError') })
    } finally {
      setProfileSaving(false)
    }
  }

  const validatePasswords = () => {
    const e = {}
    if (!passwords.currentPassword) e.currentPassword = t('client.security.enterCurrentPassword')
    if (!passwords.newPassword) e.newPassword = t('client.security.createNewPassword')
    else if (passwords.newPassword.length < 6) e.newPassword = t('client.security.min6Chars')
    if (passwords.newPassword !== passwords.confirmPassword) e.confirmPassword = t('client.security.passwordsDontMatch')
    setPwErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePasswordChange = async () => {
    if (!validatePasswords()) return
    setPwSaving(true)
    setPwMsg(null)
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })
      setPwMsg({ type: 'success', text: t('client.security.passwordUpdated') })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message || t('client.security.passwordChangeError') })
    } finally {
      setPwSaving(false)
    }
  }

  const InputModern = ({ label, icon, value, onChange, error, placeholder, type = "text" }) => (
    <div>
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className={`material-symbols-outlined text-[20px] ${error ? 'text-red-400' : 'text-slate-400'}`}>{icon}</span>
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200'}`}
        />
      </div>
      {error && <p className="text-[11px] font-bold text-red-500 mt-1.5">{error}</p>}
    </div>
  )

  const tabs = [
    { id: 'profile', label: t('client.security.tabPersonalInfo'), icon: 'manage_accounts' },
    { id: 'password', label: t('client.security.tabSecurityAccess'), icon: 'shield_lock' },
  ]

  return (
    <div className="space-y-8 platform-enter max-w-4xl mx-auto pb-10">

      {/* Header */}
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-slate-900 tracking-tight">{t('client.security.title')}</h1>
        <p className="text-slate-500 mt-1">{t('client.security.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100/50 border border-slate-200 rounded-2xl w-max max-w-full overflow-x-auto">
        {tabs.map(tb => (
          <button
            key={tb.id}
            onClick={() => { setTab(tb.id); setProfileMsg(null); setPwMsg(null); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${tab === tb.id
              ? 'bg-white text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            <span className="material-symbols-outlined text-[18px]">{tb.icon}</span>
            {tb.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Profile */}
      {tab === 'profile' && (
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100">

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8 pb-8 border-b border-slate-100">
            <div className="shrink-0 relative group cursor-pointer">
              <AvatarUpload
                currentUrl={avatarUrl}
                name={`${user?.firstName || ''} ${user?.lastName || ''}`}
                onUploaded={(url) => { setAvatarUrl(url); if (refreshUser) refreshUser() }}
                size="lg"
              />
            </div>
            <div className="text-center md:text-left pt-2">
              <h2 className="font-headline text-2xl font-extrabold text-slate-900">{user?.firstName} {user?.lastName}</h2>
              <p className="text-slate-500 font-medium mb-3">{user?.email}</p>
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-widest inline-block">
                {t('client.security.roleLabel')}: {user?.role === 'customer' ? t('client.security.customerAccount') : user?.role}
              </span>
            </div>
          </div>

          {profileMsg && (
            <div className={`mb-8 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              <span className="material-symbols-outlined text-[20px]">{profileMsg.type === 'success' ? 'check_circle' : 'error'}</span>
              {profileMsg.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InputModern label={t('client.security.firstName')} icon="badge" value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} error={profileErrors.firstName} />
            <InputModern label={t('client.security.lastName')} icon="badge" value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} error={profileErrors.lastName} />
            <div>
              <InputModern label={t('client.security.mobilePhone')} icon="phone_iphone" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+51 999 999 999" error={availabilityErrors.phone} />
              {checking.phone && <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1"><span className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin inline-block" /> {t('client.security.verifying')}</p>}
            </div>
            <div>
              <InputModern label={t('client.security.whatsappLine')} icon="chat" value={profile.whatsapp} onChange={e => setProfile({ ...profile, whatsapp: e.target.value })} placeholder="+51 999 999 999" error={availabilityErrors.whatsapp} />
              {checking.whatsapp && <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1"><span className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin inline-block" /> {t('client.security.verifying')}</p>}
            </div>
          </div>

          <div className="flex justify-end mt-10">
            <button
              onClick={handleProfileSave}
              disabled={profileSaving}
              className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] disabled:opacity-50 flex items-center gap-2"
            >
              {profileSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[20px]">save</span>}
              {t('client.security.saveAllChanges')}
            </button>
          </div>
        </div>
      )}

      {/* Tab Content: Password */}
      {tab === 'password' && (
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 flex items-center justify-center rounded-2xl shrink-0">
              <span className="material-symbols-outlined text-slate-400">password</span>
            </div>
            <div>
              <h3 className="font-headline text-xl font-extrabold text-slate-900">{t('client.security.accessCredentials')}</h3>
              <p className="text-sm text-slate-500 font-medium">{t('client.security.credentialsDesc')}</p>
            </div>
          </div>

          {pwMsg && (
            <div className={`mb-8 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border ${pwMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              <span className="material-symbols-outlined text-[20px]">{pwMsg.type === 'success' ? 'verified_user' : 'error'}</span>
              {pwMsg.text}
            </div>
          )}

          <div className="space-y-6">
            <InputModern type="password" label={t('client.security.currentPassword')} icon="key" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} error={pwErrors.currentPassword} />
            <div className="pt-4 border-t border-slate-100 border-dashed"></div>
            <InputModern type="password" label={t('client.security.newPassword')} icon="lock_reset" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} error={pwErrors.newPassword} placeholder={t('client.security.newPasswordPlaceholder')} />
            <InputModern type="password" label={t('client.security.repeatPassword')} icon="lock_person" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} error={pwErrors.confirmPassword} />
          </div>

          <div className="flex justify-end mt-10">
            <button
              onClick={handlePasswordChange}
              disabled={pwSaving}
              className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] disabled:opacity-50 flex items-center gap-2"
            >
              {pwSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[20px]">enhanced_encryption</span>}
              {t('client.security.secureAccount')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
