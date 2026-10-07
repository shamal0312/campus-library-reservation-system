import {
  AlertTriangle,
  Edit2,
  GraduationCap,
  Loader,
  MoreVertical,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users as UsersIcon,
  X
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Profile {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  created_at: string | null
}

type ModalMode = 'add' | 'edit' | null
type RoleFilter = 'all' | 'admin' | 'student'

const blankForm = { full_name: '', email: '', role: 'student' }

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string | null, email: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(' ')
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return (email ?? '??').slice(0, 2).toUpperCase()
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function avatarColor(id: string | null | undefined): string {
  const colors = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#ef4444', '#6366f1', '#14b8a6',
  ]
  if (!id) return colors[0]
  const idx = id.charCodeAt(0) % colors.length
  return colors[idx]
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Users() {
  const [profiles, setProfiles]     = useState<Profile[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  const [search, setSearch]         = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')

  const [modalMode, setModalMode]   = useState<ModalMode>(null)
  const [editing, setEditing]       = useState<Profile | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null)
  const [form, setForm]             = useState({ ...blankForm })
  const [formError, setFormError]   = useState<string | null>(null)
  const [saving, setSaving]         = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchProfiles = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (err) throw err
      setProfiles(data ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load users')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void fetchProfiles() }, [fetchProfiles])

  // Close menu on outside click
  useEffect(() => {
    const close = () => setOpenMenuId(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  // ── Derived ────────────────────────────────────────────────────────────────

  const filtered = profiles.filter(p => {
    const matchRole = roleFilter === 'all' || p.role?.toLowerCase() === roleFilter
    const q = search.toLowerCase()
    const matchSearch = !q
      || p.full_name?.toLowerCase().includes(q)
      || p.email?.toLowerCase().includes(q)
      || p.id.toLowerCase().includes(q)
    return matchRole && matchSearch
  })

  const stats = {
    total:    profiles.length,
    admins:   profiles.filter(p => p.role?.toLowerCase() === 'admin').length,
    students: profiles.filter(p => p.role?.toLowerCase() === 'student').length,
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────

  const openAdd = () => {
    setForm({ ...blankForm }); setFormError(null)
    setEditing(null); setModalMode('add')
  }

  const openEdit = (p: Profile) => {
    setForm({
      full_name: p.full_name ?? '',
      email:     p.email    ?? '',
      role:      p.role     ?? 'student',
    })
    setFormError(null); setEditing(p); setModalMode('edit')
  }

  const closeModal = () => { setModalMode(null); setEditing(null); setFormError(null) }

  const handleSave = async () => {
    if (!form.full_name.trim()) { setFormError('Full name is required.'); return }
    if (!form.email.trim())     { setFormError('Email is required.');     return }
    setSaving(true); setFormError(null)

    const payload = {
      full_name: form.full_name.trim(),
      email:     form.email.trim(),
      role:      form.role,
    }

    try {
      if (modalMode === 'add') {
        const { error: e } = await supabase.from('profiles').insert([payload])
        if (e) throw e
      } else if (editing) {
        const { error: e } = await supabase.from('profiles').update(payload).eq('id', editing.id)
        if (e) throw e
      }
      closeModal(); void fetchProfiles()
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Save failed.')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const { error: e } = await supabase.from('profiles').delete().eq('id', deleteTarget.id)
      if (e) throw e
      setDeleteTarget(null); void fetchProfiles()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed.')
    } finally { setDeleting(false) }
  }

  const quickRoleChange = async (p: Profile, newRole: string) => {
    try {
      const { error: e } = await supabase.from('profiles').update({ role: newRole }).eq('id', p.id)
      if (e) throw e
      void fetchProfiles()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Update failed.') }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="users-page">

      {/* ── Header ── */}
      <div className="users-header">
        <div>
          <h1>User Management</h1>
          <p>Manage library members, roles, and access control</p>
        </div>
        <div className="users-header-actions">
          <button className="primary-button" onClick={openAdd}>
            <Plus size={15} /> Add User
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="users-stats">
        <div className="user-stat-card">
          <div className="user-stat-icon user-stat-blue"><UsersIcon size={18} /></div>
          <div>
            <div className="user-stat-value">{stats.total}</div>
            <div className="user-stat-label">Total Users</div>
          </div>
        </div>
        <div className="user-stat-card">
          <div className="user-stat-icon user-stat-purple"><ShieldCheck size={18} /></div>
          <div>
            <div className="user-stat-value">{stats.admins}</div>
            <div className="user-stat-label">Administrators</div>
          </div>
        </div>
        <div className="user-stat-card">
          <div className="user-stat-icon user-stat-green"><GraduationCap size={18} /></div>
          <div>
            <div className="user-stat-value">{stats.students}</div>
            <div className="user-stat-label">Students</div>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="users-toolbar">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 380 }}>
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="role-filter-tabs">
          {(['all', 'admin', 'student'] as RoleFilter[]).map(r => (
            <button
              key={r}
              className={`role-filter-btn${roleFilter === r ? ' active' : ''}`}
              onClick={() => setRoleFilter(r)}
            >
              {r === 'all' ? 'All Users' : r === 'admin' ? 'Admins' : 'Students'}
              <span className="role-filter-count">
                {r === 'all' ? stats.total : r === 'admin' ? stats.admins : stats.students}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="data-table-container">
        {loading ? (
          <div className="table-loading"><Loader size={28} className="spin" /><span>Loading users…</span></div>
        ) : error ? (
          <div className="table-error">
            <AlertTriangle size={22} /><span>{error}</span>
            <button className="retry-btn" onClick={() => void fetchProfiles()}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">
            <UsersIcon size={36} />
            <p>No users found{search || roleFilter !== 'all' ? ' matching your filters' : ''}.</p>
            {(search || roleFilter !== 'all') && (
              <button className="retry-btn" onClick={() => { setSearch(''); setRoleFilter('all') }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>USER ID</th>
                  <th>JOINED</th>
                  <th className="align-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={p.id ?? idx}>
                    {/* Avatar + name */}
                    <td>
                      <div className="user-cell">
                        <div
                          className="user-avatar"
                          style={{ background: avatarColor(p.id) }}
                          aria-hidden="true"
                        >
                          {getInitials(p.full_name, p.email)}
                        </div>
                        <span className="fw-medium">{p.full_name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="text-muted">{p.email ?? '—'}</td>
                    <td>
                      <span className={`role-badge ${p.role?.toLowerCase() === 'admin' ? 'role-admin' : 'role-student'}`}>
                        {p.role?.toLowerCase() === 'admin'
                          ? <><ShieldCheck size={11} /> Admin</>
                          : <><GraduationCap size={11} /> Student</>
                        }
                      </span>
                    </td>
                    <td className="text-muted mono">{p.id ? p.id.slice(0, 8).toUpperCase() : '—'}</td>
                    <td className="text-muted">{fmtDate(p.created_at)}</td>
                    <td className="align-right row-actions">
                      <button className="icon-btn edit-btn" title="Edit user" onClick={() => openEdit(p)}>
                        <Edit2 size={14} />
                      </button>
                      {/* Quick role toggle */}
                      <div
                        className="user-menu-wrap"
                        onClick={e => { e.stopPropagation(); setOpenMenuId(prev => prev === p.id ? null : (p.id ?? null)) }}
                      >
                        <button className="icon-btn" title="More actions">
                          <MoreVertical size={14} />
                        </button>
                        {openMenuId === p.id && p.id && (
                          <div className="user-dropdown">
                            <button onClick={() => { quickRoleChange(p, p.role?.toLowerCase() === 'admin' ? 'student' : 'admin'); setOpenMenuId(null) }}>
                              {p.role?.toLowerCase() === 'admin' ? '→ Set as Student' : '→ Set as Admin'}
                            </button>
                            <button
                              className="user-dropdown-danger"
                              onClick={() => { setDeleteTarget(p); setOpenMenuId(null) }}
                            >
                              Delete User
                            </button>
                          </div>
                        )}
                      </div>
                      <button className="icon-btn delete-btn" title="Delete user" onClick={() => setDeleteTarget(p)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination-footer">
              <span className="text-muted">
                Showing {filtered.length} of {profiles.length} users
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modalMode && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="modal-card modal-card-sm">
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'Add New User' : 'Edit User'}</h2>
              <button className="modal-close-btn" onClick={closeModal} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="modal-body">
              {formError && (
                <div className="modal-form-error"><AlertTriangle size={14} /><span>{formError}</span></div>
              )}
              {/* Preview avatar */}
              {form.full_name && (
                <div className="modal-avatar-preview">
                  <div
                    className="user-avatar user-avatar-lg"
                    style={{ background: editing ? avatarColor(editing.id) : '#3b82f6' }}
                  >
                    {getInitials(form.full_name, form.email)}
                  </div>
                  <span>{form.full_name}</span>
                </div>
              )}
              <div className="modal-form-grid">
                <div className="modal-field modal-field-full">
                  <label htmlFor="u-name">Full Name <span className="required">*</span></label>
                  <input id="u-name" className="modal-input" placeholder="e.g. John Doe"
                    value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="modal-field modal-field-full">
                  <label htmlFor="u-email">Email <span className="required">*</span></label>
                  <input id="u-email" type="email" className="modal-input" placeholder="user@example.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="modal-field modal-field-full">
                  <label htmlFor="u-role">Role</label>
                  <div className="role-radio-group">
                    <label className={`role-radio ${form.role === 'student' ? 'role-radio-active' : ''}`}>
                      <input type="radio" name="role" value="student"
                        checked={form.role === 'student'}
                        onChange={() => setForm({ ...form, role: 'student' })} />
                      <GraduationCap size={15} />
                      <span>Student</span>
                    </label>
                    <label className={`role-radio ${form.role === 'admin' ? 'role-radio-active' : ''}`}>
                      <input type="radio" name="role" value="admin"
                        checked={form.role === 'admin'}
                        onChange={() => setForm({ ...form, role: 'admin' })} />
                      <ShieldCheck size={15} />
                      <span>Admin</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="footer-button footer-button-secondary" onClick={closeModal} disabled={saving}>
                Cancel
              </button>
              <button className="footer-button footer-button-primary" onClick={handleSave} disabled={saving}>
                {saving
                  ? <><Loader size={13} className="spin" style={{ marginRight: 6 }} />Saving…</>
                  : modalMode === 'add' ? 'Add User' : 'Save Changes'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null) }}>
          <div className="modal-card modal-card-sm">
            <div className="modal-header">
              <h2>Delete User</h2>
              <button className="modal-close-btn" onClick={() => setDeleteTarget(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-confirm-body">
                <div className="delete-icon-wrap"><Trash2 size={26} /></div>
                <p>Delete <strong>{deleteTarget.full_name ?? deleteTarget.email}</strong>?</p>
                <p className="delete-sub">
                  This will remove their profile. Their auth account will remain unless deleted separately.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="footer-button footer-button-secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="footer-button footer-button-danger" onClick={handleDelete} disabled={deleting}>
                {deleting
                  ? <><Loader size={13} className="spin" style={{ marginRight: 6 }} />Deleting…</>
                  : 'Delete User'
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}
