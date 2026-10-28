import { useState, useEffect, useCallback } from 'react'

export default function ReportsView() {
  const [users, setUsers] = useState([])
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const [usersRes, candRes] = await Promise.all([
        fetch('/api/dashboard/users', { headers }),
        fetch('/api/candidates', { headers })
      ])

      const uData = await usersRes.json()
      const cData = await candRes.json()

      if (uData.success && Array.isArray(uData.users)) setUsers(uData.users)
      if (cData.success && Array.isArray(cData.candidates)) setCandidates(cData.candidates)
    } catch (err) {
      console.error('Reports data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handlePrint = () => {
    window.print()
  }

  const athleteUsers = users.filter(u => u.role === 'athlete')
  const coachUsers = users.filter(u => u.role === 'coach')
  const selectorUsers = users.filter(u => u.role === 'selector')
  const shortlistedCandidates = candidates.filter(c => c.status === 'Shortlisted')

  // Calculate sport distribution dynamically strictly from real registered athletes
  const sportCounts = {}
  const stateCounts = {}

  athleteUsers.forEach(item => {
    if (item.sport) {
      sportCounts[item.sport] = (sportCounts[item.sport] || 0) + 1
    }
    if (item.state) {
      stateCounts[item.state] = (stateCounts[item.state] || 0) + 1
    }
  })

  const sportList = Object.entries(sportCounts).map(([sport, count]) => ({ sport, count }))
  const stateList = Object.entries(stateCounts).map(([state, count]) => ({ state, count }))
  const maxSport = Math.max(...sportList.map(s => s.count), 1)
  const maxState = Math.max(...stateList.map(s => s.count), 1)

  return (
    <div className="subview-container print-area">
      <div className="subview-header">
        <div>
          <h2 className="subview-title">Reports & State Analytics</h2>
          <p className="subview-subtitle">Live analytics dynamically computed from verified academy records</p>
        </div>
        <button className="btn-primary" style={{ marginRight: '1.5cm' }} onClick={handlePrint}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Export / Print Report
        </button>
      </div>

      {/* Report Summary Cards */}
      <div className="grid-4 mb-6">
        <div className="report-summary-card card">
          <span className="summary-title">Total Registered Athletes</span>
          <div className="summary-value text-gold">{loading ? '...' : athleteUsers.length}</div>
          <span className="summary-sub">Registered on portal</span>
        </div>
        <div className="report-summary-card card">
          <span className="summary-title">Shortlisted Candidates</span>
          <div className="summary-value text-blue">{loading ? '...' : shortlistedCandidates.length}</div>
          <span className="summary-sub">Under active evaluation</span>
        </div>
        <div className="report-summary-card card">
          <span className="summary-title">Certified Coaches</span>
          <div className="summary-value text-green">{loading ? '...' : coachUsers.length}</div>
          <span className="summary-sub">Active staff members</span>
        </div>
        <div className="report-summary-card card">
          <span className="summary-title">Selectors & Board</span>
          <div className="summary-value text-purple">{loading ? '...' : selectorUsers.length}</div>
          <span className="summary-sub">Evaluation panel</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid-2 mb-6">
        {/* Sport Distribution */}
        <div className="report-chart-card card">
          <h3 className="section-title mb-4">Athletes by Discipline</h3>
          {sportList.length === 0 ? (
            <div className="text-muted text-sm py-4">No sports registered yet.</div>
          ) : (
            <div className="chart-bars">
              {sportList.map((d) => (
                <div className="chart-row" key={d.sport}>
                  <span className="chart-label">{d.sport}</span>
                  <div className="chart-track">
                    <div className="chart-bar-fill" style={{ width: `${(d.count / maxSport) * 100}%` }} />
                  </div>
                  <span className="chart-count">{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* State Representation */}
        <div className="report-chart-card card">
          <h3 className="section-title mb-4">State Contingent Distribution</h3>
          {stateList.length === 0 ? (
            <div className="text-muted text-sm py-4">No state contingents registered yet.</div>
          ) : (
            <div className="chart-bars">
              {stateList.map((d) => (
                <div className="chart-row" key={d.state}>
                  <span className="chart-label">{d.state}</span>
                  <div className="chart-track">
                    <div className="chart-bar-fill bg-emerald" style={{ width: `${(d.count / maxState) * 100}%` }} />
                  </div>
                  <span className="chart-count">{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
