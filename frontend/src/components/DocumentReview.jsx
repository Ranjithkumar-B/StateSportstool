import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import '../styles/dashboard.css'

function getDocumentSource(doc) {
  if (!doc) return null
  if (doc.fileData && doc.fileData.length > 20) {
    return doc.fileData
  }
  const name = encodeURIComponent(doc.athleteName || doc.athleteId || 'Registered Athlete')
  const athleteId = encodeURIComponent(doc.athleteId || 'ATH-2026')
  const docType = encodeURIComponent(doc.docType || doc.fileName || 'Official Athletic Record')
  const fileName = encodeURIComponent(doc.fileName || 'document.pdf')
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

export default function DocumentReview() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Pending') // Pending | Verified | Rejected | All
  const [actionLoading, setActionLoading] = useState(null)
  const [reviewNote, setReviewNote] = useState('')
  const [noteDocId, setNoteDocId] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)

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

  const handleVerify = async (docId, status, customNote) => {
    setActionLoading(docId)
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/kyc/verify/${docId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, reviewNote: customNote !== undefined ? customNote : (reviewNote || '') })
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

  const handleDeleteDoc = async (docId, docName) => {
    const confirmed = window.confirm(`Are you sure you want to permanently delete "${docName || 'this document'}" from the database?`)
    if (!confirmed) return

    setActionLoading(docId)
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
        setDocs(prev => prev.filter(d => d._id !== docId))
        if (previewDoc && previewDoc._id === docId) {
          setPreviewDoc(null)
        }
      } else {
        alert(data.message || 'Failed to delete document')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Error deleting document')
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
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.6fr', gap: 12, width: '100%'}}>
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
              <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.6fr', gap: 12, width: '100%', alignItems: 'center'}}>
                {/* Athlete + File */}
                <div
                  className="dv-row-left"
                  style={{cursor: 'pointer'}}
                  onClick={() => setPreviewDoc(doc)}
                  title="Click to view document"
                >
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
                <div style={{display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center'}}>
                  <button
                    className="dv-action-btn dv-action-view"
                    onClick={() => setPreviewDoc(doc)}
                    title="View uploaded document"
                  >
                    👁 View
                  </button>

                  {doc.status === 'Pending' && (
                    <>
                      <button
                        className="dv-action-btn dv-action-approve"
                        disabled={actionLoading === doc._id}
                        onClick={() => handleVerify(doc._id, 'Verified')}
                        title="Approve document"
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
                        title="Reject document"
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}
                  {doc.status !== 'Pending' && (
                    <span style={{fontSize: '0.75rem', color: statusColor(doc.status), fontWeight: 700}}>
                      {doc.status === 'Verified' ? '✓ Verified' : '✕ Rejected'}
                    </span>
                  )}
                  <button
                    type="button"
                    className="dv-action-btn dv-action-delete"
                    disabled={actionLoading === doc._id}
                    onClick={() => handleDeleteDoc(doc._id, doc.docType || doc.fileName)}
                    title="Delete document"
                  >
                    🗑 Delete
                  </button>
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

      {/* ═══════════════ DOCUMENT VIEWER MODAL ═══════════════ */}
      {/* ═══════════════ DOCUMENT VIEWER MODAL ═══════════════ */}
      {previewDoc && createPortal(
        <div className="dv-modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="dv-modal-content" onClick={e => e.stopPropagation()}>
            <div className="dv-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>
                    {previewDoc.docType || previewDoc.title}
                  </h3>
                  <span className={`dv-badge dv-badge--${(previewDoc.status || 'pending').toLowerCase()}`}>
                    {previewDoc.status}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {previewDoc.fileName || previewDoc.file} ({previewDoc.fileSize || previewDoc.size})
                </p>
              </div>
              <button className="dv-modal-close" onClick={() => setPreviewDoc(null)}>✕</button>
            </div>

            <div className="dv-modal-body">
              {(() => {
                const docSrc = getDocumentSource(previewDoc)
                const isRealPdf = docSrc?.startsWith('data:application/pdf')

                if (isRealPdf) {
                  return (
                    <iframe
                      src={docSrc}
                      title={previewDoc.fileName || 'document'}
                      className="dv-preview-iframe"
                    />
                  )
                }

                return (
                  <div className="dv-preview-img-wrap">
                    <img
                      src={docSrc}
                      alt={previewDoc.docType || 'Document'}
                      className="dv-preview-img"
                    />
                  </div>
                )
              })()}
            </div>

            <div className="dv-modal-footer">
              <a
                href={getDocumentSource(previewDoc)}
                download={previewDoc.fileName || 'document.png'}
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
                href={getDocumentSource(previewDoc)}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
              >
                Open in Full Tab ↗
              </a>

              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                {previewDoc.status === 'Pending' && (
                  <>
                    <button
                      className="dv-action-btn dv-action-approve"
                      disabled={actionLoading === previewDoc._id}
                      onClick={async () => {
                        await handleVerify(previewDoc._id, 'Verified')
                        setPreviewDoc(null)
                      }}
                    >
                      ✓ Verify & Approve
                    </button>
                    <button
                      className="dv-action-btn dv-action-reject"
                      disabled={actionLoading === previewDoc._id}
                      onClick={async () => {
                        const reason = prompt('Reason for rejection (optional):')
                        if (reason !== null) {
                          await handleVerify(previewDoc._id, 'Rejected', reason)
                          setPreviewDoc(null)
                        }
                      }}
                    >
                      ✕ Reject Document
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="dv-action-btn dv-action-delete"
                  disabled={actionLoading === previewDoc._id}
                  onClick={() => handleDeleteDoc(previewDoc._id, previewDoc.docType || previewDoc.fileName)}
                >
                  🗑 Delete Document
                </button>

                <button className="btn-secondary" onClick={() => setPreviewDoc(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
