import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import usersService from '../services/users.service'
import Pagination from '../../../core/components/Pagination'
import { useToast } from '../../../core/contexts/ToastContext'

const ITEMS_PER_PAGE = 10

export default function AdminUsers() {
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const ROLE_CONFIG = {
    super_admin: { bg: 'bg-violet-50', text: 'text-violet-700', label: t('common.roles.super_admin') },
    admin: { bg: 'bg-blue-50', text: 'text-blue-700', label: t('common.roles.admin') },
    agent: { bg: 'bg-zinc-100', text: 'text-zinc-700', label: t('common.roles.agent') },
    customer: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: t('common.roles.customer') },
  }

  const fetchUsers = useCallback(() => {
    setLoading(true)
    usersService.findAll({ search: search || undefined, role: roleFilter || undefined })
      .then(data => {
        const list = Array.isArray(data) ? data : []
        setUsers(list)
        setTotal(list.length)
      })
      .catch(err => console.error('Error fetching users', err))
      .finally(() => setLoading(false))
  }, [search, roleFilter])

  useEffect(() => {
    setPage(1)
    const timer = setTimeout(fetchUsers, search ? 350 : 0)
    return () => clearTimeout(timer)
  }, [search, roleFilter])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const paginated = users.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const openEdit = (user) => {
    setEditUser(user)
    setEditForm({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', phone: user.phone || '', role: user.role, isVerified: user.isVerified })
  }

  const handleSaveUser = async () => {
    if (!editForm.firstName?.trim() || !editForm.email?.trim()) {
      addToast(t('admin.users.nameEmailRequired'), 'error')
      return
    }
    setSaving(true)
    try {
      await usersService.update(editUser.id, editForm)
      fetchUsers()
      setEditUser(null)
      addToast(t('admin.users.updateSuccess'))
    } catch (err) {
      console.error(err)
      addToast(t('admin.users.updateError'), 'error')
    }
    finally { setSaving(false) }
  }

  const totalUsers = total
  const totalCustomers = users.filter(u => u.role === 'customer').length
  const totalAgents = users.filter(u => u.role === 'agent').length
  const unverified = users.filter(u => !u.isVerified).length

  const metrics = [
    { title: t('admin.users.stats.total'), value: totalUsers, icon: 'group' },
    { title: t('admin.users.stats.customers'), value: totalCustomers, icon: 'person' },
    { title: t('admin.users.stats.agents'), value: totalAgents, icon: 'support_agent' },
    { title: t('admin.users.stats.unverified'), value: unverified, icon: 'warning' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-5 platform-enter">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">{t('admin.users.title')}</h2>
        <p className="text-sm text-zinc-500 mt-0.5">{t('admin.users.subtitle')}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center gap-3 stat-card">
            <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
            </div>
            <div>
              <p className="text-xs text-zinc-500">{m.title}</p>
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
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('admin.users.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setRoleFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!roleFilter ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200'}`}>
              {t('common.all')}
            </button>
            {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
              <button key={key} onClick={() => setRoleFilter(roleFilter === key ? '' : key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${roleFilter === key ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200'}`}>
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-3xl text-zinc-300">person_off</span>
            <p className="text-sm text-zinc-500 mt-2">{t('admin.users.noUsers')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[650px]">
              <thead>
                <tr className="bg-zinc-50 text-[11px] font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-100">
                  <th className="px-5 py-3">{t('admin.users.table.user')}</th>
                  <th className="px-5 py-3">{t('admin.users.table.role')}</th>
                  <th className="px-5 py-3">{t('admin.users.table.status')}</th>
                  <th className="px-5 py-3">{t('admin.users.table.registered')}</th>
                  <th className="px-5 py-3 text-right">{t('admin.users.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {paginated.map(user => {
                  const r = ROLE_CONFIG[user.role] || ROLE_CONFIG.customer
                  return (
                    <tr key={user.id} className="hover:bg-zinc-50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-medium text-sm">
                              {user.firstName?.charAt(0) || '?'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-900">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 ${r.bg} ${r.text} text-[11px] font-medium rounded-md`}>{r.label}</span>
                      </td>
                      <td className="px-5 py-3">
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {t('admin.users.verified')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            {t('admin.users.unverified')}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-zinc-500">{new Date(user.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(user)} title={t('common.edit')}
                            className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
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
            {t('admin.pagination.showing')} <span className="font-medium">{Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}-{Math.min(page * ITEMS_PER_PAGE, total)}</span> {t('admin.pagination.of')} <span className="font-medium">{total}</span> {t('admin.pagination.users')}
          </span>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
        </div>
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity" onClick={() => setEditUser(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="text-lg font-semibold text-zinc-900">{t('admin.users.editTitle')}</h3>
              <button onClick={() => setEditUser(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors -mr-2">
                <span className="material-symbols-outlined text-zinc-400 text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-zinc-50 border border-zinc-100 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-white ring-1 ring-zinc-200 flex items-center justify-center text-zinc-600 font-bold text-lg shadow-sm">
                  {editUser.firstName?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{editUser.firstName} {editUser.lastName}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 font-medium">{editUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">{t('admin.users.firstName')}</label>
                  <input type="text" value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">{t('admin.users.lastName')}</label>
                  <input type="text" value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">{t('admin.users.email')}</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">{t('admin.users.phone')}</label>
                  <input type="tel" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="+51 999 999 999"
                    className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 outline-none transition-all leading-normal" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">{t('admin.users.role')}</label>
                  <div className="relative border border-zinc-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-zinc-900/10 focus-within:border-zinc-400 transition-all">
                    <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white text-sm appearance-none outline-none text-zinc-900 cursor-pointer">
                      <option value="customer">{t('common.roles.customer')}</option>
                      <option value="agent">{t('common.roles.agent')}</option>
                      <option value="admin">{t('common.roles.admin')}</option>
                      <option value="super_admin">{t('common.roles.super_admin')}</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none text-[18px]">expand_content</span>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 pt-2 mt-2 cursor-pointer hover:bg-emerald-50/50 rounded-xl transition-colors border border-transparent hover:border-emerald-100 group">
                <input type="checkbox" checked={editForm.isVerified} onChange={e => setEditForm({ ...editForm, isVerified: e.target.checked })}
                  className="w-5 h-5 rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500/20 transition-all cursor-pointer" />
                <div>
                  <span className="text-sm font-semibold text-zinc-800 group-hover:text-emerald-800 transition-colors">{t('admin.users.isVerified')}</span>
                  <span className="text-[11px] text-zinc-500 block leading-tight font-medium">{t('admin.users.isVerifiedDesc')}</span>
                </div>
              </label>
            </div>

            <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50/50">
              <button onClick={() => setEditUser(null)} className="px-4 py-2 bg-white border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-colors shadow-sm">
                {t('common.cancel')}
              </button>
              <button onClick={handleSaveUser} disabled={saving}
                className="px-6 py-2 bg-zinc-900 text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 hover:-translate-y-0.5 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? t('common.saving') : t('admin.users.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
