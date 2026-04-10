import { useState, useEffect } from 'react'
import productsService from '../../public/services/products.service'

const EMPTY_FORM = { name: '', slug: '', description: '', icon: '' }

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

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

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create') }
  const openEdit = (cat) => {
    setSelected(cat)
    setForm({ name: cat.name || '', slug: cat.slug || '', description: cat.description || '', icon: cat.icon || '' })
    setModal('edit')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (modal === 'create') await productsService.createCategory(form)
      else await productsService.updateCategory(selected.id, form)
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
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-headline tracking-tight">Categorías</h2>
          <p className="text-sm text-gray-500 mt-1">Organiza tu catálogo de productos.</p>
        </div>
        <button onClick={openCreate} className="bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 text-sm">
          <span className="material-symbols-outlined text-[18px]">add_circle</span> Nueva Categoría
        </button>
      </div>

      {/* Metric */}
      <div className="flex gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">category</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total</p>
            <p className="text-lg font-black text-gray-900 font-headline">{categories.length}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar categoría..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-[3px] border-sky-200 border-t-sky-600 rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-gray-300">category</span>
            <p className="text-sm text-gray-400 mt-2">No se encontraron categorías</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Categoría</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Descripción</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                          <span className="material-symbols-outlined text-[18px]">{cat.icon || 'category'}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-800">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-400 font-mono">{cat.slug}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 max-w-xs truncate">{cat.description || '—'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => openEdit(cat)} title="Editar"
                        className="p-1.5 rounded-lg hover:bg-sky-50 text-gray-400 hover:text-sky-600 transition-colors opacity-60 group-hover:opacity-100">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 font-headline">{modal === 'create' ? 'Nueva Categoría' : 'Editar Categoría'}</h3>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded-lg"><span className="material-symbols-outlined text-gray-400">close</span></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Nombre</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Tecnología"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Slug</label>
                <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="tecnologia"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Descripción</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descripción breve..." rows={2}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Icono (Material Symbol)</label>
                <input type="text" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="category"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all" />
                {form.icon && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <span className="material-symbols-outlined text-sky-600">{form.icon}</span>
                    Vista previa
                  </div>
                )}
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.name}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-all flex items-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {modal === 'create' ? 'Crear' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
