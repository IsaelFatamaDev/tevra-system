import { useState, useEffect, useCallback } from 'react'
import usersService from '../services/users.service'
import Pagination from '../../../core/components/Pagination'

const ITEMS_PER_PAGE = 10

const ROLE_CONFIG = {
  super_admin: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Super Admin' },
  admin: { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Admin' },
  agent: { bg: 'bg-primary/10', text: 'text-primary', label: 'Agente' },
  customer: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Cliente' },
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

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
    const t = setTimeout(fetchUsers, search ? 350 : 0)
    return () => clearTimeout(t)
  }, [search, roleFilter])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const paginated = users.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const openEdit = (user) => {
    setEditUser(user)
    setEditForm({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', phone: user.phone || '', role: user.role, isVerified: user.isVerified })
  }

  const handleSaveUser = async () => {
    setSaving(true)
    try {
      await usersService.update(editUser.id, editForm)
      fetchUsers()
      setEditUser(null)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const totalUsers = total
  const totalCustomers = users.filter(u => u.role === 'customer').length
  const totalAgents = users.filter(u => u.role === 'agent').length
  const unverified = users.filter(u => !u.isVerified).length

  const metrics = [
    { title: 'Total Usuarios', value: totalUsers, icon: 'group', color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Clientes', value: totalCustomers, icon: 'person', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Agentes', value: totalAgents, icon: 'support_agent', color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Sin Verificar', value: unverified, icon: 'warning', color: 'text-red-600', bg: 'bg-red-50' },
  ]

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-on-background font-headline tracking-tight">Gestión de Usuarios</h2>
          <p className="text-sm text-text-muted mt-1">Administra accesos y perfiles de toda la plataforma.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-outline-variant flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${m.bg} ${m.color} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-[20px]">{m.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{m.title}</p>
              <p className="text-lg font-black text-on-background font-headline">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o correo..."
              className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setRoleFilter('')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${!roleFilter ? 'bg-primary text-white shadow-sm' : 'bg-surface-container-low text-text-muted hover:bg-surface-container-high border border-outline-variant'}`}>
              Todos
            </button>
            {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
              <button key={key} onClick={() => setRoleFilter(roleFilter === key ? '' : key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${roleFilter === key ? `${cfg.bg} ${cfg.text} ring-1 ring-current` : 'bg-surface-container-low text-text-muted hover:bg-surface-container-high border border-outline-variant'}`}>
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-outline-variant">person_off</span>
            <p className="text-sm text-text-muted mt-2">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[650px]">
              <thead>
                <tr className="bg-surface-container-low text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <th className="px-5 py-3">Usuario</th>
                  <th className="px-5 py-3">Rol</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Registro</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {paginated.map(user => {
                  const r = ROLE_CONFIG[user.role] || ROLE_CONFIG.customer
                  return (
                    <tr key={user.id} className="hover:bg-surface-container-low/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {user.firstName?.charAt(0) || '?'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-on-background">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-text-muted truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2.5 py-1 ${r.bg} ${r.text} text-[11px] font-bold rounded-full`}>{r.label}</span>
                      </td>
                      <td className="px-5 py-3">
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full">
                            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            Verificado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-full">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-text-muted">{new Date(user.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(user)} title="Editar"
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-colors">
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

        <div className="px-5 py-3 border-t border-outline-variant/30 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-text-muted">
            Mostrando <span className="font-bold text-text-muted">{Math.min((page - 1) * ITEMS_PER_PAGE + 1, total)}-{Math.min(page * ITEMS_PER_PAGE, total)}</span> de <span className="font-bold text-text-muted">{total}</span> usuarios
          </span>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)} />
        </div>
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="text-lg font-bold text-on-background font-headline">Editar Usuario</h3>
              <button onClick={() => setEditUser(null)} className="p-1 hover:bg-surface-container-high rounded-lg"><span className="material-symbols-outlined text-text-muted">close</span></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {editUser.firstName?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-on-background">{editUser.firstName} {editUser.lastName}</p>
                  <p className="text-xs text-text-muted">{editUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Nombre</label>
                  <input type="text" value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Apellido</label>
                  <input type="text" value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Email</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Teléfono</label>
                <input type="tel" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="+51 999 999 999"
                  className="w-full mt-1 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Rol</label>
                <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option value="customer">Cliente</option>
                  <option value="agent">Agente</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editForm.isVerified} onChange={e => setEditForm({ ...editForm, isVerified: e.target.checked })}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20" />
                <span className="text-sm font-semibold text-on-background">Usuario Verificado</span>
              </label>
            </div>
            <div className="p-4 border-t border-outline-variant/30 flex justify-end gap-2">
              <button onClick={() => setEditUser(null)} className="px-4 py-2 text-sm font-medium text-text-muted hover:bg-surface-container-high rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleSaveUser} disabled={saving}
                className="px-5 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary disabled:opacity-40 transition-colors">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
