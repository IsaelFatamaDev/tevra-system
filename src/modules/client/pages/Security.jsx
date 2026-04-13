import { useState, useEffect } from 'react'
import { useAuth } from '../../../core/contexts/AuthContext'
import api from '../../../core/services/api'
import AvatarUpload from '../../../core/components/AvatarUpload'

export default function ClientSecurity() {
  const { user, refreshUser } = useAuth()
  const [tab, setTab] = useState('profile')

  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '', whatsapp: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)
  const [profileErrors, setProfileErrors] = useState({})

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
    if (!profile.firstName.trim()) e.firstName = 'Requerido'
    if (!profile.lastName.trim()) e.lastName = 'Requerido'
    setProfileErrors(e)
    return Object.keys(e).length === 0
  }

  const handleProfileSave = async () => {
    if (!validateProfile()) return
    setProfileSaving(true)
    setProfileMsg(null)
    try {
      await api.put('/users/me', profile)
      setProfileMsg({ type: 'success', text: 'Tus datos se guardaron correctamente.' })
      if (refreshUser) refreshUser()
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Error al guardar. Intenta de nuevo.' })
    } finally {
      setProfileSaving(false)
    }
  }

  const validatePasswords = () => {
    const e = {}
    if (!passwords.currentPassword) e.currentPassword = 'Debes ingresar tu clave actual'
    if (!passwords.newPassword) e.newPassword = 'Crea una clave nueva'
    else if (passwords.newPassword.length < 6) e.newPassword = 'Mínimo 6 caracteres requeridos'
    if (passwords.newPassword !== passwords.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden'
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
      setPwMsg({ type: 'success', text: 'Tu contraseña ha sido actualizada y asegurada.' })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message || 'Error al cambiar contraseña' })
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
    { id: 'profile', label: 'Información Personal', icon: 'manage_accounts' },
    { id: 'password', label: 'Seguridad y Accesos', icon: 'shield_lock' },
  ]

  return (
    <div className="space-y-8 platform-enter max-w-4xl mx-auto pb-10">
      
      {/* Header */}
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-slate-900 tracking-tight">Privacidad y Seguridad</h1>
        <p className="text-slate-500 mt-1">Administra tu identidad, foto de perfil y credenciales de acceso a TeVra.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100/50 border border-slate-200 rounded-2xl w-max max-w-full overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setProfileMsg(null); setPwMsg(null); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${tab === t.id 
              ? 'bg-white text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.06)]' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            {t.label}
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
                Rol: {user?.role === 'customer' ? 'Cuenta de Cliente' : user?.role}
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
            <InputModern label="Nombres" icon="badge" value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} error={profileErrors.firstName} />
            <InputModern label="Apellidos" icon="badge" value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} error={profileErrors.lastName} />
            <InputModern label="Línea Telefónica Móvil" icon="phone_iphone" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+51 999 999 999" />
            <InputModern label="Línea WhatsApp" icon="chat" value={profile.whatsapp} onChange={e => setProfile({ ...profile, whatsapp: e.target.value })} placeholder="+51 999 999 999" />
          </div>

          <div className="flex justify-end mt-10">
            <button
              onClick={handleProfileSave}
              disabled={profileSaving}
              className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] disabled:opacity-50 flex items-center gap-2"
            >
              {profileSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[20px]">save</span>}
              Guardar todos los cambios
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
               <h3 className="font-headline text-xl font-extrabold text-slate-900">Credenciales de Acceso</h3>
               <p className="text-sm text-slate-500 font-medium">Blinda tu cuenta utilizando una contraseña de alta complejidad.</p>
             </div>
          </div>

          {pwMsg && (
            <div className={`mb-8 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border ${pwMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              <span className="material-symbols-outlined text-[20px]">{pwMsg.type === 'success' ? 'verified_user' : 'error'}</span>
              {pwMsg.text}
            </div>
          )}

          <div className="space-y-6">
            <InputModern type="password" label="Contraseña Actual" icon="key" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} error={pwErrors.currentPassword} />
            <div className="pt-4 border-t border-slate-100 border-dashed"></div>
            <InputModern type="password" label="Nueva Contraseña" icon="lock_reset" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} error={pwErrors.newPassword} placeholder="Mínimo 6 caracteres" />
            <InputModern type="password" label="Repite Nueva Contraseña" icon="lock_person" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} error={pwErrors.confirmPassword} />
          </div>

          <div className="flex justify-end mt-10">
            <button
              onClick={handlePasswordChange}
              disabled={pwSaving}
              className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] disabled:opacity-50 flex items-center gap-2"
            >
              {pwSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[20px]">enhanced_encryption</span>}
              Asegurar Cuenta
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
