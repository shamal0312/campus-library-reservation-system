import { Book, Armchair, Clock, CircleAlert } from 'lucide-react'

const stats = [
  {
    label: 'Total Books',
    value: '12,480',
    detail: '+124 this month',
    detailTone: 'positive',
    icon: Book,
  },
  {
    label: 'Active Seats Occupied',
    value: '86 / 120',
    detail: '72% capacity',
    detailTone: 'warning',
    icon: Armchair,
  },
  {
    label: 'Pending Reservations',
    value: '34',
    detail: '12 need review',
    detailTone: 'info',
    icon: Clock,
  },
  {
    label: 'Total Fines Due',
    value: 'Rs. 18,450',
    detail: 'From 63 students',
    detailTone: 'alert',
    icon: CircleAlert,
  },
]

function StatCards() {
  return (
    <section className="stats-grid" aria-label="Library statistics">
      {stats.map(({ label, value, detail, detailTone, icon: Icon }) => (
        <article className="stat-card" key={label}>
          <div className="stat-card-heading">
            <span>{label}</span>
            <div className="stat-icon"><Icon size={15} strokeWidth={2} /></div>
          </div>
          <strong className="stat-value">{value}</strong>
          <small className={`stat-detail ${detailTone}`}>{detail}</small>
        </article>
      ))}
    </section>
  )
}

export default StatCards
