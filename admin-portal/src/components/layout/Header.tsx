import { Bell, ChevronDown, Menu, Search } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

type HeaderProps = {
  onLogout: () => void
  onToggleSidebar?: () => void
}

function Header({ onLogout, onToggleSidebar }: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout()
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} strokeWidth={2} />
        </button>
        <div className="search-box">
          <Search size={15} />
          <input aria-label="Search library" placeholder="Search books, students, reservations..." />
        </div>
      </div>
      <div className="topbar-actions">
        <button className="notification-button" type="button" aria-label="Notifications">
          <Bell size={18} />
          <i />
        </button>
        <div className="profile-wrap">
          <button
            className="profile-button"
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
          >
            <span className="avatar">AU</span>
            <span className="profile-copy">
              <strong>Admin User</strong>
              <small>Head Librarian ▾</small>
            </span>
            <ChevronDown size={14} strokeWidth={2} />
          </button>
          {profileOpen && (
            <div className="profile-menu">
              <button type="button" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
