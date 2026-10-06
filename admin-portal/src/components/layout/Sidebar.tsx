import { Armchair, BarChart3, BookMarked, BookOpen, LayoutDashboard, Settings, Ticket, Users, X } from 'lucide-react'

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Books', icon: BookMarked },
  { label: 'Seats & Reading Room', icon: Armchair },
  { label: 'Reservations & Fines', icon: Ticket },
  { label: 'Reports', icon: BarChart3 },
  { label: 'User Management', icon: Users },
  { label: 'Settings', icon: Settings },
]

type SidebarProps = {
  isOpen?: boolean
  onClose?: () => void
  activePage: string
  onNavigate: (page: string) => void
}

function Sidebar({ isOpen = false, onClose, activePage, onNavigate }: SidebarProps) {
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
        {navigation.map(({ label, icon: Icon }) => (
          <button 
            className={`nav-item${activePage === label ? ' active' : ''}`} 
            key={label} 
            type="button"
            onClick={() => onNavigate(label)}
          >
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
