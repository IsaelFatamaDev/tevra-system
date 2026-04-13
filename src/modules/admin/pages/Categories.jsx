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
          <h2 className="text-xl font-semibold text-zinc-900">{t('admin.categories.title')}</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{t('admin.categories.subtitle')}</p>
        </div>
        <button onClick={openCreate} className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors text-sm">
          <span className="material-symbols-outlined text-[16px]">add</span> {t('admin.categories.newCategory')}
        </button>
      </div>

      {/* Metric */}
      <div className="flex gap-3">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center gap-3 stat-card">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">category</span>
          </div>
          <div>
            <p className="text-xs text-zinc-500">{t('admin.categories.totalCategories')}</p>
            <p className="text-lg font-semibold text-zinc-900">{categories.length}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-100">
          <div className="relative max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('admin.categories.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-3xl text-zinc-300">category</span>
            <p className="text-sm text-zinc-500 mt-2">{t('admin.categories.noCategoriesFound')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  <th className="px-5 py-3">{t('admin.table.category')}</th>
                  <th className="px-5 py-3">{t('admin.table.slug')}</th>
                  <th className="px-5 py-3">{t('admin.table.description')}</th>
                  <th className="px-5 py-3 text-right">{t('admin.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {paginated.map(cat => (
                  <tr key={cat.id} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
                          <span className="material-symbols-outlined text-[18px]">{cat.icon || 'category'}</span>
                        </div>
                        <span className="text-sm font-medium text-zinc-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-500 font-mono">{cat.slug}</td>
                    <td className="px-5 py-3 text-sm text-zinc-500 max-w-xs truncate">{cat.description || '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => openEdit(cat)} title={t('common.edit')}
                        className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors opacity-60 group-hover:opacity-100">
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
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity" onClick={() => setModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="text-lg font-semibold text-zinc-900">{modal === 'create' ? t('admin.categories.newCategory') : t('admin.categories.editCategory')}</h3>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors -mr-2 text-zinc-400">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">{t('admin.categories.nameLabel')}</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('admin.categories.namePlaceholder')}
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">{t('admin.categories.slugLabel')} <span className="text-zinc-400 font-normal normal-case tracking-normal">{t('common.optional')}</span></label>
                <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder={t('admin.categories.slugPlaceholder')}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all font-mono text-zinc-700 placeholder:text-zinc-300" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">{t('admin.products.description')}</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={t('admin.categories.descriptionPlaceholder')} rows={2}
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all resize-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">{t('admin.categories.iconLabel')}</label>
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <input type="text" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="category"
                      className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" />
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-200 shrink-0">
                    <span className="material-symbols-outlined text-zinc-600 text-[20px]">{form.icon || 'category'}</span>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">{t('admin.categories.iconHint')}</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50/50">
              <button onClick={() => setModal(null)} className="px-4 py-2 bg-white border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-colors shadow-sm">
                {t('common.cancel')}
              </button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:-translate-y-0.5 disabled:translate-y-0 disabled:shadow-none flex items-center gap-2">
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
