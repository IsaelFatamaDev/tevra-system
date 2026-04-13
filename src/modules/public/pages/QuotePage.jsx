import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../../core/hooks/useCart'
import { useAuth } from '../../../core/contexts/AuthContext'
import ordersService from '../services/orders.service'

export default function QuotePage() {
  const { items, selectedAgent, getSubtotal, getCount, clearCart } = useCart()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [loading, setLoading] = useState(false)

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background-cream flex items-center justify-center" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
        <div className="text-center space-y-6">
          <span className="material-symbols-outlined text-7xl text-outline-variant/40 block">shopping_cart</span>
          <h1 className="font-headline font-extrabold text-3xl text-primary">Tu carrito está vacío</h1>
          <p className="text-text-muted">Agrega productos antes de cotizar.</p>
          <Link to="/catalogo" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-headline font-bold hover:bg-primary-dark transition-colors">
            Ir al catálogo
          </Link>
        </div>
      </main>
    )
  }

  if (!selectedAgent) {
    return (
      <main className="min-h-screen bg-background-cream flex items-center justify-center" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
        <div className="text-center space-y-6">
          <span className="material-symbols-outlined text-7xl text-outline-variant/40 block">support_agent</span>
          <h1 className="font-headline font-extrabold text-3xl text-primary">Selecciona un agente</h1>
          <p className="text-text-muted max-w-md">Elige un agente de nuestro directorio para enviar tu cotización por WhatsApp.</p>
          <Link to="/directorio-agentes" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-headline font-bold hover:bg-primary-dark transition-colors">
            <span className="material-symbols-outlined">group</span>
            Ver agentes disponibles
          </Link>
        </div>
      </main>
    )
  }

  const buildWhatsAppMessage = (orderNumber) => {
    let msg = `¡Hola ${selectedAgent.name}!\n\n`
    if (orderNumber) {
      msg += `Acabo de registrar el pedido *${orderNumber}* en la plataforma de TeVra.\n`
    } else {
      msg += `Quiero cotizar estos productos de TeVra:\n`
    }
    msg += `━━━━━━━━━━━━━━━━\n\n`

    items.forEach((item, i) => {
      msg += `${i + 1}. *${item.name}*\n`
      msg += `   Precio: $${Number(item.price).toFixed(0)} USD`
      if (item.qty > 1) msg += ` × ${item.qty} = $${(item.price * item.qty).toFixed(0)} USD`
      msg += `\n`
      if (item.brand) msg += `   Marca: ${item.brand}\n`
      msg += `\n`
    })

    msg += `━━━━━━━━━━━━━━━━\n`
    msg += `*${getCount()} producto${getCount() > 1 ? 's' : ''}*\n`
    msg += `*Subtotal: $${getSubtotal().toFixed(0)} USD*\n\n`
    msg += `¿Me pueden dar el costo total con envío?`

    return msg
  }

  const handleSendWhatsApp = async () => {
    const phone = (selectedAgent.whatsapp || '').replace(/[^0-9]/g, '')
    if (!phone) {
      alert('Este agente no tiene número de WhatsApp registrado. Intenta con otro agente.')
      return
    }

    let orderNumber = null;
    try {
      setLoading(true);
      const dto = {
        agentId: selectedAgent.id,
        items: items.map(i => ({
          productId: i.productId,
          productName: i.name,
          productImage: i.image,
          quantity: i.qty,
          unitPrice: i.price,
        })),
        notes: "Cotización iniciada vía WhatsApp",
      };
      
      const res = await ordersService.create(dto);
      orderNumber = res.orderNumber;
    } catch (error) {
       console.error("Error al crear el pedido", error);
       alert("Hubo un error al registrar el pedido en el sistema. Puedes intentar de nuevo.");
       setLoading(false);
       return;
    } finally {
       setLoading(false);
    }

    const msg = encodeURIComponent(buildWhatsAppMessage(orderNumber))
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
    clearCart();
    // Redirect to the client's active orders
    navigate('/mi-cuenta/pedidos')
  }

  return (
    <main className="min-h-screen bg-background-cream" style={{ paddingTop: 'clamp(3.5rem, 8vh, 5rem)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10 mb-4">
            <span className="material-symbols-outlined text-primary text-sm">receipt_long</span>
            <span className="text-primary text-[11px] font-bold uppercase tracking-widest">Resumen de cotización</span>
          </div>
          <h1 className="font-headline font-extrabold text-3xl text-primary mb-2">Confirma tu cotización</h1>
          <p className="text-text-muted">Revisa los detalles y envía tu pedido por WhatsApp al agente.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Products list */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="font-headline font-bold text-lg text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">shopping_bag</span>
              Productos ({getCount()})
            </h2>
            {items.map(item => (
              <div key={item.productId} className="bg-surface-container-lowest rounded-xl p-4 flex gap-4 shadow-soft">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-surface-container-low shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-surface-container-low flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl text-outline-variant">image</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {item.brand && <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{item.brand}</p>}
                  <p className="font-bold text-primary text-sm truncate">{item.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-text-muted">Cantidad: {item.qty}</span>
                    <span className="font-black text-primary">${(item.price * item.qty).toFixed(0)} <span className="text-xs text-text-muted">USD</span></span>
                  </div>
                </div>
              </div>
            ))}

            {/* Totals */}
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-soft space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Subtotal</span>
                <span className="font-bold text-primary">${getSubtotal().toFixed(0)} USD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Envío</span>
                <span className="text-xs font-bold text-mint">A cotizar por agente</span>
              </div>
              <div className="border-t border-outline-variant/20 pt-3 flex justify-between">
                <span className="font-bold text-primary text-lg">Total estimado</span>
                <span className="font-black text-2xl text-secondary">${getSubtotal().toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Agent + CTA */}
          <div className="lg:col-span-2">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-soft sticky top-28 space-y-6">
              <h2 className="font-headline font-bold text-lg text-primary">Tu agente</h2>

              <div className="flex items-center gap-4 bg-surface-container rounded-xl p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {selectedAgent.avatar ? (
                    <img src={selectedAgent.avatar} alt={selectedAgent.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="material-symbols-outlined text-primary text-xl">support_agent</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-primary truncate">{selectedAgent.name}</p>
                  <p className="text-xs text-text-muted">{selectedAgent.city}</p>
                </div>
              </div>

              {isAuthenticated ? (
                <button
                  onClick={handleSendWhatsApp}
                  disabled={loading}
                  className="w-full bg-[#25D366] hover:bg-[#1ebd5e] text-white py-3.5 px-4 rounded-xl font-bold flex flex-wrap items-center justify-center gap-2 transition-all shadow-lg shadow-green-200 text-base sm:text-lg disabled:opacity-50"
                >
                  <span className="material-symbols-outlined shrink-0">
                    {loading ? 'hourglass_empty' : 'chat'}
                  </span>
                  <span className="text-center">
                    {loading ? 'Procesando...' : 'Confirmar por WhatsApp'}
                  </span>
                </button>
              ) : (
                <Link
                  to="/login?redirect=/cotizar"
                  className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg text-lg"
                >
                  <span className="material-symbols-outlined">login</span>
                  Iniciar sesión para cotizar
                </Link>
              )}

              <div className="text-center">
                <Link to="/directorio-agentes" className="text-xs text-secondary font-bold hover:underline">
                  Cambiar agente
                </Link>
              </div>

              <div className="border-t border-outline-variant/20 pt-4 space-y-2">
                <div className="flex items-start gap-2 text-xs text-text-muted">
                  <span className="material-symbols-outlined text-sm text-mint shrink-0">info</span>
                  <p>Al enviar, tu agente recibirá la lista completa y te responderá con el precio total incluyendo envío.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Link to="/carrito" className="flex-1 text-center py-3 rounded-xl border border-outline-variant/20 text-sm font-bold text-text-muted hover:bg-surface-container transition-colors">
                  Editar carrito
                </Link>
                <button
                  onClick={() => { clearCart(); navigate('/catalogo') }}
                  className="px-4 py-3 rounded-xl border border-outline-variant/20 text-sm font-bold text-red-400 hover:bg-red-50 transition-colors"
                >
                  Vaciar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp preview */}
        <div className="mt-12 bg-surface-container-lowest rounded-2xl p-8 shadow-soft">
          <h3 className="font-headline font-bold text-lg text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">preview</span>
            Vista previa del mensaje
          </h3>
          <div className="bg-[#e5ddd5] rounded-xl p-6">
            <div className="bg-[#dcf8c6] rounded-xl p-4 max-w-lg ml-auto shadow-sm">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">{buildWhatsAppMessage()}</pre>
              <p className="text-right text-[10px] text-gray-500 mt-2">Ahora ✓✓</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
