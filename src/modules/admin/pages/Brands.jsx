import { useState, useEffect, useRef } from 'react'
import productsService from '../../public/services/products.service'
import Pagination from '../../../core/components/Pagination'

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
    <div className="max-w-5xl mx-auto space-y-6 platform-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-on-background font-headline tracking-tight">Marcas</h2>
          <p className="text-sm text-text-muted mt-1">Gestiona las marcas de tu catálogo.</p>
        </div>
        <button onClick={openCreate} className="bg-primary hover:bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 text-sm">
          <span className="material-symbols-outlined text-[18px]">add_circle</span> Nueva Marca
        </button>
      </div>

      {/* Metric */}
      <div className="flex gap-4">
        <div className="bg-white p-4 rounded-xl border border-outline-variant flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">storefront</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Total Marcas</p>
            <p className="text-lg font-black text-on-background font-headline">{brands.length}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30">
          <div className="relative max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar marca..."
              className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-outline-variant">storefront</span>
            <p className="text-sm text-text-muted mt-2">No se encontraron marcas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <th className="px-5 py-3">Marca</th>
                  <th className="px-5 py-3">Creada</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {paginated.map(brand => (
                  <tr key={brand.id} className="hover:bg-surface-container-low/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {brand.logoUrl ? (
                          <img src={brand.logoUrl} alt={brand.name} className="w-9 h-9 rounded-lg object-contain bg-surface-container-low border border-outline-variant/30 p-0.5" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                            <span className="material-symbols-outlined text-[18px]">storefront</span>
                          </div>
                        )}
                        <span className="text-sm font-bold text-on-background">{brand.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-text-muted">{new Date(brand.createdAt).toLocaleDateString('es-PE')}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(brand)} title="Editar"
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-colors opacity-60 group-hover:opacity-100">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => openDelete(brand)} title="Eliminar"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors opacity-60 group-hover:opacity-100">
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
        <div className="px-5 py-3 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <span>Mostrando {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}</span>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="text-lg font-bold text-on-background font-headline">{modal === 'create' ? 'Nueva Marca' : 'Editar Marca'}</h3>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-surface-container-high rounded-lg"><span className="material-symbols-outlined text-text-muted">close</span></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Logo upload */}
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5">Logo de la Marca</label>
                <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleFileChange} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center gap-4 p-4 border-2 border-dashed border-outline-variant rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all group">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="w-14 h-14 rounded-lg object-contain bg-surface-container-low border border-outline-variant/30 p-1" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-surface-container-high flex items-center justify-center text-text-muted group-hover:text-primary">
                      <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium text-on-background group-hover:text-primary">Click para subir logo</p>
                    <p className="text-xs text-text-muted">JPG, PNG hasta 5MB</p>
                  </div>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5">Nombre</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Samsung"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
              </div>
            </div>
            <div className="p-5 border-t border-outline-variant/30 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-medium text-text-muted hover:bg-surface-container-high rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.name}
                className="px-5 py-2.5 bg-primary hover:bg-primary disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-all flex items-center gap-2">
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
              <h3 className="text-lg font-bold text-on-background">¿Eliminar marca?</h3>
              <p className="text-sm text-text-muted mt-1">Se desactivará <strong>{selected?.name}</strong>.</p>
            </div>
            <div className="p-4 border-t border-outline-variant/30 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-medium text-text-muted hover:bg-surface-container-high rounded-lg transition-colors">Cancelar</button>
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
