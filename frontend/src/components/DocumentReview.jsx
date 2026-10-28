import { useState, useEffect, useCallback } from 'react'
import '../styles/dashboard.css'

export default function DocumentReview() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Pending') // Pending | Verified | Rejected | All
  const [actionLoading, setActionLoading] = useState(null)
  const [reviewNote, setReviewNote] = useState('')
  const [noteDocId, setNoteDocId] = useState(null)

  const fetchDocs = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const endpoint = filter === 'Pending' ? '/api/kyc/pending' : '/api/kyc/all'
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        let list = data.documents || []
        if (filter !== 'Pending' && filter !== 'All') {
          list = list.filter(d => d.status === filter)
        }
        setDocs(list)
      }
    } catch {
      setDocs([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchDocs()
  }, [fetchDocs])

  const handleVerify = async (docId, status) => {
    setActionLoading(docId)
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/kyc/verify/${docId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, reviewNote: reviewNote || '' })
      })
      setReviewNote('')
      setNoteDocId(null)
      fetchDocs()
    } catch {
      // silently fail
    } finally {
      setActionLoading(null)
    }
  }

  const statusColor = (s) => {
    if (s === 'Verified') return '#34d399'
    if (s === 'Rejected') return '#f87171'
    return '#fbbf24'
  }

  return (
    <div className="subview-container animate-fade-in">
      <div className="subview-header">
        <h2>Document Verification</h2>
        <p style={{color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4}}>
          Review and verify documents uploaded by athletes
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="dv-review-tabs">
        {['Pending', 'Verified', 'Rejected', 'All'].map(tab => (
          <button
            key={tab}
            className={`dv-review-tab ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
            {tab === 'Pending' && docs.length > 0 && filter === 'Pending' && (
              <span className="dv-review-count">{docs.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="dv-card" style={{marginTop: 20}}>
        <div className="dv-table-head" style={{gridTemplateColumns: '1fr'}}>
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, width: '100%'}}>
            <span className="dv-col-doc">ATHLETE / DOCUMENT</span>
            <span className="dv-col-doc">TYPE</span>
            <span className="dv-col-doc">STATUS</span>
            <span className="dv-col-doc" style={{textAlign: 'right'}}>ACTIONS</span>
          </div>
        </div>

        <div className="dv-rows">
          {loading && (
            <div style={{padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)'}}>
              Loading documents…
            </div>
          )}

          {!loading && docs.length === 0 && (
            <div style={{padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)'}}>
              No {filter.toLowerCase()} documents found.
            </div>
          )}

          {!loading && docs.map((doc, i) => (
            <div className="dv-row" key={doc._id || i} style={{'--i': i}}>
              <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, width: '100%', alignItems: 'center'}}>
                {/* Athlete + File */}
                <div className="dv-row-left">
                  <div className="dv-file-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </div>
                  <div className="dv-file-info">
                    <span className="dv-file-title">{doc.athleteName || doc.athleteId}</span>
                    <span className="dv-file-meta">{doc.fileName} ({doc.fileSize})</span>
                  </div>
                </div>

                {/* Doc Type */}
                <div style={{fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600}}>
                  {doc.docType}
                </div>

                {/* Status Badge */}
                <div>
                  <span
                    className={`dv-badge dv-badge--${(doc.status || 'pending').toLowerCase()}`}
                  >
                    {doc.status}
                  </span>
                </div>

                {/* Actions */}
                <div style={{display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap'}}>
                  {doc.status === 'Pending' && (
                    <>
                      <button
                        className="dv-action-btn dv-action-approve"
                        disabled={actionLoading === doc._id}
                        onClick={() => handleVerify(doc._id, 'Verified')}
                      >
                        ✓ Verify
                      </button>
                      <button
                        className="dv-action-btn dv-action-reject"
                        disabled={actionLoading === doc._id}
                        onClick={() => {
                          if (noteDocId === doc._id) {
                            handleVerify(doc._id, 'Rejected')
                          } else {
                            setNoteDocId(doc._id)
                          }
                        }}
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}
                  {doc.status !== 'Pending' && (
                    <span style={{fontSize: '0.75rem', color: statusColor(doc.status), fontWeight: 700}}>
                      {doc.status === 'Verified' ? '✓ Done' : '✕ Done'}
                    </span>
                  )}
                </div>
              </div>

              {/* Reject Note Input */}
              {noteDocId === doc._id && (
                <div style={{width: '100%', marginTop: 12, display: 'flex', gap: 8}}>
                  <input
                    type="text"
                    placeholder="Reason for rejection (optional)…"
                    value={reviewNote}
                    onChange={e => setReviewNote(e.target.value)}
                    className="form-input"
                    style={{flex: 1, fontSize: '0.82rem'}}
                  />
                  <button
                    className="dv-action-btn dv-action-reject"
                    onClick={() => handleVerify(doc._id, 'Rejected')}
                    disabled={actionLoading === doc._id}
                  >
                    Confirm Reject
                  </button>
                  <button
                    className="btn-secondary"
                    style={{fontSize: '0.78rem', padding: '6px 14px'}}
                    onClick={() => { setNoteDocId(null); setReviewNote('') }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
