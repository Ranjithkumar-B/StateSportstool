import { useState, useEffect, useCallback } from 'react'

export default function CoachHub({ currentView }) {
  const [sessions, setSessions] = useState([])
  const [squad, setSquad] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [loadingSquad, setLoadingSquad] = useState(true)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [showBonusModal, setShowBonusModal] = useState(false)
  const [bonusTarget, setBonusTarget] = useState(null)
  const [bonusPoints, setBonusPoints] = useState(10)
  const [bonusReason, setBonusReason] = useState('')
  const [selectedSession, setSelectedSession] = useState(null)
  const [attendanceMap, setAttendanceMap] = useState({})

  // Skill Evaluation State
  const [showEvalModal, setShowEvalModal] = useState(false)
  const [evalTarget, setEvalTarget] = useState(null)
  const [evalScores, setEvalScores] = useState({ speed: 80, stamina: 80, technique: 80, tactical: 80 })
  const [evalStatus, setEvalStatus] = useState('Under Review')

  const [portalAthletes, setPortalAthletes] = useState([])
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [assignSearch, setAssignSearch] = useState('')

  // New Session Form State
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newSport, setNewSport] = useState('Athletics')
  const [newDuration, setNewDuration] = useState('60 mins')
  const [newIntensity, setNewIntensity] = useState('High')
  const [newLocation, setNewLocation] = useState('')
  const [newFocus, setNewFocus] = useState('')
  const [toastMsg, setToastMsg] = useState(null)

  const triggerToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 4500)
  }

  // Fetch Training Sessions from MongoDB
  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/trainings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.sessions)) {
        setSessions(data.sessions)
      } else {
        setSessions([])
      }
    } catch {
      setSessions([])
    } finally {
      setLoadingSessions(false)
    }
  }, [])

  // Fetch Squad Assignments from MongoDB
  const fetchSquad = useCallback(async () => {
    setLoadingSquad(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/squads', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.squad)) {
        setSquad(data.squad)
      } else {
        setSquad([])
      }
    } catch {
      setSquad([])
    } finally {
      setLoadingSquad(false)
    }
  }, [])

  // Fetch all registered athletes from MongoDB
  const fetchPortalAthletes = useCallback(async () => {
    setLoadingPortal(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/dashboard/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.users)) {
        const onlyAthletes = data.users.filter(u => u.role === 'athlete')
        setPortalAthletes(onlyAthletes)
      } else {
        setPortalAthletes([])
      }
    } catch {
      setPortalAthletes([])
    } finally {
      setLoadingPortal(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
    fetchSquad()
    fetchPortalAthletes()
  }, [fetchSessions, fetchSquad, fetchPortalAthletes])

  const openAssignModal = () => {
    setShowAssignModal(true)
    fetchPortalAthletes()
  }

  const isSportMatch = (athleteSport, sessionSport) => {
    if (!sessionSport || sessionSport.toLowerCase().includes('general') || sessionSport === 'All Sports') {
      return true
    }
    if (!athleteSport) return false
    const a = athleteSport.trim().toLowerCase()
    const s = sessionSport.trim().toLowerCase()
    return a === s || a.includes(s) || s.includes(a)
  }

  const getSessionAthletes = (session) => {
    if (!session) return []
    if (session.assignedAthletes && session.assignedAthletes.length > 0) {
      return session.assignedAthletes
    }
    const matchingSquad = squad.filter(a => isSportMatch(a.sport, session.sport))
    if (matchingSquad.length > 0) return matchingSquad
    const matchingPortal = portalAthletes.filter(a => isSportMatch(a.sport, session.sport))
    if (matchingPortal.length > 0) return matchingPortal
    if (session.sport?.toLowerCase().includes('general')) return squad
    return []
  }

  const openAttendanceModal = (session) => {
    setSelectedSession(session)
    const initialMap = {}
    const sessionAthletes = getSessionAthletes(session)
    const existingLog = session.attendanceLog || []
    
    sessionAthletes.forEach(athlete => {
      const athleteId = athlete.athleteId || athlete._id
      const found = existingLog.find(l => l.athleteId === athleteId)
      initialMap[athleteId] = found ? found.status : 'Present'
    })
    
    setAttendanceMap(initialMap)
    setShowAttendanceModal(true)
  }

  const handleAttendanceChange = (athleteId, status) => {
    setAttendanceMap(prev => ({ ...prev, [athleteId]: status }))
  }

  const submitAttendance = async () => {
    if (!selectedSession) return

    const sessionAthletes = getSessionAthletes(selectedSession)
    const attendanceLog = Object.entries(attendanceMap).map(([athleteId, status]) => {
      const athleteObj = sessionAthletes.find(a => (a.athleteId || a._id) === athleteId) || squad.find(a => (a.athleteId || a._id) === athleteId)
      return {
        athleteId,
        athleteName: athleteObj?.name || athleteObj?.athleteName || 'Athlete',
        status
      }
    })

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/trainings/${selectedSession._id}/attendance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ attendanceLog })
      })

      const data = await res.json()
      if (data.success) {
        fetchSessions()
        fetchSquad()
      }
    } catch (err) {
      console.error('Submit attendance error:', err)
    } finally {
      setShowAttendanceModal(false)
      setSelectedSession(null)
    }
  }

  const handleAwardBonus = async (e) => {
    e.preventDefault()
    if (!bonusTarget) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/points/bonus', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          athleteId: bonusTarget.athleteId || bonusTarget._id,
          points: bonusPoints,
          reason: bonusReason
        })
      })
      const data = await res.json()
      if (data.success) {
        fetchSquad()
      }
    } catch (err) {
      console.error('Award bonus error:', err)
    } finally {
      setShowBonusModal(false)
      setBonusTarget(null)
      setBonusReason('')
      setBonusPoints(10)
    }
  }

  // Assign athlete in MongoDB
  const assignAthleteToSquad = async (registeredAthlete) => {
    const athleteId = registeredAthlete.athleteId || registeredAthlete._id
    const isAlreadyAssigned = squad.some(a => a.athleteId === athleteId || a.name.toLowerCase() === registeredAthlete.name.toLowerCase())
    if (isAlreadyAssigned) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/squads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          athleteId,
          name: registeredAthlete.name,
          sport: registeredAthlete.sport || 'General Sports',
          state: registeredAthlete.state || 'State Academy'
        })
      })
      const data = await res.json()
      if (data.success && data.assignment) {
        setSquad(prev => [data.assignment, ...prev])
      } else {
        fetchSquad()
      }
    } catch (err) {
      console.error('Assign athlete error:', err)
      fetchSquad()
    }
  }

  // Remove athlete from MongoDB
  const removeAthleteFromSquad = async (squadId, athleteId) => {
    setSquad(prev => prev.filter(a => a._id !== squadId && a.athleteId !== athleteId))
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/squads/${squadId || athleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    } catch (err) {
      console.error('Remove athlete error:', err)
    }
  }

  // Create training session in MongoDB
  const handleAddSession = async (e) => {
    e.preventDefault()
    if (!newTitle || !newDate || !newLocation) return

    const matchingSquad = squad.filter(a => isSportMatch(a.sport, newSport))
    const matchingPortal = portalAthletes.filter(a => isSportMatch(a.sport, newSport))
    const targetAthletes = matchingSquad.length > 0 ? matchingSquad : (matchingPortal.length > 0 ? matchingPortal : (newSport.toLowerCase().includes('general') ? squad : []))
    const payloadAssigned = targetAthletes.map(a => ({
      athleteId: a.athleteId || a._id,
      name: a.name,
      sport: a.sport || newSport
    }))

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/trainings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTitle,
          date: newDate,
          time: newTime || '07:00 AM',
          sport: newSport,
          duration: newDuration,
          intensity: newIntensity,
          location: newLocation,
          focus: newFocus || 'General athletic conditioning',
          assignedAthletes: payloadAssigned
        })
      })
      const data = await res.json()
      if (data.success && data.session) {
        setSessions(prev => [data.session, ...prev])
        triggerToast(`✅ Training scheduled! Notifications sent to assigned ${newSport} athlete(s).`)
        window.dispatchEvent(new Event('refresh-notifications'))
      } else {
        fetchSessions()
        triggerToast(`✅ Training scheduled! Notifications sent to assigned ${newSport} athlete(s).`)
        window.dispatchEvent(new Event('refresh-notifications'))
      }
    } catch (err) {
      console.error('Add session error:', err)
      fetchSessions()
    } finally {
      setShowAddModal(false)
      resetForm()
    }
  }

  // Open Skill Evaluation Modal
  const openEvalModal = async (athlete) => {
    setEvalTarget(athlete)
    setShowEvalModal(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/candidates', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.candidates)) {
        const found = data.candidates.find(c => c.athleteId === (athlete.athleteId || athlete._id))
        if (found) {
          if (found.scores) setEvalScores(found.scores)
          if (found.status) setEvalStatus(found.status)
        }
      }
    } catch (err) {
      console.error('Fetch candidate record error:', err)
    }
  }

  // Save Coach Evaluation to MongoDB
  const handleSaveEvaluation = async (e) => {
    e.preventDefault()
    if (!evalTarget) return
    const targetId = evalTarget.athleteId || evalTarget._id
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/candidates/${targetId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scores: evalScores,
          status: evalStatus
        })
      })
      const data = await res.json()
      if (data.success) {
        alert(`Evaluation saved for ${evalTarget.name}! Scores updated successfully.`)
        setShowEvalModal(false)
        fetchSquad()
      } else {
        alert(data.message || 'Failed to update evaluation')
      }
    } catch (err) {
      alert('Error updating evaluation')
    }
  }

  const resetForm = () => {
    setNewTitle('')
    setNewDate('')
    setNewTime('')
    setNewLocation('')
    setNewFocus('')
  }

  // Toggle session status in MongoDB
  const toggleSessionStatus = async (sessionId, currentStatus) => {
    const nextStatus = currentStatus === 'Scheduled' ? 'Completed' : 'Scheduled'
    setSessions(prev => prev.map(s => s._id === sessionId ? { ...s, status: nextStatus } : s))

    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/trainings/${sessionId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    } catch (err) {
      console.error('Toggle status error:', err)
    }
  }

  // Delete session in MongoDB
  const deleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this training session?')) return;

    setSessions(prev => prev.filter(s => s._id !== sessionId))

    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/trainings/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    } catch (err) {
      console.error('Delete session error:', err)
      fetchSessions()
    }
  }

  const filteredPortalAthletes = portalAthletes.filter(a =>
    a.name.toLowerCase().includes(assignSearch.toLowerCase()) ||
    (a.athleteId && a.athleteId.toLowerCase().includes(assignSearch.toLowerCase())) ||
    (a.sport && a.sport.toLowerCase().includes(assignSearch.toLowerCase())) ||
    (a.state && a.state.toLowerCase().includes(assignSearch.toLowerCase()))
  )

  const standardSports = [
    'Archery',
    'Athletics',
    'Badminton',
    'Basketball',
    'Boxing',
    'Cricket',
    'Football',
    'Gymnastics',
    'Hockey',
    'Kabaddi',
    'Shooting',
    'Swimming',
    'Tennis',
    'Volleyball',
    'Weightlifting',
    'Wrestling',
    'General Conditioning'
  ]

  const availableSports = Array.from(
    new Set([
      ...standardSports,
      ...squad.map(a => a.sport).filter(Boolean),
      ...portalAthletes.map(a => a.sport).filter(Boolean)
    ])
  ).sort((a, b) => {
    if (a === 'General Conditioning') return 1
    if (b === 'General Conditioning') return -1
    return a.localeCompare(b)
  })

  return (
    <div className="subview-container">
      {/* Visual Toast Notification Banner */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '80px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #059669, #10b981)',
          color: '#ffffff',
          padding: '14px 22px',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          fontWeight: '600',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="subview-header">
        <div>
          <h2 className="subview-title">Coach Performance & Training Hub</h2>
          <p className="subview-subtitle">Organize athletic training programs, log benchmarks, and track assigned squads</p>
        </div>
        <div className="flex gap-2">
          {currentView === 'My Athletes' ? (
            <button className="btn-primary" style={{ marginRight: '1.5cm' }} onClick={openAssignModal}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="16" y1="11" x2="22" y2="11"/>
              </svg>
              Assign Athlete
            </button>
          ) : (
            <button className="btn-primary" style={{ marginRight: '2cm' }} onClick={() => setShowAddModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Training Session
            </button>
          )}
        </div>
      </div>

      {/* Training Schedule View */}
      {(currentView === 'Training Schedule' || currentView === 'Performance') && (
        <div className="schedule-list">
          {loadingSessions ? (
            <div className="card text-center py-6 text-muted">Loading training sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="card text-center py-6 text-muted">No training sessions scheduled yet. Click 'New Training Session' to add one.</div>
          ) : (
            sessions.map((s) => (
              <div className={`schedule-card card ${s.status?.toLowerCase() || 'scheduled'}`} key={s._id}>
                <div className="schedule-badge-col">
                  <span className={`intensity-badge intensity-${s.intensity?.toLowerCase() || 'high'}`}>
                    {s.intensity} Intensity
                  </span>
                  <span className={`status-pill status-${s.status?.toLowerCase() || 'scheduled'}`}>
                    {s.status}
                  </span>
                </div>

                <div className="schedule-info-col">
                  <h3>{s.title}</h3>
                  <p className="schedule-focus">{s.focus}</p>
                  <div className="schedule-meta-row">
                    <span>📅 {new Date(s.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} at {s.time}</span>
                    <span>⏱️ {s.duration}</span>
                    <span>📍 {s.location}</span>
                    <span>🏅 {s.sport}</span>
                    <span style={{ color: '#38bdf8' }}>
                      👥 Assigned: {
                        s.assignedAthletes && s.assignedAthletes.length > 0
                          ? `${s.assignedAthletes.length} ${s.sport} Athlete(s)`
                          : squad.filter(a => isSportMatch(a.sport, s.sport)).length > 0
                          ? `${squad.filter(a => isSportMatch(a.sport, s.sport)).length} ${s.sport} Athlete(s)`
                          : s.sport?.toLowerCase().includes('general')
                          ? `All Squad Athletes`
                          : `${s.sport} Athletes`
                      }
                    </span>
                  </div>
                </div>

                <div className="schedule-action-col flex gap-2 items-center">
                  <button
                    className="btn-primary-sm"
                    onClick={() => openAttendanceModal(s)}
                  >
                    Take Attendance
                  </button>
                  <button
                    className={s.status === 'Completed' ? 'btn-secondary-sm' : 'btn-success-sm'}
                    onClick={() => toggleSessionStatus(s._id, s.status)}
                  >
                    {s.status === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
                  </button>
                  <button
                    className="btn-secondary-sm border-red-500/30 text-red-400 hover:bg-red-500/20"
                    onClick={() => deleteSession(s._id)}
                    title="Delete training session"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Assigned Athletes View */}
      {currentView === 'My Athletes' && (
        <>
          {loadingSquad ? (
            <div className="card text-center py-6 text-muted full-width">Loading squad...</div>
          ) : squad.length === 0 ? (
            <div className="card text-center py-6 text-muted full-width">No athletes assigned to your squad yet. Click 'Assign Athlete' to add athletes from the portal.</div>
          ) : (
            <div className="cards-grid">
              {squad.map((a) => (
                <div className="athlete-coach-card card" key={a._id || a.athleteId}>
                  <button
                    className="remove-squad-btn"
                    title="Remove from squad"
                    onClick={() => removeAthleteFromSquad(a._id, a.athleteId)}
                  >
                    ×
                  </button>
                  <div className="avatar-circle large mb-3">{a.name.charAt(0).toUpperCase()}</div>
                  <h3>{a.name}</h3>
                  <p className="text-muted text-sm">{a.sport} • {a.state || 'Academy'}</p>
                  <code className="code-badge mt-1">{a.athleteId}</code>

                  <div className="stats-row mt-4">
                    <div className="stat-pill">
                      <span className="stat-pill-val">{a.attendance || '100%'}</span>
                      <span className="stat-pill-lbl">Attendance</span>
                    </div>
                    <div className="stat-pill">
                      <span className="stat-pill-val">{a.fitnessScore || '90/100'}</span>
                      <span className="stat-pill-lbl">Fitness Rating</span>
                    </div>
                    <div className="stat-pill" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                      <span className="stat-pill-val text-gold">{a.totalPoints || 0}</span>
                      <span className="stat-pill-lbl">Points</span>
                    </div>
                  </div>

                  {a.sprintBest && a.sprintBest !== 'N/A' && (
                    <div className="highlight-metric mt-3">
                      Personal Best: <strong>{a.sprintBest}</strong>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button 
                      className="btn-primary-sm flex-1 text-xs py-2 rounded font-semibold bg-amber-500 hover:bg-amber-600 text-black transition-all" 
                      onClick={() => openEvalModal(a)}
                    >
                      ✏️ Evaluate Skills
                    </button>
                    <button 
                      className="btn-secondary-sm flex-1 text-xs py-2 rounded font-semibold" 
                      onClick={() => { setBonusTarget(a); setShowBonusModal(true); }}
                    >
                      + Award Points
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}


        </>
      )}

      {/* Bonus Points Modal */}
      {showBonusModal && bonusTarget && (
        <div className="modal-overlay" onClick={() => setShowBonusModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Award Bonus Points</h3>
              <button className="close-btn" onClick={() => setShowBonusModal(false)}>×</button>
            </div>
            <form onSubmit={handleAwardBonus} className="modal-body">
              <p className="text-muted text-sm mb-4">
                Award points to <strong className="text-white">{bonusTarget.name}</strong> for outstanding effort, leadership, or personal records.
              </p>
              
              <div className="form-group mb-3">
                <label className="form-label">Points to Award</label>
                <select 
                  className="select-input full-width" 
                  value={bonusPoints} 
                  onChange={(e) => setBonusPoints(Number(e.target.value))}
                >
                  <option value="5">+5 Points (Minor)</option>
                  <option value="10">+10 Points (Standard)</option>
                  <option value="20">+20 Points (Major)</option>
                  <option value="50">+50 Points (Exceptional)</option>
                </select>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Reason</label>
                <input 
                  type="text" 
                  className="text-input full-width" 
                  required
                  placeholder="e.g. Broke personal 100m sprint record"
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                />
              </div>

              <div className="modal-footer mt-4">
                <button type="button" className="btn-secondary" onClick={() => setShowBonusModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Award Points</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Skill Evaluation Modal */}
      {showEvalModal && evalTarget && (
        <div className="modal-overlay" onClick={() => setShowEvalModal(false)}>
          <div className="modal-content card max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="text-lg font-bold">Coach Skill & Fitness Assessment</h3>
                <p className="text-muted text-xs">Evaluate physical benchmarks & selection status for {evalTarget.name}</p>
              </div>
              <button className="close-btn" onClick={() => setShowEvalModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveEvaluation} className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-amber-400 font-semibold text-xs">Speed Index (0-100)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    className="text-input full-width mt-1" 
                    value={evalScores.speed} 
                    onChange={(e) => setEvalScores(prev => ({ ...prev, speed: Number(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-blue-400 font-semibold text-xs">Stamina Index (0-100)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    className="text-input full-width mt-1" 
                    value={evalScores.stamina} 
                    onChange={(e) => setEvalScores(prev => ({ ...prev, stamina: Number(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-green-400 font-semibold text-xs">Technical Mastery (0-100)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    className="text-input full-width mt-1" 
                    value={evalScores.technique || evalScores.agility || 80} 
                    onChange={(e) => setEvalScores(prev => ({ ...prev, technique: Number(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-purple-400 font-semibold text-xs">Tactical Score (0-100)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    className="text-input full-width mt-1" 
                    value={evalScores.tactical || evalScores.power || 80} 
                    onChange={(e) => setEvalScores(prev => ({ ...prev, tactical: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="form-group mt-3">
                <label className="form-label text-xs font-semibold">Selection Milestone Status</label>
                <select 
                  className="select-input full-width mt-1"
                  value={evalStatus}
                  onChange={(e) => setEvalStatus(e.target.value)}
                >
                  <option value="Under Review">Under Review (State Selection Panel Review)</option>
                  <option value="Shortlisted">Shortlisted for State Squad</option>
                  <option value="Selected for State Squad">Selected for State Squad (Final Nomination)</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="modal-footer mt-4 flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={() => setShowEvalModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Assessment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Attendance Modal */}
      {showAttendanceModal && selectedSession && (
        <div className="modal-overlay" onClick={() => setShowAttendanceModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Session Attendance Check-In</h3>
                <p className="text-muted text-xs">{selectedSession.title} • {selectedSession.date} ({selectedSession.sport})</p>
              </div>
              <button className="close-btn" onClick={() => setShowAttendanceModal(false)}>×</button>
            </div>

            <div className="modal-body">
              {(() => {
                const sessionAthletes = getSessionAthletes(selectedSession)
                if (sessionAthletes.length === 0) {
                  return (
                    <div className="text-center py-6 text-muted">
                      No athletes currently assigned for <strong>{selectedSession.sport}</strong>.<br />
                      <span className="text-xs">Assign {selectedSession.sport} athletes from "My Athletes" to take session attendance.</span>
                    </div>
                  )
                }
                return (
                  <div className="attendance-list flex flex-col gap-3">
                    {sessionAthletes.map((athlete) => {
                      const athleteId = athlete.athleteId || athlete._id
                      const athleteName = athlete.name || athlete.athleteName
                      const athleteSport = athlete.sport || selectedSession.sport
                      const currentStatus = attendanceMap[athleteId] || 'Present'
                      return (
                        <div className="assign-item-card" key={athleteId}>
                          <div className="assign-user-info">
                            <div className="avatar-circle">{athleteName.charAt(0).toUpperCase()}</div>
                            <div>
                              <div className="font-semibold">{athleteName}</div>
                              <div className="text-muted text-xs">{athleteSport} ({athleteId})</div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {['Present', 'Absent', 'Late'].map((st) => (
                              <button
                                key={st}
                                type="button"
                                className={`pill-btn ${currentStatus === st ? 'active' : ''}`}
                                onClick={() => handleAttendanceChange(athleteId, st)}
                              >
                                {st === 'Present' ? 'Present ✓' : st === 'Absent' ? 'Absent ✗' : 'Late ⏱'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAttendanceModal(false)}>Cancel</button>
              {getSessionAthletes(selectedSession).length > 0 && (
                <button className="btn-primary" onClick={submitAttendance}>
                  Submit Attendance
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Registered Athlete Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Assign Registered Athletes</h3>
                <p className="text-muted text-xs">Browse athletes registered on the State Sports Academy portal</p>
              </div>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="search-box mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search registered athlete by name, ID, sport, or state..."
                  value={assignSearch}
                  onChange={(e) => setAssignSearch(e.target.value)}
                />
              </div>

              <div className="assign-list">
                {loadingPortal ? (
                  <div className="text-center py-6 text-muted">Fetching portal directory...</div>
                ) : filteredPortalAthletes.length === 0 ? (
                  <div className="text-center py-6 text-muted">No registered athletes found. Athletes who register as 'athlete' will appear here.</div>
                ) : (
                  filteredPortalAthletes.map((pa) => {
                    const athleteId = pa.athleteId || pa._id
                    const isAssigned = squad.some(a => a.athleteId === athleteId || a.name.toLowerCase() === pa.name.toLowerCase())
                    return (
                      <div className="assign-item-card" key={pa._id || pa.athleteId}>
                        <div className="assign-user-info">
                          <div className="avatar-circle">{pa.name.charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="font-semibold">{pa.name}</div>
                            <div className="text-muted text-xs">{pa.sport || 'Athlete'} • {pa.state || 'State'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="code-badge">{pa.athleteId}</code>
                          {isAssigned ? (
                            <span className="status-pill status-completed">Assigned ✓</span>
                          ) : (
                            <button
                              className="btn-primary-sm"
                              onClick={() => assignAthleteToSquad(pa)}
                            >
                              + Add to Squad
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAssignModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Training Session Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Training Session</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <form onSubmit={handleAddSession} className="modal-body">
              <div className="form-group">
                <label className="form-label">Session Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Endurance & Cadence Drills"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-input full-width"
                />
              </div>

              <div className="grid-2 mt-3">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="text-input full-width"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 06:30 AM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="text-input full-width"
                  />
                </div>
              </div>

              <div className="grid-2 mt-3">
                <div className="form-group">
                  <label className="form-label">Discipline / Sport</label>
                  <select
                    value={newSport}
                    onChange={(e) => setNewSport(e.target.value)}
                    className="select-input full-width"
                  >
                    {availableSports.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Intensity Level</label>
                  <select
                    value={newIntensity}
                    onChange={(e) => setNewIntensity(e.target.value)}
                    className="select-input full-width"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low / Recovery</option>
                  </select>
                </div>
              </div>

              <div className="grid-2 mt-3">
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 90 mins"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="text-input full-width"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location / Arena</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Track 1 / Gym B"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="text-input full-width"
                  />
                </div>
              </div>

              <div className="form-group mt-3">
                <label className="form-label">Training Objectives & Focus</label>
                <textarea
                  rows="2"
                  placeholder="Outline key metrics and drill focus..."
                  value={newFocus}
                  onChange={(e) => setNewFocus(e.target.value)}
                  className="text-input full-width"
                />
              </div>

              <div className="modal-footer mt-4">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Publish Training Session</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
