import { useState, useEffect } from 'react'
import usersService from '../services/users.service'

const ROLE_CONFIG = {
  super_admin: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Super Admin' },
  admin: { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Admin' },
  agent: { bg: 'bg-sky-50', text: 'text-sky-700', label: 'Agente' },
  customer: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Cliente' },
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  const fetchUsers = () => {
    setLoading(true)
    usersService.findAll()
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching users', err))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchUsers() }, [])

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q || `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    const matchRole = !roleFilter || u.role === roleFilter
    return matchSearch && matchRole
  })

  const openEdit = (user) => {
    setEditUser(user)
    setEditForm({ role: user.role, isVerified: user.isVerified })
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

  const totalUsers = users.length
  const totalCustomers = users.filter(u => u.role === 'customer').length
  const totalAgents = users.filter(u => u.role === 'agent').length
  const unverified = users.filter(u => !u.isVerified).length

  const metrics = [
    { title: 'Total Usuarios', value: totalUsers, icon: 'group', color: 'text-sky-600', bg: 'bg-sky-50' },
    { title: 'Clientes', value: totalCustomers, icon: 'person', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Agentes', value: totalAgents, icon: 'support_agent', color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Sin Verificar', value: unverified, icon: 'warning', color: 'text-red-600', bg: 'bg-red-50' },
  ]

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-headline tracking-tight">Gestión de Usuarios</h2>
          <p className="text-sm text-gray-500 mt-1">Administra accesos y perfiles de toda la plataforma.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${m.bg} ${m.color} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-[20px]">{m.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{m.title}</p>
              <p className="text-lg font-black text-gray-900 font-headline">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o correo..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setRoleFilter('')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${!roleFilter ? 'bg-sky-600 text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
              Todos
            </button>
            {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
              <button key={key} onClick={() => setRoleFilter(roleFilter === key ? '' : key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${roleFilter === key ? `${cfg.bg} ${cfg.text} ring-1 ring-current` : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-[3px] border-sky-200 border-t-sky-600 rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-gray-300">person_off</span>
            <p className="text-sm text-gray-400 mt-2">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[650px]">
              <thead>
                <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Usuario</th>
                  <th className="px-5 py-3">Rol</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Registro</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(user => {
                  const r = ROLE_CONFIG[user.role] || ROLE_CONFIG.customer
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-sky-50 flex items-center justify-center text-sky-700 font-bold text-sm">
                              {user.firstName?.charAt(0) || '?'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
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
                      <td className="px-5 py-3 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(user)} title="Editar"
                            className="p-1.5 rounded-lg hover:bg-sky-50 text-gray-400 hover:text-sky-600 transition-colors">
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

        <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-400">
            Mostrando <span className="font-bold text-gray-600">{filtered.length}</span> de <span className="font-bold text-gray-600">{users.length}</span> usuarios
          </span>
        </div>
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 font-headline">Editar Usuario</h3>
              <button onClick={() => setEditUser(null)} className="p-1 hover:bg-gray-100 rounded-lg"><span className="material-symbols-outlined text-gray-400">close</span></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-700 font-bold">
                  {editUser.firstName?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{editUser.firstName} {editUser.lastName}</p>
                  <p className="text-xs text-gray-400">{editUser.email}</p>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Rol</label>
                <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none">
                  <option value="customer">Cliente</option>
                  <option value="agent">Agente</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editForm.isVerified} onChange={e => setEditForm({ ...editForm, isVerified: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500/20" />
                <span className="text-sm font-semibold text-gray-700">Usuario Verificado</span>
              </label>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setEditUser(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleSaveUser} disabled={saving}
                className="px-5 py-2 text-sm font-bold bg-sky-600 text-white rounded-lg hover:bg-sky-500 disabled:opacity-40 transition-colors">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
