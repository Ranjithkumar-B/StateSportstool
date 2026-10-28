import { useState, useEffect, useCallback } from 'react'

export default function UserManagement({ currentUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
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
        setUsers(data.users)
      } else {
        setUsers([])
      }
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDeleteUser = async (u) => {
    if (!u) return
    if (!window.confirm(`Are you sure you want to permanently delete "${u.name}" (${u.athleteId})? This action cannot be undone.`)) {
      return
    }

    setDeletingId(u._id)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/dashboard/users/${u._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      if (data.success) {
        setUsers(prev => prev.filter(user => user._id !== u._id))
        if (selectedUser?._id === u._id) {
          setSelectedUser(null)
        }
      } else {
        alert(data.message || 'Failed to delete user.')
      }
    } catch (err) {
      console.error('Delete user error:', err)
      alert('Error occurred while deleting user.')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.athleteId && u.athleteId.toLowerCase().includes(search.toLowerCase())) ||
      (u.sport && u.sport.toLowerCase().includes(search.toLowerCase())) ||
      (u.state && u.state.toLowerCase().includes(search.toLowerCase()))

    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="subview-container">
      <div className="subview-header">
        <div>
          <h2 className="subview-title">User Management</h2>
          <p className="subview-subtitle">Overview and detailed profile records of all registered portal users</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="filters-card">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, ID, sport, or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch('')}>×</button>
          )}
        </div>

        <div className="role-pills">
          {['all', 'athlete', 'coach', 'selector', 'admin'].map((role) => (
            <button
              key={role}
              className={`pill-btn ${roleFilter === role ? 'active' : ''}`}
              onClick={() => setRoleFilter(role)}
            >
              {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1) + 's'}
              <span className="pill-count">
                {role === 'all' ? users.length : users.filter(u => u.role === role).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <div className="table-wrapper card">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Athlete / Staff ID</th>
              <th>Role</th>
              <th>Sport</th>
              <th>State</th>
              <th>Contact</th>
              <th style={{ minWidth: '220px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="table-empty">Loading users...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty">No registered users found. Users who register on the portal will appear here.</td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="table-user-cell">
                      <div className="avatar-circle">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">{u.name}</div>
                        <div className="text-muted text-xs">{u.gender ? u.gender.toUpperCase() : 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td><code className="code-badge">{u.athleteId}</code></td>
                  <td><span className={`role-tag role-${u.role}`}>{u.role}</span></td>
                  <td>{u.sport || '—'}</td>
                  <td>{u.state || '—'}</td>
                  <td>{u.phone || '—'}</td>
                  <td className="table-actions-td">
                    <div className="table-actions-cell">
                      <button className="btn-secondary-sm" onClick={() => setSelectedUser(u)}>
                        View Profile
                      </button>
                      {u.athleteId !== 'admin' && u.athleteId !== currentUser?.athleteId && (
                        <button
                          className="btn-danger-sm"
                          disabled={deletingId === u._id}
                          onClick={() => handleDeleteUser(u)}
                          title={`Delete ${u.name}`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          {deletingId === u._id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Profile Detail Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-user-header">
                <div className="avatar-circle large">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{selectedUser.name}</h3>
                  <span className={`role-tag role-${selectedUser.role}`}>{selectedUser.role}</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setSelectedUser(null)}>×</button>
            </div>

            <div className="modal-body grid-2">
              <div className="detail-item">
                <label>Athlete / Staff ID</label>
                <div className="detail-value">{selectedUser.athleteId}</div>
              </div>
              <div className="detail-item">
                <label>Gender</label>
                <div className="detail-value">{selectedUser.gender ? selectedUser.gender.toUpperCase() : '—'}</div>
              </div>
              <div className="detail-item">
                <label>Father's Name</label>
                <div className="detail-value">{selectedUser.fatherName || '—'}</div>
              </div>
              <div className="detail-item">
                <label>Date of Birth</label>
                <div className="detail-value">
                  {selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : '—'}
                </div>
              </div>
              <div className="detail-item">
                <label>Sport Discipline</label>
                <div className="detail-value">{selectedUser.sport || '—'}</div>
              </div>
              <div className="detail-item">
                <label>State / Region</label>
                <div className="detail-value">{selectedUser.state || '—'}</div>
              </div>
              <div className="detail-item">
                <label>Phone Number</label>
                <div className="detail-value">{selectedUser.phone || '—'}</div>
              </div>
              <div className="detail-item">
                <label>Registration Date</label>
                <div className="detail-value">
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : '—'}
                </div>
              </div>
              <div className="detail-item full-width">
                <label>Residential Address</label>
                <div className="detail-value">{selectedUser.address || '—'}</div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              {selectedUser.athleteId !== 'admin' && selectedUser.athleteId !== currentUser?.athleteId ? (
                <button
                  className="btn-danger-sm"
                  disabled={deletingId === selectedUser._id}
                  onClick={() => handleDeleteUser(selectedUser)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  {deletingId === selectedUser._id ? 'Deleting...' : 'Delete User'}
                </button>
              ) : <div />}
              <button className="btn-secondary" onClick={() => setSelectedUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
