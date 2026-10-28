import { useState, useEffect, useCallback } from 'react'

export default function SelectionPanel() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sportFilter, setSportFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [editStatus, setEditStatus] = useState('')
  const [editNotes, setEditNotes] = useState('')

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/candidates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.candidates)) {
        setCandidates(data.candidates)
      } else {
        setCandidates([])
      }
    } catch {
      setCandidates([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  const toggleShortlist = async (candidate) => {
    const nextStatus = candidate.status === 'Shortlisted' ? 'Under Review' : 'Shortlisted'
    
    // Optimistic local UI update
    setCandidates(prev => prev.map(c => c._id === candidate._id ? { ...c, status: nextStatus } : c))

    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/candidates/${candidate._id}/shortlist`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    } catch (err) {
      console.error('Shortlist update error:', err)
    }
  }

  const openScorecard = (candidate) => {
    setSelectedCandidate(candidate)
    setEditStatus(candidate.status)
    setEditNotes(candidate.notes || '')
  }

  const saveCandidateDecision = async () => {
    if (!selectedCandidate) return
    const candidateId = selectedCandidate._id

    // Optimistic local UI update
    setCandidates(prev => prev.map(c => c._id === candidateId ? { ...c, status: editStatus, notes: editNotes } : c))
    setSelectedCandidate(null)

    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/candidates/${candidateId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: editStatus,
          notes: editNotes,
          scores: selectedCandidate.scores
        })
      })
    } catch (err) {
      console.error('Save candidate decision error:', err)
    }
  }

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.athleteId && c.athleteId.toLowerCase().includes(search.toLowerCase())) ||
      (c.sport && c.sport.toLowerCase().includes(search.toLowerCase())) ||
      (c.state && c.state.toLowerCase().includes(search.toLowerCase()))

    const matchesSport = sportFilter === 'all' || (c.sport && c.sport.toLowerCase().includes(sportFilter.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    return matchesSearch && matchesSport && matchesStatus
  })

  const allKnownSports = [
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
    'Wrestling'
  ]

  // Dynamically include all standard sports plus any sports registered by candidates
  const sportsList = [
    'all',
    ...Array.from(
      new Set([
        ...allKnownSports,
        ...candidates.map(c => c.sport).filter(Boolean)
      ])
    ).sort((a, b) => a.localeCompare(b))
  ]

  return (
    <div className="subview-container">
      <div className="subview-header">
        <div>
          <h2 className="subview-title">Selection Panel</h2>
          <p className="subview-subtitle">Review athlete trial performances, shortlists, and squad nominations</p>
        </div>
        <div className="header-stats-badge" style={{ marginRight: '1.5cm' }}>
          <span>Shortlisted: {candidates.filter(c => c.status === 'Shortlisted').length}</span>
          <span className="divider">•</span>
          <span>Selected: {candidates.filter(c => c.status === 'Selected for State Squad').length}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filters-card">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search candidate name, ID, or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-selects">
          <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)} className="select-input">
            <option value="all">All Sports</option>
            {sportsList.filter(s => s !== 'all').map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-input">
            <option value="all">All Statuses</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Selected for State Squad">Selected for State Squad</option>
            <option value="Under Review">Under Review</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Roster Cards Grid */}
      <div className="cards-grid">
        {loading ? (
          <div className="empty-state card full-width text-center">Loading candidates...</div>
        ) : filteredCandidates.length === 0 ? (
          <div className="empty-state card full-width text-center">
            <p>No registered athletes found. Athletes who register on the portal as 'athlete' will automatically appear here for selector review.</p>
          </div>
        ) : (
          filteredCandidates.map((c) => {
            const scores = c.scores || { speed: 80, stamina: 80, technique: 80, tactical: 80 }
            const avgScore = Math.round((scores.speed + scores.stamina + scores.technique + scores.tactical) / 4)
            return (
              <div className="candidate-card card" key={c._id}>
                <div className="candidate-card-header">
                  <div className="candidate-info">
                    <span className="candidate-id">{c.athleteId || c._id}</span>
                    <h3 className="candidate-name">{c.name}</h3>
                    <span className="candidate-meta">{c.sport || 'Sport'} • {c.state || 'State'}</span>
                  </div>
                  <button
                    className={`shortlist-star ${c.status === 'Shortlisted' ? 'active' : ''}`}
                    onClick={() => toggleShortlist(c)}
                    title={c.status === 'Shortlisted' ? 'Remove from shortlist' : 'Shortlist candidate'}
                  >
                    ★
                  </button>
                </div>

                <div className="score-summary">
                  <div className="score-ring">
                    <span className="score-num">{avgScore}</span>
                    <span className="score-lbl">OVERALL</span>
                  </div>

                  <div className="mini-bars">
                    <div className="mini-bar-item">
                      <span>Speed</span>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${scores.speed}%` }} /></div>
                    </div>
                    <div className="mini-bar-item">
                      <span>Stamina</span>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${scores.stamina}%` }} /></div>
                    </div>
                    <div className="mini-bar-item">
                      <span>Technique</span>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${scores.technique}%` }} /></div>
                    </div>
                  </div>
                </div>

                <div className="candidate-card-footer">
                  <span className={`status-badge status-${(c.status || 'under-review').toLowerCase().replace(/\s+/g, '-')}`}>
                    {c.status}
                  </span>
                  <button className="btn-secondary-sm" onClick={() => openScorecard(c)}>
                    Evaluate Scorecard
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Candidate Scorecard Modal */}
      {selectedCandidate && (
        <div className="modal-overlay" onClick={() => setSelectedCandidate(null)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{selectedCandidate.name}</h3>
                <p className="text-muted">{selectedCandidate.sport} • {selectedCandidate.state} ({selectedCandidate.athleteId || selectedCandidate._id})</p>
              </div>
              <button className="close-btn" onClick={() => setSelectedCandidate(null)}>×</button>
            </div>

            <div className="modal-body">
              <h4 className="section-subtitle">Performance Benchmark Breakdown</h4>
              <div className="benchmark-grid">
                {[
                  { key: 'speed', label: 'Speed & Agility', val: selectedCandidate.scores?.speed || 80 },
                  { key: 'stamina', label: 'Stamina & Endurance', val: selectedCandidate.scores?.stamina || 80 },
                  { key: 'technique', label: 'Technical Mastery', val: selectedCandidate.scores?.technique || 80 },
                  { key: 'tactical', label: 'Tactical Awareness', val: selectedCandidate.scores?.tactical || 80 }
                ].map((b) => (
                  <div className="benchmark-card" key={b.key}>
                    <div className="benchmark-header">
                      <span>{b.label}</span>
                      <span className="font-bold">{b.val} / 100</span>
                    </div>
                    <div className="bar-track large">
                      <div className="bar-fill" style={{ width: `${b.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-group mt-4">
                <label className="form-label">Selection Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="select-input full-width"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Selected for State Squad">Selected for State Squad</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="form-group mt-4">
                <label className="form-label">Selector Assessment Notes</label>
                <textarea
                  rows="3"
                  className="text-input full-width"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add evaluation comments, strengths, or recommendations..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedCandidate(null)}>Cancel</button>
              <button className="btn-primary" onClick={saveCandidateDecision}>Save Evaluation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
