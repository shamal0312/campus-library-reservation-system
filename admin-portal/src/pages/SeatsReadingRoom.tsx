import {
    AlertTriangle,
    BookOpen,
    ChevronDown,
    Clock,
    Edit2, Loader, Plus, RefreshCw,
    Trash2,
    Users,
    X
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// ── Types ────────────────────────────────────────────────────────────────────

interface Seat {
  id: string
  seat_number: string
  floor: number
  room_type: string
  status: 'available' | 'occupied' | 'reserved' | string
  created_at: string
  student_id: string | null
  student_name: string | null
  time_slot: string | null
  reserved_at: string | null
}

type ModalMode = 'add' | 'edit' | null

const ROOM_TYPES   = ['Reading Room', 'Quiet Study', 'Discussion Room', 'Computer Lab']
const STATUS_OPTS  = ['available', 'occupied', 'reserved']
const FLOORS       = [1, 2, 3]

const blankForm = {
  seat_number:  '',
  floor:        '1',
  room_type:    'Reading Room',
  status:       'available',
  student_id:   '',
  student_name: '',
  time_slot:    '',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function seatStatusClass(status: string) {
  const s = status?.toLowerCase()
  if (s === 'available') return 'seat-available'
  if (s === 'occupied')  return 'seat-occupied'
  if (s === 'reserved')  return 'seat-reserved'
  return 'seat-available'
}

function badgeClass(status: string) {
  const s = status?.toLowerCase()
  if (s === 'available') return 'status-success'
  if (s === 'occupied')  return 'status-warning'
  if (s === 'reserved')  return 'status-info'
  return 'status-default'
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
}

function formatTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Component ────────────────────────────────────────────────────────────────

export default function SeatsReadingRoom() {
  const [seats, setSeats]           = useState<Seat[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)

  // Filters
  const [filterRoom, setFilterRoom]     = useState('All Rooms')
  const [filterFloor, setFilterFloor]   = useState('All Floors')
  const [filterStatus, setFilterStatus] = useState('All')
  const [view, setView]                 = useState<'map' | 'table'>('map')

  // Modal
  const [modalMode, setModalMode]       = useState<ModalMode>(null)
  const [editingSeat, setEditingSeat]   = useState<Seat | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Seat | null>(null)
  const [saving, setSaving]             = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const [formError, setFormError]       = useState<string | null>(null)
  const [form, setForm]                 = useState({ ...blankForm })

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchSeats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('seats')
        .select('*')
        .order('floor', { ascending: true })
        .order('seat_number', { ascending: true })
      if (err) throw err
      setSeats(data ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load seats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchSeats() }, [fetchSeats])

  // ── Derived data ─────────────────────────────────────────────────────────

  const roomTypes = ['All Rooms', ...Array.from(new Set(seats.map(s => s.room_type).filter(Boolean)))]
  const floors    = ['All Floors', ...Array.from(new Set(seats.map(s => s.floor).filter(v => v != null))).sort()]

  const filtered = seats.filter(s => {
    if (filterRoom   !== 'All Rooms'   && s.room_type !== filterRoom)            return false
    if (filterFloor  !== 'All Floors'  && String(s.floor) !== String(filterFloor)) return false
    if (filterStatus !== 'All'         && s.status?.toLowerCase() !== filterStatus) return false
    return true
  })

  const stats = {
    total:     seats.length,
    available: seats.filter(s => s.status?.toLowerCase() === 'available').length,
    occupied:  seats.filter(s => s.status?.toLowerCase() === 'occupied').length,
    reserved:  seats.filter(s => s.status?.toLowerCase() === 'reserved').length,
  }

  // Group by floor → room for map view
  const grouped: Record<string, Record<string, Seat[]>> = {}
  filtered.forEach(s => {
    const fKey = `Floor ${s.floor ?? '?'}`
    const rKey = s.room_type ?? 'Unknown'
    if (!grouped[fKey]) grouped[fKey] = {}
    if (!grouped[fKey][rKey]) grouped[fKey][rKey] = []
    grouped[fKey][rKey].push(s)
  })

  // ── CRUD ─────────────────────────────────────────────────────────────────

  const openAdd = () => {
    setForm({ ...blankForm })
    setFormError(null)
    setEditingSeat(null)
    setModalMode('add')
  }

  const openEdit = (seat: Seat, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setForm({
      seat_number:  seat.seat_number ?? '',
      floor:        String(seat.floor ?? 1),
      room_type:    seat.room_type ?? 'Reading Room',
      status:       seat.status ?? 'available',
      student_id:   seat.student_id ?? '',
      student_name: seat.student_name ?? '',
      time_slot:    seat.time_slot ?? '',
    })
    setFormError(null)
    setEditingSeat(seat)
    setModalMode('edit')
  }

  const closeModal = () => { setModalMode(null); setEditingSeat(null); setFormError(null) }

  const handleSave = async () => {
    if (!form.seat_number.trim()) { setFormError('Seat number is required.'); return }
    setSaving(true); setFormError(null)

    const payload: Record<string, unknown> = {
      seat_number:  form.seat_number.trim(),
      floor:        Number(form.floor),
      room_type:    form.room_type,
      status:       form.status,
      student_id:   form.student_id.trim()   || null,
      student_name: form.student_name.trim() || null,
      time_slot:    form.time_slot.trim()    || null,
      reserved_at:  form.student_id.trim() ? new Date().toISOString() : null,
    }

    try {
      if (modalMode === 'add') {
        const { error: e } = await supabase.from('seats').insert([payload])
        if (e) throw e
      } else if (editingSeat) {
        const { error: e } = await supabase.from('seats').update(payload).eq('id', editingSeat.id)
        if (e) throw e
        // Refresh selected seat if it's the one being edited
        if (selectedSeat?.id === editingSeat.id) setSelectedSeat(null)
      }
      closeModal()
      void fetchSeats()
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleRelease = async (seat: Seat) => {
    try {
      const { error: e } = await supabase.from('seats').update({
        status: 'available', student_id: null, student_name: null,
        time_slot: null, reserved_at: null,
      }).eq('id', seat.id)
      if (e) throw e
      setSelectedSeat(null)
      void fetchSeats()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Release failed.')
    }
  }

  const handleBlock = async (seat: Seat) => {
    try {
      const { error: e } = await supabase.from('seats').update({
        status: 'occupied', student_id: null, student_name: null,
        time_slot: null,
      }).eq('id', seat.id)
      if (e) throw e
      void fetchSeats()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Block failed.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const { error: e } = await supabase.from('seats').delete().eq('id', deleteTarget.id)
      if (e) throw e
      if (selectedSeat?.id === deleteTarget.id) setSelectedSeat(null)
      setDeleteTarget(null)
      void fetchSeats()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed.')
    } finally {
      setDeleting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="seats-page">

      {/* ── Header ── */}
      <div className="seats-page-header">
        <div>
          <h1>Seats &amp; Reading Room</h1>
          <p>Monitor occupancy and manage floor availability</p>
        </div>
        <div className="seats-header-actions">
          <button className="icon-text-btn" onClick={() => void fetchSeats()}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="primary-button" onClick={openAdd}>
            <Plus size={15} /> Add Seat
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="seats-stats-row">
        {[
          { label: 'Total Seats',   value: stats.total,     icon: <BookOpen size={16} />, color: 'blue'  },
          { label: 'Available',     value: stats.available, icon: <BookOpen size={16} />, color: 'green' },
          { label: 'Occupied',      value: stats.occupied,  icon: <Users    size={16} />, color: 'amber' },
          { label: 'Reserved',      value: stats.reserved,  icon: <Clock    size={16} />, color: 'blue'  },
        ].map(c => (
          <div key={c.label} className={`seats-stat-card seats-stat-${c.color}`}>
            <div className="seats-stat-icon">{c.icon}</div>
            <div>
              <div className="seats-stat-value">{c.value}</div>
              <div className="seats-stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters + View Toggle ── */}
      <div className="seats-toolbar">
        <div className="seats-filters">
          <div className="filter-select-wrap">
            <select value={filterRoom} onChange={e => setFilterRoom(e.target.value)} className="seats-select">
              {roomTypes.map(r => <option key={r}>{r}</option>)}
            </select>
            <ChevronDown size={13} className="select-chevron" />
          </div>
          <div className="filter-select-wrap">
            <select value={filterFloor} onChange={e => setFilterFloor(e.target.value)} className="seats-select">
              {floors.map(f => <option key={String(f)}>{f}</option>)}
            </select>
            <ChevronDown size={13} className="select-chevron" />
          </div>
          <div className="filter-select-wrap">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="seats-select">
              <option value="All">All Status</option>
              {STATUS_OPTS.map(s => <option key={s} value={s}>{capitalize(s)}</option>)}
            </select>
            <ChevronDown size={13} className="select-chevron" />
          </div>
        </div>
        <div className="view-toggle">
          <button className={`view-btn${view === 'map' ? ' active' : ''}`} onClick={() => setView('map')}>Map</button>
          <button className={`view-btn${view === 'table' ? ' active' : ''}`} onClick={() => setView('table')}>List</button>
        </div>
      </div>

      {/* ── Main content ── */}
      {loading ? (
        <div className="table-loading"><Loader size={28} className="spin" /><span>Loading seats…</span></div>
      ) : error ? (
        <div className="table-error">
          <AlertTriangle size={22} /><span>{error}</span>
          <button className="retry-btn" onClick={() => void fetchSeats()}>Retry</button>
        </div>
      ) : seats.length === 0 ? (
        <div className="table-empty">
          <BookOpen size={36} />
          <p>No seats found. Add your first seat to get started.</p>
          <button className="retry-btn" onClick={openAdd}>Add Seat</button>
        </div>
      ) : (
        <div className="seats-content-area">

          {/* ── MAP VIEW ── */}
          {view === 'map' && (
            <div className="seats-map-wrapper">
              <div className="seats-map-main">
                {Object.keys(grouped).length === 0 ? (
                  <div className="table-empty"><p>No seats match the selected filters.</p></div>
                ) : (
                  Object.entries(grouped).map(([floor, rooms]) => (
                    <div key={floor} className="floor-section">
                      <div className="floor-section-title">{floor}</div>
                      {Object.entries(rooms).map(([room, roomSeats]) => (
                        <div key={room} className="room-section">
                          <div className="room-section-header">
                            <span className="room-name">{room}</span>
                            <span className="room-count">{roomSeats.length} seats</span>
                          </div>
                          <div className="seats-grid-map">
                            {roomSeats.map(seat => (
                              <div
                                key={seat.id}
                                className={`seat-card ${seatStatusClass(seat.status)} ${selectedSeat?.id === seat.id ? 'seat-card-selected' : ''}`}
                                onClick={() => setSelectedSeat(prev => prev?.id === seat.id ? null : seat)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && setSelectedSeat(prev => prev?.id === seat.id ? null : seat)}
                                aria-label={`Seat ${seat.seat_number}, ${seat.status}`}
                              >
                                <div className="seat-card-num">{seat.seat_number?.replace('Seat ', '') ?? seat.id.slice(0, 6)}</div>
                                <div className="seat-card-status">{capitalize(seat.status)}</div>
                                <div className="seat-card-actions">
                                  <button className="seat-mini-btn" onClick={e => openEdit(seat, e)} aria-label="Edit"><Edit2 size={11} /></button>
                                  <button className="seat-mini-btn seat-mini-del" onClick={e => { e.stopPropagation(); setDeleteTarget(seat) }} aria-label="Delete"><Trash2 size={11} /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>

              {/* ── Side Panel ── */}
              <div className="seats-side-panel">
                {/* Legend */}
                <div className="legend-card">
                  <div className="legend-title">Legend</div>
                  {[
                    { cls: 'seat-available', label: 'Available' },
                    { cls: 'seat-occupied',  label: 'Occupied'  },
                    { cls: 'seat-reserved',  label: 'Reserved'  },
                  ].map(l => (
                    <div key={l.label} className="legend-row">
                      <span className={`legend-dot ${l.cls}`}></span>
                      <span>{l.label}</span>
                    </div>
                  ))}
                </div>

                {/* Selected Seat Details */}
                {selectedSeat ? (
                  <div className="seat-detail-card">
                    <div className="seat-detail-top">
                      <div>
                        <div className="sdc-label">SELECTED SEAT</div>
                        <div className="sdc-seat-num">{selectedSeat.seat_number}</div>
                        <span className={`status-badge ${badgeClass(selectedSeat.status)}`}>
                          {capitalize(selectedSeat.status)}
                        </span>
                      </div>
                      <button className="modal-close-btn" onClick={() => setSelectedSeat(null)} aria-label="Close">
                        <X size={16} />
                      </button>
                    </div>

                    <div className="sdc-rows">
                      <div className="sdc-row"><span>Floor</span><span>{selectedSeat.floor}</span></div>
                      <div className="sdc-row"><span>Room type</span><span>{selectedSeat.room_type ?? '—'}</span></div>
                      <div className="sdc-row"><span>Student ID</span><span>{selectedSeat.student_id ?? '—'}</span></div>
                      <div className="sdc-row"><span>Student</span><strong>{selectedSeat.student_name ?? '—'}</strong></div>
                      <div className="sdc-row"><span>Time slot</span><span>{selectedSeat.time_slot ?? '—'}</span></div>
                      <div className="sdc-row"><span>Reserved at</span><span>{formatTime(selectedSeat.reserved_at)}</span></div>
                      <div className="sdc-row"><span>Created</span><span>{formatDate(selectedSeat.created_at)}</span></div>
                    </div>

                    <div className="sdc-actions">
                      <button className="sdc-btn sdc-btn-edit" onClick={() => openEdit(selectedSeat)}>
                        <Edit2 size={13} /> Edit Seat
                      </button>
                      {selectedSeat.status !== 'available' && (
                        <button className="sdc-btn sdc-btn-release" onClick={() => handleRelease(selectedSeat)}>
                          Release Seat
                        </button>
                      )}
                      {selectedSeat.status === 'available' && (
                        <button className="sdc-btn sdc-btn-block" onClick={() => handleBlock(selectedSeat)}>
                          Block Seat
                        </button>
                      )}
                      <button className="sdc-btn sdc-btn-delete" onClick={() => setDeleteTarget(selectedSeat)}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="seat-detail-card seat-detail-empty">
                    <BookOpen size={28} />
                    <p>Click any seat to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── LIST VIEW ── */}
          {view === 'table' && (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SEAT NUMBER</th>
                    <th>FLOOR</th>
                    <th>ROOM TYPE</th>
                    <th>STUDENT</th>
                    <th>TIME SLOT</th>
                    <th>STATUS</th>
                    <th className="align-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(seat => (
                    <tr key={seat.id}>
                      <td className="fw-medium">{seat.seat_number}</td>
                      <td className="text-muted">Floor {seat.floor}</td>
                      <td className="text-muted">{seat.room_type ?? '—'}</td>
                      <td className="text-muted">{seat.student_name ?? '—'}</td>
                      <td className="text-muted">{seat.time_slot ?? '—'}</td>
                      <td>
                        <span className={`status-badge ${badgeClass(seat.status)}`}>
                          {capitalize(seat.status)}
                        </span>
                      </td>
                      <td className="align-right row-actions">
                        <button className="icon-btn edit-btn" aria-label="Edit" onClick={() => openEdit(seat)}><Edit2 size={14} /></button>
                        <button className="icon-btn delete-btn" aria-label="Delete" onClick={() => setDeleteTarget(seat)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination-footer">
                <span className="text-muted">Showing {filtered.length} of {seats.length} seats</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modalMode && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="modal-card">
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'Add New Seat' : 'Edit Seat'}</h2>
              <button className="modal-close-btn" onClick={closeModal} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="modal-body">
              {formError && (
                <div className="modal-form-error"><AlertTriangle size={14} /><span>{formError}</span></div>
              )}
              <div className="modal-form-grid">
                <div className="modal-field modal-field-full">
                  <label htmlFor="f-seatnum">Seat Number <span className="required">*</span></label>
                  <input id="f-seatnum" className="modal-input" placeholder="e.g. Seat A-01" value={form.seat_number} onChange={e => setForm({ ...form, seat_number: e.target.value })} />
                </div>
                <div className="modal-field">
                  <label htmlFor="f-floor">Floor</label>
                  <select id="f-floor" className="modal-input" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })}>
                    {FLOORS.map(f => <option key={f} value={f}>Floor {f}</option>)}
                  </select>
                </div>
                <div className="modal-field">
                  <label htmlFor="f-roomtype">Room Type</label>
                  <select id="f-roomtype" className="modal-input" value={form.room_type} onChange={e => setForm({ ...form, room_type: e.target.value })}>
                    {ROOM_TYPES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="modal-field modal-field-full">
                  <label htmlFor="f-status">Status</label>
                  <select id="f-status" className="modal-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {STATUS_OPTS.map(s => <option key={s} value={s}>{capitalize(s)}</option>)}
                  </select>
                </div>

                <div className="modal-divider modal-field-full"><span>Booking Details (optional)</span></div>

                <div className="modal-field">
                  <label htmlFor="f-stuId">Student ID</label>
                  <input id="f-stuId" className="modal-input" placeholder="STU-2026-1234" value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} />
                </div>
                <div className="modal-field">
                  <label htmlFor="f-stuName">Student Name</label>
                  <input id="f-stuName" className="modal-input" placeholder="Full name" value={form.student_name} onChange={e => setForm({ ...form, student_name: e.target.value })} />
                </div>
                <div className="modal-field modal-field-full">
                  <label htmlFor="f-timeslot">Time Slot</label>
                  <input id="f-timeslot" className="modal-input" placeholder="e.g. 10:00 AM – 12:00 PM" value={form.time_slot} onChange={e => setForm({ ...form, time_slot: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="footer-button footer-button-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="footer-button footer-button-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader size={14} className="spin" style={{ marginRight: 6 }} />Saving…</> : modalMode === 'add' ? 'Add Seat' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null) }}>
          <div className="modal-card modal-card-sm">
            <div className="modal-header">
              <h2>Delete Seat</h2>
              <button className="modal-close-btn" onClick={() => setDeleteTarget(null)} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="delete-confirm-body">
                <div className="delete-icon-wrap"><Trash2 size={28} /></div>
                <p>Delete <strong>{deleteTarget.seat_number}</strong>?</p>
                <p className="delete-sub">This will permanently remove the seat and all booking data.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="footer-button footer-button-secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button className="footer-button footer-button-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? <><Loader size={14} className="spin" style={{ marginRight: 6 }} />Deleting…</> : 'Delete Seat'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}
