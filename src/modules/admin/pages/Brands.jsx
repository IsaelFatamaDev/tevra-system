import { useState, useEffect, useRef } from 'react'
import productsService from '../../public/services/products.service'
import Pagination from '../../../core/components/Pagination'
import { useToast } from '../../../core/contexts/ToastContext'

const ITEMS_PER_PAGE = 10
const EMPTY_FORM = { name: '', logoUrl: '' }

export default function AdminBrands() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [logoPreview, setLogoPreview] = useState(null)
  const fileRef = useRef(null)
  const { addToast } = useToast()

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

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

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
    if (!form.name.trim()) {
      addToast('El nombre de la marca es obligatorio', 'error')
      return
    }
    setSaving(true)
    try {
      if (modal === 'create') {
        await productsService.createBrand(form)
        addToast('Marca creada exitosamente')
      } else {
        await productsService.updateBrand(selected.id, form)
        addToast('Marca actualizada exitosamente')
      }
      fetchData()
      setModal(null)
    } catch (err) { 
      console.error(err)
      addToast('Error al procesar la solicitud', 'error')
    }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await productsService.deleteBrand(selected.id)
      fetchData()
      setModal(null)
      addToast('Marca eliminada exitosamente')
    } catch (err) { 
      console.error(err)
      addToast('Error al eliminar la marca', 'error')
    }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 platform-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Marcas</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Gestiona las marcas de tu catálogo.</p>
        </div>
        <button onClick={openCreate} className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors text-sm">
          <span className="material-symbols-outlined text-[16px]">add</span> Nueva Marca
        </button>
      </div>

      {/* Metric */}
      <div className="flex gap-3">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center gap-3 stat-card">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">storefront</span>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Total Marcas</p>
            <p className="text-lg font-semibold text-zinc-900">{brands.length}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-100">
          <div className="relative max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar marca..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-3xl text-zinc-300">storefront</span>
            <p className="text-sm text-zinc-500 mt-2">No se encontraron marcas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Marca</th>
                  <th className="px-5 py-3">Creada</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {paginated.map(brand => (
                  <tr key={brand.id} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {brand.logoUrl ? (
                          <img src={brand.logoUrl} alt={brand.name} className="w-9 h-9 rounded-lg object-contain bg-zinc-50 border border-zinc-200 p-0.5" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
                            <span className="material-symbols-outlined text-[18px]">storefront</span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-zinc-900">{brand.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-500">{new Date(brand.createdAt).toLocaleDateString('es-PE')}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(brand)} title="Editar"
                          className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors opacity-60 group-hover:opacity-100">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => openDelete(brand)} title="Eliminar"
                          className="p-1.5 rounded-md hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors opacity-60 group-hover:opacity-100">
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
        <div className="px-5 py-3 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <span>Mostrando {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}</span>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity" onClick={() => setModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="text-lg font-semibold text-zinc-900">{modal === 'create' ? 'Nueva Marca' : 'Editar Marca'}</h3>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors -mr-2 text-zinc-400">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Logo upload */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Logo de la Marca</label>
                <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleFileChange} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center gap-4 p-4 bg-zinc-50 border border-zinc-200 rounded-xl hover:border-tevra-coral hover:bg-white transition-all group shadow-sm focus:outline-none focus:ring-2 focus:ring-tevra-coral/20">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="w-14 h-14 rounded-lg object-contain bg-white border border-zinc-200 p-1 shadow-sm group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:text-tevra-coral shadow-sm group-hover:border-tevra-coral transition-colors">
                      <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                    </div>
                  )}
                  <div className="text-left flex-1">
                    <p className="text-sm font-bold text-zinc-800 group-hover:text-tevra-coral transition-colors decoration-2 underline-offset-2">Explorar archivos...</p>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">JPG, PNG, WEBP (Máx. 5MB)</p>
                  </div>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Nombre Institucional *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Samsung, Apple"
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50/50">
              <button onClick={() => setModal(null)} className="px-4 py-2 bg-white border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-colors shadow-sm">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:-translate-y-0.5 disabled:translate-y-0 disabled:shadow-none flex items-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? 'Guardando...' : modal === 'create' ? 'Crear Marca' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity" onClick={() => setModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm ring-1 ring-red-100">
                <span className="material-symbols-outlined text-red-500 text-[32px]">warning</span>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">¿Eliminar marca?</h3>
              <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
                Estás a punto de eliminar <strong className="text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded px-2">{selected?.name}</strong>. Esta acción la ocultará del catálogo y podría afectar filtros existentes.
              </p>
              
              <div className="flex gap-3 w-full">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 bg-white border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-colors shadow-sm">
                  Cancelar
                </button>
                <button onClick={handleDelete} disabled={saving}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:-translate-y-0.5 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2">
                  {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {saving ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
