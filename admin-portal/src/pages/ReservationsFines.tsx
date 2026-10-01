import {
  AlertTriangle,
  CheckCircle,
  Download,
  Edit2,
  Loader,
  Plus,
  RefreshCw,
  Trash2, X,
  XCircle
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Fine {
  id: string
  student_id: string | null
  student_name: string | null
  book_title: string | null
  due_date: string | null
  overdue_days: number | null
  fine_amount: number | null
  payment_status: string | null
  created_at: string
}

interface Reservation {
  id: string
  user_id: string | null
  student_id: string | null
  student_name: string | null
  item_type: string | null
  item_name: string | null
  book_id: string | null
  seat_id: string | null
  status: string | null
  start_time: string | null
  end_time: string | null
  created_at: string
}

type ActiveTab = 'fines' | 'reservations'
type ModalMode = 'add' | 'edit' | null

const blankFine = {
  student_id: '', student_name: '', book_title: '',
  due_date: '', overdue_days: '', fine_amount: '', payment_status: 'Unpaid',
}

const blankReservation = {
  student_id: '', student_name: '', item_type: 'book',
  item_name: '', status: 'Reserved', start_time: '', end_time: '',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtDateTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReservationsFines() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('fines')

  // Fines state
  const [fines, setFines]           = useState<Fine[]>([])
  const [finesLoading, setFinesLoading] = useState(true)
  const [finesError, setFinesError] = useState<string | null>(null)
  const [selectedFines, setSelectedFines] = useState<string[]>([])

  // Reservations state
  const [reservations, setReservations]           = useState<Reservation[]>([])
  const [resLoading, setResLoading]               = useState(true)
  const [resError, setResError]                   = useState<string | null>(null)
  const [selectedRes, setSelectedRes]             = useState<string[]>([])

  // Modal state
  const [fineModal, setFineModal]     = useState<ModalMode>(null)
  const [editingFine, setEditingFine] = useState<Fine | null>(null)
  const [deleteFine, setDeleteFine]   = useState<Fine | null>(null)
  const [fineForm, setFineForm]       = useState({ ...blankFine })

  const [resModal, setResModal]       = useState<ModalMode>(null)
  const [editingRes, setEditingRes]   = useState<Reservation | null>(null)
  const [deleteRes, setDeleteRes]     = useState<Reservation | null>(null)
  const [resForm, setResForm]         = useState({ ...blankReservation })

  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchFines = useCallback(async () => {
    setFinesLoading(true); setFinesError(null)
    try {
      const { data, error } = await supabase
        .from('fines').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setFines(data ?? [])
    } catch (e: unknown) {
      setFinesError(e instanceof Error ? e.message : 'Failed to load fines')
    } finally { setFinesLoading(false) }
  }, [])

  const fetchReservations = useCallback(async () => {
    setResLoading(true); setResError(null)
    try {
      const { data, error } = await supabase
        .from('reservations').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setReservations(data ?? [])
    } catch (e: unknown) {
      setResError(e instanceof Error ? e.message : 'Failed to load reservations')
    } finally { setResLoading(false) }
  }, [])

  useEffect(() => { void fetchFines(); void fetchReservations() }, [fetchFines, fetchReservations])

  // ── Counts for tabs ────────────────────────────────────────────────────────

  const fineUnpaid   = fines.filter(f => f.payment_status?.toLowerCase() === 'unpaid').length
  const finePaid     = fines.filter(f => f.payment_status?.toLowerCase() === 'paid').length
  const resActive    = reservations.filter(r => r.status?.toLowerCase() === 'reserved').length
  const resPending   = reservations.filter(r => r.status?.toLowerCase() === 'pending').length

  // ── Selection helpers ──────────────────────────────────────────────────────

  const toggleFine = (id: string) =>
    setSelectedFines(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const toggleAllFines = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSelectedFines(e.target.checked ? fines.map(f => f.id) : [])

  const toggleRes = (id: string) =>
    setSelectedRes(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const toggleAllRes = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSelectedRes(e.target.checked ? reservations.map(r => r.id) : [])

  // ── Bulk actions ───────────────────────────────────────────────────────────

  const bulkMarkPaid = async () => {
    if (!selectedFines.length) return
    setBulkLoading(true)
    try {
      const { error } = await supabase.from('fines')
        .update({ payment_status: 'Paid' })
        .in('id', selectedFines)
      if (error) throw error
      setSelectedFines([])
      void fetchFines()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setBulkLoading(false) }
  }

  const bulkWaive = async () => {
    if (!selectedFines.length) return
    setBulkLoading(true)
    try {
      const { error } = await supabase.from('fines')
        .update({ payment_status: 'Waived', fine_amount: 0 })
        .in('id', selectedFines)
      if (error) throw error
      setSelectedFines([])
      void fetchFines()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setBulkLoading(false) }
  }

  const bulkCancelRes = async () => {
    if (!selectedRes.length) return
    setBulkLoading(true)
    try {
      const { error } = await supabase.from('reservations')
        .update({ status: 'Cancelled' })
        .in('id', selectedRes)
      if (error) throw error
      setSelectedRes([])
      void fetchReservations()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setBulkLoading(false) }
  }

  // ── Fines CRUD ─────────────────────────────────────────────────────────────

  const openAddFine = () => {
    setFineForm({ ...blankFine }); setFormError(null)
    setEditingFine(null); setFineModal('add')
  }
  const openEditFine = (f: Fine) => {
    setFineForm({
      student_id:    f.student_id    ?? '',
      student_name:  f.student_name  ?? '',
      book_title:    f.book_title    ?? '',
      due_date:      f.due_date      ? f.due_date.slice(0, 10) : '',
      overdue_days:  String(f.overdue_days  ?? ''),
      fine_amount:   String(f.fine_amount   ?? ''),
      payment_status: f.payment_status ?? 'Unpaid',
    })
    setFormError(null); setEditingFine(f); setFineModal('edit')
  }
  const closeFineModal = () => { setFineModal(null); setEditingFine(null); setFormError(null) }

  const saveFine = async () => {
    if (!fineForm.student_name.trim()) { setFormError('Student name is required.'); return }
    setSaving(true); setFormError(null)
    const payload = {
      student_id:    fineForm.student_id.trim()   || null,
      student_name:  fineForm.student_name.trim(),
      book_title:    fineForm.book_title.trim()   || null,
      due_date:      fineForm.due_date            || null,
      overdue_days:  fineForm.overdue_days ? Number(fineForm.overdue_days) : null,
      fine_amount:   fineForm.fine_amount  ? Number(fineForm.fine_amount)  : null,
      payment_status: fineForm.payment_status,
    }
    try {
      if (fineModal === 'add') {
        const { error } = await supabase.from('fines').insert([payload])
        if (error) throw error
      } else if (editingFine) {
        const { error } = await supabase.from('fines').update(payload).eq('id', editingFine.id)
        if (error) throw error
      }
      closeFineModal(); void fetchFines()
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Save failed.')
    } finally { setSaving(false) }
  }

  const confirmDeleteFine = async () => {
    if (!deleteFine) return
    setDeleting(true)
    try {
      const { error } = await supabase.from('fines').delete().eq('id', deleteFine.id)
      if (error) throw error
      setDeleteFine(null); void fetchFines()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Delete failed.') }
    finally { setDeleting(false) }
  }

  // ── Reservations CRUD ──────────────────────────────────────────────────────

  const openAddRes = () => {
    setResForm({ ...blankReservation }); setFormError(null)
    setEditingRes(null); setResModal('add')
  }
  const openEditRes = (r: Reservation) => {
    setResForm({
      student_id:   r.student_id  ?? '',
      student_name: r.student_name ?? '',
      item_type:    r.item_type   ?? 'book',
      item_name:    r.item_name   ?? '',
      status:       r.status      ?? 'Reserved',
      start_time:   r.start_time  ? r.start_time.slice(0, 16) : '',
      end_time:     r.end_time    ? r.end_time.slice(0, 16)   : '',
    })
    setFormError(null); setEditingRes(r); setResModal('edit')
  }
  const closeResModal = () => { setResModal(null); setEditingRes(null); setFormError(null) }

  const saveRes = async () => {
    if (!resForm.student_name.trim()) { setFormError('Student name is required.'); return }
    setSaving(true); setFormError(null)
    const payload = {
      student_id:   resForm.student_id.trim()   || null,
      student_name: resForm.student_name.trim(),
      item_type:    resForm.item_type,
      item_name:    resForm.item_name.trim()    || null,
      status:       resForm.status,
      start_time:   resForm.start_time          || null,
      end_time:     resForm.end_time            || null,
    }
    try {
      if (resModal === 'add') {
        const { error } = await supabase.from('reservations').insert([payload])
        if (error) throw error
      } else if (editingRes) {
        const { error } = await supabase.from('reservations').update(payload).eq('id', editingRes.id)
        if (error) throw error
      }
      closeResModal(); void fetchReservations()
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Save failed.')
    } finally { setSaving(false) }
  }

  const confirmDeleteRes = async () => {
    if (!deleteRes) return
    setDeleting(true)
    try {
      const { error } = await supabase.from('reservations').delete().eq('id', deleteRes.id)
      if (error) throw error
      setDeleteRes(null); void fetchReservations()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Delete failed.') }
    finally { setDeleting(false) }
  }

  // ── Quick status update ────────────────────────────────────────────────────

  const quickUpdateFineStatus = async (fine: Fine, status: string) => {
    try {
      const { error } = await supabase.from('fines')
        .update({ payment_status: status }).eq('id', fine.id)
      if (error) throw error
      void fetchFines()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Update failed.') }
  }

  const quickUpdateResStatus = async (res: Reservation, status: string) => {
    try {
      const { error } = await supabase.from('reservations')
        .update({ status }).eq('id', res.id)
      if (error) throw error
      void fetchReservations()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Update failed.') }
  }

  // ── Export CSV ─────────────────────────────────────────────────────────────

  const exportCSV = () => {
    if (activeTab === 'fines') {
      const rows = [
        ['Student ID', 'Student Name', 'Book Title', 'Due Date', 'Overdue Days', 'Fine Amount', 'Payment Status'],
        ...fines.map(f => [f.student_id ?? '', f.student_name ?? '', f.book_title ?? '',
          fmt(f.due_date), String(f.overdue_days ?? ''), String(f.fine_amount ?? ''), f.payment_status ?? '']),
      ]
      downloadCSV(rows, 'fines.csv')
    } else {
      const rows = [
        ['Student ID', 'Student Name', 'Item Type', 'Item Name', 'Status', 'Start Time', 'End Time'],
        ...reservations.map(r => [r.student_id ?? '', r.student_name ?? '', r.item_type ?? '',
          r.item_name ?? '', r.status ?? '', fmtDateTime(r.start_time), fmtDateTime(r.end_time)]),
      ]
      downloadCSV(rows, 'reservations.csv')
    }
  }

  const downloadCSV = (rows: string[][], filename: string) => {
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const loading = activeTab === 'fines' ? finesLoading : resLoading
  const error   = activeTab === 'fines' ? finesError   : resError

  return (
    <main className="reservations-page">

      {/* ── Header ── */}
      <div className="page-heading reservations-heading">
        <div>
          <h1>Reservations &amp; Fine Management</h1>
          <p>Track circulation deadlines, overdue fines, and payments</p>
        </div>
        <div className="rf-header-actions">
          <button className="icon-text-btn"
            onClick={() => activeTab === 'fines' ? void fetchFines() : void fetchReservations()}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="export-button" onClick={exportCSV}>
            <Download size={15} /> Export CSV
          </button>
          <button className="primary-button"
            onClick={() => activeTab === 'fines' ? openAddFine() : openAddRes()}>
            <Plus size={15} /> {activeTab === 'fines' ? 'Add Fine' : 'Add Reservation'}
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="data-table-container">
        <div className="tabs-bar">
          <button className={`tab-button${activeTab === 'fines' ? ' tab-button-active' : ''}`}
            onClick={() => setActiveTab('fines')}>
            Overdue Fines <span className="tab-count">{fines.length}</span>
          </button>
          <button className={`tab-button${activeTab === 'fines' && false ? ' tab-button-active' : ''}`}
            onClick={() => setActiveTab('fines')}>
            Unpaid <span className="tab-count">{fineUnpaid}</span>
          </button>
          <button className={`tab-button${activeTab === 'fines' && false ? ' tab-button-active' : ''}`}
            onClick={() => setActiveTab('fines')}>
            Paid <span className="tab-count">{finePaid}</span>
          </button>
          <div className="tab-separator" />
          <button className={`tab-button${activeTab === 'reservations' ? ' tab-button-active' : ''}`}
            onClick={() => setActiveTab('reservations')}>
            Reservations <span className="tab-count">{reservations.length}</span>
          </button>
          <button className={`tab-button${activeTab === 'reservations' && false ? '' : ''}`}
            onClick={() => setActiveTab('reservations')}>
            Active <span className="tab-count">{resActive}</span>
          </button>
          <button className={`tab-button`}
            onClick={() => setActiveTab('reservations')}>
            Pending <span className="tab-count">{resPending}</span>
          </button>
        </div>

        {/* ── Loading / Error ── */}
        {loading ? (
          <div className="table-loading"><Loader size={26} className="spin" /><span>Loading…</span></div>
        ) : error ? (
          <div className="table-error">
            <AlertTriangle size={20} /><span>{error}</span>
            <button className="retry-btn"
              onClick={() => activeTab === 'fines' ? void fetchFines() : void fetchReservations()}>
              Retry
            </button>
          </div>

        ) : activeTab === 'fines' ? (
          /* ── FINES TABLE ── */
          <>
            {fines.length === 0 ? (
              <div className="table-empty">
                <CheckCircle size={32} />
                <p>No fines found. Great news!</p>
                <button className="retry-btn" onClick={openAddFine}>Add Fine</button>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <input type="checkbox" className="table-checkbox"
                        checked={selectedFines.length === fines.length && fines.length > 0}
                        onChange={toggleAllFines} aria-label="Select all" />
                    </th>
                    <th>STUDENT ID</th>
                    <th>STUDENT NAME</th>
                    <th>BOOK TITLE</th>
                    <th>DUE DATE</th>
                    <th>OVERDUE DAYS</th>
                    <th>FINE AMOUNT</th>
                    <th>PAYMENT STATUS</th>
                    <th className="align-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {fines.map(f => (
                    <tr key={f.id} className={selectedFines.includes(f.id) ? 'row-selected' : ''}>
                      <td>
                        <input type="checkbox" className="table-checkbox"
                          checked={selectedFines.includes(f.id)}
                          onChange={() => toggleFine(f.id)} />
                      </td>
                      <td className="text-muted mono">{f.student_id ?? '—'}</td>
                      <td className="fw-medium">{f.student_name ?? '—'}</td>
                      <td className="text-muted">{f.book_title ?? '—'}</td>
                      <td className="text-muted">{fmt(f.due_date)}</td>
                      <td className="text-muted">
                        {f.overdue_days != null
                          ? <span className={f.overdue_days > 5 ? 'overdue-high' : 'overdue-low'}>{f.overdue_days}d</span>
                          : '—'}
                      </td>
                      <td className="fw-medium">
                        {f.fine_amount != null ? `Rs. ${f.fine_amount}` : '—'}
                      </td>
                      <td>
                        <span className={`payment-badge ${
                          f.payment_status?.toLowerCase() === 'paid'   ? 'payment-badge-paid'   :
                          f.payment_status?.toLowerCase() === 'waived' ? 'payment-badge-waived' :
                          'payment-badge-unpaid'}`}>
                          {f.payment_status ?? '—'}
                        </span>
                      </td>
                      <td className="align-right row-actions">
                        {f.payment_status?.toLowerCase() !== 'paid' && (
                          <button className="icon-btn" title="Mark Paid"
                            onClick={() => quickUpdateFineStatus(f, 'Paid')}>
                            <CheckCircle size={14} style={{ color: '#16a34a' }} />
                          </button>
                        )}
                        <button className="icon-btn edit-btn" title="Edit"
                          onClick={() => openEditFine(f)}><Edit2 size={14} /></button>
                        <button className="icon-btn delete-btn" title="Delete"
                          onClick={() => setDeleteFine(f)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="table-footer">
              <div className="selection-info">
                <input type="checkbox" className="table-checkbox"
                  checked={selectedFines.length === fines.length && fines.length > 0}
                  onChange={toggleAllFines} />
                <span className="text-muted">
                  {selectedFines.length > 0 ? `${selectedFines.length} selected` : 'Select records'}
                </span>
              </div>
              <div className="footer-actions">
                <button className="footer-button footer-button-primary"
                  disabled={!selectedFines.length || bulkLoading} onClick={bulkMarkPaid}>
                  {bulkLoading ? <Loader size={13} className="spin" /> : <CheckCircle size={13} />}
                  Mark as Paid
                </button>
                <button className="footer-button footer-button-secondary"
                  disabled={!selectedFines.length || bulkLoading} onClick={bulkWaive}>
                  Waive Fine
                </button>
              </div>
            </div>
          </>

        ) : (
          /* ── RESERVATIONS TABLE ── */
          <>
            {reservations.length === 0 ? (
              <div className="table-empty">
                <XCircle size={32} />
                <p>No reservations found.</p>
                <button className="retry-btn" onClick={openAddRes}>Add Reservation</button>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <input type="checkbox" className="table-checkbox"
                        checked={selectedRes.length === reservations.length && reservations.length > 0}
                        onChange={toggleAllRes} aria-label="Select all" />
                    </th>
                    <th>STUDENT</th>
                    <th>STUDENT ID</th>
                    <th>ITEM TYPE</th>
                    <th>ITEM NAME</th>
                    <th>START TIME</th>
                    <th>END TIME</th>
                    <th>STATUS</th>
                    <th className="align-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(r => (
                    <tr key={r.id} className={selectedRes.includes(r.id) ? 'row-selected' : ''}>
                      <td>
                        <input type="checkbox" className="table-checkbox"
                          checked={selectedRes.includes(r.id)}
                          onChange={() => toggleRes(r.id)} />
                      </td>
                      <td className="fw-medium">{r.student_name ?? '—'}</td>
                      <td className="text-muted mono">{r.student_id ?? '—'}</td>
                      <td>
                        <span className="item-type-badge">
                          {r.item_type ?? '—'}
                        </span>
                      </td>
                      <td className="text-muted">{r.item_name ?? '—'}</td>
                      <td className="text-muted">{fmtDateTime(r.start_time)}</td>
                      <td className="text-muted">{fmtDateTime(r.end_time)}</td>
                      <td>
                        <span className={`status-badge ${
                          r.status?.toLowerCase() === 'reserved'  ? 'status-info'    :
                          r.status?.toLowerCase() === 'completed' ? 'status-success' :
                          r.status?.toLowerCase() === 'cancelled' ? 'status-danger'  :
                          'status-warning'}`}>
                          {r.status ?? '—'}
                        </span>
                      </td>
                      <td className="align-right row-actions">
                        {r.status?.toLowerCase() === 'reserved' && (
                          <button className="icon-btn" title="Mark Completed"
                            onClick={() => quickUpdateResStatus(r, 'Completed')}>
                            <CheckCircle size={14} style={{ color: '#16a34a' }} />
                          </button>
                        )}
                        <button className="icon-btn edit-btn" title="Edit"
                          onClick={() => openEditRes(r)}><Edit2 size={14} /></button>
                        <button className="icon-btn delete-btn" title="Delete"
                          onClick={() => setDeleteRes(r)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="table-footer">
              <div className="selection-info">
                <input type="checkbox" className="table-checkbox"
                  checked={selectedRes.length === reservations.length && reservations.length > 0}
                  onChange={toggleAllRes} />
                <span className="text-muted">
                  {selectedRes.length > 0 ? `${selectedRes.length} selected` : 'Select records'}
                </span>
              </div>
              <div className="footer-actions">
                <button className="footer-button footer-button-secondary"
                  disabled={!selectedRes.length || bulkLoading} onClick={bulkCancelRes}>
                  Cancel Selected
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Fine Modal ── */}
      {fineModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeFineModal() }}>
          <div className="modal-card">
            <div className="modal-header">
              <h2>{fineModal === 'add' ? 'Add Fine' : 'Edit Fine'}</h2>
              <button className="modal-close-btn" onClick={closeFineModal}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {formError && <div className="modal-form-error"><AlertTriangle size={14} /><span>{formError}</span></div>}
              <div className="modal-form-grid">
                <div className="modal-field">
                  <label>Student ID</label>
                  <input className="modal-input" placeholder="STU-2026-1234"
                    value={fineForm.student_id} onChange={e => setFineForm({ ...fineForm, student_id: e.target.value })} />
                </div>
                <div className="modal-field">
                  <label>Student Name <span className="required">*</span></label>
                  <input className="modal-input" placeholder="Full name"
                    value={fineForm.student_name} onChange={e => setFineForm({ ...fineForm, student_name: e.target.value })} />
                </div>
                <div className="modal-field modal-field-full">
                  <label>Book Title</label>
                  <input className="modal-input" placeholder="Book title"
                    value={fineForm.book_title} onChange={e => setFineForm({ ...fineForm, book_title: e.target.value })} />
                </div>
                <div className="modal-field">
                  <label>Due Date</label>
                  <input type="date" className="modal-input"
                    value={fineForm.due_date} onChange={e => setFineForm({ ...fineForm, due_date: e.target.value })} />
                </div>
                <div className="modal-field">
                  <label>Overdue Days</label>
                  <input type="number" min="0" className="modal-input" placeholder="0"
                    value={fineForm.overdue_days} onChange={e => setFineForm({ ...fineForm, overdue_days: e.target.value })} />
                </div>
                <div className="modal-field">
                  <label>Fine Amount (Rs.)</label>
                  <input type="number" min="0" className="modal-input" placeholder="0"
                    value={fineForm.fine_amount} onChange={e => setFineForm({ ...fineForm, fine_amount: e.target.value })} />
                </div>
                <div className="modal-field">
                  <label>Payment Status</label>
                  <select className="modal-input" value={fineForm.payment_status}
                    onChange={e => setFineForm({ ...fineForm, payment_status: e.target.value })}>
                    <option>Unpaid</option><option>Paid</option><option>Waived</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="footer-button footer-button-secondary" onClick={closeFineModal} disabled={saving}>Cancel</button>
              <button className="footer-button footer-button-primary" onClick={saveFine} disabled={saving}>
                {saving ? <><Loader size={13} className="spin" style={{ marginRight: 6 }} />Saving…</> : fineModal === 'add' ? 'Add Fine' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reservation Modal ── */}
      {resModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeResModal() }}>
          <div className="modal-card">
            <div className="modal-header">
              <h2>{resModal === 'add' ? 'Add Reservation' : 'Edit Reservation'}</h2>
              <button className="modal-close-btn" onClick={closeResModal}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {formError && <div className="modal-form-error"><AlertTriangle size={14} /><span>{formError}</span></div>}
              <div className="modal-form-grid">
                <div className="modal-field">
                  <label>Student ID</label>
                  <input className="modal-input" placeholder="STU-2026-1234"
                    value={resForm.student_id} onChange={e => setResForm({ ...resForm, student_id: e.target.value })} />
                </div>
                <div className="modal-field">
                  <label>Student Name <span className="required">*</span></label>
                  <input className="modal-input" placeholder="Full name"
                    value={resForm.student_name} onChange={e => setResForm({ ...resForm, student_name: e.target.value })} />
                </div>
                <div className="modal-field">
                  <label>Item Type</label>
                  <select className="modal-input" value={resForm.item_type}
                    onChange={e => setResForm({ ...resForm, item_type: e.target.value })}>
                    <option value="book">Book</option>
                    <option value="seat">Seat</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Item Name</label>
                  <input className="modal-input" placeholder="Book/seat name"
                    value={resForm.item_name} onChange={e => setResForm({ ...resForm, item_name: e.target.value })} />
                </div>
                <div className="modal-field">
                  <label>Start Time</label>
                  <input type="datetime-local" className="modal-input"
                    value={resForm.start_time} onChange={e => setResForm({ ...resForm, start_time: e.target.value })} />
                </div>
                <div className="modal-field">
                  <label>End Time</label>
                  <input type="datetime-local" className="modal-input"
                    value={resForm.end_time} onChange={e => setResForm({ ...resForm, end_time: e.target.value })} />
                </div>
                <div className="modal-field modal-field-full">
                  <label>Status</label>
                  <select className="modal-input" value={resForm.status}
                    onChange={e => setResForm({ ...resForm, status: e.target.value })}>
                    <option>Reserved</option><option>Pending</option>
                    <option>Completed</option><option>Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="footer-button footer-button-secondary" onClick={closeResModal} disabled={saving}>Cancel</button>
              <button className="footer-button footer-button-primary" onClick={saveRes} disabled={saving}>
                {saving ? <><Loader size={13} className="spin" style={{ marginRight: 6 }} />Saving…</> : resModal === 'add' ? 'Add Reservation' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Fine Confirm ── */}
      {deleteFine && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteFine(null) }}>
          <div className="modal-card modal-card-sm">
            <div className="modal-header">
              <h2>Delete Fine</h2>
              <button className="modal-close-btn" onClick={() => setDeleteFine(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="delete-confirm-body">
                <div className="delete-icon-wrap"><Trash2 size={26} /></div>
                <p>Delete fine for <strong>{deleteFine.student_name}</strong>?</p>
                <p className="delete-sub">This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="footer-button footer-button-secondary" onClick={() => setDeleteFine(null)} disabled={deleting}>Cancel</button>
              <button className="footer-button footer-button-danger" onClick={confirmDeleteFine} disabled={deleting}>
                {deleting ? <><Loader size={13} className="spin" style={{ marginRight: 6 }} />Deleting…</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Reservation Confirm ── */}
      {deleteRes && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteRes(null) }}>
          <div className="modal-card modal-card-sm">
            <div className="modal-header">
              <h2>Delete Reservation</h2>
              <button className="modal-close-btn" onClick={() => setDeleteRes(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="delete-confirm-body">
                <div className="delete-icon-wrap"><Trash2 size={26} /></div>
                <p>Delete reservation for <strong>{deleteRes.student_name}</strong>?</p>
                <p className="delete-sub">This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="footer-button footer-button-secondary" onClick={() => setDeleteRes(null)} disabled={deleting}>Cancel</button>
              <button className="footer-button footer-button-danger" onClick={confirmDeleteRes} disabled={deleting}>
                {deleting ? <><Loader size={13} className="spin" style={{ marginRight: 6 }} />Deleting…</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}
