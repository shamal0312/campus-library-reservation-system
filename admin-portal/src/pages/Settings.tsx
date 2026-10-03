import { useState } from 'react'
import { User } from 'lucide-react'

function Settings() {
  const [activeTab, setActiveTab] = useState('Profile')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true)

  const tabs = ['Profile', 'Account & Security', 'Notifications', 'System Settings']

  return (
    <main className="settings-page">
      <div className="page-heading">
        <div>
          <h1>Settings</h1>
          <p>Configure system parameters, fine rates, and administrator settings</p>
        </div>
      </div>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`settings-tab ${activeTab === tab ? 'settings-tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </aside>

        <div className="settings-content">
          {activeTab === 'Profile' && (
            <div className="settings-section">
              <h2 className="section-title">Administrator Profile</h2>
              
              <div className="profile-card">
                <div className="profile-avatar">
                  <User size={32} strokeWidth={1.5} />
                </div>
                <div className="profile-info">
                  <h3 className="profile-name">Admin User</h3>
                  <p className="profile-role">Head Librarian</p>
                  <p className="profile-email">admin@librarysystem.org</p>
                </div>
                <button className="edit-profile-button">Edit Profile</button>
              </div>

              <div className="settings-section">
                <h3 className="subsection-title">Account & Security</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="current-password" className="form-label">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="current-password"
                      className="form-input"
                      defaultValue="••••••••"
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="new-password" className="form-label">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="new-password"
                      className="form-input"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirm-password" className="form-label">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      className="form-input"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>

                <div className="toggle-setting">
                  <div className="toggle-info">
                    <h4 className="toggle-title">Two-Factor Authentication (2FA)</h4>
                    <p className="toggle-description">
                      Require authentication code from your authenticator app on logins
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={twoFactorEnabled}
                      onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h3 className="subsection-title">System Settings</h3>

                <div className="form-row form-row-two">
                  <div className="form-group">
                    <label htmlFor="library-name" className="form-label">
                      Library Name
                    </label>
                    <input
                      type="text"
                      id="library-name"
                      className="form-input"
                      defaultValue="City Central Library"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="operating-hours" className="form-label">
                      Operating Hours
                    </label>
                    <input
                      type="text"
                      id="operating-hours"
                      className="form-input"
                      defaultValue="08:00 AM - 08:00 PM"
                    />
                  </div>
                </div>

                <div className="form-row form-row-two">
                  <div className="form-group">
                    <label htmlFor="fine-rate" className="form-label">
                      Daily Fine Rate (Rs.)
                    </label>
                    <input
                      type="text"
                      id="fine-rate"
                      className="form-input"
                      defaultValue="Rs. 50 / day"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="max-books" className="form-label">
                      Max Books Per Student
                    </label>
                    <input
                      type="text"
                      id="max-books"
                      className="form-input"
                      defaultValue="5 books"
                    />
                  </div>
                </div>

                <div className="toggle-setting">
                  <div className="toggle-info">
                    <h4 className="toggle-title">Automatic Cloud Backups</h4>
                    <p className="toggle-description">
                      Automatically back up system databases and configurations daily at midnight
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={autoBackupEnabled}
                      onChange={(e) => setAutoBackupEnabled(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h3 className="subsection-title">Notification Rules</h3>
                <div className="settings-footer">
                  <button className="settings-button settings-button-secondary">Cancel</button>
                  <button className="settings-button settings-button-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Account & Security' && (
            <div className="settings-section">
              <h2 className="section-title">Account & Security</h2>
              <p className="text-muted">Manage your account security settings and password.</p>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="settings-section">
              <h2 className="section-title">Notifications</h2>
              <p className="text-muted">Configure notification preferences and alerts.</p>
            </div>
          )}

          {activeTab === 'System Settings' && (
            <div className="settings-section">
              <h2 className="section-title">System Settings</h2>
              <p className="text-muted">Configure library parameters and operational settings.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Settings
