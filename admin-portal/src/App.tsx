import { useEffect, useState } from 'react'
import './App.css'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import { supabase } from './lib/supabase'
import Dashboard from './pages/Dashboard'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const syncAdminSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
        setIsAdmin(profile?.role === 'admin')
      } else setIsAdmin(false)
      setIsLoading(false)
    }
    void syncAdminSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => void syncAdminSession())
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = () => setIsAdmin(false)

  //if (isLoading) return <main className="session-loading" aria-label="Loading admin session" />
  //if (!isAdmin) return <Login />

  return (
    <div className="admin-layout">
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main">
        <Header
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <Dashboard />
      </div>
    </div>
  )
}

export default App
