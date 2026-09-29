import { useEffect, useState } from 'react'
import './App.css'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import { supabase, checkIsAdmin } from './lib/supabase'
import Dashboard from './pages/Dashboard'
import Books from './pages/Books'
import Login from './Login'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('Dashboard')

  useEffect(() => {
    const syncAdminSession = async (currentSession: any = null) => {
      const session = currentSession || (await supabase.auth.getSession()).data.session
      if (session?.user) {
        const isAdminUser = await checkIsAdmin(session.user)
        setIsAdmin(isAdminUser)
      } else {
        setIsAdmin(false)
      }
      setIsLoading(false)
    }
    void syncAdminSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => void syncAdminSession(session))
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAdmin(false)
  }

  if (isLoading) return <main className="session-loading" aria-label="Loading admin session" />
  if (!isAdmin) return <Login />

  return (
    <div className="admin-layout">
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        activePage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page)
          setSidebarOpen(false)
        }}
      />
      <div className="admin-main">
        <Header
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        {currentPage === 'Dashboard' && <Dashboard />}
        {currentPage === 'Books' && <Books />}
        {currentPage !== 'Dashboard' && currentPage !== 'Books' && (
          <main className="dashboard-page">
            <div className="page-heading">
              <h1>{currentPage}</h1>
              <p>This page is under construction.</p>
            </div>
          </main>
        )}
      </div>
    </div>
  )
}

export default App
