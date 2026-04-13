import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../../core/services/api'

const EMPTY_FORM = { label: '', recipientName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', country: '', zipCode: '', isDefault: false }

export default function ClientAddresses() {
  const { t } = useTranslation()
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
    if (!form.recipientName.trim()) e.recipientName = t('client.addresses.nameRequired')
    if (!form.phone.trim()) e.phone = t('client.addresses.phoneRequired')
    if (!form.addressLine1.trim()) e.addressLine1 = t('client.addresses.addressRequired')
    if (!form.city.trim()) e.city = t('client.addresses.cityRequired')
    if (!form.state.trim()) e.state = t('client.addresses.stateRequired')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const openCreate = () => { setForm({ ...EMPTY_FORM, country: t('client.addresses.defaultCountry') }); setErrors({}); setModal('create') }
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
      country: addr.country || t('client.addresses.defaultCountry'),
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
    if (!window.confirm(t('client.addresses.confirmDelete'))) return
    try {
      await api.delete(`/users/me/addresses/${id}`)
      fetchAddresses()
    } catch (err) { console.error(err) }
  }

  const InputField = ({ label, field, type = 'text', placeholder = '', colSpan = false }) => (
    <div className={colSpan ? 'sm:col-span-2' : ''}>
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={form[field]}
          onChange={e => setForm({ ...form, [field]: e.target.value })}
          placeholder={placeholder}
          className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all ${errors[field] ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200'}`}
        />
        {errors[field] && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-red-500 text-[18px]">error</span>
        )}
      </div>
      {errors[field] && <p className="text-[11px] font-bold text-red-500 mt-1.5">{errors[field]}</p>}
    </div>
  )

  return (
    <div className="space-y-8 platform-enter max-w-6xl mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-slate-900 tracking-tight">{t('client.addresses.title')}</h1>
          <p className="text-slate-500 mt-1">{t('client.addresses.subtitle')}</p>
        </div>
        <button onClick={openCreate}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 text-sm">
          <span className="material-symbols-outlined text-[20px]">add_location_alt</span>
          {t('client.addresses.addButton')}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-16 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl text-slate-300">location_off</span>
          </div>
          <h3 className="font-headline text-xl font-bold text-slate-800 mb-2">{t('client.addresses.noAddresses')}</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">{t('client.addresses.noAddressesDesc')}</p>
          <button onClick={openCreate}
            className="px-8 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">add</span>
            {t('client.addresses.addFirst')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map(addr => (
            <div key={addr.id} className={`group relative bg-white rounded-[2rem] p-6 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 flex flex-col h-full ${addr.isDefault ? 'border-2 border-slate-900 shadow-md' : 'border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)]'}`}>

              {/* Card Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex flex-col gap-1.5">
                  <span className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 mb-2 group-hover:bg-slate-900 group-hover:border-slate-900 transition-colors">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-white transition-colors">signpost</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-headline text-lg font-extrabold text-slate-900">{addr.label || t('client.addresses.addressLabel')}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-900 text-white rounded-md tracking-widest uppercase">{t('client.addresses.defaultBadge')}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => openEdit(addr)} className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors" title="Editar">
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center hover:bg-red-500 text-red-500 hover:text-white transition-colors" title="Eliminar">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>

              {/* Info Body */}
              <div className="flex-1 space-y-1 mb-6">
                <p className="text-sm font-bold text-slate-700">{addr.recipientName}</p>
                <p className="text-sm text-slate-500 flex items-start gap-2 mt-2">
                  <span className="material-symbols-outlined text-[16px] text-slate-300 mt-0.5">location_on</span>
                  <span className="leading-snug">{addr.addressLine1} {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</span>
                </p>
                <p className="text-sm text-slate-500 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-slate-300 mt-0.5 opacity-0">location_on</span>
                  <span>{addr.city}, {addr.state} {addr.zipCode}</span>
                </p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-3 pt-3 border-t border-slate-100">
                  {addr.country}
                </p>
              </div>

              {/* Footer row (Phone) */}
              {addr.phone && (
                <div className="mt-auto flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">phone_iphone</span>
                  <p className="text-sm font-semibold text-slate-700">{addr.phone}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Modal for Creating/Editing */}
      <div className={`fixed inset-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${modal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>

        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModal(null)} />

        {/* Panel */}
        <div className={`absolute inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${modal ? 'translate-x-0' : 'translate-x-[110%]'}`}>

          {/* Header */}
          <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 bg-white z-10 shrink-0">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('client.addresses.title')}</p>
              <h2 className="font-headline text-2xl font-extrabold text-slate-900">{modal === 'create' ? t('client.addresses.newAddress') : t('client.addresses.editAddress')}</h2>
            </div>
            <button onClick={() => setModal(null)} className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 bg-slate-50/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6">
              <InputField label={t('client.addresses.labelField')} field="label" placeholder={t('client.addresses.labelPlaceholder')} colSpan />

              <div className="sm:col-span-2 pt-4 pb-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">{t('client.addresses.contactDetails')}</h4>
              </div>

              <InputField label={t('client.addresses.recipientName')} field="recipientName" placeholder={t('client.addresses.recipientPlaceholder')} />
              <InputField label={t('client.addresses.contactPhone')} field="phone" type="tel" placeholder="+51 999 999 999" />

              <div className="sm:col-span-2 pt-4 pb-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">{t('client.addresses.deliveryHeading')}</h4>
              </div>

              <InputField label={t('client.addresses.country')} field="country" />
              <InputField label={t('client.addresses.zipCode')} field="zipCode" placeholder="15001" />

              <InputField label={t('client.addresses.addressLine1')} field="addressLine1" placeholder={t('client.addresses.addressLine1Placeholder')} colSpan />
              <InputField label={t('client.addresses.addressLine2')} field="addressLine2" placeholder={t('client.addresses.addressLine2Placeholder')} colSpan />

              <InputField label={t('client.addresses.city')} field="city" placeholder="Lima" />
              <InputField label={t('client.addresses.state')} field="state" placeholder="Lima" />

              <div className="sm:col-span-2 mt-4 bg-slate-100 p-5 rounded-2xl flex items-center justify-between border border-slate-200">
                <div>
                  <p className="text-sm font-bold text-slate-900">{t('client.addresses.primaryAddress')}</p>
                  <p className="text-xs text-slate-500 mt-1">{t('client.addresses.primaryAddressDesc')}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Footer Save */}
          <div className="p-6 md:p-8 bg-white border-t border-slate-100 shrink-0 flex gap-4">
            <button onClick={() => setModal(null)} className="flex-1 py-4 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors">{t('client.addresses.cancel')}</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[20px]">save</span>}
              {t('client.addresses.save')}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
