import { useState, useEffect, useRef, useCallback } from 'react'
import productsService from '../../public/services/products.service'
import Pagination from '../../../core/components/Pagination'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'
const ITEMS_PER_PAGE = 10

const STOCK_CONFIG = {
  available: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Disponible' },
  in_stock: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'En Stock' },
  low_stock: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Bajo Stock' },
  out_of_stock: { bg: 'bg-red-50', text: 'text-red-700', label: 'Agotado' },
}

const EMPTY_FORM = { name: '', description: '', priceUsd: '', priceRefLocal: '', stockStatus: 'available', marginPct: '', isFeatured: false, categoryId: '', brandId: '' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const fileRef = useRef(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    const selectedCat = categories.find(c => c.id === catFilter)
    Promise.all([
      productsService.findAll({ includeInactive: true, search: search || undefined, category: selectedCat?.slug || undefined }),
      productsService.getCategories(),
      productsService.getBrands(),
    ])
      .then(([prodData, catData, brandData]) => {
        const list = Array.isArray(prodData) ? prodData : prodData?.items || []
        setProducts(list)
        setTotal(prodData?.total ?? list.length)
        setCategories(Array.isArray(catData) ? catData : [])
        setBrands(Array.isArray(brandData) ? brandData : [])
      })
      .catch(err => console.error('Error fetching products', err))
      .finally(() => setLoading(false))
  }, [search, catFilter])

  useEffect(() => {
    setPage(1)
    const t = setTimeout(fetchData, search ? 350 : 0)
    return () => clearTimeout(t)
  }, [search, catFilter])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const paginated = products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const openCreate = () => { setForm(EMPTY_FORM); setImageFile(null); setImagePreview(null); setFormErrors({}); setModal('create') }
  const openEdit = (prod) => {
    setSelected(prod)
    setForm({
      name: prod.name || '', description: prod.description || '', priceUsd: prod.priceUsd || '',
      priceRefLocal: prod.priceRefLocal || '', stockStatus: prod.stockStatus || 'available',
      marginPct: prod.marginPct || '', isFeatured: prod.isFeatured || false,
      categoryId: prod.category?.id || '', brandId: prod.brand?.id || '',
    })
    setImageFile(null)
    setImagePreview(getImageUrl(prod))
    setModal('edit')
  }
  const openDelete = (prod) => { setSelected(prod); setModal('delete') }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const getImageUrl = (prod) => {
    if (prod.images?.[0]) {
      const img = prod.images[0]
      if (img.startsWith('data:')) return img
      return img.startsWith('http') ? img : `${API_BASE}${img}`
    }
    return null
  }

  const handleSave = async () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Nombre requerido'
    if (!form.priceUsd || isNaN(form.priceUsd) || Number(form.priceUsd) <= 0) e.priceUsd = 'Precio válido requerido'
    if (!form.categoryId) e.categoryId = 'Categoría requerida'
    setFormErrors(e)
    if (Object.keys(e).length > 0) return
    setSaving(true)
    try {
      let product
      if (modal === 'create') product = await productsService.create(form)
      else product = await productsService.update(selected.id, form)
      if (imageFile && product?.id) {
        setUploading(true)
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target.result)
          reader.readAsDataURL(imageFile)
        })
        await productsService.uploadImage(product.id, base64)
        setUploading(false)
      }
      fetchData(); setModal(null)
    } catch (err) { console.error(err) }
    finally { setSaving(false); setUploading(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try { await productsService.delete(selected.id); fetchData(); setModal(null) }
    catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleToggleActive = async (prod) => {
    try {
      await productsService.toggleActive(prod.id)
      fetchData()
    } catch (err) { console.error(err) }
  }

  const totalProducts = products.length
  const featured = products.filter(p => p.isFeatured).length
  const avgPrice = totalProducts ? (products.reduce((s, p) => s + Number(p.priceUsd || 0), 0) / totalProducts) : 0

  return (
    <div className="max-w-7xl mx-auto space-y-6 platform-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-on-background font-headline tracking-tight">Catálogo de Productos</h2>
          <p className="text-sm text-text-muted mt-1">Gestiona inventario, precios y estados.</p>
        </div>
        <button onClick={openCreate} className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 text-sm">
          <span className="material-symbols-outlined text-[18px]">add_circle</span> Nuevo Producto
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Productos', value: totalProducts, icon: 'inventory_2', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Destacados', value: featured, icon: 'star', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Precio Promedio', value: `$${avgPrice.toFixed(0)}`, icon: 'attach_money', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((m, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-outline-variant/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-4 stat-card">
            <div className={`w-11 h-11 rounded-xl ${m.bg} ${m.color} flex items-center justify-center flex-shrink-0`}>
              <span className="material-symbols-outlined text-[22px]">{m.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{m.label}</p>
              <p className="text-xl font-black text-on-background font-headline">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-outline-variant/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-4 border-b border-outline-variant/10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar productos..."
              className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setCatFilter('')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${!catFilter ? 'bg-primary text-white shadow-sm' : 'bg-surface-container-low text-text-muted hover:bg-surface-container-high border border-outline-variant'}`}>
              Todas
            </button>
            {categories.slice(0, 6).map(cat => (
              <button key={cat.id} onClick={() => setCatFilter(catFilter === cat.id ? '' : cat.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${catFilter === cat.id ? 'bg-primary/10 text-primary ring-1 ring-primary/30' : 'bg-surface-container-low text-text-muted hover:bg-surface-container-high border border-outline-variant'}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-outline-variant">inventory_2</span>
            <p className="text-sm text-text-muted mt-2">No se encontraron productos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-195">
              <thead>
                <tr className="bg-[#f8fafc] text-[11px] font-bold text-text-muted uppercase tracking-wider border-b border-outline-variant/10">
                  <th className="px-5 py-3">Producto</th>
                  <th className="px-5 py-3">Categoría</th>
                  <th className="px-5 py-3">Precio USD</th>
                  <th className="px-5 py-3">Margen</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Publicado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/8">
                {paginated.map(prod => {
                  const st = STOCK_CONFIG[prod.stockStatus] || STOCK_CONFIG.available
                  const imgUrl = getImageUrl(prod)
                  return (
                    <tr key={prod.id} className="hover:bg-surface-container-low/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {imgUrl ? (
                            <img src={imgUrl} alt={prod.name} className="w-10 h-10 rounded-lg object-cover bg-surface-container-high" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-text-muted">
                              <span className="material-symbols-outlined text-[18px]">image</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-on-background truncate">{prod.name}</p>
                            <p className="text-xs text-text-muted truncate">{prod.brand?.name || ''}</p>
                          </div>
                          {prod.isFeatured && <span className="material-symbols-outlined text-amber-400 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-text-muted">{prod.category?.name || '—'}</td>
                      <td className="px-5 py-3 text-sm font-bold text-on-background">${Number(prod.priceUsd || 0).toFixed(2)}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-text-muted">{prod.marginPct ? `${prod.marginPct}%` : '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2.5 py-1 ${st.bg} ${st.text} text-[11px] font-bold rounded-full`}>{st.label}</span>
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleToggleActive(prod)} title={prod.isActive ? 'Despublicar' : 'Publicar'}
                          className="relative inline-flex items-center cursor-pointer">
                          <div className={`w-9 h-5 rounded-full transition-colors ${prod.isActive !== false ? 'bg-emerald-500' : 'bg-outline-variant'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prod.isActive !== false ? 'translate-x-4' : ''}`} />
                          </div>
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(prod)} title="Editar"
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button onClick={() => openDelete(prod)} title="Eliminar"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 border-t border-outline-variant/10 bg-[#fafafa] flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-text-muted">
            Mostrando <span className="font-bold text-text-muted">{Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}-{Math.min(page * ITEMS_PER_PAGE, total)}</span> de <span className="font-bold text-text-muted">{total}</span> productos
          </span>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-on-background font-headline">{modal === 'create' ? 'Nuevo Producto' : 'Editar Producto'}</h3>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-surface-container-high rounded-lg"><span className="material-symbols-outlined text-text-muted">close</span></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5">Imagen del Producto</label>
                <div className="flex items-center gap-4">
                  <div onClick={() => fileRef.current?.click()}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-outline-variant flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-outline-variant text-2xl">add_photo_alternate</span>
                    )}
                  </div>
                  <div className="text-xs text-text-muted">
                    <p className="font-medium text-text-muted">Click para subir imagen</p>
                    <p>JPG, PNG hasta 5MB</p>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5">Nombre *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-3.5 py-2.5 bg-surface-container-low border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${formErrors.name ? 'border-red-400' : 'border-outline-variant'}`} />
                {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5">Descripción</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5">Categoría *</label>
                  <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
                    className={`w-full px-3.5 py-2.5 bg-surface-container-low border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${formErrors.categoryId ? 'border-red-400' : 'border-outline-variant'}`}>
                    <option value="">Sin categoría</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {formErrors.categoryId && <p className="text-xs text-red-500 mt-1">{formErrors.categoryId}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5">Marca</label>
                  <select value={form.brandId} onChange={e => setForm({ ...form, brandId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                    <option value="">Sin marca</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5">Precio USD *</label>
                  <input type="number" step="0.01" value={form.priceUsd} onChange={e => setForm({ ...form, priceUsd: e.target.value })}
                    className={`w-full px-3.5 py-2.5 bg-surface-container-low border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${formErrors.priceUsd ? 'border-red-400' : 'border-outline-variant'}`} />
                  {formErrors.priceUsd && <p className="text-xs text-red-500 mt-1">{formErrors.priceUsd}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5">Precio Ref. Local</label>
                  <input type="number" step="0.01" value={form.priceRefLocal} onChange={e => setForm({ ...form, priceRefLocal: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5">Margen %</label>
                  <input type="number" step="0.1" value={form.marginPct} onChange={e => setForm({ ...form, marginPct: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5">Estado Stock</label>
                  <select value={form.stockStatus} onChange={e => setForm({ ...form, stockStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                    <option value="available">Disponible</option>
                    <option value="low_stock">Bajo Stock</option>
                    <option value="out_of_stock">Agotado</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20" />
                <span className="text-sm font-semibold text-on-background">Producto Destacado</span>
              </label>
            </div>
            <div className="p-4 border-t border-outline-variant/30 flex justify-end gap-2 sticky bottom-0 bg-white">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-text-muted hover:bg-surface-container-high rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 bg-primary hover:bg-primary disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-all flex items-center gap-2">
                {(saving || uploading) && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {uploading ? 'Subiendo...' : saving ? 'Guardando...' : modal === 'create' ? 'Crear' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {modal === 'delete' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-[28px]">delete_forever</span>
              </div>
              <h3 className="text-lg font-bold text-on-background mb-1">Eliminar Producto</h3>
              <p className="text-sm text-text-muted">¿Estás seguro de eliminar <strong>{selected.name}</strong>?</p>
            </div>
            <div className="p-4 border-t border-outline-variant/30 flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-text-muted hover:bg-surface-container-high rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleDelete} disabled={saving}
                className="px-5 py-2 text-sm font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-40 transition-colors">
                {saving ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
