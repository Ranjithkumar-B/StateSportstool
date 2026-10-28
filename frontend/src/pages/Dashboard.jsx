import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
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

function getDocumentSource(doc) {
  if (!doc) return null
  if (doc.fileData && doc.fileData.length > 20) {
    return doc.fileData
  }
  const name = encodeURIComponent(doc.athleteName || doc.athleteId || 'Registered Athlete')
  const athleteId = encodeURIComponent(doc.athleteId || 'ATH-2026')
  const docType = encodeURIComponent(doc.docType || doc.title || doc.fileName || 'Official Record')
  const fileName = encodeURIComponent(doc.fileName || doc.file || 'document.pdf')
  const date = encodeURIComponent(new Date(doc.createdAt || Date.now()).toLocaleDateString())

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1050" viewBox="0 0 800 1050">
    <defs>
      <linearGradient id="gold" x1="0" y1="0" x2="800" y2="1050" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#D97706"/>
      </linearGradient>
      <linearGradient id="bg" x1="0" y1="0" x2="800" y2="1050" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#0F172A"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
    </defs>
    <rect width="800" height="1050" fill="url(#bg)"/>
    <rect x="25" y="25" width="750" height="1000" rx="16" fill="none" stroke="url(#gold)" stroke-width="3" stroke-dasharray="12 6"/>
    <rect x="40" y="40" width="720" height="970" rx="12" fill="#1E293B" fill-opacity="0.6" stroke="#334155" stroke-width="1.5"/>
    <circle cx="400" cy="140" r="50" fill="none" stroke="url(#gold)" stroke-width="3"/>
    <path d="M380 160 L400 115 L420 160 Z" fill="none" stroke="#F59E0B" stroke-width="3"/>
    <circle cx="400" cy="110" r="6" fill="#EF4444"/>
    <text x="400" y="230" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#F8FAFC" text-anchor="middle" letter-spacing="3">STATE SPORTS ACADEMY</text>
    <text x="400" y="260" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="#94A3B8" text-anchor="middle" letter-spacing="2">OFFICIAL ATHLETIC DOCUMENT VAULT</text>
    <line x1="120" y1="290" x2="680" y2="290" stroke="#334155" stroke-width="1.5"/>
    <rect x="220" y="320" width="360" height="42" rx="8" fill="#F59E0B" fill-opacity="0.15" stroke="#F59E0B" stroke-width="1.5"/>
    <text x="400" y="347" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#FBBF24" text-anchor="middle">${docType}</text>
    <rect x="80" y="400" width="640" height="340" rx="10" fill="#0F172A" stroke="#334155" stroke-width="1"/>
    <text x="120" y="450" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#64748B">ATHLETE NAME</text>
    <text x="120" y="480" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#F8FAFC">${name}</text>
    <text x="460" y="450" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#64748B">ATHLETE / REGISTRATION ID</text>
    <text x="460" y="480" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#38BDF8">${athleteId}</text>
    <line x1="120" y1="515" x2="680" y2="515" stroke="#1E293B" stroke-width="1"/>
    <text x="120" y="560" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#64748B">ATTACHED FILE NAME</text>
    <text x="120" y="590" font-family="Arial, sans-serif" font-size="15" font-weight="600" fill="#CBD5E1">${fileName}</text>
    <text x="460" y="560" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#64748B">REGISTRATION TIMESTAMP</text>
    <text x="460" y="590" font-family="Arial, sans-serif" font-size="15" font-weight="600" fill="#CBD5E1">${date}</text>
    <line x1="120" y1="625" x2="680" y2="625" stroke="#1E293B" stroke-width="1"/>
    <text x="120" y="670" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#64748B">DOCUMENT INTEGRITY</text>
    <text x="120" y="700" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#34D399">&#x2713; DIGITAL RECORD VERIFIED IN ACADEMY REPOSITORY</text>
    <circle cx="200" cy="850" r="55" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-dasharray="6 3"/>
    <circle cx="200" cy="850" r="45" fill="none" stroke="#F59E0B" stroke-width="1"/>
    <text x="200" y="845" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#FBBF24" text-anchor="middle">STATE SPORTS</text>
    <text x="200" y="862" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#FBBF24" text-anchor="middle">OFFICIAL SEAL</text>
    <line x1="460" y1="875" x2="660" y2="875" stroke="#94A3B8" stroke-width="1.5"/>
    <text x="560" y="900" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#94A3B8" text-anchor="middle">ACADEMY AUTHORIZED REGISTRAR</text>
    <text x="560" y="920" font-family="Arial, sans-serif" font-size="10" fill="#64748B" text-anchor="middle">DIRECTORATE OF STATE SPORTS</text>
  </svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
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
  const [vaultPreviewDoc, setVaultPreviewDoc] = useState(null)
  const [deletingDocId, setDeletingDocId] = useState(null)
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

  const handleDeleteDoc = async (docId, docName) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${docName || 'this document'}"? It will also be removed from the Coach Dashboard review list.`)
    if (!confirmed) return

    setDeletingDocId(docId)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/kyc/${docId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (data.success) {
        setVaultDocs(prev => prev.filter(d => d._id !== docId))
        if (vaultPreviewDoc && vaultPreviewDoc._id === docId) {
          setVaultPreviewDoc(null)
        }
      } else {
        alert(data.message || 'Failed to delete document')
      }
    } catch (err) {
      console.error('Delete document error:', err)
      alert('Error deleting document. Please try again.')
    } finally {
      setDeletingDocId(null)
    }
  }

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

      // Animate sidebar ONLY on desktop viewports (> 768px)
      // On mobile viewports (<= 768px), sidebar is an off-canvas drawer controlled purely by CSS transforms
      if (typeof window !== 'undefined' && window.innerWidth > 768) {
        tl.fromTo('.sidebar', { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 })
      } else {
        gsap.set('.sidebar', { clearProps: 'transform,opacity' })
      }
      
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
                      e.target.value = ''
                      if (file.size > 10 * 1024 * 1024) {
                        alert('File size must be under 10MB')
                        return
                      }
                      setUploadSending(true)
                      try {
                        const token = localStorage.getItem('token')
                        const sizeStr = file.size > 1048576
                          ? (file.size / 1048576).toFixed(1) + ' MB'
                          : (file.size / 1024).toFixed(0) + ' KB'
                        
                        const reader = new FileReader()
                        reader.onload = async () => {
                          const fileData = reader.result
                          try {
                            const res = await fetch('/api/kyc/upload', {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                docType: uploadDocType,
                                fileName: file.name,
                                fileSize: sizeStr,
                                fileType: file.type || 'application/octet-stream',
                                fileData
                              })
                            })
                            const data = await res.json()
                            if (data.success) fetchVaultDocs()
                          } catch (err) {
                            console.error('KYC upload error:', err)
                          } finally {
                            setUploadSending(false)
                          }
                        }
                        reader.readAsDataURL(file)
                      } catch {
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
                  <span className="dv-col-status">STATUS / ACTION</span>
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
                      <div
                        className="dv-row-left"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setVaultPreviewDoc(doc)}
                        title="Click to view document"
                      >
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          type="button"
                          className="dv-action-btn dv-action-view"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => setVaultPreviewDoc(doc)}
                          title="View uploaded document"
                        >
                          👁 View
                        </button>
                        <button
                          type="button"
                          className="dv-action-btn dv-action-delete"
                          disabled={deletingDocId === doc._id}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteDoc(doc._id, doc.docType || doc.fileName)
                          }}
                          title="Delete document permanently (removes from coach review too)"
                        >
                          {deletingDocId === doc._id ? 'Deleting…' : '🗑 Delete'}
                        </button>
                        <div className={`dv-badge dv-badge--${(doc.status || 'pending').toLowerCase()}`}>
                          {doc.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Preview Modal for Athlete */}
              {vaultPreviewDoc && createPortal(
                <div className="dv-modal-overlay" onClick={() => setVaultPreviewDoc(null)}>
                  <div className="dv-modal-content" onClick={e => e.stopPropagation()}>
                    <div className="dv-modal-header">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>
                            {vaultPreviewDoc.docType || vaultPreviewDoc.title}
                          </h3>
                          <span className={`dv-badge dv-badge--${(vaultPreviewDoc.status || 'pending').toLowerCase()}`}>
                            {vaultPreviewDoc.status}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {vaultPreviewDoc.fileName || vaultPreviewDoc.file} ({vaultPreviewDoc.fileSize || vaultPreviewDoc.size})
                        </p>
                      </div>
                      <button className="dv-modal-close" onClick={() => setVaultPreviewDoc(null)}>✕</button>
                    </div>

                    <div className="dv-modal-body">
                      {(() => {
                        const docSrc = getDocumentSource(vaultPreviewDoc)
                        const isRealPdf = docSrc?.startsWith('data:application/pdf')

                        if (isRealPdf) {
                          return (
                            <iframe
                              src={docSrc}
                              title={vaultPreviewDoc.fileName || 'document'}
                              className="dv-preview-iframe"
                            />
                          )
                        }

                        return (
                          <div className="dv-preview-img-wrap">
                            <img
                              src={docSrc}
                              alt={vaultPreviewDoc.docType || 'Document'}
                              className="dv-preview-img"
                            />
                          </div>
                        )
                      })()}
                    </div>

                    <div className="dv-modal-footer">
                      <a
                        href={getDocumentSource(vaultPreviewDoc)}
                        download={vaultPreviewDoc.fileName || 'document.png'}
                        className="btn-secondary"
                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download Document
                      </a>

                      <a
                        href={getDocumentSource(vaultPreviewDoc)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
                      >
                        Open in Full Tab ↗
                      </a>

                      <button
                        type="button"
                        className="dv-action-btn dv-action-delete"
                        style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: '0.82rem' }}
                        disabled={deletingDocId === vaultPreviewDoc._id}
                        onClick={() => handleDeleteDoc(vaultPreviewDoc._id, vaultPreviewDoc.docType || vaultPreviewDoc.fileName)}
                      >
                        {deletingDocId === vaultPreviewDoc._id ? 'Deleting…' : '🗑 Delete Document'}
                      </button>

                      <button className="btn-secondary" onClick={() => setVaultPreviewDoc(null)}>Close</button>
                    </div>
                  </div>
                </div>,
                document.body
              )}
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
          <div className="sidebar-brand-wrapper">
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
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
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
