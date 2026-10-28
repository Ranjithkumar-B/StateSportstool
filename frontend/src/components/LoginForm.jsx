import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'

export default function LoginForm({ onSuccess, showMessage }) {
  const [athleteId, setAthleteId] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const formRef = useRef(null)
  const group1Ref = useRef(null)
  const group2Ref = useRef(null)
  const btnRef = useRef(null)

  // GSAP entrance animation (with StrictMode context cleanup)
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(group1Ref.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 })
      tl.fromTo(group2Ref.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, '-=0.2')
      tl.fromTo(btnRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, '-=0.15')

      // Pulsing glow on button
      gsap.to(btnRef.current, {
        boxShadow: '0 4px 30px rgba(245, 158, 11, 0.5)',
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })
    }, formRef)

    return () => ctx.revert()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!athleteId.trim() || !password) {
      showMessage('error', 'Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ athleteId: athleteId.trim(), password })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setLoading(false)
        showMessage('error', data.message || 'INVALID USERNAME OR PASSWORD')
        return
      }

      setLoading(false)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onSuccess(data.user)
    } catch (err) {
      setLoading(false)
      showMessage('error', 'Unable to connect to server. Please try again.')
      console.error('Login error:', err)
    }
  }

  const togglePw = () => {
    setShowPw(prev => !prev)
  }

  return (
    <form className="auth-form" ref={formRef} onSubmit={handleSubmit} autoComplete="off">

      {/* Athlete ID */}
      <div className="form-group" ref={group1Ref}>
        <label htmlFor="loginAthleteId">Athlete ID</label>
        <div className="input-wrapper">
          <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <input
            type="text"
            id="loginAthleteId"
            placeholder="Enter Athlete ID (or select demo account)"
            value={athleteId}
            onChange={e => setAthleteId(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="form-group" ref={group2Ref}>
        <label htmlFor="loginPassword">Password</label>
        <div className="input-wrapper">
          <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            type={showPw ? 'text' : 'password'}
            id="loginPassword"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="button" className="toggle-password" onClick={togglePw} aria-label="Toggle password visibility">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Submit */}
      <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} ref={btnRef}>
        <span className="btn-text">Sign In</span>
        <span className="btn-loader"></span>
      </button>
    </form>
  )
}
