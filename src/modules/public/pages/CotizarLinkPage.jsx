import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../../core/hooks/useCart'
import { useAuth } from '../../../core/contexts/AuthContext'

export default function CotizarLinkPage() {
  const { t } = useTranslation()
  const { selectedAgent } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')

  const isValidUrl = url.trim().length > 0

  const buildWhatsAppMessage = () => {
    const agentName = selectedAgent
      ? `${selectedAgent.name || 'Agente'}`
      : 'equipo de TeVra'

    let msg = `Hola ${agentName}, me gustaría cotizar el siguiente producto de USA:\n\n`
    msg += `🔗 ${url.trim()}\n`
    if (notes.trim()) {
      msg += `\n📝 ${notes.trim()}\n`
    }
    msg += `\n¿Podrías darme el precio total con envío incluido hasta Perú? Gracias 🙏`
    return msg
  }

  const handleSend = () => {
    const phone = (selectedAgent?.whatsapp || '').replace(/[^0-9]/g, '')
    if (!phone) {
      alert('Selecciona un agente con número de WhatsApp para enviar la cotización.')
      return
    }
    const msg = encodeURIComponent(buildWhatsAppMessage())
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
    navigate('/')
  }

  return (
    <main
      className="min-h-screen bg-background-cream"
      style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20 mb-4">
            <span className="material-symbols-outlined text-secondary text-sm">link</span>
            <span className="text-secondary text-[11px] font-black uppercase tracking-widest">
              Cotizar por Link
            </span>
          </div>
          <h1 className="font-headline font-extrabold text-3xl text-primary mb-2">
            ¿No encuentras lo que buscas?
          </h1>
          <p className="text-text-muted max-w-md mx-auto">
            Pega el link del producto de cualquier tienda de USA y tu agente te cotizará el precio total con envío incluido.
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 shadow-soft p-8 space-y-6">

          {/* URL Input */}
          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              Link del producto <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-outline-variant/30 bg-surface-container-low focus-within:border-primary/50 transition-colors">
              <span className="material-symbols-outlined text-text-muted text-xl shrink-0">link</span>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://www.amazon.com/dp/..."
                className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-text-muted/50"
              />
              {isValidUrl && (
                <span className="material-symbols-outlined text-mint text-xl shrink-0">check_circle</span>
              )}
            </div>
            <p className="text-xs text-text-muted mt-1.5">
              Amazon, Nike, Apple, Walmart, eBay, Target y cualquier otra tienda USA.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              Notas adicionales{' '}
              <span className="text-text-muted font-normal">(opcional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Ej: talla M, color negro, modelo específico..."
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none placeholder:text-text-muted/50"
            />
          </div>

          {/* Agent selection */}
          <div className="rounded-2xl border border-outline-variant/15 bg-surface-container p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Tu Agente</p>
            {selectedAgent ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {selectedAgent.avatar ? (
                    <img src={selectedAgent.avatar} alt={selectedAgent.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="material-symbols-outlined text-primary text-lg">support_agent</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-primary truncate">{selectedAgent.name}</p>
                  <p className="text-xs text-text-muted">{selectedAgent.city}</p>
                </div>
                <Link
                  to="/directorio-agentes"
                  className="text-xs text-secondary font-bold hover:underline shrink-0"
                >
                  Cambiar
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-text-muted">
                  Selecciona un agente para enviar tu cotización
                </p>
                <Link
                  to="/directorio-agentes"
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-secondary transition-colors whitespace-nowrap"
                >
                  Elegir agente
                </Link>
              </div>
            )}
          </div>

          {/* Message preview */}
          {isValidUrl && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">preview</span>
                Vista previa del mensaje
              </p>
              <div className="bg-[#e5ddd5] rounded-xl p-4">
                <div className="bg-[#dcf8c6] rounded-xl p-4 max-w-xs ml-auto shadow-sm">
                  <pre className="whitespace-pre-wrap text-xs text-gray-800 font-sans leading-relaxed">
                    {buildWhatsAppMessage()}
                  </pre>
                  <p className="text-right text-[10px] text-gray-500 mt-2">Ahora ✓✓</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {isAuthenticated ? (
            <button
              onClick={handleSend}
              disabled={!isValidUrl || !selectedAgent}
              className="w-full bg-[#25D366] hover:bg-[#1ebd5e] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-200 disabled:opacity-40 disabled:cursor-not-allowed text-base"
            >
              <span className="material-symbols-outlined">chat</span>
              Enviar cotización por WhatsApp
            </button>
          ) : (
            <Link
              to="/login?redirect=/cotizar-link"
              className="w-full bg-primary hover:bg-secondary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg text-base"
            >
              <span className="material-symbols-outlined">login</span>
              Inicia sesión para cotizar
            </Link>
          )}

          {!selectedAgent && isAuthenticated && isValidUrl && (
            <p className="text-center text-xs text-amber-600 font-medium">
              Debes seleccionar un agente antes de enviar.
            </p>
          )}
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          También puedes{' '}
          <Link to="/catalogo" className="text-secondary font-bold hover:underline">
            explorar nuestro catálogo
          </Link>{' '}
          con miles de productos listos para cotizar.
        </p>
      </div>
    </main>
  )
}
