import { useState, useEffect, useRef, useCallback } from 'react'
import productsService from '../../public/services/products.service'
import Pagination from '../../../core/components/Pagination'
import { useToast } from '../../../core/contexts/ToastContext'

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
  const { addToast } = useToast()

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
    if (!form.name.trim()) e.name = 'El nombre es obligatorio'
    if (!form.priceUsd || isNaN(form.priceUsd) || Number(form.priceUsd) <= 0) e.priceUsd = 'Ingresa un precio válido'
    if (!form.categoryId) e.categoryId = 'Selecciona una categoría'
    
    setFormErrors(e)
    
    if (Object.keys(e).length > 0) {
      addToast('Por favor, completa los campos requeridos.', 'error')
      return
    }
    
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
      fetchData()
      setModal(null)
      addToast(modal === 'create' ? 'Producto creado exitosamente' : 'Producto actualizado exitosamente')
    } catch (err) { 
      console.error(err)
      addToast('Ocurrió un error al procesar la solicitud', 'error')
    }
    finally { setSaving(false); setUploading(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try { 
      await productsService.delete(selected.id)
      fetchData()
      setModal(null)
      addToast('Producto eliminado permanentemente', 'success')
    }
    catch (err) { 
      console.error(err)
      addToast('Error al eliminar el producto', 'error')
    }
    finally { setSaving(false) }
  }

  const handleToggleActive = async (prod) => {
    try {
      await productsService.toggleActive(prod.id)
      fetchData()
      addToast(`Producto ${prod.isActive ? 'despublicado' : 'publicado'} correctamente`)
    } catch (err) { 
      console.error(err)
      addToast('Error al cambiar el estado del producto', 'error')
    }
  }

  const totalProducts = products.length
  const featured = products.filter(p => p.isFeatured).length
  const avgPrice = totalProducts ? (products.reduce((s, p) => s + Number(p.priceUsd || 0), 0) / totalProducts) : 0

  return (
    <div className="max-w-7xl mx-auto space-y-5 platform-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Productos</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Gestiona inventario, precios y estados.</p>
        </div>
        <button onClick={openCreate} className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors text-sm">
          <span className="material-symbols-outlined text-[16px]">add</span> Nuevo Producto
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Productos', value: totalProducts, icon: 'inventory_2' },
          { label: 'Destacados', value: featured, icon: 'star' },
          { label: 'Precio Promedio', value: `$${avgPrice.toFixed(0)}`, icon: 'attach_money' },
        ].map((m, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center gap-3 stat-card">
            <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
            </div>
            <div>
              <p className="text-xs text-zinc-500">{m.label}</p>
              <p className="text-lg font-semibold text-zinc-900">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar productos..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setCatFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!catFilter ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200'}`}>
              Todas
            </button>
            {categories.slice(0, 6).map(cat => (
              <button key={cat.id} onClick={() => setCatFilter(catFilter === cat.id ? '' : cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${catFilter === cat.id ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200'}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-3xl text-zinc-300">inventory_2</span>
            <p className="text-sm text-zinc-500 mt-2">No se encontraron productos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-195">
              <thead>
                <tr className="bg-zinc-50 text-[11px] font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-100">
                  <th className="px-5 py-3">Producto</th>
                  <th className="px-5 py-3">Categoría</th>
                  <th className="px-5 py-3">Precio USD</th>
                  <th className="px-5 py-3">Margen</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Publicado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {paginated.map(prod => {
                  const st = STOCK_CONFIG[prod.stockStatus] || STOCK_CONFIG.available
                  const imgUrl = getImageUrl(prod)
                  return (
                    <tr key={prod.id} className="hover:bg-zinc-50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {imgUrl ? (
                            <img src={imgUrl} alt={prod.name} className="w-9 h-9 rounded-lg object-cover bg-zinc-100" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400">
                              <span className="material-symbols-outlined text-[16px]">image</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-900 truncate">{prod.name}</p>
                            <p className="text-xs text-zinc-500 truncate">{prod.brand?.name || ''}</p>
                          </div>
                          {prod.isFeatured && <span className="material-symbols-outlined text-amber-400 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-zinc-500">{prod.category?.name || '—'}</td>
                      <td className="px-5 py-3 text-sm font-medium text-zinc-900">${Number(prod.priceUsd || 0).toFixed(2)}</td>
                      <td className="px-5 py-3 text-sm text-zinc-500">{prod.marginPct ? `${prod.marginPct}%` : '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 ${st.bg} ${st.text} text-[11px] font-medium rounded-md`}>{st.label}</span>
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleToggleActive(prod)} title={prod.isActive ? 'Despublicar' : 'Publicar'}
                          className="relative inline-flex items-center cursor-pointer">
                          <div className={`w-9 h-5 rounded-full transition-colors ${prod.isActive !== false ? 'bg-emerald-500' : 'bg-zinc-300'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prod.isActive !== false ? 'translate-x-4' : ''}`} />
                          </div>
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(prod)} title="Editar"
                            className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button onClick={() => openDelete(prod)} title="Eliminar"
                            className="p-1.5 rounded-md hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors">
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

        <div className="px-5 py-3 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-zinc-500">
            Mostrando <span className="font-medium">{Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}-{Math.min(page * ITEMS_PER_PAGE, total)}</span> de <span className="font-medium">{total}</span> productos
          </span>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity" onClick={() => setModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">{modal === 'create' ? 'Nuevo Producto' : 'Editar Producto'}</h3>
                <p className="text-sm font-medium text-zinc-500 mt-0.5">Completa la información del inventario</p>
              </div>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors -mr-2 text-zinc-400 hover:text-zinc-700">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Image Upload */}
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex items-center gap-5">
                <div onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-xl bg-white border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center cursor-pointer hover:border-tevra-coral hover:bg-tevra-coral/5 transition-all overflow-hidden group">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-zinc-300 group-hover:text-tevra-coral/70 transition-colors">add_photo_alternate</span>
                    </>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-zinc-900">Imagen Principal</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5 mb-2">Resolución recomendada: 800x800px. JPG o PNG hasta 5MB.</p>
                  <button onClick={() => fileRef.current?.click()} className="text-[11px] font-bold text-tevra-coral hover:underline uppercase tracking-wide">
                    {imagePreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Nombre comercial *</label>
                <div className={`relative flex items-center transition-all rounded-xl border ${formErrors.name ? 'border-red-300 ring-2 ring-red-100' : 'border-zinc-200 focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-100'}`}>
                  <input value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setFormErrors({...formErrors, name: ''}) }}
                    placeholder="Ej. iPhone 15 Pro Max 256GB"
                    className="w-full px-4 py-2.5 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400" />
                  {formErrors.name && <span className="material-symbols-outlined text-red-500 text-[18px] pr-3">error</span>}
                </div>
                {formErrors.name && <p className="text-xs text-red-500 font-medium mt-1.5 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">info</span>{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Descripción</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                  placeholder="Detalles técnicos, incluye características principales..."
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-100 focus:border-zinc-400 outline-none transition-all resize-none placeholder:text-zinc-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Categoría *</label>
                  <div className={`relative transition-all rounded-xl border ${formErrors.categoryId ? 'border-red-300 ring-2 ring-red-100' : 'border-zinc-200 focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-100'}`}>
                    <select value={form.categoryId} onChange={e => { setForm({ ...form, categoryId: e.target.value }); setFormErrors({...formErrors, categoryId: ''}) }}
                      className="w-full px-4 py-2.5 bg-transparent text-sm appearance-none outline-none text-zinc-900">
                      <option value="" disabled>Selecciona...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">expand_content</span>
                  </div>
                  {formErrors.categoryId && <p className="text-xs text-red-500 font-medium mt-1.5 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">info</span>{formErrors.categoryId}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Marca</label>
                  <div className="relative border border-zinc-200 rounded-xl focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-100 transition-all">
                    <select value={form.brandId} onChange={e => setForm({ ...form, brandId: e.target.value })}
                      className="w-full px-4 py-2.5 bg-transparent text-sm appearance-none outline-none text-zinc-900">
                      <option value="">Sin marca</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">expand_content</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Precio USD *</label>
                  <div className={`relative flex items-center transition-all rounded-xl border ${formErrors.priceUsd ? 'border-red-300 ring-2 ring-red-100' : 'border-zinc-200 focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-100'}`}>
                    <span className="pl-4 text-zinc-500 font-semibold">$</span>
                    <input type="number" step="0.01" value={form.priceUsd} onChange={e => { setForm({ ...form, priceUsd: e.target.value }); setFormErrors({...formErrors, priceUsd: ''}) }}
                      className="w-full pl-2 pr-4 py-2.5 bg-transparent text-sm font-semibold text-zinc-900 outline-none" placeholder="0.00" />
                  </div>
                  {formErrors.priceUsd && <p className="text-xs text-red-500 font-medium mt-1.5 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">info</span>{formErrors.priceUsd}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Precio Local</label>
                  <div className="relative flex items-center border border-zinc-200 rounded-xl focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-100 transition-all">
                    <span className="pl-4 text-zinc-400 font-semibold">S/</span>
                    <input type="number" step="0.01" value={form.priceRefLocal} onChange={e => setForm({ ...form, priceRefLocal: e.target.value })}
                      className="w-full pl-2 pr-4 py-2.5 bg-transparent text-sm font-semibold text-zinc-900 outline-none" placeholder="0.00" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Comisión (%)</label>
                  <div className="relative flex items-center border border-zinc-200 rounded-xl focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-100 transition-all">
                    <input type="number" step="0.1" value={form.marginPct} onChange={e => setForm({ ...form, marginPct: e.target.value })}
                      className="w-full pl-4 pr-8 py-2.5 bg-transparent text-sm font-semibold text-zinc-900 outline-none" placeholder="10.0" />
                    <span className="absolute right-4 text-zinc-400 font-bold">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Estado Stock</label>
                  <div className="relative border border-zinc-200 rounded-xl focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-100 transition-all">
                    <select value={form.stockStatus} onChange={e => setForm({ ...form, stockStatus: e.target.value })}
                      className="w-full px-4 py-2.5 bg-transparent text-sm appearance-none outline-none text-zinc-900 font-medium">
                      <option value="available">Disponible</option>
                      <option value="low_stock">Bajo Stock</option>
                      <option value="out_of_stock">Agotado</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">expand_content</span>
                  </div>
                </div>
              </div>
              
              <label className="flex items-center gap-3 p-4 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-5 h-5 rounded border-zinc-300 text-tevra-coral focus:ring-tevra-coral/20 transition-all cursor-pointer" />
                <div>
                  <span className="text-sm font-bold text-zinc-900 block">Marcar como Destacado</span>
                  <span className="text-xs text-zinc-500 block">Mostrar este producto en carruseles principales y hot-sales.</span>
                </div>
              </label>
            </div>
            
            <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50/50 rounded-b-2xl">
              <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 bg-white border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-colors shadow-sm">Cancelar</button>
              <button type="submit" onClick={handleSave} disabled={saving}
                className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 focus:ring-4 focus:ring-zinc-900/20 disabled:opacity-50 disabled:hover:translate-y-0 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:-translate-y-0.5 flex items-center gap-2">
                {(saving || uploading) ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">save</span>
                )}
                {uploading ? 'Subiendo...' : saving ? 'Guardando...' : modal === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {modal === 'delete' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity" onClick={() => setModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center ring-4 ring-red-50/50">
                <span className="material-symbols-outlined text-red-500 text-[26px]">delete_forever</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1.5">Eliminar Producto</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">¿Estás seguro de que deseas eliminar permanentemente <strong className="text-zinc-800">{selected.name}</strong>? Esta acción no se puede deshacer.</p>
            </div>
            <div className="p-5 border-t border-zinc-100 flex flex-col gap-2 bg-zinc-50/50 rounded-b-2xl">
              <button onClick={handleDelete} disabled={saving}
                className="w-full px-4 py-2.5 font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:translate-y-0 disabled:shadow-none disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? 'Eliminando...' : 'Sí, Eliminar Producto'}
              </button>
              <button onClick={() => setModal(null)} className="w-full px-4 py-2.5 font-semibold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
