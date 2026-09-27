import { Armchair, BarChart3, BookMarked, BookOpen, LayoutDashboard, Settings, Ticket, X } from 'lucide-react'

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Books', icon: BookMarked },
  { label: 'Seats & Reading Room', icon: Armchair },
  { label: 'Reservations & Fines', icon: Ticket },
  { label: 'Reports', icon: BarChart3 },
  { label: 'Settings', icon: Settings },
]

type SidebarProps = {
  isOpen?: boolean
  onClose?: () => void
}

function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  return (
    <aside className={`sidebar${isOpen ? ' is-open' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-left">
          <div className="sidebar-logo"><BookOpen size={15} strokeWidth={2.4} /></div>
          <span>LIBRARY <strong>ADMIN</strong></span>
        </div>
        {onClose && (
          <button className="sidebar-close-btn" type="button" onClick={onClose} aria-label="Close sidebar">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navigation.map(({ label, icon: Icon, active }) => (
          <button className={`nav-item${active ? ' active' : ''}`} key={label} type="button">
            <Icon size={16} strokeWidth={1.9} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="system-status">
        <p>SYSTEM STATUS</p>
        <span><i />&nbsp;All services operational</span>
      </div>
    </aside>
  )
}

export default Sidebar
