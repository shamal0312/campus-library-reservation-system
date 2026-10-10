import { Armchair, Book, CircleAlert, Clock } from 'lucide-react'
import type { DashboardStats } from '../../pages/Dashboard'

interface Props {
  stats:   DashboardStats
  loading: boolean
}

function StatCards({ stats, loading }: Props) {
  const occupancyPct = stats.totalSeats > 0
    ? Math.round((stats.occupiedSeats / stats.totalSeats) * 100)
    : 0

  const cards = [
    {
      label:     'Total Books',
      value:     stats.totalBooks.toLocaleString(),
      detail:    `${stats.availableBooks.toLocaleString()} available`,
      detailTone: 'positive',
      icon:      Book,
    },
    {
      label:     'Seats Occupied',
      value:     `${stats.occupiedSeats} / ${stats.totalSeats}`,
      detail:    `${occupancyPct}% capacity${stats.pendingSeats > 0 ? ` · ${stats.pendingSeats} pending` : ''}`,
      detailTone: occupancyPct > 80 ? 'alert' : 'warning',
      icon:      Armchair,
    },
    {
      label:     'Active Reservations',
      value:     stats.totalReservations.toLocaleString(),
      detail:    stats.pendingSeats > 0 ? `${stats.pendingSeats} need approval` : 'All up to date',
      detailTone: stats.pendingSeats > 0 ? 'info' : 'positive',
      icon:      Clock,
    },
    {
      label:     'Total Fines Due',
      value:     `Rs. ${stats.fineAmount.toLocaleString()}`,
      detail:    `From ${stats.pendingFines} student${stats.pendingFines !== 1 ? 's' : ''}`,
      detailTone: stats.pendingFines > 0 ? 'alert' : 'positive',
      icon:      CircleAlert,
    },
  ]

  return (
    <section className="stats-grid" aria-label="Library statistics">
      {cards.map(({ label, value, detail, detailTone, icon: Icon }) => (
        <article className="stat-card" key={label}>
          <div className="stat-card-heading">
            <span>{label}</span>
            <div className="stat-icon"><Icon size={15} strokeWidth={2} /></div>
          </div>
          {loading
            ? <div className="stat-skeleton" />
            : <strong className="stat-value">{value}</strong>
          }
          <small className={`stat-detail ${detailTone}`}>{detail}</small>
        </article>
      ))}
    </section>
  )
}

export default StatCards
