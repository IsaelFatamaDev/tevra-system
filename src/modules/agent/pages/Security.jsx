import { useState, useEffect } from 'react'
import { useAuth } from '../../../core/contexts/AuthContext'
import api from '../../../core/services/api'
import AvatarUpload from '../../../core/components/AvatarUpload'

export default function AgentSecurity() {
  const { user, refreshUser } = useAuth()
  const [tab, setTab] = useState('profile')

  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '', whatsapp: '' })
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)
  const [profileErrors, setProfileErrors] = useState({})

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)
  const [pwErrors, setPwErrors] = useState({})

  useEffect(() => {
    api.get('/users/me').then(data => {
      setProfile({ firstName: data.firstName || '', lastName: data.lastName || '', phone: data.phone || '', whatsapp: data.whatsapp || '' })
      setAvatarUrl(data.avatarUrl || null)
    }).catch(() => { })
  }, [])

  const validateProfile = () => {
    const e = {}
    if (!profile.firstName.trim()) e.firstName = 'Nombre requerido'
    if (!profile.lastName.trim()) e.lastName = 'Apellido requerido'
    setProfileErrors(e)
    return Object.keys(e).length === 0
  }

  const handleProfileSave = async () => {
    if (!validateProfile()) return
    setProfileSaving(true)
    setProfileMsg(null)
    try {
      await api.put('/users/me', profile)
      setProfileMsg({ type: 'success', text: 'Perfil actualizado correctamente' })
      if (refreshUser) refreshUser()
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Error al guardar' })
    } finally { setProfileSaving(false) }
  }

  const validatePasswords = () => {
    const e = {}
    if (!passwords.currentPassword) e.currentPassword = 'Requerido'
    if (!passwords.newPassword) e.newPassword = 'Requerido'
    else if (passwords.newPassword.length < 6) e.newPassword = 'Mínimo 6 caracteres'
    if (passwords.newPassword !== passwords.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden'
    setPwErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePasswordChange = async () => {
    if (!validatePasswords()) return
    setPwSaving(true)
    setPwMsg(null)
    try {
      await api.post('/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
      setPwMsg({ type: 'success', text: 'Contraseña actualizada correctamente' })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message || 'Error al cambiar contraseña' })
    } finally { setPwSaving(false) }
  }

  const tabs = [
    { id: 'profile', label: 'Mi Perfil', icon: 'person' },
    { id: 'password', label: 'Contraseña', icon: 'lock' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-background">Seguridad y Perfil</h1>
        <p className="text-sm text-text-muted mt-1">Administra tu información personal y contraseña</p>
      </div>

      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? 'bg-primary text-white shadow-md' : 'bg-white text-text-muted hover:bg-surface-container-low border border-outline-variant/10'}`}>
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-6">
            <AvatarUpload currentUrl={avatarUrl} name={`${user?.firstName || ''} ${user?.lastName || ''}`} size="lg"
              onUploaded={(url) => { setAvatarUrl(url); if (refreshUser) refreshUser() }} />
            <div>
              <p className="font-semibold text-on-background">{user?.email}</p>
              <p className="text-xs text-text-muted">Agente Verificado</p>
            </div>
          </div>
          {profileMsg && (
            <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{profileMsg.text}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Nombre</label>
              <input value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${profileErrors.firstName ? 'border-red-400' : 'border-outline-variant/20'} bg-surface-container-low/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none`} />
              {profileErrors.firstName && <p className="text-xs text-red-500 mt-1">{profileErrors.firstName}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Apellido</label>
              <input value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${profileErrors.lastName ? 'border-red-400' : 'border-outline-variant/20'} bg-surface-container-low/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none`} />
              {profileErrors.lastName && <p className="text-xs text-red-500 mt-1">{profileErrors.lastName}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Teléfono</label>
              <input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-low/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="+51 999 999 999" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">WhatsApp</label>
              <input value={profile.whatsapp} onChange={e => setProfile({ ...profile, whatsapp: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-low/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="+51 999 999 999" />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={handleProfileSave} disabled={profileSaving}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
              {profileSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Guardar cambios
            </button>
          </div>
        </div>
      )}

      {tab === 'password' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10 max-w-lg">
          <h3 className="font-semibold text-on-background mb-1">Cambiar contraseña</h3>
          <p className="text-xs text-text-muted mb-6">Asegúrate de usar una contraseña segura de al menos 6 caracteres</p>
          {pwMsg && (
            <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${pwMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{pwMsg.text}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Contraseña actual</label>
              <input type="password" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${pwErrors.currentPassword ? 'border-red-400' : 'border-outline-variant/20'} bg-surface-container-low/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none`} />
              {pwErrors.currentPassword && <p className="text-xs text-red-500 mt-1">{pwErrors.currentPassword}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Nueva contraseña</label>
              <input type="password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${pwErrors.newPassword ? 'border-red-400' : 'border-outline-variant/20'} bg-surface-container-low/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none`} />
              {pwErrors.newPassword && <p className="text-xs text-red-500 mt-1">{pwErrors.newPassword}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Confirmar nueva contraseña</label>
              <input type="password" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${pwErrors.confirmPassword ? 'border-red-400' : 'border-outline-variant/20'} bg-surface-container-low/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none`} />
              {pwErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{pwErrors.confirmPassword}</p>}
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={handlePasswordChange} disabled={pwSaving}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
              {pwSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Cambiar contraseña
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
