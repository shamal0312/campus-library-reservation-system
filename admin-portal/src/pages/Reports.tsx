import {
    AlertCircle,
    BookOpen,
    Calendar,
    ChevronDown,
    DollarSign,
    Download,
    Loader,
    RefreshCw,
    TrendingUp,
    Users,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

interface MonthlyBucket {
  month: string   // e.g. "Jan", "Feb"
  year:  number
  count: number
}

interface TopBook {
  title: string
  count: number
}

interface ReportStats {
  totalReservations: number
  totalMembers:      number
  overdueCount:      number
  fineRevenue:       number
  availableBooks:    number
  totalBooks:        number
  occupiedSeats:     number
  totalSeats:        number
  pendingApprovals:  number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function last6Months(): { key: string; label: string }[] {
  const now = new Date()
  const result = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({
      key:   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: MONTH_LABELS[d.getMonth()],
    })
  }
  return result
}

function exportCSV(stats: ReportStats, monthly: MonthlyBucket[], top: TopBook[]) {
  const rows: string[] = [
    'Reports & Analytics Export',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    'Summary Stats',
    'Metric,Value',
    `Total Reservations,${stats.totalReservations}`,
    `Active Members,${stats.totalMembers}`,
    `Overdue Fines,${stats.overdueCount}`,
    `Fine Revenue (Rs.),${stats.fineRevenue.toFixed(2)}`,
    `Available Books,${stats.availableBooks}`,
    `Total Books,${stats.totalBooks}`,
    `Occupied Seats,${stats.occupiedSeats}`,
    `Total Seats,${stats.totalSeats}`,
    `Pending Approvals,${stats.pendingApprovals}`,
    '',
    'Monthly Reservations',
    'Month,Count',
    ...monthly.map(m => `${m.month} ${m.year},${m.count}`),
    '',
    'Top Borrowed Books',
    'Title,Checkouts',
    ...top.map(b => `"${b.title}",${b.count}`),
  ]
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `library-report-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Component ─────────────────────────────────────────────────────────────────

const emptyStats: ReportStats = {
  totalReservations: 0, totalMembers: 0,   overdueCount:    0,
  fineRevenue:       0, availableBooks: 0, totalBooks:      0,
  occupiedSeats:     0, totalSeats:    0,  pendingApprovals: 0,
}

export default function Reports() {
  const [stats,   setStats]   = useState<ReportStats>(emptyStats)
  const [monthly, setMonthly] = useState<MonthlyBucket[]>([])
  const [topBooks, setTopBooks] = useState<TopBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [range,   setRange]   = useState('6') // months to show
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [
        { count: resCount },
        { count: memberCount },
        { count: overdueCount },
        { data: fineData },
        { count: availBooks },
        { count: totalBooks },
        { count: occupiedSeats },
        { count: totalSeats },
        { count: pendingSeats },
        { data: allReservations },
      ] = await Promise.all([
        supabase.from('reservations').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('fines').select('*', { count: 'exact', head: true }).eq('payment_status', 'Unpaid'),
        supabase.from('fines').select('fine_amount').eq('payment_status', 'Paid'),
        supabase.from('books').select('*', { count: 'exact', head: true }).eq('status', 'Available'),
        supabase.from('books').select('*', { count: 'exact', head: true }),
        supabase.from('seats').select('*', { count: 'exact', head: true }).eq('status', 'occupied'),
        supabase.from('seats').select('*', { count: 'exact', head: true }),
        supabase.from('seats').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('reservations').select('item_name, created_at').order('created_at', { ascending: false }),
      ])

      // Fine revenue from paid fines
      const revenue = (fineData ?? []).reduce((sum, f) => sum + (Number(f.fine_amount) || 0), 0)

      setStats({
        totalReservations: resCount    ?? 0,
        totalMembers:      memberCount ?? 0,
        overdueCount:      overdueCount ?? 0,
        fineRevenue:       revenue,
        availableBooks:    availBooks  ?? 0,
        totalBooks:        totalBooks  ?? 0,
        occupiedSeats:     occupiedSeats ?? 0,
        totalSeats:        totalSeats  ?? 0,
        pendingApprovals:  pendingSeats ?? 0,
      })

      // ── Monthly chart ──────────────────────────────────────────────────────
      const buckets = last6Months()
      const monthMap: Record<string, number> = {}
      buckets.forEach(b => { monthMap[b.key] = 0 });

      (allReservations ?? []).forEach(r => {
        if (!r.created_at) return
        const d   = new Date(r.created_at)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (key in monthMap) monthMap[key]++
      })

      setMonthly(buckets.map(b => ({
        month: b.label,
        year:  parseInt(b.key.split('-')[0]),
        count: monthMap[b.key],
      })))

      // ── Top books ──────────────────────────────────────────────────────────
      const bookCount: Record<string, number> = {}
      ;(allReservations ?? [])
        .filter(r => r.item_name)
        .forEach(r => {
          const title = r.item_name as string
          bookCount[title] = (bookCount[title] ?? 0) + 1
        })

      const sorted = Object.entries(bookCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([title, count]) => ({ title, count }))

      setTopBooks(sorted)
      setLastRefresh(new Date())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load report data')
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => { void fetchAll() }, [fetchAll])

  // ── Derived chart values ───────────────────────────────────────────────────
  const maxBar   = Math.max(...monthly.map(m => m.count), 1)
  const totalRes = monthly.reduce((s, m) => s + m.count, 0)

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="reports-page">

      {/* ══════════════════ HEADER ══════════════════ */}
      <div className="rpt-hero">
        <div className="rpt-hero-bg" aria-hidden="true">
          {/* decorative circles */}
          <span className="rpt-hero-circle rpt-hero-circle-1" />
          <span className="rpt-hero-circle rpt-hero-circle-2" />
          <span className="rpt-hero-circle rpt-hero-circle-3" />
        </div>
        <div className="rpt-hero-content">
          <div className="rpt-hero-left">
            <div className="rpt-hero-badge">
              <TrendingUp size={13} />
              <span>Live Analytics</span>
            </div>
            <h1 className="rpt-hero-title">Reports &amp; Analytics</h1>
            <p className="rpt-hero-sub">
              Real-time circulation statistics, trends and member insights
            </p>
            {lastRefresh && (
              <span className="rpt-hero-updated">
                Last updated: {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <div className="rpt-hero-actions">
            <div className="rpt-range-wrap">
              <Calendar size={14} />
              <select
                className="rpt-range-select"
                value={range}
                onChange={e => setRange(e.target.value)}
                aria-label="Date range"
              >
                <option value="3">Last 3 months</option>
                <option value="6">Last 6 months</option>
                <option value="12">Last 12 months</option>
              </select>
              <ChevronDown size={12} />
            </div>
            <button
              className="rpt-refresh-btn"
              onClick={() => void fetchAll()}
              disabled={loading}
              aria-label="Refresh"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
            <button
              className="rpt-export-btn"
              onClick={() => exportCSV(stats, monthly, topBooks)}
              disabled={loading}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════ ERROR ══════════════════ */}
      {error && (
        <div className="rpt-error-bar">
          <AlertCircle size={15} />
          <span>{error}</span>
          <button onClick={() => void fetchAll()}>Retry</button>
        </div>
      )}

      {/* ══════════════════ STAT CARDS ══════════════════ */}
      <div className="rpt-stats-grid">
        {[
          {
            label: 'Total Reservations',
            value: stats.totalReservations.toLocaleString(),
            sub:   `${stats.pendingApprovals} pending approval`,
            subType: stats.pendingApprovals > 0 ? 'warn' : 'muted',
            icon: <BookOpen size={17} />,
            accent: 'blue',
          },
          {
            label: 'Active Members',
            value: stats.totalMembers.toLocaleString(),
            sub:   'Registered profiles',
            subType: 'info',
            icon: <Users size={17} />,
            accent: 'purple',
          },
          {
            label: 'Overdue Fines',
            value: stats.overdueCount.toLocaleString(),
            sub:   `Rs. ${stats.fineRevenue.toLocaleString(undefined, { minimumFractionDigits: 0 })} collected`,
            subType: stats.overdueCount > 0 ? 'warn' : 'ok',
            icon: <AlertCircle size={17} />,
            accent: 'amber',
          },
          {
            label: 'Books Available',
            value: `${stats.availableBooks} / ${stats.totalBooks}`,
            sub:   `${stats.totalBooks - stats.availableBooks} currently checked out`,
            subType: 'muted',
            icon: <BookOpen size={17} />,
            accent: 'green',
          },
          {
            label: 'Seat Occupancy',
            value: `${stats.occupiedSeats} / ${stats.totalSeats}`,
            sub:   stats.totalSeats > 0
              ? `${Math.round((stats.occupiedSeats / stats.totalSeats) * 100)}% occupied`
              : 'No seats configured',
            subType: 'muted',
            icon: <Users size={17} />,
            accent: 'teal',
          },
          {
            label: 'Fine Revenue',
            value: `Rs. ${stats.fineRevenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}`,
            sub:   'From paid fines',
            subType: 'ok',
            icon: <DollarSign size={17} />,
            accent: 'emerald',
          },
        ].map(c => (
          <div key={c.label} className={`rpt-stat-card rpt-stat-${c.accent}`}>
            <div className="rpt-stat-top">
              <span className="rpt-stat-label">{c.label}</span>
              <div className="rpt-stat-icon">{c.icon}</div>
            </div>
            {loading
              ? <div className="rpt-stat-skeleton" />
              : <div className="rpt-stat-value">{c.value}</div>
            }
            <span className={`rpt-stat-sub rpt-sub-${c.subType}`}>{c.sub}</span>
          </div>
        ))}
      </div>

      {/* ══════════════════ WIDGETS ══════════════════ */}
      <div className="reports-widgets">

        {/* ── Bar Chart ── */}
        <div className="chart-card">
          <div className="widget-heading">
            <div>
              <h2>Monthly Reservations</h2>
              <p className="widget-sub">Last 6 months · {totalRes.toLocaleString()} total</p>
            </div>
          </div>
          <div className="chart-container">
            {loading ? (
              <div className="rpt-chart-loading">
                <Loader size={22} className="spin" />
              </div>
            ) : (
              <div className="chart-bars">
                {monthly.map(d => (
                  <div key={`${d.month}${d.year}`} className="chart-bar-wrapper">
                    <div className="chart-bar-container">
                      <div
                        className="chart-bar"
                        style={{ height: `${maxBar > 0 ? (d.count / maxBar) * 100 : 4}%` }}
                        title={`${d.month}: ${d.count} reservations`}
                      >
                        <span className="chart-value">{d.count}</span>
                      </div>
                    </div>
                    <span className="chart-label">{d.month}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Top Books ── */}
        <div className="top-books-card">
          <div className="widget-heading">
            <div>
              <h2>Top Borrowed Books</h2>
              <p className="widget-sub">By reservation count</p>
            </div>
          </div>
          {loading ? (
            <div className="rpt-topbooks-loading"><Loader size={20} className="spin" /></div>
          ) : topBooks.length === 0 ? (
            <div className="rpt-topbooks-empty">
              <BookOpen size={28} />
              <p>No reservation data yet</p>
            </div>
          ) : (
            <div className="top-books-list">
              <table className="top-books-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>TITLE</th>
                    <th className="align-right">COUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {topBooks.map((book, idx) => (
                    <tr key={book.title}>
                      <td className="rank-cell">
                        <span className={`rpt-rank rpt-rank-${idx < 3 ? idx + 1 : 'rest'}`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="title-cell">{book.title}</td>
                      <td className="checkouts-cell">
                        <div className="rpt-count-cell">
                          <span>{book.count}</span>
                          <div
                            className="rpt-mini-bar"
                            style={{ width: `${(book.count / topBooks[0].count) * 100}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
