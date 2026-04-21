import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import productsService from '../../public/services/products.service'
import Pagination from '../../../core/components/Pagination'
import { useToast } from '../../../core/contexts/ToastContext'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'
const ITEMS_PER_PAGE = 10

const EMPTY_FORM = { name: '', description: '', priceUsd: '', priceRefLocal: '', stockStatus: 'available', marginPct: '', isFeatured: false, categoryId: '', brandId: '' }

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
    const timer = setTimeout(fetchData, search ? 350 : 0)
    return () => clearTimeout(timer)
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
      addToast(modal === 'create' ? t('admin.products.created') : t('admin.products.updated'))
    } catch (err) {
      console.error(err)
      addToast(t('admin.products.processError'), 'error')
    }
    finally { setSaving(false); setUploading(false) }
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#031926]">{t('admin.products.title')}</h2>
          <p className="text-sm text-[#468189] mt-0.5">{t('admin.products.subtitle')}</p>
        </div>
        <button onClick={openCreate} className="bg-[#031926] hover:bg-[#0d3349] text-[#EBF2FA] px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors text-sm">
          <span className="material-symbols-outlined text-[16px]">add</span> {t('admin.products.newProduct')}
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('admin.products.totalProducts'), value: totalProducts, icon: 'inventory_2' },
          { label: t('admin.products.featured'), value: featured, icon: 'star' },
          { label: t('admin.products.avgPrice'), value: `$${avgPrice.toFixed(0)}`, icon: 'attach_money' },
        ].map((m, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-[#9DBEBB]/20 flex items-center gap-3 stat-card">
            <div className="w-9 h-9 rounded-lg bg-[#EBF2FA] text-[#468189] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
            </div>
            <div>
              <p className="text-xs text-[#468189]">{m.label}</p>
              <p className="text-lg font-semibold text-[#031926]">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#9DBEBB]/20 overflow-hidden">
        <div className="p-4 border-b border-[#9DBEBB]/10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9DBEBB] text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('admin.products.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setCatFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!catFilter ? 'bg-[#031926] text-[#EBF2FA]' : 'bg-[#EBF2FA]/30 text-[#468189] hover:bg-[#EBF2FA] border border-[#9DBEBB]/20'}`}>
              {t('common.all')}
            </button>
            {categories.slice(0, 6).map(cat => (
              <button key={cat.id} onClick={() => setCatFilter(catFilter === cat.id ? '' : cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${catFilter === cat.id ? 'bg-[#031926] text-[#EBF2FA]' : 'bg-[#EBF2FA]/30 text-[#468189] hover:bg-[#EBF2FA] border border-[#9DBEBB]/20'}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-[#9DBEBB]/20 border-t-[#468189] rounded-full animate-spin" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-3xl text-[#9DBEBB]">inventory_2</span>
            <p className="text-sm text-[#468189] mt-2">{t('admin.products.noProductsFound')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-195">
              <thead>
                <tr className="bg-[#EBF2FA]/30 text-[11px] font-medium text-[#468189] uppercase tracking-wider border-b border-[#9DBEBB]/10">
                  <th className="px-5 py-3">{t('admin.table.product')}</th>
                  <th className="px-5 py-3">{t('admin.table.category')}</th>
                  <th className="px-5 py-3">{t('admin.table.priceUsd')}</th>
                  <th className="px-5 py-3">{t('admin.table.margin')}</th>
                  <th className="px-5 py-3">{t('admin.table.status')}</th>
                  <th className="px-5 py-3">{t('admin.table.published')}</th>
                  <th className="px-5 py-3 text-right">{t('admin.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#9DBEBB]/10">
                {paginated.map(prod => {
                  const st = STOCK_CONFIG[prod.stockStatus] || STOCK_CONFIG.available
                  const imgUrl = getImageUrl(prod)
                  return (
                    <tr key={prod.id} className="hover:bg-[#EBF2FA]/30 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {imgUrl ? (
                            <img src={imgUrl} alt={prod.name} className="w-9 h-9 rounded-lg object-cover bg-[#EBF2FA]" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-[#EBF2FA] flex items-center justify-center text-[#9DBEBB]">
                              <span className="material-symbols-outlined text-[16px]">image</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#031926] truncate">{prod.name}</p>
                            <p className="text-xs text-[#468189] truncate">{prod.brand?.name || ''}</p>
                          </div>
                          {prod.isFeatured && <span className="material-symbols-outlined text-amber-400 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#468189]">{prod.category?.name || '—'}</td>
                      <td className="px-5 py-3 text-sm font-medium text-[#031926]">${Number(prod.priceUsd || 0).toFixed(2)}</td>
                      <td className="px-5 py-3 text-sm text-[#468189]">{prod.marginPct ? `${prod.marginPct}%` : '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 ${st.bg} ${st.text} text-[11px] font-medium rounded-md`}>{st.label}</span>
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleToggleActive(prod)} title={prod.isActive ? t('admin.products.unpublished') : t('admin.products.published')}
                          className="relative inline-flex items-center cursor-pointer">
                          <div className={`w-9 h-5 rounded-full transition-colors ${prod.isActive !== false ? 'bg-emerald-500' : 'bg-[#9DBEBB]/40'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prod.isActive !== false ? 'translate-x-4' : ''}`} />
                          </div>
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(prod)} title={t('common.edit')}
                            className="p-1.5 rounded-md hover:bg-[#EBF2FA] text-[#9DBEBB] hover:text-[#031926] transition-colors">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button onClick={() => openDelete(prod)} title={t('common.delete')}
                            className="p-1.5 rounded-md hover:bg-red-50 text-[#9DBEBB] hover:text-red-500 transition-colors">
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

        <div className="px-5 py-3 border-t border-[#9DBEBB]/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-[#468189]">
            {t('admin.pagination.showing')} <span className="font-medium">{Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}-{Math.min(page * ITEMS_PER_PAGE, total)}</span> {t('admin.pagination.of')} <span className="font-medium">{total}</span> {t('admin.pagination.products')}
          </span>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#031926]/40 backdrop-blur-sm transition-opacity" onClick={() => setModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-[#9DBEBB]/10 flex justify-between items-center bg-[#EBF2FA]/30/50 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-semibold text-[#031926]">{modal === 'create' ? t('admin.products.newProduct') : t('admin.products.editProduct')}</h3>
                <p className="text-sm font-medium text-[#468189] mt-0.5">{t('admin.products.inventoryInfo')}</p>
              </div>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-[#EBF2FA] rounded-full transition-colors -mr-2 text-[#9DBEBB] hover:text-[#031926]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Image Upload */}
              <div className="bg-[#EBF2FA]/30 p-4 rounded-xl border border-[#9DBEBB]/10 flex items-center gap-5">
                <div onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-xl bg-white border-2 border-dashed border-[#9DBEBB]/20 flex flex-col items-center justify-center cursor-pointer hover:border-tevra-coral hover:bg-tevra-coral/5 transition-all overflow-hidden group">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[#9DBEBB] group-hover:text-tevra-coral/70 transition-colors">add_photo_alternate</span>
                    </>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-[#031926]">{t('admin.products.mainImage')}</h4>
                  <p className="text-[11px] text-[#468189] mt-0.5 mb-2">{t('admin.products.imageHint')}</p>
                  <button onClick={() => fileRef.current?.click()} className="text-[11px] font-bold text-tevra-coral hover:underline uppercase tracking-wide">
                    {imagePreview ? t('admin.products.changeImage') : t('admin.products.selectImage')}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#468189] uppercase tracking-widest mb-1.5">{t('admin.products.commercialName')}</label>
                <div className={`relative flex items-center transition-all rounded-xl border ${formErrors.name ? 'border-red-300 ring-2 ring-red-100' : 'border-[#9DBEBB]/20 focus-within:border-[#468189] focus-within:ring-2 focus-within:ring-[#9DBEBB]/15'}`}>
                  <input value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setFormErrors({ ...formErrors, name: '' }) }}
                    placeholder={t('admin.products.namePlaceholder')}
                    className="w-full px-4 py-2.5 bg-transparent text-sm text-[#031926] outline-none placeholder:text-[#9DBEBB]" />
                  {formErrors.name && <span className="material-symbols-outlined text-red-500 text-[18px] pr-3">error</span>}
                </div>
                {formErrors.name && <p className="text-xs text-red-500 font-medium mt-1.5 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">info</span>{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#468189] uppercase tracking-widest mb-1.5">{t('admin.products.description')}</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                  placeholder={t('admin.products.descriptionPlaceholder')}
                  className="w-full px-4 py-2.5 bg-white border border-[#9DBEBB]/20 rounded-xl text-sm focus:ring-2 focus:ring-[#9DBEBB]/15 focus:border-[#468189] outline-none transition-all resize-none placeholder:text-[#9DBEBB]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#468189] uppercase tracking-widest mb-1.5">{t('admin.products.categoryLabel')}</label>
                  <div className={`relative transition-all rounded-xl border ${formErrors.categoryId ? 'border-red-300 ring-2 ring-red-100' : 'border-[#9DBEBB]/20 focus-within:border-[#468189] focus-within:ring-2 focus-within:ring-[#9DBEBB]/15'}`}>
                    <select value={form.categoryId} onChange={e => { setForm({ ...form, categoryId: e.target.value }); setFormErrors({ ...formErrors, categoryId: '' }) }}
                      className="w-full px-4 py-2.5 bg-transparent text-sm appearance-none outline-none text-[#031926]">
                      <option value="" disabled>{t('admin.products.selectOption')}</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#9DBEBB] pointer-events-none">expand_content</span>
                  </div>
                  {formErrors.categoryId && <p className="text-xs text-red-500 font-medium mt-1.5 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">info</span>{formErrors.categoryId}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#468189] uppercase tracking-widest mb-1.5">{t('admin.products.brandLabel')}</label>
                  <div className="relative border border-[#9DBEBB]/20 rounded-xl focus-within:border-[#468189] focus-within:ring-2 focus-within:ring-[#9DBEBB]/15 transition-all">
                    <select value={form.brandId} onChange={e => setForm({ ...form, brandId: e.target.value })}
                      className="w-full px-4 py-2.5 bg-transparent text-sm appearance-none outline-none text-[#031926]">
                      <option value="">{t('admin.products.noBrand')}</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#9DBEBB] pointer-events-none">expand_content</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#468189] uppercase tracking-widest mb-1.5">{t('admin.products.priceUsdLabel')}</label>
                  <div className={`relative flex items-center transition-all rounded-xl border ${formErrors.priceUsd ? 'border-red-300 ring-2 ring-red-100' : 'border-[#9DBEBB]/20 focus-within:border-[#468189] focus-within:ring-2 focus-within:ring-[#9DBEBB]/15'}`}>
                    <span className="pl-4 text-[#468189] font-semibold">$</span>
                    <input type="number" step="0.01" value={form.priceUsd} onChange={e => { setForm({ ...form, priceUsd: e.target.value }); setFormErrors({ ...formErrors, priceUsd: '' }) }}
                      className="w-full pl-2 pr-4 py-2.5 bg-transparent text-sm font-semibold text-[#031926] outline-none" placeholder="0.00" />
                  </div>
                  {formErrors.priceUsd && <p className="text-xs text-red-500 font-medium mt-1.5 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">info</span>{formErrors.priceUsd}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#468189] uppercase tracking-widest mb-1.5">{t('admin.products.priceLocal')}</label>
                  <div className="relative flex items-center border border-[#9DBEBB]/20 rounded-xl focus-within:border-[#468189] focus-within:ring-2 focus-within:ring-[#9DBEBB]/15 transition-all">
                    <span className="pl-4 text-[#9DBEBB] font-semibold">S/</span>
                    <input type="number" step="0.01" value={form.priceRefLocal} onChange={e => setForm({ ...form, priceRefLocal: e.target.value })}
                      className="w-full pl-2 pr-4 py-2.5 bg-transparent text-sm font-semibold text-[#031926] outline-none" placeholder="0.00" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#468189] uppercase tracking-widest mb-1.5">{t('admin.products.commissionPct')}</label>
                  <div className="relative flex items-center border border-[#9DBEBB]/20 rounded-xl focus-within:border-[#468189] focus-within:ring-2 focus-within:ring-[#9DBEBB]/15 transition-all">
                    <input type="number" step="0.1" value={form.marginPct} onChange={e => setForm({ ...form, marginPct: e.target.value })}
                      className="w-full pl-4 pr-8 py-2.5 bg-transparent text-sm font-semibold text-[#031926] outline-none" placeholder="10.0" />
                    <span className="absolute right-4 text-[#9DBEBB] font-bold">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#468189] uppercase tracking-widest mb-1.5">{t('admin.products.stockStatus')}</label>
                  <div className="relative border border-[#9DBEBB]/20 rounded-xl focus-within:border-[#468189] focus-within:ring-2 focus-within:ring-[#9DBEBB]/15 transition-all">
                    <select value={form.stockStatus} onChange={e => setForm({ ...form, stockStatus: e.target.value })}
                      className="w-full px-4 py-2.5 bg-transparent text-sm appearance-none outline-none text-[#031926] font-medium">
                      <option value="available">{t('admin.products.stockAvailable')}</option>
                      <option value="low_stock">{t('admin.products.stockLow')}</option>
                      <option value="out_of_stock">{t('admin.products.stockOut')}</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#9DBEBB] pointer-events-none">expand_content</span>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-3 p-4 border border-[#9DBEBB]/20 rounded-xl cursor-pointer hover:bg-[#EBF2FA]/30 transition-colors">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-5 h-5 rounded border-[#9DBEBB]/30 text-tevra-coral focus:ring-tevra-coral/20 transition-all cursor-pointer" />
                <div>
                  <span className="text-sm font-bold text-[#031926] block">{t('admin.products.markFeatured')}</span>
                  <span className="text-xs text-[#468189] block">{t('admin.products.featuredHint')}</span>
                </div>
              </label>
            </div>

            <div className="px-6 py-4 border-t border-[#9DBEBB]/10 flex justify-end gap-3 bg-[#EBF2FA]/30/50 rounded-b-2xl">
              <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 bg-white border border-[#9DBEBB]/20 text-sm font-medium text-[#468189] hover:bg-[#EBF2FA]/30 hover:text-[#031926] rounded-xl transition-colors shadow-sm">{t('common.cancel')}</button>
              <button type="submit" onClick={handleSave} disabled={saving}
                className="px-6 py-2.5 bg-[#031926] hover:bg-[#0d3349] focus:ring-4 focus:ring-[#031926]/20 disabled:opacity-50 disabled:hover:translate-y-0 text-[#EBF2FA] rounded-xl font-semibold text-sm transition-all shadow-md hover:-translate-y-0.5 flex items-center gap-2">
                {(saving || uploading) ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">save</span>
                )}
                {uploading ? t('common.uploading') : saving ? t('common.saving') : modal === 'create' ? t('admin.products.createProduct') : t('admin.users.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {modal === 'delete' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#031926]/40 backdrop-blur-sm transition-opacity" onClick={() => setModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center ring-4 ring-red-50/50">
                <span className="material-symbols-outlined text-red-500 text-[26px]">delete_forever</span>
              </div>
              <h3 className="text-lg font-bold text-[#031926] mb-1.5">{t('admin.products.deleteProduct')}</h3>
              <p className="text-sm text-[#468189] leading-relaxed">{t('admin.products.deleteConfirmation', { name: selected.name })}</p>
            </div>
            <div className="p-5 border-t border-[#9DBEBB]/10 flex flex-col gap-2 bg-[#EBF2FA]/30/50 rounded-b-2xl">
              <button onClick={handleDelete} disabled={saving}
                className="w-full px-4 py-2.5 font-semibold bg-red-500 text-[#EBF2FA] rounded-xl hover:bg-red-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:translate-y-0 disabled:shadow-none disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? t('common.deleting') : t('admin.products.confirmDelete')}
              </button>
              <button onClick={() => setModal(null)} className="w-full px-4 py-2.5 font-semibold text-[#468189] bg-white border border-[#9DBEBB]/20 hover:bg-[#EBF2FA]/30 hover:text-[#031926] rounded-xl transition-colors">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
