import { ArrowRight, Loader, RefreshCw } from 'lucide-react'
import type { ActivityRow } from '../../pages/Dashboard'

interface Props {
  rows:      ActivityRow[]
  loading:   boolean
  onRefresh: () => void
}

function statusTone(status: string, type: 'reservation' | 'fine'): string {
  if (type === 'fine') return 'rose'
  const s = status.toLowerCase()
  if (s === 'reserved'  || s === 'pending')   return 'blue'
  if (s === 'completed' || s === 'returned')  return 'emerald'
  if (s === 'cancelled' || s === 'rejected')  return 'slate'
  if (s === 'occupied')                       return 'amber'
  return 'blue'
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

function RecentActivityTable({ rows, loading, onRefresh }: Props) {
  return (
    <section className="activity-card">
      <div className="widget-heading">
        <h2>Recent Activity</h2>
        <button
          className="dash-icon-btn"
          onClick={onRefresh}
          aria-label="Refresh activity"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <div className="dash-table-loading">
          <Loader size={22} className="spin" />
          <span>Loading activity…</span>
        </div>
      ) : rows.length === 0 ? (
        <div className="dash-table-empty">
          <p>No recent activity found.</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Item</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
                  <td className="student-name">{row.student}</td>
                  <td className="dash-item-cell" title={row.item}>
                    {row.item.length > 28 ? row.item.slice(0, 28) + '…' : row.item}
                  </td>
                  <td>
                    <span className={`status-tag ${statusTone(row.status, row.type)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="dash-date-cell">{fmtDate(row.createdAt)}</td>
                  <td>
                    <button className="view-button" type="button">
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default RecentActivityTable
