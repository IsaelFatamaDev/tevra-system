import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import productsService from '../../public/services/products.service'
import Pagination from '../../../core/components/Pagination'
import { useToast } from '../../../core/contexts/ToastContext'

const ITEMS_PER_PAGE = 10
const EMPTY_FORM = { name: '', logoUrl: '' }

export default function AdminBrands() {
  const { t } = useTranslation()
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
      addToast(t('admin.brands.nameRequired'), 'error')
      return
    }
    setSaving(true)
    try {
      if (modal === 'create') {
        await productsService.createBrand(form)
        addToast(t('admin.brands.created'))
      } else {
        await productsService.updateBrand(selected.id, form)
        addToast(t('admin.brands.updated'))
      }
      fetchData()
      setModal(null)
    } catch (err) {
      console.error(err)
      addToast(t('admin.brands.processError'), 'error')
    }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await productsService.deleteBrand(selected.id)
      fetchData()
      setModal(null)
      addToast(t('admin.brands.deleted'))
    } catch (err) {
      console.error(err)
      addToast(t('admin.brands.deleteError'), 'error')
    }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 platform-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#031926]">{t('admin.brands.title')}</h2>
          <p className="text-sm text-[#468189] mt-0.5">{t('admin.brands.subtitle')}</p>
        </div>
        <button onClick={openCreate} className="bg-[#031926] hover:bg-[#0d3349] text-[#EBF2FA] px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors text-sm">
          <span className="material-symbols-outlined text-[16px]">add</span> {t('admin.brands.newBrand')}
        </button>
      </div>

      {/* Metric */}
      <div className="flex gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#9DBEBB]/20 flex items-center gap-3 stat-card">
          <div className="w-9 h-9 rounded-lg bg-[#EBF2FA] text-[#468189] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">storefront</span>
          </div>
          <div>
            <p className="text-xs text-[#468189]">{t('admin.brands.totalBrands')}</p>
            <p className="text-lg font-semibold text-[#031926]">{brands.length}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#9DBEBB]/20 overflow-hidden">
        <div className="p-4 border-b border-[#9DBEBB]/10">
          <div className="relative max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9DBEBB] text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('admin.brands.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-[#9DBEBB]/20 border-t-[#468189] rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-3xl text-[#9DBEBB]">storefront</span>
            <p className="text-sm text-[#468189] mt-2">{t('admin.brands.noBrandsFound')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#EBF2FA]/30 border-b border-[#9DBEBB]/10 text-[11px] font-medium text-[#468189] uppercase tracking-wider">
                  <th className="px-5 py-3">{t('admin.table.brand')}</th>
                  <th className="px-5 py-3">{t('admin.table.created')}</th>
                  <th className="px-5 py-3 text-right">{t('admin.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#9DBEBB]/10">
                {paginated.map(brand => (
                  <tr key={brand.id} className="hover:bg-[#EBF2FA]/30 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {brand.logoUrl ? (
                          <img src={brand.logoUrl} alt={brand.name} className="w-9 h-9 rounded-lg object-contain bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 p-0.5" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-[#EBF2FA] flex items-center justify-center text-[#468189]">
                            <span className="material-symbols-outlined text-[18px]">storefront</span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-[#031926]">{brand.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-[#468189]">{new Date(brand.createdAt).toLocaleDateString('es-PE')}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(brand)} title={t('common.edit')}
                          className="p-1.5 rounded-md hover:bg-[#EBF2FA] text-[#9DBEBB] hover:text-[#031926] transition-colors opacity-60 group-hover:opacity-100">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => openDelete(brand)} title={t('common.delete')}
                          className="p-1.5 rounded-md hover:bg-red-50 text-[#9DBEBB] hover:text-red-500 transition-colors opacity-60 group-hover:opacity-100">
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
        <div className="px-5 py-3 border-t border-[#9DBEBB]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#468189]">
          <span>{t('admin.pagination.showing')} {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)} {t('admin.pagination.of')} {filtered.length}</span>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#031926]/40 backdrop-blur-sm transition-opacity" onClick={() => setModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-[#9DBEBB]/10 flex justify-between items-center bg-[#EBF2FA]/30/50">
              <h3 className="text-lg font-semibold text-[#031926]">{modal === 'create' ? t('admin.brands.newBrand') : t('admin.brands.editBrand')}</h3>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-[#EBF2FA] rounded-full transition-colors -mr-2 text-[#9DBEBB]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Logo upload */}
              <div>
                <label className="block text-[11px] font-bold text-[#468189] uppercase tracking-widest mb-1.5">{t('admin.brands.logoLabel')}</label>
                <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleFileChange} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center gap-4 p-4 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-xl hover:border-tevra-coral hover:bg-white transition-all group shadow-sm focus:outline-none focus:ring-2 focus:ring-tevra-coral/20">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="w-14 h-14 rounded-lg object-contain bg-white border border-[#9DBEBB]/20 p-1 shadow-sm group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-white border border-[#9DBEBB]/20 flex items-center justify-center text-[#9DBEBB] group-hover:text-tevra-coral shadow-sm group-hover:border-tevra-coral transition-colors">
                      <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                    </div>
                  )}
                  <div className="text-left flex-1">
                    <p className="text-sm font-bold text-[#031926] group-hover:text-tevra-coral transition-colors decoration-2 underline-offset-2">{t('admin.brands.browseFiles')}</p>
                    <p className="text-xs text-[#468189] font-medium mt-0.5">{t('admin.brands.fileHint')}</p>
                  </div>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#468189] uppercase tracking-widest mb-1.5">{t('admin.brands.institutionalName')}</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('admin.brands.namePlaceholder')}
                  className="w-full px-4 py-2.5 bg-white border border-[#9DBEBB]/20 rounded-xl text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#9DBEBB]/10 flex justify-end gap-3 bg-[#EBF2FA]/30/50">
              <button onClick={() => setModal(null)} className="px-4 py-2 bg-white border border-[#9DBEBB]/20 text-sm font-medium text-[#468189] hover:bg-[#EBF2FA]/30 hover:text-[#031926] rounded-xl transition-colors shadow-sm">
                {t('common.cancel')}
              </button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="px-6 py-2 bg-[#031926] hover:bg-[#0d3349] disabled:opacity-50 text-[#EBF2FA] rounded-xl font-semibold text-sm transition-all shadow-md hover:-translate-y-0.5 disabled:translate-y-0 disabled:shadow-none flex items-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? t('common.saving') : modal === 'create' ? t('admin.brands.createBrand') : t('admin.users.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#031926]/40 backdrop-blur-sm transition-opacity" onClick={() => setModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm ring-1 ring-red-100">
                <span className="material-symbols-outlined text-red-500 text-[32px]">warning</span>
              </div>
              <h3 className="text-xl font-bold text-[#031926] mb-2">{t('admin.brands.deleteTitle')}</h3>
              <p className="text-sm text-[#468189] mb-6 leading-relaxed">
                {t('admin.brands.deleteConfirmation', { name: selected?.name })}
              </p>

              <div className="flex gap-3 w-full">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 bg-white border border-[#9DBEBB]/20 text-sm font-semibold text-[#468189] hover:bg-[#EBF2FA]/30 hover:text-[#031926] rounded-xl transition-colors shadow-sm">
                  {t('common.cancel')}
                </button>
                <button onClick={handleDelete} disabled={saving}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-[#EBF2FA] rounded-xl font-semibold text-sm transition-all shadow-md hover:-translate-y-0.5 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2">
                  {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {saving ? t('common.deleting') : t('admin.brands.confirmDelete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
