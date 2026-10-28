import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import Particles from '../components/Particles'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'
import '../styles/auth.css'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showSuccess, setShowSuccess] = useState(false)
  const [successUser, setSuccessUser] = useState(null)

  const containerRef = useRef(null)
  const headerRef = useRef(null)
  const tabsRef = useRef(null)
  const navigate = useNavigate()

  // Clear any invalid/stale tokens when user explicitly visits auth page to register or sign in
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      try {
        JSON.parse(user)
        // Verify user object is valid before navigating to dashboard
        navigate('/dashboard', { replace: true })
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [navigate])

  // GSAP entrance animation (with StrictMode context cleanup)
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(containerRef.current, { y: 60, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.8 })
      tl.fromTo('.logo-icon', { scale: 0, rotation: -180, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.7)' }, '-=0.4')
      tl.fromTo('.auth-title', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.3')
      tl.fromTo('.auth-subtitle', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, '-=0.2')
      tl.fromTo(tabsRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, '-=0.2')
    }, containerRef)

    return () => ctx.revert()
  }, [])

  // Show message with shake on error
  const showMessage = useCallback((type, text) => {
    if (!type || !text) {
      setMessage({ type: '', text: '' })
      return
    }

    setMessage({ type, text })

    if (type === 'error' && containerRef.current) {
      containerRef.current.classList.add('shake')
      setTimeout(() => containerRef.current.classList.remove('shake'), 700)
    }
  }, [])

  // Tab switch with GSAP
  const switchTab = (tab) => {
    setActiveTab(tab)
    setMessage({ type: '', text: '' })
    if (tab === 'register') {
      // Clean slate for new registration
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  // Create confetti burst
  const createConfetti = () => {
    const colors = ['#F59E0B', '#EF4444', '#22C55E', '#3B82F6', '#8B5CF6', '#06B6D4']

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div')
      confetti.className = 'confetti-piece'
      const size = Math.random() * 8 + 4
      confetti.style.cssText = `
        width: ${size}px; height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: 50%; top: 50%;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      `
      document.body.appendChild(confetti)

      gsap.to(confetti, {
        x: (Math.random() - 0.5) * window.innerWidth * 0.8,
        y: (Math.random() - 0.5) * window.innerHeight * 0.8,
        rotation: Math.random() * 720,
        opacity: 0,
        duration: Math.random() * 1.5 + 1,
        ease: 'power2.out',
        onComplete: () => confetti.remove()
      })
    }
  }

  // Success handler
  const handleSuccess = (user) => {
    setSuccessUser(user)
    setShowSuccess(true)
    createConfetti()

    // GSAP success animation
    setTimeout(() => {
      gsap.from('.success-content', { scale: 0.5, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' })
    }, 50)

    // Redirect after delay
    setTimeout(() => {
      navigate('/dashboard')
    }, 2200)
  }

  return (
    <div className="auth-page">
      <Particles />

      <div className="auth-container" ref={containerRef}>
        {/* Header */}
        <div className="auth-header" ref={headerRef}>
          <div className="logo-icon">
            <svg viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="url(#grad1)" strokeWidth="3" />
              <path d="M20 44 L32 16 L44 44" stroke="url(#grad1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M24 36 H40" stroke="url(#grad1)" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="32" cy="12" r="3" fill="#F59E0B" />
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="64" y2="64">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="auth-title">State Sports Academy</h1>
          <p className="auth-subtitle">Athlete Performance Monitoring & Selection Portal</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs" ref={tabsRef}>
          <button
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
          >Sign In</button>
          <button
            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => switchTab('register')}
          >Register</button>
          <div className={`tab-indicator ${activeTab === 'register' ? 'right' : ''}`} />
        </div>

        {/* Message */}
        {message.text && (
          <div className={`message-box show ${message.type}`}>
            <span className="message-icon">{message.type === 'error' ? '⚠️' : '✅'}</span>
            <span className="message-text">{message.text}</span>
          </div>
        )}

        {/* Login */}
        {activeTab === 'login' && (
          <>
            <LoginForm onSuccess={handleSuccess} showMessage={showMessage} />
            <p className="form-footer">
              Don't have an account?{' '}
              <span className="link" onClick={() => switchTab('register')}>Register here</span>
            </p>
          </>
        )}

        {/* Register */}
        {activeTab === 'register' && (
          <>
            <RegisterForm onSuccess={handleSuccess} showMessage={showMessage} />
            <p className="form-footer">
              Already have an account?{' '}
              <span className="link" onClick={() => switchTab('login')}>Sign in here</span>
            </p>
          </>
        )}
      </div>

      {/* Success Overlay */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-content">
            <div className="success-checkmark">
              <svg viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="25" fill="none" stroke="#22C55E" strokeWidth="2" />
                <path fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14 27l7 7 16-16" />
              </svg>
            </div>
            <h2>Welcome, {successUser?.name}!</h2>
            <p>Redirecting to your {successUser?.role} dashboard...</p>
          </div>
        </div>
      )}
    </div>
  )
}
