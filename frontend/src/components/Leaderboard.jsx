import { useState, useEffect, useCallback } from 'react'
import '../styles/leaderboard.css'

const SPORT_EMOJI = {
  Athletics: '🏃',
  Swimming: '🏊',
  Badminton: '🏸',
  Cricket: '🏏',
  Football: '⚽',
  Basketball: '🏀',
  Volleyball: '🏐',
  Wrestling: '🤼',
  Boxing: '🥊',
  Cycling: '🚴',
  Overall: '🏆',
}

const AVATAR_PALETTE = [
  ['#7c3aed', '#c4b5fd'],
  ['#d97706', '#fde68a'],
  ['#059669', '#6ee7b7'],
  ['#2563eb', '#93c5fd'],
  ['#db2777', '#f9a8d4'],
  ['#ea580c', '#fed7aa'],
  ['#0891b2', '#a5f3fc'],
  ['#65a30d', '#d9f99d'],
  ['#dc2626', '#fca5a5'],
  ['#7c3aed', '#ddd6fe'],
]

function Avatar({ name, idx, size = 48 }) {
  const [bg, fg] = AVATAR_PALETTE[idx % AVATAR_PALETTE.length]
  const letter = (name || '?')[0].toUpperCase()
  return (
    <div
      className="lb2-avatar"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${bg}, ${fg})`,
        color: '#fff',
        fontSize: size * 0.38,
        fontWeight: 800,
        boxShadow: `0 0 0 3px ${bg}44`,
      }}
    >
      {letter}
    </div>
  )
}

function ProgressBar({ value, max, color }) {
  const pct = Math.min(100, Math.round((value / (max || 1)) * 100))
  return (
    <div className="lb2-bar-track">
      <div
        className="lb2-bar-fill"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

export default function Leaderboard() {
  const [data, setData] = useState({ allTop10: [], bySport: {} })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Overall')

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/points/leaderboard', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      const result = await res.json()
      if (result.success) {
        setData({ allTop10: result.allTop10 || [], bySport: result.bySport || {} })
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLeaderboard() }, [fetchLeaderboard])

  const sports = Object.keys(data.bySport).sort()
  const currentList = activeTab === 'Overall' ? data.allTop10 : (data.bySport[activeTab] || [])
  const maxPts = Math.max(...currentList.map(a => a.totalPoints || 0), 1)

  const podiumColors = {
    0: { glow: '#f59e0b', border: 'rgba(245,158,11,0.6)', badge: '🥇', label: '1st', height: 120 },
    1: { glow: '#9ca3af', border: 'rgba(156,163,175,0.6)', badge: '🥈', label: '2nd', height: 90 },
    2: { glow: '#d97706', border: 'rgba(217,119,6,0.6)', badge: '🥉', label: '3rd', height: 70 },
  }

  // Podium order: 2nd | 1st | 3rd
  const podiumOrder = [currentList[1], currentList[0], currentList[2]]
  const podiumIdx   = [1, 0, 2]

  return (
    <div className="lb2-page">

      {/* ══════════ HEADER ══════════ */}
      <div className="lb2-header">
        <div className="lb2-header-glow" />
        <div className="lb2-header-inner">
          <div className="lb2-trophy-wrap">
            <svg className="lb2-trophy-svg" viewBox="0 0 64 64" fill="none">
              <path d="M12 8h40v20c0 11-8.95 20-20 20S12 39 12 28V8z" fill="url(#tg1)" stroke="#fbbf24" strokeWidth="1.5"/>
              <path d="M12 18H4a4 4 0 0 0 4 4h4M52 18h8a4 4 0 0 1-4 4h-4" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
              <rect x="24" y="48" width="16" height="5" rx="2" fill="#fbbf24"/>
              <rect x="18" y="53" width="28" height="4" rx="2" fill="#f59e0b"/>
              <circle cx="32" cy="24" r="6" fill="rgba(251,191,36,0.3)" stroke="#fbbf24" strokeWidth="1"/>
              <defs>
                <linearGradient id="tg1" x1="12" y1="8" x2="52" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fde68a"/>
                  <stop offset="1" stopColor="#d97706"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="lb2-title">LEADERBOARD</h1>
            <p className="lb2-subtitle">State Sports Academy · Athlete Rankings</p>
          </div>
          <button className="lb2-refresh-btn" onClick={fetchLeaderboard} title="Refresh">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ══════════ SPORT TABS ══════════ */}
      <div className="lb2-tabs-wrap">
        <div className="lb2-tabs">
          {['Overall', ...sports].map(tab => (
            <button
              key={tab}
              className={`lb2-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="lb2-tab-emoji">{SPORT_EMOJI[tab] || '🏅'}</span>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════ BODY ══════════ */}
      {loading ? (
        <div className="lb2-loading">
          <div className="lb2-spinner" />
          <span>Fetching rankings…</span>
        </div>
      ) : currentList.length === 0 ? (
        <div className="lb2-empty">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="1.4">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 15s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
          </svg>
          <p>No athletes found in this category yet.</p>
        </div>
      ) : (
        <>
          {/* ── PODIUM ── */}
          <div className="lb2-podium">
            {podiumOrder.map((athlete, pi) => {
              if (!athlete) return <div key={pi} className="lb2-podium-slot empty" />
              const rank = podiumIdx[pi]
              const pc = podiumColors[rank]
              return (
                <div
                  key={athlete._id || pi}
                  className={`lb2-podium-slot ${rank === 0 ? 'first' : ''}`}
                  style={{ '--glow': pc.glow, '--border': pc.border }}
                >
                  {rank === 0 && <div className="lb2-crown">👑</div>}
                  <Avatar name={athlete.name} idx={rank} size={rank === 0 ? 72 : 58} />
                  <div className="lb2-podium-badge">{pc.badge}</div>
                  <div className="lb2-podium-name">{athlete.name}</div>
                  <div className="lb2-podium-sport">{athlete.sport || 'General'}</div>
                  <div className="lb2-podium-pts">{athlete.totalPoints || 0}</div>
                  <div className="lb2-podium-pts-lbl">PTS</div>
                  <div className="lb2-podium-stand" style={{ height: pc.height, background: `linear-gradient(180deg, ${pc.glow}33, ${pc.glow}11)`, borderTop: `3px solid ${pc.glow}` }}>
                    <span className="lb2-podium-rank-lbl">{pc.label}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── RANKED TABLE ── */}
          <div className="lb2-table">
            <div className="lb2-table-head">
              <span>RANK</span>
              <span>ATHLETE</span>
              <span style={{ textAlign: 'right' }}>POINTS</span>
            </div>

            {currentList.map((athlete, i) => {
              const rank = i + 1
              return (
                <div
                  key={athlete._id || i}
                  className={`lb2-row ${rank <= 3 ? 'top3' : ''}`}
                  style={{ '--delay': `${i * 50}ms` }}
                >
                  {/* Rank */}
                  <div className="lb2-row-rank">
                    {rank <= 3
                      ? <span className="lb2-medal">{['🥇','🥈','🥉'][i]}</span>
                      : <span className="lb2-rank-num">#{rank}</span>
                    }
                  </div>

                  {/* Athlete */}
                  <div className="lb2-row-athlete">
                    <Avatar name={athlete.name} idx={i} size={40} />
                    <div className="lb2-row-info">
                      <span className="lb2-row-name">{athlete.name}</span>
                      <span className="lb2-row-meta">{athlete.sport || 'General'} · {athlete.state || 'Tamil Nadu'}</span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="lb2-row-pts">
                    <span className="lb2-pts-num">{athlete.totalPoints || 0}</span>
                    <span className="lb2-pts-lbl">pts</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
