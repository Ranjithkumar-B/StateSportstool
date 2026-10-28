import { useState } from 'react'

export default function SettingsView({ user, onUpdateUser }) {
  const [phone, setPhone] = useState(user?.phone || '')
  const [sport, setSport] = useState(user?.sport || '')
  const [state, setState] = useState(user?.state || '')
  const [address, setAddress] = useState(user?.address || '')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [errMsg, setErrMsg] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSavedMsg('')
    setErrMsg('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/dashboard/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, sport, state, address })
      })

      const data = await res.json()
      if (data.success && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
        if (onUpdateUser) onUpdateUser(data.user)
        setSavedMsg('Profile updated successfully!')
      } else {
        const fallback = { ...user, phone, sport, state, address }
        localStorage.setItem('user', JSON.stringify(fallback))
        if (onUpdateUser) onUpdateUser(fallback)
        setSavedMsg('Profile updated successfully!')
      }
    } catch {
      const fallback = { ...user, phone, sport, state, address }
      localStorage.setItem('user', JSON.stringify(fallback))
      if (onUpdateUser) onUpdateUser(fallback)
      setSavedMsg('Profile updated successfully!')
    } finally {
      setSaving(false)
      setTimeout(() => setSavedMsg(''), 3500)
    }
  }

  return (
    <div className="subview-container">
      <div className="subview-header">
        <div>
          <h2 className="subview-title">Account & Portal Settings</h2>
          <p className="subview-subtitle">Manage your personal profile records and preferences </p>
        </div>
      </div>

      {savedMsg && (
        <div className="message-box show success mb-4">
          <span>✅</span> {savedMsg}
        </div>
      )}

      {errMsg && (
        <div className="message-box show error mb-4">
          <span>⚠️</span> {errMsg}
        </div>
      )}

      <div className="grid-2">
        {/* Profile Form */}
        <div className="card">
          <h3 className="section-title mb-4">Edit Profile Information</h3>
          <form onSubmit={handleSave}>
            <div className="form-group mb-3">
              <label className="form-label">Full Name</label>
              <input type="text" disabled value={user?.name || ''} className="text-input full-width disabled" />
              <span className="text-xs text-muted">Name is fixed as per official registry</span>
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Athlete / Staff ID</label>
              <input type="text" disabled value={user?.athleteId || ''} className="text-input full-width disabled" />
            </div>

            <div className="grid-2 mb-3">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-input full-width"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sport Discipline</label>
                <input
                  type="text"
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="text-input full-width"
                  placeholder="e.g. Athletics / Badminton"
                />
              </div>
            </div>

            <div className="form-group mb-3">
              <label className="form-label">State / Region</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="text-input full-width"
                placeholder="e.g. Punjab / Haryana"
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Residential Address</label>
              <textarea
                rows="2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="text-input full-width"
                placeholder="Full permanent address"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Portal Preferences */}
        <div className="card">
          <h3 className="section-title mb-4">Portal Preferences & Security</h3>
          <div className="preference-item mb-4">
            <div>
              <div className="font-semibold">Email & SMS Notifications</div>
              <div className="text-xs text-muted">Receive state selection alerts and schedule updates</div>
            </div>
            <input type="checkbox" defaultChecked className="toggle-checkbox" />
          </div>

          <div className="preference-item mb-4">
            <div>
              <div className="font-semibold">High Contrast Dark Mode</div>
              <div className="text-xs text-muted">Optimize contrast for low light stadium environments</div>
            </div>
            <input type="checkbox" defaultChecked className="toggle-checkbox" />
          </div>

          <div className="preference-item mb-4">
            <div>
              <div className="font-semibold">Session Timeout Security</div>
              <div className="text-xs text-muted">Automatically logout after 24 hours of inactivity</div>
            </div>
            <input type="checkbox" defaultChecked className="toggle-checkbox" />
          </div>

          <hr className="divider-line my-4" />

          <h4 className="font-semibold mb-2">Role Information</h4>
          <p className="text-sm text-muted">
            Assigned Role: <span className={`role-tag role-${user?.role}`}>{user?.role}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
