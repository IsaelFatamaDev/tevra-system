import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import productsService from '../../public/services/products.service'
import Pagination from '../../../core/components/Pagination'
import { useToast } from '../../../core/contexts/ToastContext'
import { useSiteConfig } from '../../../core/contexts/SiteConfigContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
const ITEMS_PER_PAGE = 10

const EMPTY_FORM = { name: '', description: '', descriptionEn: '', priceUsd: '', priceRefLocal: '', providerCostUsd: '', stockStatus: 'available', marginPct: '', isFeatured: false, categoryId: '', brandId: '', images: [] }
const DEFAULT_GROSS_MARGIN = 30

export default function AdminProducts() {
  const { t } = useTranslation()

  const STOCK_CONFIG = {
    available: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: t('admin.products.stockAvailable') },
    in_stock: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: t('admin.products.stockInStock') },
    low_stock: { bg: 'bg-amber-50', text: 'text-amber-700', label: t('admin.products.stockLow') },
    out_of_stock: { bg: 'bg-red-50', text: 'text-red-700', label: t('admin.products.stockOut') },
  }

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
  const [formErrors, setFormErrors] = useState({})
  const fileRef = useRef(null)
  const { addToast } = useToast()
  const { exchangeRateSell } = useSiteConfig()

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
    const timer = setTimeout(fetchData, search ? 350 : 0)
    return () => clearTimeout(timer)
  }, [search, catFilter])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const paginated = products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const openCreate = () => { setForm(EMPTY_FORM); setFormErrors({}); setModal('create') }
  
  
  const openEdit = (prod) => {
    setSelected(prod)
    setForm({
      name: prod.name || '', description: prod.description || '', descriptionEn: prod.descriptionEn || '', priceUsd: prod.priceUsd || '',
      priceRefLocal: prod.priceRefLocal || '', providerCostUsd: prod.providerCostUsd || '',
      stockStatus: prod.stockStatus || 'available',
      marginPct: prod.marginPct || '', isFeatured: prod.isFeatured || false,
      categoryId: prod.category?.id || prod.categoryId || '', brandId: prod.brand?.id || prod.brandId || '',
      images: prod.images || [],
    })
    setFormErrors({})  // BUG-15 FIX: Clear any previous errors
    setSaving(false)   // BUG-15 FIX: Reset saving state
    setModal('edit')
  }
  const openDelete = (prod) => { setSelected(prod); setModal('delete') }

  const handleAddImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setForm(prev => ({ ...prev, images: [...(prev.images || []), ev.target.result] }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = (index) => {
    setForm(prev => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== index) }))
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
    if (!form.name.trim()) e.name = t('admin.products.nameRequired')
    if (!form.priceUsd || isNaN(form.priceUsd) || Number(form.priceUsd) <= 0) e.priceUsd = t('admin.products.validPrice')
    if (!form.categoryId) e.categoryId = t('admin.products.selectCategory')

    setFormErrors(e)

    if (Object.keys(e).length > 0) {
      addToast(t('admin.products.fillRequired'), 'error')
      return
    }

    setSaving(true)
    try {
      if (modal === 'create') await productsService.create(form)
      else await productsService.update(selected.id, form)
      fetchData()
      setModal(null)
      addToast(modal === 'create' ? t('admin.products.created') : t('admin.products.updated'))
    } catch (err) {
      console.error(err)
      addToast(t('admin.products.processError'), 'error')
    }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await productsService.delete(selected.id)
      fetchData()
      setModal(null)
      addToast(t('admin.products.deleted'), 'success')
    }
    catch (err) {
      console.error(err)
      addToast(t('admin.products.deleteError'), 'error')
    }
    finally { setSaving(false) }
  }

  const handleToggleActive = async (prod) => {
    try {
      await productsService.toggleActive(prod.id)
      fetchData()
      addToast(prod.isActive ? t('admin.products.unpublished') : t('admin.products.published'))
    } catch (err) {
      console.error(err)
      addToast(t('admin.products.toggleError'), 'error')
    }
  }

  const totalProducts = products.length
  const featured = products.filter(p => p.isFeatured).length
  const avgPrice = totalProducts ? (products.reduce((s, p) => s + Number(p.priceUsd || 0), 0) / totalProducts) : 0

  return (
    <div className="max-w-7xl mx-auto space-y-5 platform-enter">
      {}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#134074]">{t('admin.products.title')}</h2>
          <p className="text-sm text-[#134074] mt-0.5">{t('admin.products.subtitle')}</p>
        </div>
        <button onClick={openCreate} className="bg-[#134074] hover:bg-[#13315C] text-[#EEF4ED] px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors text-sm">
          <span className="material-symbols-outlined text-[16px]">add</span> {t('admin.products.newProduct')}
        </button>
      </div>

      {}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('admin.products.totalProducts'), value: totalProducts, icon: 'inventory_2' },
          { label: t('admin.products.featured'), value: featured, icon: 'star' },
          { label: t('admin.products.avgPrice'), value: `$${avgPrice.toFixed(0)}`, icon: 'attach_money' },
        ].map((m, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-[#C5D8E8]/20 flex items-center gap-3 stat-card">
            <div className="w-9 h-9 rounded-lg bg-[#EEF4ED] text-[#134074] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
            </div>
            <div>
              <p className="text-xs text-[#134074]">{m.label}</p>
              <p className="text-lg font-semibold text-[#134074]">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {}
      <div className="bg-white rounded-xl border border-[#C5D8E8]/20 overflow-hidden">
        <div className="p-4 border-b border-[#C5D8E8]/10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#13315C] text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('admin.products.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 bg-[#EEF4ED]/30 border border-[#C5D8E8]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#134074]/10 focus:border-[#8DA9C4] outline-none transition-all" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setCatFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!catFilter ? 'bg-[#134074] text-[#EEF4ED]' : 'bg-[#EEF4ED]/30 text-[#134074] hover:bg-[#EEF4ED] border border-[#C5D8E8]/20'}`}>
              {t('common.all')}
            </button>
            {categories.slice(0, 6).map(cat => (
              <button key={cat.id} onClick={() => setCatFilter(catFilter === cat.id ? '' : cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${catFilter === cat.id ? 'bg-[#134074] text-[#EEF4ED]' : 'bg-[#EEF4ED]/30 text-[#134074] hover:bg-[#EEF4ED] border border-[#C5D8E8]/20'}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-[#C5D8E8]/20 border-t-[#8DA9C4] rounded-full animate-spin" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-3xl text-[#13315C]">inventory_2</span>
            <p className="text-sm text-[#134074] mt-2">{t('admin.products.noProductsFound')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-195">
              <thead>
                <tr className="bg-[#EEF4ED]/30 text-[11px] font-medium text-[#134074] uppercase tracking-wider border-b border-[#C5D8E8]/10">
                  <th className="px-5 py-3">{t('admin.table.product')}</th>
                  <th className="px-5 py-3">{t('admin.table.category')}</th>
                  <th className="px-5 py-3">{t('admin.table.priceUsd')}</th>
                  <th className="px-5 py-3">{t('admin.table.margin')}</th>
                  <th className="px-5 py-3">{t('admin.table.status')}</th>
                  <th className="px-5 py-3">{t('admin.table.published')}</th>
                  <th className="px-5 py-3 text-right">{t('admin.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5D8E8]/10">
                {paginated.map(prod => {
                  const st = STOCK_CONFIG[prod.stockStatus] || STOCK_CONFIG.available
                  const imgUrl = getImageUrl(prod)
                  return (
                    <tr key={prod.id} className="hover:bg-[#EEF4ED]/30 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {imgUrl ? (
                            <img src={imgUrl} alt={prod.name} className="w-9 h-9 rounded-lg object-cover bg-[#EEF4ED]" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-[#EEF4ED] flex items-center justify-center text-[#13315C]">
                              <span className="material-symbols-outlined text-[16px]">image</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#134074] truncate">{prod.name}</p>
                            <p className="text-xs text-[#134074] truncate">{prod.brand?.name || ''}</p>
                          </div>
                          {prod.isFeatured && <span className="material-symbols-outlined text-amber-400 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#134074]">{prod.category?.name || '—'}</td>
                      <td className="px-5 py-3 text-sm font-medium text-[#134074]">${Number(prod.priceUsd || 0).toFixed(2)}</td>
                      <td className="px-5 py-3 text-sm text-[#134074]">{prod.marginPct ? `${prod.marginPct}%` : '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 ${st.bg} ${st.text} text-[11px] font-medium rounded-md`}>{st.label}</span>
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleToggleActive(prod)} title={prod.isActive ? t('admin.products.unpublished') : t('admin.products.published')}
                          className="relative inline-flex items-center cursor-pointer">
                          <div className={`w-9 h-5 rounded-full transition-colors ${prod.isActive !== false ? 'bg-emerald-500' : 'bg-[#C5D8E8]/40'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prod.isActive !== false ? 'translate-x-4' : ''}`} />
                          </div>
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(prod)} title={t('common.edit')}
                            className="p-1.5 rounded-md hover:bg-[#EEF4ED] text-[#13315C] hover:text-[#134074] transition-colors">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button onClick={() => openDelete(prod)} title={t('common.delete')}
                            className="p-1.5 rounded-md hover:bg-red-50 text-[#13315C] hover:text-red-500 transition-colors">
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

        <div className="px-5 py-3 border-t border-[#C5D8E8]/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-[#134074]">
            {t('admin.pagination.showing')} <span className="font-medium">{Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}-{Math.min(page * ITEMS_PER_PAGE, total)}</span> {t('admin.pagination.of')} <span className="font-medium">{total}</span> {t('admin.pagination.products')}
          </span>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
        </div>
      </div>

      {}
      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#134074]/40 backdrop-blur-sm transition-opacity" onClick={() => setModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-[#C5D8E8]/10 flex justify-between items-center bg-[#EEF4ED]/30/50 rounded-t-2xl shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-[#134074]">{modal === 'create' ? t('admin.products.newProduct') : t('admin.products.editProduct')}</h3>
                <p className="text-sm font-medium text-[#134074] mt-0.5">{t('admin.products.inventoryInfo')}</p>
              </div>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-[#EEF4ED] rounded-full transition-colors -mr-2 text-[#13315C] hover:text-[#134074]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Images & Status */}
                <div className="space-y-6">
                  {/* Images Section */}
                  <div className="bg-white p-5 rounded-2xl border border-[#C5D8E8]/20 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#134074] uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">imagesmode</span>
                        {t('admin.products.mainImage')}
                      </label>
                      <button onClick={() => fileRef.current?.click()} className="text-[11px] font-bold text-tevra-coral hover:text-tevra-coral/80 uppercase tracking-wide flex items-center gap-1 transition-colors">
                        <span className="material-symbols-outlined text-[14px]">add_photo_alternate</span> Añadir
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAddImage} />
                    </div>
                    
                    {(!form.images || form.images.length === 0) ? (
                      <div onClick={() => fileRef.current?.click()} className="w-full h-40 rounded-xl bg-[#EEF4ED]/30 border-2 border-dashed border-[#C5D8E8]/50 flex flex-col items-center justify-center cursor-pointer hover:border-tevra-coral hover:bg-tevra-coral/5 transition-all group">
                        <span className="material-symbols-outlined text-[#13315C] text-3xl group-hover:text-tevra-coral/70 transition-colors mb-2">add_photo_alternate</span>
                        <span className="text-xs text-[#13315C] font-medium">Click para añadir imagen</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {form.images.map((imgUrl, idx) => (
                          <div key={idx} className={`relative group rounded-xl overflow-hidden border border-[#C5D8E8]/20 bg-[#EEF4ED]/30 aspect-square ${idx === 0 ? 'col-span-2' : ''}`}>
                            <img src={imgUrl.startsWith('data:') || imgUrl.startsWith('http') ? imgUrl : `${API_BASE}${imgUrl}`} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                            <button onClick={() => handleRemoveImage(idx)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md">
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                            {idx === 0 && <span className="absolute bottom-2 left-2 bg-tevra-coral text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider shadow-sm">Principal</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Settings Section */}
                  <div className="bg-white p-5 rounded-2xl border border-[#C5D8E8]/20 shadow-sm space-y-4">
                    <label className="block text-xs font-bold text-[#134074] uppercase tracking-widest flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-[16px]">settings</span>
                      Configuración
                    </label>
                    
                    <div>
                      <label className="block text-[11px] font-bold text-[#134074] uppercase tracking-widest mb-1.5 text-opacity-70">{t('admin.products.stockStatus')}</label>
                      <div className="relative border border-[#C5D8E8]/20 rounded-xl focus-within:border-[#8DA9C4] focus-within:ring-2 focus-within:ring-[#C5D8E8]/15 transition-all">
                        <select value={form.stockStatus} onChange={e => setForm({ ...form, stockStatus: e.target.value })}
                          className="w-full px-4 py-2.5 bg-transparent text-sm appearance-none outline-none text-[#134074] font-medium">
                          <option value="available">{t('admin.products.stockAvailable')}</option>
                          <option value="low_stock">{t('admin.products.stockLow')}</option>
                          <option value="out_of_stock">{t('admin.products.stockOut')}</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#13315C] pointer-events-none">expand_content</span>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 p-3 border border-[#C5D8E8]/20 rounded-xl cursor-pointer hover:bg-[#EEF4ED]/30 transition-colors mt-2">
                      <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                        className="w-5 h-5 rounded border-[#C5D8E8]/30 text-tevra-coral focus:ring-tevra-coral/20 transition-all cursor-pointer" />
                      <div>
                        <span className="text-sm font-bold text-[#134074] block">{t('admin.products.markFeatured')}</span>
                        <span className="text-xs text-[#13315C] block">Mostrar destacado en inicio</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Right Column: Form details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* General Info */}
                  <div className="bg-white p-6 rounded-2xl border border-[#C5D8E8]/20 shadow-sm space-y-5">
                    <h4 className="text-sm font-bold text-[#134074] uppercase tracking-widest border-b border-[#C5D8E8]/10 pb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">info</span> Información General
                    </h4>
                    
                    <div>
                      <label className="block text-[11px] font-bold text-[#134074] uppercase tracking-widest mb-1.5 opacity-80">{t('admin.products.commercialName')}</label>
                      <div className={`relative flex items-center transition-all rounded-xl border ${formErrors.name ? 'border-red-300 ring-2 ring-red-100' : 'border-[#C5D8E8]/30 focus-within:border-tevra-coral/50 focus-within:ring-2 focus-within:ring-tevra-coral/10 bg-[#EEF4ED]/10'}`}>
                        <input value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setFormErrors({ ...formErrors, name: '' }) }}
                          placeholder={t('admin.products.namePlaceholder')}
                          className="w-full px-4 py-3 bg-transparent text-[15px] font-medium text-[#134074] outline-none placeholder:text-[#A5C0D8]" />
                        {formErrors.name && <span className="material-symbols-outlined text-red-500 text-[18px] pr-3">error</span>}
                      </div>
                      {formErrors.name && <p className="text-xs text-red-500 font-medium mt-1.5 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">info</span>{formErrors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[11px] font-bold text-[#134074] uppercase tracking-widest mb-1.5 opacity-80">{t('admin.products.categoryLabel')}</label>
                        <div className={`relative transition-all rounded-xl border ${formErrors.categoryId ? 'border-red-300 ring-2 ring-red-100' : 'border-[#C5D8E8]/30 focus-within:border-tevra-coral/50 focus-within:ring-2 focus-within:ring-tevra-coral/10 bg-[#EEF4ED]/10'}`}>
                          <select value={form.categoryId} onChange={e => { setForm({ ...form, categoryId: e.target.value }); setFormErrors({ ...formErrors, categoryId: '' }) }}
                            className="w-full px-4 py-3 bg-transparent text-[14px] appearance-none outline-none text-[#134074]">
                            <option value="" disabled>{t('admin.products.selectOption')}</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#13315C] pointer-events-none text-[20px]">expand_more</span>
                        </div>
                        {formErrors.categoryId && <p className="text-xs text-red-500 font-medium mt-1.5 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">info</span>{formErrors.categoryId}</p>}
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#134074] uppercase tracking-widest mb-1.5 opacity-80">{t('admin.products.brandLabel')}</label>
                        <div className="relative border border-[#C5D8E8]/30 rounded-xl focus-within:border-tevra-coral/50 focus-within:ring-2 focus-within:ring-tevra-coral/10 bg-[#EEF4ED]/10 transition-all">
                          <select value={form.brandId} onChange={e => setForm({ ...form, brandId: e.target.value })}
                            className="w-full px-4 py-3 bg-transparent text-[14px] appearance-none outline-none text-[#134074]">
                            <option value="">{t('admin.products.noBrand')}</option>
                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#13315C] pointer-events-none text-[20px]">expand_more</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-white p-6 rounded-2xl border border-[#C5D8E8]/20 shadow-sm space-y-5">
                    <h4 className="text-sm font-bold text-[#134074] uppercase tracking-widest border-b border-[#C5D8E8]/10 pb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">payments</span> Precios y Costos
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-[#134074] uppercase tracking-widest mb-1.5 opacity-80">{t('admin.products.providerCostLabel')}</label>
                        <div className="relative flex items-center border border-[#C5D8E8]/30 rounded-xl focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/10 bg-[#EEF4ED]/10 transition-all">
                          <span className="pl-4 text-[#134074] font-semibold text-[15px]">$</span>
                          <input
                            type="number" step="0.01" value={form.providerCostUsd}
                            onChange={e => {
                              const cost = parseFloat(e.target.value) || 0
                              const margin = parseFloat(form.marginPct) || DEFAULT_GROSS_MARGIN
                              const autoPrice = cost > 0 ? (cost / (1 - margin / 100)).toFixed(2) : ''
                              setForm({ ...form, providerCostUsd: e.target.value, priceUsd: autoPrice, priceRefLocal: autoPrice ? (Number(autoPrice) * (exchangeRateSell || 3.78)).toFixed(2) : '' })
                              setFormErrors({ ...formErrors, priceUsd: '' })
                            }}
                            className="w-full pl-2 pr-4 py-3 bg-transparent text-[15px] font-bold text-[#134074] outline-none" placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-[#134074] uppercase tracking-widest mb-1.5 opacity-80">{t('admin.products.commissionPct')}</label>
                        <div className="relative flex items-center border border-[#C5D8E8]/30 rounded-xl focus-within:border-[#8DA9C4] focus-within:ring-2 focus-within:ring-[#C5D8E8]/15 bg-[#EEF4ED]/10 transition-all">
                          <input type="number" step="0.1" value={form.marginPct} onChange={e => {
                            const margin = parseFloat(e.target.value) || DEFAULT_GROSS_MARGIN
                            const cost = parseFloat(form.providerCostUsd) || 0
                            const autoPrice = cost > 0 ? (cost / (1 - margin / 100)).toFixed(2) : form.priceUsd
                            setForm({ ...form, marginPct: e.target.value, priceUsd: autoPrice })
                          }}
                            className="w-full pl-4 pr-8 py-3 bg-transparent text-[15px] font-bold text-[#134074] outline-none" placeholder="30" />
                          <span className="absolute right-4 text-[#13315C] font-bold text-[15px]">%</span>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-[#134074] uppercase tracking-widest mb-1.5 opacity-80">{t('admin.products.priceUsdLabel')}</label>
                        <div className={`relative flex items-center transition-all rounded-xl border ${formErrors.priceUsd ? 'border-red-300 ring-2 ring-red-100 bg-red-50' : 'border-[#C5D8E8]/30 focus-within:border-tevra-coral/50 focus-within:ring-2 focus-within:ring-tevra-coral/10 bg-[#EEF4ED]/10'}`}>
                          <span className="pl-4 text-tevra-coral font-bold text-[15px]">$</span>
                          <input type="number" step="0.01" value={form.priceUsd} onChange={e => { setForm({ ...form, priceUsd: e.target.value, priceRefLocal: (Number(e.target.value) * (exchangeRateSell || 3.78)).toFixed(2) }); setFormErrors({ ...formErrors, priceUsd: '' }) }}
                            className="w-full pl-2 pr-4 py-3 bg-transparent text-[16px] font-black text-tevra-coral outline-none" placeholder="0.00" />
                        </div>
                        {formErrors.priceUsd && <p className="text-xs text-red-500 font-medium mt-1.5 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">info</span>{formErrors.priceUsd}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-[#134074] uppercase tracking-widest mb-1.5 opacity-80">{t('admin.products.priceLocal')}</label>
                        <div className="relative flex items-center border border-[#C5D8E8]/30 rounded-xl focus-within:border-[#8DA9C4] focus-within:ring-2 focus-within:ring-[#C5D8E8]/15 bg-[#EEF4ED]/10 transition-all">
                          <span className="pl-4 text-[#13315C] font-bold text-[15px]">S/</span>
                          <input type="number" step="0.01" value={form.priceRefLocal} onChange={e => setForm({ ...form, priceRefLocal: e.target.value })}
                            className="w-full pl-2 pr-4 py-3 bg-transparent text-[16px] font-black text-[#134074] outline-none" placeholder="0.00" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="bg-white p-6 rounded-2xl border border-[#C5D8E8]/20 shadow-sm space-y-5">
                    <h4 className="text-sm font-bold text-[#134074] uppercase tracking-widest border-b border-[#C5D8E8]/10 pb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">description</span> Características
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#134074] uppercase tracking-widest mb-1.5 opacity-80">{t('admin.products.description')} <span className="text-tevra-coral bg-tevra-coral/10 px-1.5 py-0.5 rounded text-[9px]">ES</span></label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={6}
                          placeholder={t('admin.products.descriptionPlaceholder')}
                          className="w-full px-4 py-3 bg-[#EEF4ED]/10 border border-[#C5D8E8]/30 rounded-xl text-[14px] leading-relaxed text-[#134074] focus:ring-2 focus:ring-tevra-coral/10 focus:border-tevra-coral/50 outline-none transition-all resize-y placeholder:text-[#A5C0D8]" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#134074] uppercase tracking-widest mb-1.5 opacity-80">{t('admin.products.descriptionEn')} <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[9px]">EN</span></label>
                        <textarea value={form.descriptionEn} onChange={e => setForm({ ...form, descriptionEn: e.target.value })} rows={5}
                          placeholder={t('admin.products.descriptionEnPlaceholder')}
                          className="w-full px-4 py-3 bg-[#EEF4ED]/10 border border-[#C5D8E8]/30 rounded-xl text-[14px] leading-relaxed text-[#134074] focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all resize-y placeholder:text-[#A5C0D8]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#C5D8E8]/10 flex justify-end gap-3 bg-white rounded-b-2xl shrink-0">
              <button type="button" onClick={() => setModal(null)} className="px-6 py-2.5 bg-gray-50 border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">{t('common.cancel')}</button>
              <button type="submit" onClick={handleSave} disabled={saving}
                className="px-8 py-2.5 bg-[#134074] hover:bg-[#13315C] focus:ring-4 focus:ring-[#134074]/20 disabled:opacity-50 disabled:hover:translate-y-0 text-[#EEF4ED] rounded-xl font-bold text-[15px] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[20px]">save</span>
                )}
                {saving ? t('common.saving') : modal === 'create' ? t('admin.products.createProduct') : t('admin.users.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {modal === 'delete' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#134074]/40 backdrop-blur-sm transition-opacity" onClick={() => setModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center ring-4 ring-red-50/50">
                <span className="material-symbols-outlined text-red-500 text-[26px]">delete_forever</span>
              </div>
              <h3 className="text-lg font-bold text-[#134074] mb-1.5">{t('admin.products.deleteProduct')}</h3>
              <p className="text-sm text-[#134074] leading-relaxed">{t('admin.products.deleteConfirmation', { name: selected.name })}</p>
            </div>
            <div className="p-5 border-t border-[#C5D8E8]/10 flex flex-col gap-2 bg-[#EEF4ED]/30/50 rounded-b-2xl">
              <button onClick={handleDelete} disabled={saving}
                className="w-full px-4 py-2.5 font-semibold bg-red-500 text-[#EEF4ED] rounded-xl hover:bg-red-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:translate-y-0 disabled:shadow-none disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? t('common.deleting') : t('admin.products.confirmDelete')}
              </button>
              <button onClick={() => setModal(null)} className="w-full px-4 py-2.5 font-semibold text-[#134074] bg-white border border-[#C5D8E8]/20 hover:bg-[#EEF4ED]/30 hover:text-[#134074] rounded-xl transition-colors">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
