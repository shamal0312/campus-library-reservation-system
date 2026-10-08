import { AlertTriangle, BookOpen, ChevronLeft, ChevronRight, Edit2, Loader, Plus, Search, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// ── Types ────────────────────────────────────────────────────────────────────

interface Book {
  id: string
  book_id?: string
  title: string
  author: string
  category?: string
  genre?: string
  status?: string
  availability_status?: string
  isbn?: string
  published_year?: number | string
  description?: string
  total_copies?: number
  available_copies?: number
  [key: string]: unknown
}

type ModalMode = 'add' | 'edit' | null

const CATEGORIES = ['All Categories', 'Fiction', 'Non-Fiction', 'Technology', 'Science', 'History', 'Biography', 'Finance', 'Wellness', 'Mystery', 'Romance', 'Self-Help', 'Other']
const STATUSES   = ['Available', 'Reserved', 'Checked Out', 'Unavailable']
const PAGE_SIZE  = 10

// ── Helpers ──────────────────────────────────────────────────────────────────

function getBookId(book: Book): string {
  const raw = (book.book_id ?? book.id ?? '') as string
  // If it's a UUID, show first 8 chars
  if (raw.includes('-') && raw.length > 16) return raw.slice(0, 8).toUpperCase()
  return raw
}

function getStatus(book: Book): string {
  return ((book.status ?? book.availability_status ?? '') as string) || '—'
}

function getCategory(book: Book): string {
  return ((book.category ?? book.genre ?? '') as string) || '—'
}

function statusClass(status: string): string {
  const s = status?.toLowerCase() ?? ''
  if (s === 'available')   return 'status-success'
  if (s === 'reserved')    return 'status-warning'
  if (s === 'checked out' || s === 'unavailable') return 'status-danger'
  return 'status-default'
}

// ── Component ────────────────────────────────────────────────────────────────

function Books() {
  const [books, setBooks]         = useState<Book[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState('All Categories')
  const [page, setPage]           = useState(1)

  const [modalMode, setModalMode]     = useState<ModalMode>(null)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null)
  const [saving, setSaving]           = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [formError, setFormError]     = useState<string | null>(null)

  const blankForm = { title: '', author: '', category: '', status: 'Available', isbn: '', published_year: '', description: '', total_copies: '', available_copies: '' }
  const [form, setForm] = useState({ ...blankForm })

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    setError(null)

    const from = (page - 1) * PAGE_SIZE
    const to   = from + PAGE_SIZE - 1

    try {
      // Build a simple, safe query — no filtering on columns that may not exist
      let query = supabase
        .from('books')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('title', { ascending: true })

      // Title / author search — always safe
      if (search.trim()) {
        const s = search.trim()
        query = query.or(`title.ilike.%${s}%,author.ilike.%${s}%`)
      }

      const { data, error: err1, count, status, statusText } = await query

      // Log full details to browser console for debugging
      console.log('[Books] status:', status, statusText)
      console.log('[Books] count:', count, '| data length:', data?.length)
      console.log('[Books] error:', err1)
      console.log('[Books] first row:', data?.[0])

      if (err1) {
        console.error('[Books] Full error object:', JSON.stringify(err1))
        throw new Error(`${err1.message} (code: ${err1.code}, hint: ${err1.hint})`)
      }

      setBooks(data ?? [])
      setTotalCount(count ?? 0)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load books'
      console.error('[Books] catch:', msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [search, page])  // removed category from deps — filter happens client-side

  useEffect(() => { void fetchBooks() }, [fetchBooks])
  useEffect(() => { setPage(1) }, [search, category])

  // Client-side category filter (because 'category' column may not exist in DB)
  const visibleBooks = category === 'All Categories'
    ? books
    : books.filter((b) =>
        getCategory(b).toLowerCase().includes(category.toLowerCase())
      )

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const openAdd = () => {
    setForm({ ...blankForm })
    setFormError(null)
    setEditingBook(null)
    setModalMode('add')
  }

  const openEdit = (book: Book) => {
    setForm({
      title:            String(book.title            ?? ''),
      author:           String(book.author           ?? ''),
      category:         getCategory(book) === '—' ? '' : getCategory(book),
      status:           getStatus(book)   === '—' ? '' : getStatus(book),
      isbn:             String(book.isbn             ?? ''),
      published_year:   String(book.published_year   ?? ''),
      description:      String(book.description      ?? ''),
      total_copies:     String(book.total_copies     ?? ''),
      available_copies: String(book.available_copies ?? ''),
    })
    setFormError(null)
    setEditingBook(book)
    setModalMode('edit')
  }

  const closeModal = () => { setModalMode(null); setEditingBook(null); setFormError(null) }

  const handleSave = async () => {
    if (!form.title.trim())  { setFormError('Title is required.'); return }
    if (!form.author.trim()) { setFormError('Author is required.'); return }

    setSaving(true)
    setFormError(null)

    const payload: Record<string, unknown> = {
      title:  form.title.trim(),
      author: form.author.trim(),
    }
    if (form.category)         payload.category          = form.category
    if (form.status)           payload.status            = form.status
    if (form.isbn.trim())      payload.isbn              = form.isbn.trim()
    if (form.published_year)   payload.published_year    = Number(form.published_year)
    if (form.description.trim()) payload.description     = form.description.trim()
    if (form.total_copies)     payload.total_copies      = Number(form.total_copies)
    if (form.available_copies) payload.available_copies  = Number(form.available_copies)

    try {
      if (modalMode === 'add') {
        const { error: e } = await supabase.from('books').insert([payload])
        if (e) throw e
      } else if (editingBook) {
        const { error: e } = await supabase.from('books').update(payload).eq('id', editingBook.id)
        if (e) throw e
      }
      closeModal()
      void fetchBooks()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const { error: e } = await supabase.from('books').delete().eq('id', deleteTarget.id)
      if (e) throw e
      setDeleteTarget(null)
      void fetchBooks()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delete failed.')
    } finally {
      setDeleting(false)
    }
  }

  // ── Pagination ────────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const pageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 4)       return [1, 2, 3, 4, 5, '...', totalPages]
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [1, '...', page - 1, page, page + 1, '...', totalPages]
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="books-page">

      {/* ── Header ── */}
      <div className="page-heading books-heading">
        <div>
          <h1>Manage Books</h1>
          <p>Catalog and maintain the library collection</p>
        </div>
        <div className="toolbar-actions">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search title, author or ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Category filter"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button className="primary-button add-book-btn" onClick={openAdd}>
            <Plus size={16} />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="data-table-container">
        {loading ? (
          <div className="table-loading">
            <Loader size={28} className="spin" />
            <span>Loading books…</span>
          </div>

        ) : error ? (
          <div className="table-error">
            <AlertTriangle size={22} />
            <span>{error}</span>
            <button className="retry-btn" onClick={() => { setError(null); void fetchBooks() }}>
              Retry
            </button>
          </div>

        ) : visibleBooks.length === 0 ? (
          <div className="table-empty">
            <BookOpen size={36} />
            <p>No books found{search || category !== 'All Categories' ? ' matching your filters' : ''}.</p>
            {(search || category !== 'All Categories') && (
              <button className="retry-btn" onClick={() => { setSearch(''); setCategory('All Categories') }}>
                Clear filters
              </button>
            )}
          </div>

        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>BOOK ID</th>
                  <th>TITLE</th>
                  <th>AUTHOR</th>
                  <th>CATEGORY</th>
                  <th>STATUS</th>
                  <th className="align-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {visibleBooks.map((book) => (
                  <tr key={book.id}>
                    <td className="text-muted mono">{getBookId(book)}</td>
                    <td className="fw-medium">{book.title}</td>
                    <td className="text-muted">{book.author}</td>
                    <td className="text-muted">{getCategory(book)}</td>
                    <td>
                      {getStatus(book) !== '—'
                        ? <span className={`status-badge ${statusClass(getStatus(book))}`}>{getStatus(book)}</span>
                        : <span className="text-muted">—</span>
                      }
                    </td>
                    <td className="align-right row-actions">
                      <button className="icon-btn edit-btn" aria-label="Edit book" title="Edit" onClick={() => openEdit(book)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="icon-btn delete-btn" aria-label="Delete book" title="Delete" onClick={() => setDeleteTarget(book)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination-footer">
              <span className="text-muted">
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, totalCount)}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount.toLocaleString()} books
              </span>
              <div className="pagination-controls">
                <button className="page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous">
                  <ChevronLeft size={14} />
                </button>
                {pageNumbers().map((p, i) =>
                  p === '...'
                    ? <span key={`d${i}`} className="page-dots">…</span>
                    : <button key={p} className={`page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(Number(p))}>{p}</button>
                )}
                <button className="page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modalMode && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="modal-card">
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'Add New Book' : 'Edit Book'}</h2>
              <button className="modal-close-btn" onClick={closeModal} aria-label="Close"><X size={18} /></button>
            </div>

            <div className="modal-body">
              {formError && (
                <div className="modal-form-error">
                  <AlertTriangle size={14} />
                  <span>{formError}</span>
                </div>
              )}
              <div className="modal-form-grid">
                <div className="modal-field modal-field-full">
                  <label htmlFor="f-title">Title <span className="required">*</span></label>
                  <input id="f-title" className="modal-input" placeholder="Book title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="modal-field modal-field-full">
                  <label htmlFor="f-author">Author <span className="required">*</span></label>
                  <input id="f-author" className="modal-input" placeholder="Author name" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
                </div>
                <div className="modal-field">
                  <label htmlFor="f-category">Category</label>
                  <select id="f-category" className="modal-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select category</option>
                    {CATEGORIES.slice(1).map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="modal-field">
                  <label htmlFor="f-status">Status</label>
                  <select id="f-status" className="modal-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="modal-field">
                  <label htmlFor="f-isbn">ISBN</label>
                  <input id="f-isbn" className="modal-input" placeholder="978-0-000-00000-0" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
                </div>
                <div className="modal-field">
                  <label htmlFor="f-year">Published Year</label>
                  <input id="f-year" className="modal-input" type="number" placeholder="2024" value={form.published_year} onChange={(e) => setForm({ ...form, published_year: e.target.value })} />
                </div>
                <div className="modal-field">
                  <label htmlFor="f-total">Total Copies</label>
                  <input id="f-total" className="modal-input" type="number" min="0" placeholder="5" value={form.total_copies} onChange={(e) => setForm({ ...form, total_copies: e.target.value })} />
                </div>
                <div className="modal-field">
                  <label htmlFor="f-avail">Available Copies</label>
                  <input id="f-avail" className="modal-input" type="number" min="0" placeholder="3" value={form.available_copies} onChange={(e) => setForm({ ...form, available_copies: e.target.value })} />
                </div>
                <div className="modal-field modal-field-full">
                  <label htmlFor="f-desc">Description</label>
                  <textarea id="f-desc" className="modal-input modal-textarea" rows={3} placeholder="Short description…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="footer-button footer-button-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="footer-button footer-button-primary" onClick={handleSave} disabled={saving}>
                {saving
                  ? <><Loader size={14} className="spin" style={{ marginRight: 6 }} />Saving…</>
                  : modalMode === 'add' ? 'Add Book' : 'Save Changes'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null) }}>
          <div className="modal-card modal-card-sm">
            <div className="modal-header">
              <h2>Delete Book</h2>
              <button className="modal-close-btn" onClick={() => setDeleteTarget(null)} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="delete-confirm-body">
                <div className="delete-icon-wrap"><Trash2 size={28} /></div>
                <p>Are you sure you want to delete <strong>"{deleteTarget.title}"</strong>?</p>
                <p className="delete-sub">This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="footer-button footer-button-secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button className="footer-button footer-button-danger" onClick={handleDelete} disabled={deleting}>
                {deleting
                  ? <><Loader size={14} className="spin" style={{ marginRight: 6 }} />Deleting…</>
                  : 'Delete Book'
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}

export default Books
