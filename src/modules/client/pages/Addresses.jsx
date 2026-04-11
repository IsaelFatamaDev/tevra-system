import { useState, useEffect } from 'react'
import api from '../../../core/services/api'

const EMPTY_FORM = { label: '', recipientName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', country: 'Perú', zipCode: '', isDefault: false }

export default function ClientAddresses() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const fetchAddresses = () => {
    setLoading(true)
    api.get('/users/me/addresses')
      .then(data => setAddresses(Array.isArray(data) ? data : []))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAddresses() }, [])

  const validate = () => {
    const e = {}
    if (!form.recipientName.trim()) e.recipientName = 'Nombre requerido'
    if (!form.phone.trim()) e.phone = 'Teléfono requerido'
    if (!form.addressLine1.trim()) e.addressLine1 = 'Dirección requerida'
    if (!form.city.trim()) e.city = 'Ciudad requerida'
    if (!form.state.trim()) e.state = 'Departamento requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const openCreate = () => { setForm(EMPTY_FORM); setErrors({}); setModal('create') }
  const openEdit = (addr) => {
    setSelected(addr)
    setForm({
      label: addr.label || '',
      recipientName: addr.recipientName || '',
      phone: addr.phone || '',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || '',
      state: addr.state || '',
      country: addr.country || 'Perú',
      zipCode: addr.zipCode || '',
      isDefault: addr.isDefault || false,
    })
    setErrors({})
    setModal('edit')
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (modal === 'create') await api.post('/users/me/addresses', form)
      else await api.put(`/users/me/addresses/${selected.id}`, form)
      fetchAddresses()
      setModal(null)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta dirección?')) return
    try {
      await api.delete(`/users/me/addresses/${id}`)
      fetchAddresses()
    } catch (err) { console.error(err) }
  }

  const InputField = ({ label, field, type = 'text', placeholder = '', colSpan = false }) => (
    <div className={colSpan ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-bold text-text-muted mb-1.5">{label}</label>
      <input type={type} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 bg-surface-container-low border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${errors[field] ? 'border-red-400' : 'border-outline-variant'}`} />
      {errors[field] && <p className="text-[11px] text-red-500 mt-1">{errors[field]}</p>}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-2xl font-bold text-primary">Mis Direcciones</h2>
          <p className="text-sm text-text-muted mt-1">Gestiona tus direcciones de envío.</p>
        </div>
        <button onClick={openCreate}
          className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all text-sm">
          <span className="material-symbols-outlined text-[18px]">add</span> Nueva Dirección
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-text-muted/20 block mb-3">location_on</span>
          <h3 className="font-headline text-lg font-bold text-on-background mb-1">Sin direcciones</h3>
          <p className="text-sm text-text-muted mb-4">Agrega una dirección de envío para tus pedidos</p>
          <button onClick={openCreate}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">add</span>
            Agregar Dirección
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className={`bg-white rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md ${addr.isDefault ? 'border-primary/30 ring-1 ring-primary/10' : 'border-outline-variant/10'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <span className="font-bold text-on-background text-sm">{addr.label || 'Dirección'}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full">Principal</span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(addr)} className="p-1.5 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
              <p className="text-sm text-on-background font-medium">{addr.recipientName}</p>
              <p className="text-sm text-text-muted">{addr.addressLine1}</p>
              {addr.addressLine2 && <p className="text-sm text-text-muted">{addr.addressLine2}</p>}
              <p className="text-sm text-text-muted">{addr.city}, {addr.state} {addr.zipCode}</p>
              <p className="text-sm text-text-muted">{addr.country}</p>
              {addr.phone && <p className="text-xs text-text-muted mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">phone</span>{addr.phone}</p>}
            </div>
          ))}
        </div>
      )}

      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-on-background font-headline">{modal === 'create' ? 'Nueva Dirección' : 'Editar Dirección'}</h3>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-surface-container-high rounded-lg"><span className="material-symbols-outlined text-text-muted">close</span></button>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Etiqueta" field="label" placeholder="Ej: Casa, Oficina" />
              <InputField label="Nombre del destinatario" field="recipientName" placeholder="Juan Pérez" />
              <InputField label="Teléfono" field="phone" type="tel" placeholder="+51 999 999 999" />
              <InputField label="País" field="country" />
              <InputField label="Dirección línea 1" field="addressLine1" placeholder="Av. Principal 123" colSpan />
              <InputField label="Dirección línea 2 (opcional)" field="addressLine2" placeholder="Dpto 4B, Piso 2" colSpan />
              <InputField label="Ciudad" field="city" placeholder="Lima" />
              <InputField label="Departamento/Estado" field="state" placeholder="Lima" />
              <InputField label="Código Postal" field="zipCode" placeholder="15001" />
              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20" />
                  <span className="text-sm font-semibold text-on-background">Dirección principal</span>
                </label>
              </div>
            </div>
            <div className="p-4 border-t border-outline-variant/30 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-medium text-text-muted hover:bg-surface-container-high rounded-lg">Cancelar</button>
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {modal === 'create' ? 'Crear' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
