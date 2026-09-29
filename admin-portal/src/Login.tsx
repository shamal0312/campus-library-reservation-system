import { useState } from 'react'
import type { FormEvent } from 'react'
import { AlertCircle, Eye, EyeOff, Library, LoaderCircle, LockKeyhole, Mail, Radio } from 'lucide-react'
import { supabase, checkIsAdmin } from './lib/supabase'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError || !data.user) {
      setError(signInError?.message || 'Unable to sign in. Please check your credentials.')
      setIsLoading(false)
      return
    }
    const isAdmin = await checkIsAdmin(data.user)
    if (!isAdmin) {
      await supabase.auth.signOut()
      setError('Access Denied: Student accounts must use the mobile application.')
    }
    setIsLoading(false)
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-label="Library Admin sign in">
        <div className="brand-panel">
          <div className="brand-mark"><Library size={25} strokeWidth={2.2} /></div>
          <div className="brand-name">LIBRARY <span>ADMIN</span></div>
          <div className="status-pill"><Radio size={13} /> System operational</div>
          <div className="brand-footer"><p>One secure place to manage your library.</p><span>Staff access portal</span></div>
        </div>
        <div className="form-panel">
          <div className="form-heading"><p className="form-kicker">Staff access</p><h1>Welcome back</h1><p>Sign in to continue to your dashboard.</p></div>
          {error && <div className="error-alert" role="alert"><AlertCircle size={18} /><span>{error}</span></div>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email address</label>
            <div className="input-wrap"><Mail size={18} /><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@library.com" required /></div>
            <label htmlFor="password">Password</label>
            <div className="input-wrap"><LockKeyhole size={18} /><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /><button className="visibility-button" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            <button className="sign-in-button" type="submit" disabled={isLoading}>{isLoading && <LoaderCircle className="spin" size={19} />}{isLoading ? 'Signing in...' : 'Sign in to dashboard'}</button>
          </form>
          <div className="demo-card"><div><span className="demo-label">Demo access</span><strong>Use the sample staff account</strong></div><code>admin@library.com<br />AdminPassword123</code></div>
          <p className="security-note">Protected staff area · Library Services</p>
        </div>
      </section>
    </main>
  )
}

export default Login