import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import reviewsService from '../../modules/public/services/reviews.service'

export default function ReviewModal({ isOpen, onClose, type, targetId, targetName, onSubmitted }) {
  const { t } = useTranslation()
  const [rating, setRating] = useState(5)
  const [hovered, setHovered] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const typeLabels = {
    product: 'producto',
    agent: 'agente',
    tevra: 'servicio TeVra',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await reviewsService.create({
        type,
        targetId: targetId || undefined,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
      })
      setSubmitted(true)
      onSubmitted?.()
    } catch (err) {
      setError(err.message || 'Error al enviar la reseña')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setRating(5)
    setTitle('')
    setComment('')
    setSubmitted(false)
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>

        <div className="bg-gradient-to-br from-primary to-primary/80 px-6 py-5 text-white">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-headline font-bold text-lg">Dejar reseña</h3>
            <button onClick={handleClose} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
          <p className="text-white/70 text-sm">
            {targetName ? `Tu opinión sobre: ${targetName}` : `Califica el ${typeLabels[type] || 'servicio'}`}
          </p>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-5xl text-emerald-500 mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <p className="font-bold text-slate-900 text-lg mb-1">¡Gracias por tu reseña!</p>
              <p className="text-slate-500 text-sm mb-5">Tu opinión ayuda a otros usuarios.</p>
              <button onClick={handleClose} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-secondary transition-colors">
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">Calificación</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <span
                        className="material-symbols-outlined text-3xl text-amber-400"
                        style={{ fontVariationSettings: star <= (hovered || rating) ? "'FILL' 1" : "'FILL' 0" }}
                      >star</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Título (opcional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Resumen en una línea..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tu reseña *</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Cuéntanos tu experiencia..."
                  rows={4}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none"
                />
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={submitting || !comment.trim()}
                className="w-full py-3 bg-primary text-white rounded-xl font-headline font-bold text-sm hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {submitting ? 'Enviando...' : 'Publicar reseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
