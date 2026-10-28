import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import UserManagement from '../components/UserManagement'
import SelectionPanel from '../components/SelectionPanel'
import CoachHub from '../components/CoachHub'
import AthleteHub from '../components/AthleteHub'
import ReportsView from '../components/ReportsView'
import SettingsView from '../components/SettingsView'
import Leaderboard from '../components/Leaderboard'
import BiomechanicalPoseLab from '../components/BiomechanicalPoseLab'
import DocumentReview from '../components/DocumentReview'
import NotificationBell from '../components/NotificationBell'
import '../styles/dashboard.css'

// ======================== NAV CONFIG PER ROLE ========================
const poseIcon = <path d="M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm-6 9a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-3h-2v10a1 1 0 0 1-2 0V16h-1v6a1 1 0 0 1-2 0V12H7a1 1 0 0 1-1-1z"/>

const navConfig = {
  admin: [
    { label: 'Dashboard', icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></> },
    { label: 'Biomechanical Analyzer', icon: poseIcon },
    { label: 'User Management', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
    { label: 'Reports', icon: <><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></> },
    { label: 'Leaderboard', icon: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></> },
    { label: 'Settings', icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></> }
  ],
  selector: [
    { label: 'Dashboard', icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></> },
    { label: 'Selection Panel', icon: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></> },
    { label: 'Reports', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></> },
    { label: 'Leaderboard', icon: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></> },
    { label: 'Settings', icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></> }
  ],
  coach: [
    { label: 'Dashboard', icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></> },
    { label: 'Biomechanical Analyzer', icon: poseIcon },
    { label: 'Training Schedule', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
    { label: 'My Athletes', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></> },
    { label: 'Document Review', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></> },
    { label: 'Reports', icon: <><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></> },
    { label: 'Leaderboard', icon: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></> },
    { label: 'Settings', icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></> }
  ],
  athlete: [
    { label: 'Dashboard', icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></> },
    { label: 'Biomechanical Analyzer', icon: poseIcon },
    { label: 'My Performance', icon: <><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></> },
    { label: 'Leaderboard', icon: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></> },
    { label: 'Settings', icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></> }
  ]
}



const statIcons = [
  { cls: 'gold', svg: <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></> },
  { cls: 'blue', svg: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></> },
  { cls: 'green', svg: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></> },
  { cls: 'purple', svg: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></> }
]

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}

function formatLabel(camelCase) {
  return camelCase.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

function formatDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [dashData, setDashData] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Dashboard')

  // Document Vault state
  const [vaultDocs, setVaultDocs] = useState([])
  const [uploadDocType, setUploadDocType] = useState('Birth Certificate')
  const [uploadSending, setUploadSending] = useState(false)
  const [assignedCoach, setAssignedCoach] = useState(null)
  const [coachSessions, setCoachSessions] = useState([])
  const [coachSquad, setCoachSquad] = useState([])
  const [selectorCandidates, setSelectorCandidates] = useState([])

  // Fetch coach and selector live operational feeds
  useEffect(() => {
    if (!user) return
    const token = localStorage.getItem('token')
    if (!token) return
    const headers = { 'Authorization': `Bearer ${token}` }

    if (user.role === 'coach') {
      fetch('/api/trainings', { headers })
        .then(r => r.json())
        .then(d => { if (d.success && Array.isArray(d.sessions)) setCoachSessions(d.sessions) })
        .catch(() => {})

      fetch('/api/squads', { headers })
        .then(r => r.json())
        .then(d => { if (d.success && Array.isArray(d.squad)) setCoachSquad(d.squad) })
        .catch(() => {})
    } else if (user.role === 'selector') {
      fetch('/api/candidates', { headers })
        .then(r => r.json())
        .then(d => { if (d.success && Array.isArray(d.candidates)) setSelectorCandidates(d.candidates) })
        .catch(() => {})
    } else if (user.role === 'athlete') {
      fetch('/api/squads', { headers })
        .then(r => r.json())
        .then(data => {
          if (data.success && Array.isArray(data.squad)) {
            const myAssignment = data.squad.find(
              s => (s.athleteId && s.athleteId.toLowerCase() === (user.athleteId || '').toLowerCase()) || 
                   (s.name && s.name.toLowerCase() === (user.name || '').toLowerCase())
            )
            if (myAssignment && myAssignment.coachName) {
              setAssignedCoach(myAssignment.coachName)
            }
          }
        })
        .catch(() => {})
    }
  }, [user])

  useEffect(() => {
    if (dashData?.dashboard?.assignedCoach) {
      setAssignedCoach(dashData.dashboard.assignedCoach)
    } else if (dashData?.user?.assignedCoach) {
      setAssignedCoach(dashData.user.assignedCoach)
    }
  }, [dashData])

  const fetchVaultDocs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/kyc/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setVaultDocs(data.documents || [])
    } catch {
      setVaultDocs([])
    }
  }, [])

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token')
    const stored = localStorage.getItem('user')
    if (!token || !stored) {
      navigate('/', { replace: true })
      return
    }
    try {
      setUser(JSON.parse(stored))
    } catch {
      localStorage.clear()
      navigate('/', { replace: true })
    }
  }, [navigate])

  // Fetch dashboard data
  useEffect(() => {
    if (!user) return

    const fetchDash = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (res.status === 401) {
          localStorage.clear()
          navigate('/', { replace: true })
          return
        }

        const data = await res.json()
        if (data.success) setDashData(data)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      }
    }

    fetchDash()
  }, [user, navigate])

  // Fetch vault docs for athlete
  useEffect(() => {
    if (user && user.role === 'athlete') fetchVaultDocs()
  }, [user, fetchVaultDocs])

  // GSAP entrance (with StrictMode context cleanup)
  useEffect(() => {
    if (!user) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo('.sidebar', { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 })
      
      // Only animate dashboard elements if we are on the Dashboard view
      if (activeTab === 'Dashboard') {
        const welcomeEl = document.querySelector('.welcome-section')
        if (welcomeEl) {
          tl.fromTo('.welcome-section', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.3')
          if (document.querySelectorAll('.stat-card').length) {
            tl.fromTo('.stat-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.4 }, '-=0.2')
          }
          if (document.querySelectorAll('.exec-action-card').length) {
            tl.fromTo('.exec-action-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.4 }, '-=0.2')
          }
          if (document.querySelector('.profile-section')) {
            tl.fromTo('.profile-section', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, '-=0.2')
          }
        }
      }
    })

    return () => ctx.revert()
  }, [user, dashData, activeTab])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/', { replace: true })
  }

  if (!user) return null

  const role = user.role || 'athlete'
  const navItems = navConfig[role] || navConfig.athlete
  const dashboard = dashData?.dashboard || {}
  const profileUser = dashData?.user || user
  const stats = dashboard.stats ? Object.entries(dashboard.stats) : []

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Biomechanical Analyzer':
      case 'Biomechanical Pose Lab':
      case 'AI Innovation Hub':
        return <BiomechanicalPoseLab currentUser={user} />
      case 'User Management':
        return <UserManagement currentUser={profileUser} />
      case 'Selection Panel':
      case 'Athletes':
        return <SelectionPanel />
      case 'Training Schedule':
      case 'My Athletes':
      case 'Performance':
        return <CoachHub currentView={activeTab} />
      case 'Document Review':
        return <DocumentReview />
      case 'My Performance':
      case 'Schedule':
      case 'Selection Status':
        return <AthleteHub currentUser={profileUser} assignedCoach={assignedCoach} />
      case 'Reports':
        return <ReportsView />
      case 'Leaderboard':
        return <Leaderboard />
      case 'Settings':
        return <SettingsView user={user} onUpdateUser={setUser} />
      case 'Dashboard':
      default:
        return (
          <>
            {/* Welcome */}
            <section className="welcome-section">
              <div className="welcome-text">
                <h1>Welcome back, {user.name} <span className="welcome-wave">👋</span></h1>
                {role === 'athlete' && (
                  <div className="faculty-badge">
                    <span className="faculty-badge-label">COACH:</span>
                    <span className="faculty-badge-name">{assignedCoach ? assignedCoach.toUpperCase() : 'NOT ASSIGNED'}</span>
                  </div>
                )}
              </div>
              <div className="welcome-date">{formatDate()}</div>
            </section>

            {/* Stats */}
            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon gold">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div className="stat-value">{profileUser.sport || 'Not Specified'}</div>
                <div className="stat-label">Registered Sport</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div className="stat-value">{profileUser.state || 'Not Specified'}</div>
                <div className="stat-label">Registered State</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div className="stat-value">{capitalize(profileUser.role)}</div>
                <div className="stat-label">Portal Role</div>
              </div>

              {stats.map(([key, value], i) => (
                <div className="stat-card" key={key}>
                  <div className={`stat-icon ${statIcons[(i + 3) % statIcons.length].cls}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {statIcons[(i + 3) % statIcons.length].svg}
                    </svg>
                  </div>
                  <div className="stat-value">{value}</div>
                  <div className="stat-label">{formatLabel(key)}</div>
                </div>
              ))}
            </section>

            {/* Document Vault — Athlete only */}
            {role === 'athlete' && (
            <section className="dv-section">
              <div className="dv-card">
                {/* Header */}
                <div className="dv-header">
                  <div className="dv-header-text">
                    <h2 className="dv-title">Document Vault</h2>
                    <p className="dv-subtitle">Secure repository for birth certs, medical reports &amp; documents</p>
                  </div>

                  {/* Hidden file input — triggered by the button */}
                  <input
                    id="vault-file-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files[0]
                      if (!file) return
                      // Reset so same file can be picked again
                      e.target.value = ''
                      setUploadSending(true)
                      try {
                        const token = localStorage.getItem('token')
                        const sizeStr = file.size > 1048576
                          ? (file.size / 1048576).toFixed(1) + ' MB'
                          : (file.size / 1024).toFixed(0) + ' KB'
                        const res = await fetch('/api/kyc/upload', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            docType: uploadDocType,
                            fileName: file.name,
                            fileSize: sizeStr
                          })
                        })
                        const data = await res.json()
                        if (data.success) fetchVaultDocs()
                      } catch {
                        // silently fail
                      } finally {
                        setUploadSending(false)
                      }
                    }}
                  />

                  {/* Doc type selector + Upload button side by side */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <select
                      className="form-input"
                      value={uploadDocType}
                      onChange={e => setUploadDocType(e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '7px 12px', minWidth: 160 }}
                    >
                      <option value="Birth Certificate">Birth Certificate</option>
                      <option value="Achievement Certificate">Achievement Certificate</option>
                      <option value="Medical Report">Medical Report</option>
                      <option value="Aadhaar Card">Aadhaar Card</option>
                    </select>

                    <button
                      className="dv-upload-btn"
                      disabled={uploadSending}
                      onClick={() => document.getElementById('vault-file-input').click()}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      {uploadSending ? 'Uploading…' : 'Upload Document'}
                    </button>
                  </div>
                </div>

                {/* Table header */}
                <div className="dv-table-head">
                  <span className="dv-col-doc">DOCUMENT</span>
                  <span className="dv-col-status">STATUS</span>
                </div>

                {/* Rows */}
                <div className="dv-rows">
                  {vaultDocs.length === 0 && (
                    <div style={{padding:'28px 16px', textAlign:'center', color:'var(--text-muted)', fontSize:'0.85rem'}}>
                      No documents uploaded yet. Click <b>Upload Document</b> to get started.
                    </div>
                  )}
                  {vaultDocs.map((doc, i) => (
                    <div className="dv-row" key={doc._id || i} style={{'--i': i}}>
                      <div className="dv-row-left">
                        <div className="dv-file-icon">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                          </svg>
                        </div>
                        <div className="dv-file-info">
                          <span className="dv-file-title">{doc.docType || doc.title}</span>
                          <span className="dv-file-meta">{doc.fileName || doc.file} ({doc.fileSize || doc.size})</span>
                        </div>
                      </div>
                      <div className={`dv-badge dv-badge--${(doc.status || 'pending').toLowerCase()}`}>
                        {doc.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </section>
            )}

            {/* ═══════════════ COACH EXECUTIVE SUITE ═══════════════ */}
            {role === 'coach' && (
              <section className="exec-section">
                {/* 1. Quick Command Cards */}
                <div className="exec-header">
                  <div>
                    <h2>Coach Quick tool</h2>
                  </div>
                </div>

                <div className="exec-action-cards">
                  <div className="exec-action-card" onClick={() => setActiveTab('Training Schedule')}>
                    <span className="exec-card-badge">{coachSessions.length} Sessions</span>
                    <div className="exec-card-icon gold">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </div>
                    <div>
                      <h3>Training Schedule</h3>
                      <p>Schedule athletic sessions, assign sport squads, and take attendance.</p>
                    </div>
                    <div className="exec-card-cta">Open Schedule →</div>
                  </div>

                  <div className="exec-action-card" onClick={() => setActiveTab('My Athletes')}>
                    <span className="exec-card-badge">{coachSquad.length} Athletes</span>
                    <div className="exec-card-icon blue">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div>
                      <h3>Squad Athletes</h3>
                      <p>View athlete attendance %, fitness benchmark ratings, and award bonus points.</p>
                    </div>
                    <div className="exec-card-cta">Manage Squad →</div>
                  </div>

                  <div className="exec-action-card" onClick={() => setActiveTab('Biomechanical Analyzer')}>
                    <span className="exec-card-badge">AI Vision</span>
                    <div className="exec-card-icon green">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                        {poseIcon}
                      </svg>
                    </div>
                    <div>
                      <h3>Biomechanical Pose Lab</h3>
                      <p>Real-time camera pose tracking, joint kinematics, and form analysis.</p>
                    </div>
                    <div className="exec-card-cta">Launch Pose Lab →</div>
                  </div>

                  <div className="exec-action-card" onClick={() => setActiveTab('Reports')}>
                    <span className="exec-card-badge">Analytics</span>
                    <div className="exec-card-icon purple">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                        <path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>
                      </svg>
                    </div>
                    <div>
                      <h3>Academy Reports</h3>
                      <p>State analytics, sport distributions, and official roster reports.</p>
                    </div>
                    <div className="exec-card-cta">View Reports →</div>
                  </div>
                </div>
              </section>
            )}

            {/* ═══════════════ SELECTOR EXECUTIVE SUITE ═══════════════ */}
            {role === 'selector' && (
              <section className="exec-section">
                {/* 1. Quick Command Cards */}
                <div className="exec-header">
                  <div>
                    <h2>State Selection Board Hub</h2>
                    <p>Scout district athletes, evaluate performance scorecards, and nominate state squad candidates</p>
                  </div>
                </div>

                <div className="exec-action-cards">
                  <div className="exec-action-card" onClick={() => setActiveTab('Selection Panel')}>
                    <span className="exec-card-badge">{selectorCandidates.length} Registered</span>
                    <div className="exec-card-icon gold">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                    </div>
                    <div>
                      <h3>Selection Panel</h3>
                      <p>Grade candidates across speed, stamina, technique, and tactical metrics.</p>
                    </div>
                    <div className="exec-card-cta">Open Panel →</div>
                  </div>

                  <div className="exec-action-card" onClick={() => setActiveTab('Selection Panel')}>
                    <span className="exec-card-badge">
                      {selectorCandidates.filter(c => c.status === 'Shortlisted').length} Shortlisted
                    </span>
                    <div className="exec-card-icon green">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                        <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                      </svg>
                    </div>
                    <div>
                      <h3>State Roster Shortlist</h3>
                      <p>View elite candidates nominated for state academy training representation.</p>
                    </div>
                    <div className="exec-card-cta">Review Shortlist →</div>
                  </div>

                  <div className="exec-action-card" onClick={() => setActiveTab('Biomechanical Analyzer')}>
                    <span className="exec-card-badge">Movement AI</span>
                    <div className="exec-card-icon blue">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                        {poseIcon}
                      </svg>
                    </div>
                    <div>
                      <h3>Kinematics Pose Lab</h3>
                      <p>Inspect athletic jump angles, gait stability, and joint velocities.</p>
                    </div>
                    <div className="exec-card-cta">Inspect Biomechanics →</div>
                  </div>

                  <div className="exec-action-card" onClick={() => setActiveTab('Reports')}>
                    <span className="exec-card-badge">Official PDF</span>
                    <div className="exec-card-icon purple">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <div>
                      <h3>State Scouting Reports</h3>
                      <p>Official analytics by district, sport distribution, and performance data.</p>
                    </div>
                    <div className="exec-card-cta">Generate Report →</div>
                  </div>
                </div>


              </section>
            )}

            {/* Profile */}
            <section className="profile-section">
              <h2 className="section-title">Your Registered Official Profile</h2>
              <div className="profile-card">
                <div className="profile-grid">
                  {[
                    { label: 'Full Name', value: profileUser.name },
                    { label: 'Athlete / Staff ID', value: profileUser.athleteId },
                    { label: 'Registered Sport', value: profileUser.sport || 'Not Specified' },
                    { label: 'Registered State', value: profileUser.state || 'Not Specified' },
                    { label: 'Portal Role', value: capitalize(profileUser.role) },
                    { label: 'Gender', value: capitalize(profileUser.gender) },
                    { label: 'Contact Phone', value: profileUser.phone || 'Not Specified' },
                    { label: 'Address', value: profileUser.address || 'Not Specified' }
                  ].map((f, i) => (
                    <div className="profile-item" key={i}>
                      <span className="profile-label">{f.label}</span>
                      <span className="profile-value">{f.value || 'Not Specified'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )
    }
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="url(#gradD)" strokeWidth="3" />
              <path d="M20 44 L32 16 L44 44" stroke="url(#gradD)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M24 36 H40" stroke="url(#gradD)" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="32" cy="12" r="3" fill="#F59E0B" />
              <defs>
                <linearGradient id="gradD" x1="0" y1="0" x2="64" y2="64">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="sidebar-brand">
            <h2>SSA Portal</h2>
            <span className={`role-badge ${role}`}>{capitalize(role)}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => (
            <button
              key={i}
              className={`nav-item ${activeTab === item.label ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.label)
                setSidebarOpen(false)
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{item.icon}</svg>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <span>{(user.name || '?')[0].toUpperCase()}</span>
            </div>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-id">{user.athleteId}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="menu-toggle" onClick={() => setSidebarOpen(o => !o)}>
          <span /><span /><span />
        </button>
        <h2 className="mobile-title">SSA Portal</h2>
        <button className="logout-btn" onClick={logout} title="Logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay show" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="main-content">
        {/* Top-right Notification Bar */}
        <div className="topbar-right">
          <NotificationBell />
        </div>



        {renderActiveView()}
      </main>
    </div>
  )
}
