import { useState, useEffect, useCallback } from 'react'
import '../styles/training-athlete.css'

const INTENSITY_COLOR = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' }
const STATUS_COLOR    = { Scheduled: '#6c63ff', Completed: '#22c55e' }

function formatSessionDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    })
  } catch { return dateStr }
}

export default function AthleteHub({ currentUser, assignedCoach }) {
  const [candidateRecord, setCandidateRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [points, setPoints] = useState(currentUser?.totalPoints || 0)
  const [history, setHistory] = useState([])
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [sessionFilter, setSessionFilter] = useState('All')

  useEffect(() => {
    if (currentUser?.totalPoints !== undefined && currentUser?.totalPoints !== null) {
      setPoints(prev => Math.max(prev, currentUser.totalPoints))
    }
  }, [currentUser?.totalPoints])

  const fetchCandidateRecord = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/candidates', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.candidates)) {
        const found = data.candidates.find(
          c => c.athleteId === currentUser?.athleteId || c.name.toLowerCase() === currentUser?.name?.toLowerCase()
        )
        if (found) setCandidateRecord(found)
      }

      const lookupId = currentUser?.athleteId || currentUser?.id
      if (lookupId) {
        const pRes = await fetch(`/api/points/history/${encodeURIComponent(lookupId)}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        const pData = await pRes.json()
        if (pData.success) {
          const score = pData.totalPoints !== undefined ? pData.totalPoints : (currentUser?.totalPoints || 0)
          setPoints(score)
          setHistory(pData.history || [])
        } else if (currentUser?.totalPoints !== undefined) {
          setPoints(currentUser.totalPoints)
        }
      } else if (currentUser?.totalPoints !== undefined) {
        setPoints(currentUser.totalPoints)
      }
    } catch (err) {
      console.error('Fetch athlete record error:', err)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/trainings', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.sessions)) {
        setSessions(data.sessions)
      }
    } catch {
      setSessions([])
    } finally {
      setSessionsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCandidateRecord()
    fetchSessions()
  }, [fetchCandidateRecord, fetchSessions])

  const scores = candidateRecord?.scores || { speed: 0, stamina: 0, agility: 0, power: 0 }
  const status = candidateRecord?.status || 'Portal Registered'

  const athleteSport = (currentUser?.sport || candidateRecord?.sport || '').trim().toLowerCase()
  const relevantSessions = sessions.filter(s => {
    if (!athleteSport) return true
    const sessionSport = (s.sport || '').trim().toLowerCase()
    if (!sessionSport || sessionSport.includes('general')) return true
    return sessionSport === athleteSport || sessionSport.includes(athleteSport) || athleteSport.includes(sessionSport)
  })

  const filteredSessions = sessionFilter === 'All'
    ? relevantSessions
    : relevantSessions.filter(s => s.status === sessionFilter)

  const milestones = [
    { step: 1, title: 'Portal Registration & Verification', date: 'Completed', status: 'completed', desc: `Registered athlete account verified for ${currentUser?.name || 'Athlete'}.` },
    { step: 2, title: 'District Trial Performance Test', date: candidateRecord ? 'Evaluated' : 'Pending', status: candidateRecord ? 'completed' : 'current', desc: 'District fitness and agility testing.' },
    { step: 3, title: 'Coach Fitness & Skill Assessment', date: candidateRecord ? 'Completed' : 'Upcoming', status: candidateRecord ? 'completed' : 'pending', desc: 'Coach review and benchmark logging.' },
    { step: 4, title: 'State Selection Panel Review', date: candidateRecord ? candidateRecord.status : 'Upcoming', status: candidateRecord ? 'current' : 'pending', desc: 'Selection board evaluation for state roster.' },
    { step: 5, title: 'Final State Squad Nomination', date: 'Upcoming', status: 'pending', desc: 'Official nomination release by State Sports Authority.' }
  ]

  return (
    <div className="subview-container">
      <div className="subview-header">
        <div>
          <h2 className="subview-title">Athlete Performance</h2>
          <div className="faculty-badge" style={{ marginTop: '8px' }}>
            <span className="faculty-badge-label">COACH:</span>
            <span className="faculty-badge-name">{assignedCoach ? assignedCoach.toUpperCase() : 'NOT ASSIGNED'}</span>
          </div>
        </div>
        <div className="status-pill status-completed" style={{ marginTop: '0.4cm', transform: 'translateY(0.4cm)' }}>
          {status}
        </div>
      </div>

      {/* Points & Achievement Card */}
      <div className="grid-2 mb-6">
        <div className="card athlete-points-card">
          <div className="points-card-glow" />
          <div className="points-card-header">
            <div className="points-label-wrap">
              <span className="points-icon-badge">🏆</span>
              <div>
                <span className="points-kicker">STATE ATHLETE LEDGER</span>
                <h3 className="points-title">Total Points</h3>
              </div>
            </div>
            <span className="points-tier-pill">
              {points >= 250 
                ? 'Tier 3 • Elite (250+ PTS)' 
                : points >= 100 
                ? 'Tier 2 • Contender (100-250 PTS)' 
                : 'Tier 1 • Rising Athlete (0-100 PTS)'}
            </span>
          </div>

          <div className="points-score-row">
            <div className="points-giant-number">{points}</div>
            <div className="points-unit-group">
              <span className="points-unit-tag">PTS</span>
              <span className="points-delta-tag">Verified Score</span>
            </div>
          </div>

          {/* Dynamic Milestone Progress based on Tiers */}
          {(() => {
            const isTier3 = points >= 250
            const isTier2 = points >= 100 && points < 250
            const target = isTier3 ? 250 : isTier2 ? 250 : 100
            const nextTierName = isTier3 ? 'Elite Status' : isTier2 ? 'Tier 3 (Elite)' : 'Tier 2 (Contender)'
            const percent = isTier3 ? 100 : Math.min(100, Math.max(0, Math.round((points / target) * 100)))

            return (
              <div className="points-progress-block">
                <div className="points-progress-labels">
                  <span>{isTier3 ? '🏆 Elite State Squad Status Reached' : `Next Milestone Target: ${nextTierName}`}</span>
                  <span>{isTier3 ? `${points} / 250+ PTS (100%)` : `${points} / ${target} PTS (${percent}%)`}</span>
                </div>
                <div className="points-progress-track">
                  <div 
                    className="points-progress-fill" 
                    style={{ width: `${percent}%` }} 
                  />
                </div>
              </div>
            )
          })()}

          <div className="points-card-footer">
            <span className="points-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Keep training consistently to boost your squad selection rank!
            </span>
          </div>
        </div>
        <div className="card achievements-card">
          <div className="achieve-card-header">
            <div className="achieve-header-left">
              <span className="achieve-icon-badge">🎯</span>
              <h3 className="achieve-title">Recent Achievements</h3>
            </div>
            <span className="achieve-count-badge">
              {history.length} {history.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>

          {history.length === 0 ? (
            <div className="achieve-empty-state">
              <span>📋</span>
              <p>No activity records logged yet. Attend training sessions to earn points!</p>
            </div>
          ) : (
            <div className="achieve-list">
              {history.map(item => {
                const isAttendance = item.action?.toLowerCase().includes('attendance') || item.action?.toLowerCase().includes('training')
                const isBonus = item.action?.toLowerCase().includes('bonus')
                const icon = isBonus ? '🌟' : isAttendance ? '🏃' : '🎯'

                return (
                  <div key={item._id} className="achieve-row">
                    <div className="achieve-row-left">
                      <div className="achieve-type-dot">{icon}</div>
                      <div className="achieve-details">
                        <div className="achieve-action-text" title={item.action}>{item.action}</div>
                        <div className="achieve-date-text">
                          <span>📅</span>
                          <span>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="achieve-points-badge">+{item.pointsAwarded} PTS</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid-4 mb-6">
        <div className="metric-card card">
          <span className="metric-lbl">Speed Index</span>
          <div className="metric-val text-gold">{loading ? '...' : scores.speed} <span className="text-sm">/ 100</span></div>
          <div className="bar-track mt-2"><div className="bar-fill" style={{ width: `${scores.speed}%` }} /></div>
        </div>
        <div className="metric-card card">
          <span className="metric-lbl">Stamina Index</span>
          <div className="metric-val text-blue">{loading ? '...' : scores.stamina} <span className="text-sm">/ 100</span></div>
          <div className="bar-track mt-2"><div className="bar-fill" style={{ width: `${scores.stamina}%` }} /></div>
        </div>
        <div className="metric-card card">
          <span className="metric-lbl">Technical Mastery</span>
          <div className="metric-val text-green">{loading ? '...' : (scores.technique || 0)} <span className="text-sm">/ 100</span></div>
          <div className="bar-track mt-2"><div className="bar-fill" style={{ width: `${scores.technique || 0}%` }} /></div>
        </div>
        <div className="metric-card card">
          <span className="metric-lbl">Tactical Score</span>
          <div className="metric-val text-purple">{loading ? '...' : (scores.tactical || 0)} <span className="text-sm">/ 100</span></div>
          <div className="bar-track mt-2"><div className="bar-fill" style={{ width: `${scores.tactical || 0}%` }} /></div>
        </div>
      </div>

      {/* ══ TRAINING SCHEDULE (from Coach) ══ */}
      <div className="ts-section card mb-6">
        <div className="ts-header">
          <div>
            <h3 className="section-title">Training Schedule</h3>
            <p className="ts-sub">Sessions assigned by your coach</p>
          </div>
          <div className="ts-filters">
            {['All', 'Scheduled', 'Completed'].map(f => (
              <button
                key={f}
                className={`ts-filter-btn ${sessionFilter === f ? 'active' : ''}`}
                onClick={() => setSessionFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {sessionsLoading ? (
          <div className="ts-empty">
            <div className="ts-spinner" />
            <span>Loading sessions…</span>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="ts-empty">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="1.4">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <p>No {sessionFilter !== 'All' ? sessionFilter.toLowerCase() + ' ' : ''}training sessions yet.</p>
          </div>
        ) : (
          <div className="ts-cards">
            {filteredSessions.map((s, i) => (
              <div className="ts-card" key={s._id || i} style={{ '--delay': `${i * 60}ms` }}>
                <div className="ts-card-bar" style={{ background: INTENSITY_COLOR[s.intensity] || '#6c63ff' }} />
                <div className="ts-card-body">
                  <div className="ts-card-top">
                    <div className="ts-card-title-wrap">
                      <div className="ts-card-title">{s.title}</div>
                      <div className="ts-card-focus">{s.focus || 'General training session'}</div>
                    </div>
                    <div className="ts-badges">
                      <span className="ts-badge" style={{
                        background: `${INTENSITY_COLOR[s.intensity]}22`,
                        color: INTENSITY_COLOR[s.intensity],
                        border: `1px solid ${INTENSITY_COLOR[s.intensity]}55`
                      }}>
                        {s.intensity}
                      </span>
                      <span className="ts-badge" style={{
                        background: `${STATUS_COLOR[s.status]}22`,
                        color: STATUS_COLOR[s.status],
                        border: `1px solid ${STATUS_COLOR[s.status]}55`
                      }}>
                        {s.status}
                      </span>
                    </div>
                  </div>

                  <div className="ts-card-meta">
                    <span className="ts-meta-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      {formatSessionDate(s.date)}{s.time ? ` at ${s.time}` : ''}
                    </span>
                    <span className="ts-meta-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {s.duration}
                    </span>
                    <span className="ts-meta-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {s.location}
                    </span>
                    <span className="ts-meta-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                      </svg>
                      {s.sport}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  )
}
