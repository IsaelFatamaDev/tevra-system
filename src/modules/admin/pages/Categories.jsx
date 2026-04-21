import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import productsService from '../../public/services/products.service'
import Pagination from '../../../core/components/Pagination'
import { useToast } from '../../../core/contexts/ToastContext'

const ITEMS_PER_PAGE = 10
const EMPTY_FORM = { name: '', slug: '', description: '', icon: '' }

export default function AdminCategories() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { addToast } = useToast()

  const fetchData = () => {
    setLoading(true)
    productsService.getCategories()
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching categories', err))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [])

  const filtered = categories.filter(c => {
    const q = search.toLowerCase()
    return !q || c.name?.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q)
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create') }
  const openEdit = (cat) => {
    setSelected(cat)
    setForm({ name: cat.name || '', slug: cat.slug || '', description: cat.description || '', icon: cat.icon || '' })
    setModal('edit')
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      addToast(t('admin.categories.nameRequired'), 'error')
      return
    }
    setSaving(true)
    try {
      if (modal === 'create') {
        await productsService.createCategory(form)
        addToast(t('admin.categories.created'))
      } else {
        await productsService.updateCategory(selected.id, form)
        addToast(t('admin.categories.updated'))
      }
      fetchData()
      setModal(null)
    } catch (err) {
      console.error(err)
      addToast(t('admin.categories.processError'), 'error')
    }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 platform-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#031926]">{t('admin.categories.title')}</h2>
          <p className="text-sm text-[#468189] mt-0.5">{t('admin.categories.subtitle')}</p>
        </div>
        <button onClick={openCreate} className="bg-[#031926] hover:bg-[#0d3349] text-[#EBF2FA] px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors text-sm">
          <span className="material-symbols-outlined text-[16px]">add</span> {t('admin.categories.newCategory')}
        </button>
      </div>

      {/* Metric */}
      <div className="flex gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#9DBEBB]/20 flex items-center gap-3 stat-card">
          <div className="w-9 h-9 rounded-lg bg-[#EBF2FA] text-[#468189] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">category</span>
          </div>
          <div>
            <p className="text-xs text-[#468189]">{t('admin.categories.totalCategories')}</p>
            <p className="text-lg font-semibold text-[#031926]">{categories.length}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#9DBEBB]/20 overflow-hidden">
        <div className="p-4 border-b border-[#9DBEBB]/10">
          <div className="relative max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9DBEBB] text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('admin.categories.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-[#9DBEBB]/20 border-t-[#468189] rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-3xl text-[#9DBEBB]">category</span>
            <p className="text-sm text-[#468189] mt-2">{t('admin.categories.noCategoriesFound')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#EBF2FA]/30 border-b border-[#9DBEBB]/10 text-[11px] font-medium text-[#468189] uppercase tracking-wider">
                  <th className="px-5 py-3">{t('admin.table.category')}</th>
                  <th className="px-5 py-3">{t('admin.table.slug')}</th>
                  <th className="px-5 py-3">{t('admin.table.description')}</th>
                  <th className="px-5 py-3 text-right">{t('admin.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#9DBEBB]/10">
                {paginated.map(cat => (
                  <tr key={cat.id} className="hover:bg-[#EBF2FA]/30 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#EBF2FA] flex items-center justify-center text-[#468189]">
                          <span className="material-symbols-outlined text-[18px]">{cat.icon || 'category'}</span>
                        </div>
                        <span className="text-sm font-medium text-[#031926]">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-[#468189] font-mono">{cat.slug}</td>
                    <td className="px-5 py-3 text-sm text-[#468189] max-w-xs truncate">{cat.description || '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => openEdit(cat)} title={t('common.edit')}
                        className="p-1.5 rounded-md hover:bg-[#EBF2FA] text-[#9DBEBB] hover:text-[#031926] transition-colors opacity-60 group-hover:opacity-100">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#031926]/40 backdrop-blur-sm transition-opacity" onClick={() => setModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-[#9DBEBB]/10 flex justify-between items-center bg-[#EBF2FA]/30/50">
              <h3 className="text-lg font-semibold text-[#031926]">{modal === 'create' ? t('admin.categories.newCategory') : t('admin.categories.editCategory')}</h3>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-[#EBF2FA] rounded-full transition-colors -mr-2 text-[#9DBEBB]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#468189] uppercase tracking-widest mb-1.5">{t('admin.categories.nameLabel')}</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('admin.categories.namePlaceholder')}
                  className="w-full px-4 py-2.5 bg-white border border-[#9DBEBB]/20 rounded-xl text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#468189] uppercase tracking-widest mb-1.5">{t('admin.categories.slugLabel')} <span className="text-[#9DBEBB] font-normal normal-case tracking-normal">{t('common.optional')}</span></label>
                <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder={t('admin.categories.slugPlaceholder')}
                  className="w-full px-4 py-2.5 bg-[#EBF2FA]/30 border border-[#9DBEBB]/20 rounded-xl text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all font-mono text-[#031926] placeholder:text-[#9DBEBB]" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#468189] uppercase tracking-widest mb-1.5">{t('admin.products.description')}</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={t('admin.categories.descriptionPlaceholder')} rows={2}
                  className="w-full px-4 py-2.5 bg-white border border-[#9DBEBB]/20 rounded-xl text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all resize-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#468189] uppercase tracking-widest mb-1.5">{t('admin.categories.iconLabel')}</label>
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <input type="text" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="category"
                      className="w-full px-4 py-2.5 bg-white border border-[#9DBEBB]/20 rounded-xl text-sm focus:ring-2 focus:ring-[#031926]/10 focus:border-[#468189] outline-none transition-all" />
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-[#EBF2FA] flex items-center justify-center border border-[#9DBEBB]/20 shrink-0">
                    <span className="material-symbols-outlined text-[#468189] text-[20px]">{form.icon || 'category'}</span>
                  </div>
                </div>
                <p className="text-[10px] text-[#9DBEBB] mt-1">{t('admin.categories.iconHint')}</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#9DBEBB]/10 flex justify-end gap-3 bg-[#EBF2FA]/30/50">
              <button onClick={() => setModal(null)} className="px-4 py-2 bg-white border border-[#9DBEBB]/20 text-sm font-medium text-[#468189] hover:bg-[#EBF2FA]/30 hover:text-[#031926] rounded-xl transition-colors shadow-sm">
                {t('common.cancel')}
              </button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="px-6 py-2 bg-[#031926] hover:bg-[#0d3349] disabled:opacity-50 text-[#EBF2FA] rounded-xl font-semibold text-sm transition-all shadow-md hover:-translate-y-0.5 disabled:translate-y-0 disabled:shadow-none flex items-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? t('common.saving') : modal === 'create' ? t('common.create') : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
