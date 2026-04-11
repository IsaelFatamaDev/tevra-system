import { useState, useRef } from 'react'
import api from '../services/api'

export default function AvatarUpload({ currentUrl, name, onUploaded, size = 'md' }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const inputRef = useRef(null)

  const sizes = {
    sm: { container: 'w-16 h-16', text: 'text-lg', icon: 'text-[14px]' },
    md: { container: 'w-20 h-20', text: 'text-xl', icon: 'text-[16px]' },
    lg: { container: 'w-24 h-24', text: 'text-2xl', icon: 'text-[18px]' },
  }
  const s = sizes[size] || sizes.md

  const initials = (name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const displayUrl = preview || currentUrl

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo no debe superar 5MB')
      return
    }

    setPreview(URL.createObjectURL(file))
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const media = await api.upload('/media/upload?entityType=avatar', formData)
      const avatarUrl = media?.url || media?.data?.url
      if (avatarUrl) {
        await api.put('/users/me', { avatarUrl })
        onUploaded?.(avatarUrl)
      }
    } catch (err) {
      console.error('Avatar upload failed', err)
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative group inline-block">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
        className={`${s.container} rounded-full overflow-hidden border-2 border-outline-variant hover:border-primary/40 transition-all relative focus:outline-none focus:ring-2 focus:ring-primary/20`}>
        {displayUrl ? (
          <img src={displayUrl} alt={name || 'Avatar'} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-primary/10 flex items-center justify-center ${s.text} font-bold text-primary`}>
            {initials || <span className="material-symbols-outlined">person</span>}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center ${uploading ? 'hidden' : ''}`}>
          <span className={`material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity ${s.icon}`}>photo_camera</span>
        </div>
      </button>
    </div>
  )
}
