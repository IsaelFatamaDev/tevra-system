import { useState, useEffect, useRef } from 'react'
import productsService from '../../public/services/products.service'

const EMPTY_FORM = { name: '', logoUrl: '' }

export default function AdminBrands() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [logoPreview, setLogoPreview] = useState(null)
  const fileRef = useRef(null)

  const fetchData = () => {
    setLoading(true)
    productsService.getBrands()
      .then(data => setBrands(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching brands', err))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [])

  const filtered = brands.filter(b => {
    const q = search.toLowerCase()
    return !q || b.name?.toLowerCase().includes(q)
  })

  const openCreate = () => { setForm(EMPTY_FORM); setLogoPreview(null); setModal('create') }
  const openEdit = (brand) => {
    setSelected(brand)
    setForm({ name: brand.name || '', logoUrl: brand.logoUrl || '' })
    setLogoPreview(brand.logoUrl || null)
    setModal('edit')
  }
  const openDelete = (brand) => { setSelected(brand); setModal('delete') }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setLogoPreview(ev.target.result)
      setForm(f => ({ ...f, logoUrl: ev.target.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (modal === 'create') await productsService.createBrand(form)
      else await productsService.updateBrand(selected.id, form)
      fetchData()
      setModal(null)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await productsService.deleteBrand(selected.id)
      fetchData()
      setModal(null)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-headline tracking-tight">Marcas</h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona las marcas de tu catálogo.</p>
        </div>
        <button onClick={openCreate} className="bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 text-sm">
          <span className="material-symbols-outlined text-[18px]">add_circle</span> Nueva Marca
        </button>
      </div>

      {/* Metric */}
      <div className="flex gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">storefront</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Marcas</p>
            <p className="text-lg font-black text-gray-900 font-headline">{brands.length}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar marca..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-[3px] border-sky-200 border-t-sky-600 rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-gray-300">storefront</span>
            <p className="text-sm text-gray-400 mt-2">No se encontraron marcas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Marca</th>
                  <th className="px-5 py-3">Creada</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(brand => (
                  <tr key={brand.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {brand.logoUrl ? (
                          <img src={brand.logoUrl} alt={brand.name} className="w-9 h-9 rounded-lg object-contain bg-gray-50 border border-gray-100 p-0.5" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                            <span className="material-symbols-outlined text-[18px]">storefront</span>
                          </div>
                        )}
                        <span className="text-sm font-bold text-gray-800">{brand.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{new Date(brand.createdAt).toLocaleDateString('es-PE')}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(brand)} title="Editar"
                          className="p-1.5 rounded-lg hover:bg-sky-50 text-gray-400 hover:text-sky-600 transition-colors opacity-60 group-hover:opacity-100">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => openDelete(brand)} title="Eliminar"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors opacity-60 group-hover:opacity-100">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>Mostrando {filtered.length} de {brands.length}</span>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 font-headline">{modal === 'create' ? 'Nueva Marca' : 'Editar Marca'}</h3>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded-lg"><span className="material-symbols-outlined text-gray-400">close</span></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Logo upload */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Logo de la Marca</label>
                <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleFileChange} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-sky-300 hover:bg-sky-50/30 transition-all group">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="w-14 h-14 rounded-lg object-contain bg-gray-50 border border-gray-100 p-1" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:text-sky-500">
                      <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-sky-700">Click para subir logo</p>
                    <p className="text-xs text-gray-400">JPG, PNG hasta 5MB</p>
                  </div>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Nombre</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Samsung"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.name}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-all flex items-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {modal === 'create' ? 'Crear' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-500 text-2xl">warning</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">¿Eliminar marca?</h3>
              <p className="text-sm text-gray-500 mt-1">Se desactivará <strong>{selected?.name}</strong>.</p>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleDelete} disabled={saving}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-all flex items-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
