import {
    AlertTriangle,
    Bell,
    Check,
    ChevronRight,
    Eye,
    EyeOff,
    Loader,
    Lock,
    LogOut,
    Save,
    Settings as SettingsIcon,
    Shield,
    User,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Profile {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  created_at: string | null
}

interface SystemSettings {
  library_name: string
  operating_hours: string
  fine_rate: string
  max_books: string
  max_seat_duration: string
  reservation_lead_days: string
}

interface NotifSettings {
  overdue_alerts: boolean
  new_reservation: boolean
  fine_payment: boolean
  seat_booking: boolean
  daily_report: boolean
  low_stock_alert: boolean
}

const SETTINGS_KEY = 'lib_system_settings'
const NOTIF_KEY    = 'lib_notif_settings'

const defaultSystem: SystemSettings = {
  library_name:          'Campus Library',
  operating_hours:       '08:00 AM - 08:00 PM',
  fine_rate:             '50',
  max_books:             '5',
  max_seat_duration:     '4',
  reservation_lead_days: '7',
}

const defaultNotif: NotifSettings = {
  overdue_alerts:   true,
  new_reservation:  true,
  fine_payment:     true,
  seat_booking:     false,
  daily_report:     false,
  low_stock_alert:  true,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...(JSON.parse(raw) as Partial<T>) } : fallback
  } catch { return fallback }
}

function avatarInitials(name: string | null) {
  if (!name) return 'A'
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

// ── Component ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'profile',     label: 'Profile',             icon: <User      size={15} /> },
  { id: 'security',    label: 'Account & Security',  icon: <Shield    size={15} /> },
  { id: 'notif',       label: 'Notifications',        icon: <Bell      size={15} /> },
  { id: 'system',      label: 'System Settings',      icon: <SettingsIcon size={15} /> },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')

  // ── Profile state ──────────────────────────────────────────────────────────
  const [profile, setProfile]           = useState<Profile | null>(null)
  const [profileForm, setProfileForm]   = useState({ full_name: '', email: '' })
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving]   = useState(false)
  const [profileMsg, setProfileMsg]         = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const profileMsgTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Security state ─────────────────────────────────────────────────────────
  const [pwForm, setPwForm]     = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw]     = useState({ current: false, next: false, confirm: false })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg]       = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const pwMsgTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Notification state ─────────────────────────────────────────────────────
  const [notif, setNotif]           = useState<NotifSettings>(() => loadLocal(NOTIF_KEY, defaultNotif))
  const [notifSaving, setNotifSaving] = useState(false)
  const [notifMsg, setNotifMsg]       = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // ── System settings state ──────────────────────────────────────────────────
  const [sysForm, setSysForm]         = useState<SystemSettings>(() => loadLocal(SETTINGS_KEY, defaultSystem))
  const [sysSaving, setSysSaving]     = useState(false)
  const [sysMsg, setSysMsg]           = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const sysMsgTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Load profile on mount ──────────────────────────────────────────────────

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setProfileLoading(false); return }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (!error && data) {
        setProfile(data as Profile)
        setProfileForm({ full_name: data.full_name ?? '', email: data.email ?? user.email ?? '' })
      } else {
        // Fallback to auth user data if profiles table not accessible
        setProfileForm({ full_name: user.user_metadata?.full_name ?? '', email: user.email ?? '' })
      }
    } catch { /* ignore */ }
    finally { setProfileLoading(false) }
  }, [])

  useEffect(() => { void fetchProfile() }, [fetchProfile])

  // ── Helpers for flash messages ─────────────────────────────────────────────

  function flashMsg(
    setter: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error'; text: string } | null>>,
    timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
    type: 'success' | 'error',
    text: string,
  ) {
    setter({ type, text })
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setter(null), 4000)
  }

  // ── Save handlers ──────────────────────────────────────────────────────────

  const saveProfile = async () => {
    if (!profileForm.full_name.trim()) {
      flashMsg(setProfileMsg, profileMsgTimer, 'error', 'Full name is required.')
      return
    }
    setProfileSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated.')

      // Update profile table
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: profileForm.full_name.trim(), email: profileForm.email.trim() })
        .eq('id', user.id)
      if (error) throw error

      // Also update auth metadata
      await supabase.auth.updateUser({ data: { full_name: profileForm.full_name.trim() } })

      setProfile(prev => prev ? { ...prev, full_name: profileForm.full_name.trim(), email: profileForm.email.trim() } : prev)
      flashMsg(setProfileMsg, profileMsgTimer, 'success', 'Profile updated successfully.')
    } catch (e: unknown) {
      flashMsg(setProfileMsg, profileMsgTimer, 'error', e instanceof Error ? e.message : 'Failed to save profile.')
    } finally { setProfileSaving(false) }
  }

  const savePassword = async () => {
    if (!pwForm.next.trim()) {
      flashMsg(setPwMsg, pwMsgTimer, 'error', 'New password cannot be empty.')
      return
    }
    if (pwForm.next.length < 8) {
      flashMsg(setPwMsg, pwMsgTimer, 'error', 'Password must be at least 8 characters.')
      return
    }
    if (pwForm.next !== pwForm.confirm) {
      flashMsg(setPwMsg, pwMsgTimer, 'error', 'Passwords do not match.')
      return
    }
    setPwSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.next })
      if (error) throw error
      setPwForm({ current: '', next: '', confirm: '' })
      flashMsg(setPwMsg, pwMsgTimer, 'success', 'Password updated successfully.')
    } catch (e: unknown) {
      flashMsg(setPwMsg, pwMsgTimer, 'error', e instanceof Error ? e.message : 'Failed to update password.')
    } finally { setPwSaving(false) }
  }

  const saveNotif = () => {
    setNotifSaving(true)
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(notif))
      setNotifMsg({ type: 'success', text: 'Notification preferences saved.' })
      setTimeout(() => setNotifMsg(null), 4000)
    } catch {
      setNotifMsg({ type: 'error', text: 'Failed to save preferences.' })
    } finally { setNotifSaving(false) }
  }

  const saveSystem = () => {
    if (!sysForm.library_name.trim()) {
      flashMsg(setSysMsg, sysMsgTimer, 'error', 'Library name is required.')
      return
    }
    const fineRate = Number(sysForm.fine_rate)
    const maxBooks = Number(sysForm.max_books)
    if (isNaN(fineRate) || fineRate < 0) {
      flashMsg(setSysMsg, sysMsgTimer, 'error', 'Fine rate must be a positive number.')
      return
    }
    if (isNaN(maxBooks) || maxBooks < 1) {
      flashMsg(setSysMsg, sysMsgTimer, 'error', 'Max books must be at least 1.')
      return
    }
    setSysSaving(true)
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(sysForm))
      flashMsg(setSysMsg, sysMsgTimer, 'success', 'System settings saved.')
    } catch {
      flashMsg(setSysMsg, sysMsgTimer, 'error', 'Failed to save settings.')
    } finally { setSysSaving(false) }
  }

  const handleSignOut = async () => {
    if (!confirm('Are you sure you want to sign out?')) return
    await supabase.auth.signOut()
    window.location.reload()
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="settings-page">
      <div className="page-heading">
        <div>
          <h1>Settings</h1>
          <p>Manage your profile, security, and library system configuration</p>
        </div>
      </div>

      <div className="settings-layout">

        {/* ── Sidebar ── */}
        <aside className="settings-sidebar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'settings-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="settings-tab-icon">{tab.icon}</span>
              {tab.label}
              <ChevronRight size={14} className="settings-tab-arrow" />
            </button>
          ))}

          <div className="settings-sidebar-divider" />

          <button className="settings-tab settings-tab-danger" onClick={() => void handleSignOut()}>
            <span className="settings-tab-icon"><LogOut size={15} /></span>
            Sign Out
          </button>
        </aside>

        {/* ── Content ── */}
        <div className="settings-content">

          {/* ═══════════════════════════ PROFILE ═══════════════════════════ */}
          {activeTab === 'profile' && (
            <div className="stab-panel">
              <div className="stab-panel-header">
                <h2>Administrator Profile</h2>
                <p>Update your name and contact email displayed in the system</p>
              </div>

              {profileLoading ? (
                <div className="stab-loading"><Loader size={22} className="spin" /> Loading profile…</div>
              ) : (
                <>
                  {/* Avatar card */}
                  <div className="profile-card">
                    <div className="profile-avatar settings-avatar">
                      {avatarInitials(profileForm.full_name || profile?.full_name || null)}
                    </div>
                    <div className="profile-info">
                      <h3 className="profile-name">{profileForm.full_name || 'Admin User'}</h3>
                      <p className="profile-role">{profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Administrator'}</p>
                      <p className="profile-email">{profileForm.email || '—'}</p>
                    </div>
                    {profile?.created_at && (
                      <div className="profile-joined">
                        Member since {new Date(profile.created_at).toLocaleDateString([], { month: 'long', year: 'numeric' })}
                      </div>
                    )}
                  </div>

                  {profileMsg && (
                    <div className={`stab-msg stab-msg-${profileMsg.type}`}>
                      {profileMsg.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
                      {profileMsg.text}
                    </div>
                  )}

                  <div className="settings-section">
                    <h3 className="subsection-title">Personal Information</h3>
                    <div className="form-row form-row-two">
                      <div className="form-group">
                        <label htmlFor="s-name" className="form-label">Full Name <span className="required">*</span></label>
                        <input
                          id="s-name"
                          className="form-input"
                          placeholder="Your full name"
                          value={profileForm.full_name}
                          onChange={e => setProfileForm(f => ({ ...f, full_name: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="s-email" className="form-label">Email Address</label>
                        <input
                          id="s-email"
                          className="form-input"
                          type="email"
                          placeholder="your@email.com"
                          value={profileForm.email}
                          onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="settings-footer">
                    <button
                      className="settings-button settings-button-secondary"
                      onClick={() => void fetchProfile()}
                      disabled={profileSaving}
                    >
                      Reset
                    </button>
                    <button
                      className="settings-button settings-button-primary"
                      onClick={() => void saveProfile()}
                      disabled={profileSaving}
                    >
                      {profileSaving
                        ? <><Loader size={14} className="spin" style={{ marginRight: 6 }} />Saving…</>
                        : <><Save size={14} style={{ marginRight: 6 }} />Save Profile</>
                      }
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ═══════════════════════════ SECURITY ══════════════════════════ */}
          {activeTab === 'security' && (
            <div className="stab-panel">
              <div className="stab-panel-header">
                <h2>Account &amp; Security</h2>
                <p>Change your password and manage login security</p>
              </div>

              {pwMsg && (
                <div className={`stab-msg stab-msg-${pwMsg.type}`}>
                  {pwMsg.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
                  {pwMsg.text}
                </div>
              )}

              <div className="settings-section">
                <h3 className="subsection-title">Change Password</h3>
                <div className="form-row form-row-one">
                  {(
                    [
                      { id: 'pw-current', key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                      { id: 'pw-new',     key: 'next',    label: 'New Password',     placeholder: 'Minimum 8 characters'   },
                      { id: 'pw-confirm', key: 'confirm', label: 'Confirm Password', placeholder: 'Re-enter new password'  },
                    ] as const
                  ).map(f => (
                    <div className="form-group" key={f.key}>
                      <label htmlFor={f.id} className="form-label">{f.label}</label>
                      <div className="pw-input-wrap">
                        <input
                          id={f.id}
                          className="form-input pw-input"
                          type={showPw[f.key] ? 'text' : 'password'}
                          placeholder={f.placeholder}
                          value={pwForm[f.key]}
                          onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                          autoComplete={f.key === 'current' ? 'current-password' : 'new-password'}
                        />
                        <button
                          type="button"
                          className="pw-toggle-btn"
                          onClick={() => setShowPw(s => ({ ...s, [f.key]: !s[f.key] }))}
                          aria-label={showPw[f.key] ? 'Hide password' : 'Show password'}
                        >
                          {showPw[f.key] ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pw-strength-hints">
                  {[
                    { ok: pwForm.next.length >= 8,                          label: 'At least 8 characters' },
                    { ok: /[A-Z]/.test(pwForm.next),                         label: 'Uppercase letter'      },
                    { ok: /[0-9]/.test(pwForm.next),                         label: 'Number'                },
                    { ok: pwForm.next !== '' && pwForm.next === pwForm.confirm, label: 'Passwords match'       },
                  ].map(h => (
                    <span key={h.label} className={`pw-hint ${h.ok ? 'pw-hint-ok' : ''}`}>
                      <Check size={11} /> {h.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="settings-section">
                <h3 className="subsection-title">Session</h3>
                <div className="stab-info-row">
                  <Lock size={15} />
                  <span>Your session is secured with Supabase Auth. Signing out will clear all local session data.</span>
                </div>
              </div>

              <div className="settings-footer">
                <button
                  className="settings-button settings-button-secondary"
                  onClick={() => setPwForm({ current: '', next: '', confirm: '' })}
                  disabled={pwSaving}
                >
                  Clear
                </button>
                <button
                  className="settings-button settings-button-primary"
                  onClick={() => void savePassword()}
                  disabled={pwSaving}
                >
                  {pwSaving
                    ? <><Loader size={14} className="spin" style={{ marginRight: 6 }} />Updating…</>
                    : <><Lock size={14} style={{ marginRight: 6 }} />Update Password</>
                  }
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════ NOTIFICATIONS ══════════════════════ */}
          {activeTab === 'notif' && (
            <div className="stab-panel">
              <div className="stab-panel-header">
                <h2>Notification Preferences</h2>
                <p>Choose which events trigger in-app and email alerts</p>
              </div>

              {notifMsg && (
                <div className={`stab-msg stab-msg-${notifMsg.type}`}>
                  {notifMsg.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
                  {notifMsg.text}
                </div>
              )}

              <div className="settings-section">
                <h3 className="subsection-title">Library Events</h3>
                {(
                  [
                    { key: 'overdue_alerts',  label: 'Overdue Book Alerts',        desc: 'Notify when borrowed books pass their due date'              },
                    { key: 'new_reservation', label: 'New Reservations',            desc: 'Notify when a student creates a new book or seat reservation' },
                    { key: 'fine_payment',    label: 'Fine Payments',               desc: 'Notify when a fine is paid or waived'                        },
                    { key: 'seat_booking',    label: 'Seat Booking Requests',       desc: 'Notify when a student requests a reading room seat'           },
                    { key: 'low_stock_alert', label: 'Low Book Stock',              desc: 'Notify when available copies drop to zero'                   },
                  ] as { key: keyof NotifSettings; label: string; desc: string }[]
                ).map(n => (
                  <div key={n.key} className="toggle-setting">
                    <div className="toggle-info">
                      <h4 className="toggle-title">{n.label}</h4>
                      <p className="toggle-description">{n.desc}</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notif[n.key]}
                        onChange={e => setNotif(prev => ({ ...prev, [n.key]: e.target.checked }))}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="settings-section">
                <h3 className="subsection-title">Reports</h3>
                <div className="toggle-setting">
                  <div className="toggle-info">
                    <h4 className="toggle-title">Daily Summary Report</h4>
                    <p className="toggle-description">Receive a daily digest of checkouts, returns, and fines each morning</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notif.daily_report}
                      onChange={e => setNotif(prev => ({ ...prev, daily_report: e.target.checked }))}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-footer">
                <button
                  className="settings-button settings-button-secondary"
                  onClick={() => setNotif(defaultNotif)}
                >
                  Reset to Defaults
                </button>
                <button
                  className="settings-button settings-button-primary"
                  onClick={saveNotif}
                  disabled={notifSaving}
                >
                  {notifSaving
                    ? <><Loader size={14} className="spin" style={{ marginRight: 6 }} />Saving…</>
                    : <><Save size={14} style={{ marginRight: 6 }} />Save Preferences</>
                  }
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════ SYSTEM ═════════════════════════════ */}
          {activeTab === 'system' && (
            <div className="stab-panel">
              <div className="stab-panel-header">
                <h2>System Settings</h2>
                <p>Configure library operational parameters and rules</p>
              </div>

              {sysMsg && (
                <div className={`stab-msg stab-msg-${sysMsg.type}`}>
                  {sysMsg.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
                  {sysMsg.text}
                </div>
              )}

              <div className="settings-section">
                <h3 className="subsection-title">Library Information</h3>
                <div className="form-row form-row-two">
                  <div className="form-group">
                    <label htmlFor="sys-name" className="form-label">Library Name <span className="required">*</span></label>
                    <input
                      id="sys-name"
                      className="form-input"
                      placeholder="e.g. Campus Central Library"
                      value={sysForm.library_name}
                      onChange={e => setSysForm(f => ({ ...f, library_name: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sys-hours" className="form-label">Operating Hours</label>
                    <input
                      id="sys-hours"
                      className="form-input"
                      placeholder="e.g. 08:00 AM – 08:00 PM"
                      value={sysForm.operating_hours}
                      onChange={e => setSysForm(f => ({ ...f, operating_hours: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3 className="subsection-title">Borrowing Rules</h3>
                <div className="form-row form-row-two">
                  <div className="form-group">
                    <label htmlFor="sys-fine" className="form-label">Daily Fine Rate (Rs.)</label>
                    <div className="input-prefix-wrap">
                      <span className="input-prefix">Rs.</span>
                      <input
                        id="sys-fine"
                        className="form-input input-with-prefix"
                        type="number"
                        min="0"
                        placeholder="50"
                        value={sysForm.fine_rate}
                        onChange={e => setSysForm(f => ({ ...f, fine_rate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="sys-maxbooks" className="form-label">Max Books Per Student</label>
                    <div className="input-suffix-wrap">
                      <input
                        id="sys-maxbooks"
                        className="form-input input-with-suffix"
                        type="number"
                        min="1"
                        max="20"
                        placeholder="5"
                        value={sysForm.max_books}
                        onChange={e => setSysForm(f => ({ ...f, max_books: e.target.value }))}
                      />
                      <span className="input-suffix">books</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="sys-seatdur" className="form-label">Max Seat Duration (hrs)</label>
                    <div className="input-suffix-wrap">
                      <input
                        id="sys-seatdur"
                        className="form-input input-with-suffix"
                        type="number"
                        min="1"
                        max="12"
                        placeholder="4"
                        value={sysForm.max_seat_duration}
                        onChange={e => setSysForm(f => ({ ...f, max_seat_duration: e.target.value }))}
                      />
                      <span className="input-suffix">hrs</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="sys-lead" className="form-label">Reservation Lead Time (days)</label>
                    <div className="input-suffix-wrap">
                      <input
                        id="sys-lead"
                        className="form-input input-with-suffix"
                        type="number"
                        min="1"
                        max="30"
                        placeholder="7"
                        value={sysForm.reservation_lead_days}
                        onChange={e => setSysForm(f => ({ ...f, reservation_lead_days: e.target.value }))}
                      />
                      <span className="input-suffix">days</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-footer">
                <button
                  className="settings-button settings-button-secondary"
                  onClick={() => setSysForm(loadLocal(SETTINGS_KEY, defaultSystem))}
                  disabled={sysSaving}
                >
                  Reset
                </button>
                <button
                  className="settings-button settings-button-primary"
                  onClick={saveSystem}
                  disabled={sysSaving}
                >
                  {sysSaving
                    ? <><Loader size={14} className="spin" style={{ marginRight: 6 }} />Saving…</>
                    : <><Save size={14} style={{ marginRight: 6 }} />Save Settings</>
                  }
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
