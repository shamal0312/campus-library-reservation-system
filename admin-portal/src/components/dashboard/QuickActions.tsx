import { AlertTriangle, BookPlus, HandCoins, LayoutGrid } from 'lucide-react'
import type { DashboardStats } from '../../pages/Dashboard'

interface Props {
  stats:   DashboardStats
  loading: boolean
  onNavigate: (page: string) => void
}

function QuickActions({ stats, loading, onNavigate }: Props) {
  const alerts: { text: string; severity: 'high' | 'medium' }[] = []

  if (!loading) {
    if (stats.pendingFines > 0)
      alerts.push({ text: `${stats.pendingFines} unpaid fine${stats.pendingFines > 1 ? 's' : ''} pending`, severity: 'high' })
    if (stats.pendingSeats > 0)
      alerts.push({ text: `${stats.pendingSeats} seat booking${stats.pendingSeats > 1 ? 's' : ''} awaiting approval`, severity: 'medium' })
    if (stats.occupiedSeats / Math.max(stats.totalSeats, 1) > 0.85)
      alerts.push({ text: 'Seats above 85% capacity', severity: 'medium' })
    if (stats.availableBooks === 0 && stats.totalBooks > 0)
      alerts.push({ text: 'No books currently available', severity: 'high' })
  }

  return (
    <aside className="quick-actions">
      <h2>Quick Actions</h2>

      <div className="action-list">
        {[
          { label: 'Add Book',        page: 'Books',                icon: BookPlus   },
          { label: 'Update Seat Map', page: 'Seats & Reading Room', icon: LayoutGrid },
          { label: 'Collect Fine',    page: 'Reservations & Fines', icon: HandCoins  },
        ].map(({ label, page, icon: Icon }) => (
          <button className="action-btn" key={label} type="button" onClick={() => onNavigate(page)}>
            <span className="action-btn-icon"><Icon size={14} strokeWidth={2} /></span>
            {label}
          </button>
        ))}
      </div>

      {/* ── Live Alerts ── */}
      <div className="dash-alerts-section">
        <div className="dash-alerts-title">
          <AlertTriangle size={13} />
          <span>Live Alerts</span>
          {alerts.length > 0 && (
            <span className="dash-alert-count">{alerts.length}</span>
          )}
        </div>

        {loading ? (
          <p className="dash-alerts-loading">Checking alerts…</p>
        ) : alerts.length === 0 ? (
          <div className="dash-no-alerts">
            <span className="dash-no-alerts-dot" />
            All systems operational
          </div>
        ) : (
          <ul className="dash-alert-list">
            {alerts.map((a, i) => (
              <li key={i} className={`dash-alert-item dash-alert-${a.severity}`}>
                <span className="dash-alert-dot" />
                {a.text}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Occupancy mini bar ── */}
      {!loading && stats.totalSeats > 0 && (
        <div className="dash-occupancy">
          <div className="dash-occupancy-row">
            <span>Seat Occupancy</span>
            <span className="dash-occupancy-pct">
              {Math.round((stats.occupiedSeats / stats.totalSeats) * 100)}%
            </span>
          </div>
          <div className="dash-occupancy-track">
            <div
              className="dash-occupancy-fill"
              style={{ width: `${(stats.occupiedSeats / stats.totalSeats) * 100}%` }}
            />
          </div>
          <div className="dash-occupancy-sub">
            {stats.occupiedSeats} of {stats.totalSeats} seats occupied
          </div>
        </div>
      )}
    </aside>
  )
}

export default QuickActions
