import { AlertTriangle, BookPlus, LayoutGrid, HandCoins } from 'lucide-react'

const actions = [
  { label: 'Add Book',        icon: BookPlus    },
  { label: 'Update Seat Map', icon: LayoutGrid  },
  { label: 'Collect Fine',    icon: HandCoins   },
] as const

function QuickActions() {
  return (
    <aside className="quick-actions">
      <h2>Quick Actions</h2>

      <div className="action-list">
        {actions.map(({ label, icon: Icon }) => (
          <button className="action-btn" key={label} type="button">
            <span className="action-btn-icon"><Icon size={14} strokeWidth={2} /></span>
            {label}
          </button>
        ))}
      </div>

      <div className="attention-card">
        <div className="attention-title">
          <AlertTriangle size={13} strokeWidth={2} />
          Attention
        </div>
        <p>7 overdue reservations require action today.</p>
        <button className="review-btn" type="button">Review now</button>
      </div>
    </aside>
  )
}

export default QuickActions
