import { useState, useEffect, useCallback, useRef } from 'react'
import '../styles/notifications.css'

const TYPE_ICON = {
  doc_uploaded:          '📄',
  doc_verified:          '✅',
  doc_rejected:          '❌',
  training_added:        '📋',
  candidate_selected:    '🏆',
  candidate_shortlisted: '⭐',
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const res = await fetch('/api/notifications/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications || [])
        setUnread(data.unread || 0)
      }
    } catch { /* silent */ }
  }, [])

  // Poll every 5 seconds and listen for instant refresh events
  useEffect(() => {
    fetchNotifications()
    const iv = setInterval(fetchNotifications, 5000)
    const handleRefresh = () => fetchNotifications()
    window.addEventListener('refresh-notifications', handleRefresh)
    return () => {
      clearInterval(iv)
      window.removeEventListener('refresh-notifications', handleRefresh)
    }
  }, [fetchNotifications])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const clearAll = async () => {
    try {
      const token = localStorage.getItem('token')
      await fetch('/api/notifications/clear-all', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications([])
      setUnread(0)
    } catch {
      setNotifications([])
      setUnread(0)
    }
  }

  const clearOne = async (e, id) => {
    e.stopPropagation()
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(prev => prev.filter(n => n._id !== id))
      setUnread(u => Math.max(0, u - 1))
    } catch {
      setNotifications(prev => prev.filter(n => n._id !== id))
    }
  }

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token')
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(n => n.map(x => ({ ...x, isRead: true })))
      setUnread(0)
    } catch { /* silent */ }
  }

  const markOne = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/notifications/read/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(n => n.map(x => x._id === id ? { ...x, isRead: true } : x))
      setUnread(u => Math.max(0, u - 1))
    } catch { /* silent */ }
  }

  return (
    <div className="nb-wrap" ref={panelRef}>
      {/* Bell Button */}
      <button
        className={`nb-bell ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        title="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className="nb-badge">{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="nb-panel">
          {/* Panel Header */}
          <div className="nb-panel-header">
            <div>
              <span className="nb-panel-title">Notifications</span>
              {unread > 0 && <span className="nb-unread-count">{unread} new</span>}
            </div>
            <div className="nb-header-actions">
              {unread > 0 && (
                <button className="nb-mark-all" onClick={markAllRead}>
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button className="nb-clear-btn" onClick={clearAll} title="Clear all notifications">
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="nb-list">
            {notifications.length === 0 ? (
              <div className="nb-empty">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`nb-item ${n.isRead ? 'read' : 'unread'}`}
                  onClick={() => !n.isRead && markOne(n._id)}
                >
                  <div className="nb-item-icon">{TYPE_ICON[n.type] || '🔔'}</div>
                  <div className="nb-item-body">
                    <div className="nb-item-title">{n.title}</div>
                    <div className="nb-item-msg">{n.message}</div>
                    <div className="nb-item-time">{timeAgo(n.createdAt)}</div>
                  </div>
                  <div className="nb-item-actions">
                    {!n.isRead && <div className="nb-dot" />}
                    <button
                      className="nb-item-dismiss"
                      onClick={(e) => clearOne(e, n._id)}
                      title="Clear notification"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
