import { useEffect, useState } from 'react'
import { LogOut, ShieldCheck } from 'lucide-react'
import { supabase } from './lib/supabase'
import Login from './Login'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAdmin(false)
  }

  if (isLoading) return <main className="session-loading" aria-label="Loading admin session" />
  if (!isAdmin) return <Login />

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card">
        <div className="dashboard-icon"><ShieldCheck size={24} /></div>
        <p className="eyebrow">Library Admin</p>
        <h1>Welcome back.</h1>
        <p className="dashboard-copy">Your administrative workspace is ready for today.</p>
        <button className="logout-button" type="button" onClick={handleLogout}><LogOut size={17} />Sign out</button>
      </section>
    </main>
  )
}

export default App
