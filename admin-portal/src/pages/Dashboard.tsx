import { useCallback, useEffect, useState } from 'react'
import QuickActions from '../components/dashboard/QuickActions'
import RecentActivityTable from '../components/dashboard/RecentActivityTable'
import StatCards from '../components/dashboard/StatCards'
import { supabase } from '../lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalBooks:        number
  availableBooks:    number
  totalSeats:        number
  occupiedSeats:     number
  pendingSeats:      number
  totalReservations: number
  pendingFines:      number
  fineAmount:        number
  totalMembers:      number
}

export interface ActivityRow {
  id:        string
  student:   string
  item:      string
  status:    string
  createdAt: string
  type:      'reservation' | 'fine'
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getFormattedDate(): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())
}

const emptyStats: DashboardStats = {
  totalBooks: 0, availableBooks: 0,
  totalSeats: 0, occupiedSeats: 0, pendingSeats: 0,
  totalReservations: 0, pendingFines: 0, fineAmount: 0, totalMembers: 0,
}

// ── Component ─────────────────────────────────────────────────────────────────

interface DashboardProps {
  onNavigate: (page: string) => void
}

function Dashboard({ onNavigate }: DashboardProps) {
  const [stats,      setStats]      = useState<DashboardStats>(emptyStats)
  const [activity,   setActivity]   = useState<ActivityRow[]>([])
  const [loading,    setLoading]    = useState(true)
  const [adminName,  setAdminName]  = useState<string>('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      // Admin name
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const name = user.user_metadata?.full_name as string | undefined
        setAdminName(name ?? user.email?.split('@')[0] ?? 'Admin')
      }

      // Parallel stat queries
      const [
        { count: totalBooks },
        { count: availBooks },
        { count: totalSeats },
        { count: occupiedSeats },
        { count: pendingSeats },
        { count: totalRes },
        { count: pendingFines },
        { data: fineData },
        { count: members },
        { data: recentRes },
        { data: recentFines },
      ] = await Promise.all([
        supabase.from('books').select('*', { count: 'exact', head: true }),
        supabase.from('books').select('*', { count: 'exact', head: true }).eq('status', 'Available'),
        supabase.from('seats').select('*', { count: 'exact', head: true }),
        supabase.from('seats').select('*', { count: 'exact', head: true }).eq('status', 'occupied'),
        supabase.from('seats').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('reservations').select('*', { count: 'exact', head: true }),
        supabase.from('fines').select('*', { count: 'exact', head: true }).eq('payment_status', 'Unpaid'),
        supabase.from('fines').select('fine_amount').eq('payment_status', 'Unpaid'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('reservations')
          .select('id, student_name, item_name, item_type, status, created_at')
          .order('created_at', { ascending: false })
          .limit(6),
        supabase.from('fines')
          .select('id, student_name, book_title, fine_amount, payment_status, created_at')
          .order('created_at', { ascending: false })
          .limit(4),
      ])

      const fineAmt = (fineData ?? []).reduce((s, f) => s + (Number(f.fine_amount) || 0), 0)

      setStats({
        totalBooks:        totalBooks        ?? 0,
        availableBooks:    availBooks        ?? 0,
        totalSeats:        totalSeats        ?? 0,
        occupiedSeats:     occupiedSeats     ?? 0,
        pendingSeats:      pendingSeats      ?? 0,
        totalReservations: totalRes          ?? 0,
        pendingFines:      pendingFines      ?? 0,
        fineAmount:        fineAmt,
        totalMembers:      members           ?? 0,
      })

      // Merge + sort activity rows
      const resRows: ActivityRow[] = (recentRes ?? []).map(r => ({
        id:        r.id,
        student:   (r.student_name as string) || 'Unknown',
        item:      (r.item_name    as string) || (r.item_type as string) || '—',
        status:    (r.status       as string) || 'Reserved',
        createdAt: r.created_at as string,
        type:      'reservation',
      }))

      const fineRows: ActivityRow[] = (recentFines ?? []).map(f => ({
        id:        f.id,
        student:   (f.student_name as string) || 'Unknown',
        item:      (f.book_title   as string) || 'Fine',
        status:    `Fine Rs. ${f.fine_amount ?? 0}`,
        createdAt: f.created_at as string,
        type:      'fine',
      }))

      const merged = [...resRows, ...fineRows]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8)

      setActivity(merged)
    } catch { /* errors handled per-component */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void fetchAll() }, [fetchAll])

  return (
    <main className="dashboard-page">

      {/* ══════════ HERO ══════════ */}
      <div className="dash-hero">
        <div className="dash-hero-bg" aria-hidden="true">
          <span className="dash-hero-circle dash-hero-c1" />
          <span className="dash-hero-circle dash-hero-c2" />
          <span className="dash-hero-circle dash-hero-c3" />
        </div>
        <div className="dash-hero-content">
          <div className="dash-hero-left">
            <p className="dash-greeting">{getGreeting()}{adminName ? `, ${adminName}` : ''} 👋</p>
            <h1 className="dash-hero-title">Library Dashboard</h1>
            <p className="dash-hero-date">{getFormattedDate()}</p>
          </div>
          <div className="dash-hero-kpis">
            {[
              { label: 'Total Books',   value: loading ? '—' : stats.totalBooks.toLocaleString(),   accent: 'blue'   },
              { label: 'Members',       value: loading ? '—' : stats.totalMembers.toLocaleString(),  accent: 'purple' },
              { label: 'Reservations',  value: loading ? '—' : stats.totalReservations.toLocaleString(), accent: 'teal' },
              { label: 'Fines Due',     value: loading ? '—' : `Rs. ${stats.fineAmount.toLocaleString()}`, accent: 'amber' },
            ].map(k => (
              <div key={k.label} className={`dash-kpi dash-kpi-${k.accent}`}>
                <span className="dash-kpi-value">{k.value}</span>
                <span className="dash-kpi-label">{k.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ STAT CARDS ══════════ */}
      <StatCards stats={stats} loading={loading} />

      {/* ══════════ WIDGETS ══════════ */}
      <div className="dashboard-widgets">
        <RecentActivityTable rows={activity} loading={loading} onRefresh={fetchAll} />
        <QuickActions stats={stats} loading={loading} onNavigate={onNavigate} />
      </div>

    </main>
  )
}

export default Dashboard
