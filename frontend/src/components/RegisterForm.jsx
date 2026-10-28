import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'

const SPORTS = [
  'Athletics', 'Badminton', 'Basketball', 'Boxing', 'Cricket',
  'Football', 'Gymnastics', 'Hockey', 'Kabaddi', 'Shooting',
  'Swimming', 'Tennis', 'Volleyball', 'Weightlifting', 'Wrestling', 'Other'
]

export default function RegisterForm({ onSuccess, showMessage }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [pwStrength, setPwStrength] = useState('')

  // Form data
  const [form, setForm] = useState({
    name: '', athleteId: '', password: '', role: '',
    gender: '', fatherName: '', dateOfBirth: '',
    phone: '', sport: '', state: '', address: ''
  })

  const stepRef = useRef(null)

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (field === 'password') calcStrength(value)
  }

  // Password strength calculator
  const calcStrength = (val) => {
    if (!val) { setPwStrength(''); return }
    let score = 0
    if (val.length >= 6) score++
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++
    if (/[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val)) score++
    if (score <= 1) setPwStrength('weak')
    else if (score === 2) setPwStrength('medium')
    else setPwStrength('strong')
  }

  // Animate step transitions
  useEffect(() => {
    if (stepRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(stepRef.current,
          { x: 30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
        )
      }, stepRef)
      return () => ctx.revert()
    }
  }, [step])

  // Validate & go next
  const goNext = () => {
    if (step === 1) {
      if (!form.name.trim()) { showMessage('error', 'Please enter your full name'); return }
      if (!form.athleteId.trim()) { showMessage('error', 'Please enter an Athlete ID'); return }
      if (form.password.length < 6) { showMessage('error', 'Password must be at least 6 characters'); return }
      if (!form.role) { showMessage('error', 'Please select a role'); return }
    }
    if (step === 2) {
      if (!form.gender) { showMessage('error', 'Please select your gender'); return }
      if (!form.fatherName.trim()) { showMessage('error', "Please enter your father's name"); return }
      if (!form.dateOfBirth) { showMessage('error', 'Please enter your date of birth'); return }
    }
    showMessage('', '')
    setStep(prev => prev + 1)
  }

  const goBack = () => {
    showMessage('', '')
    setStep(prev => prev - 1)
  }

  // Submit registration
  const handleSubmit = async (e) => {
    e.preventDefault()

    const { name, athleteId, password, role, gender, fatherName, dateOfBirth } = form
    if (!name || !athleteId || !password || !role || !gender || !fatherName || !dateOfBirth) {
      showMessage('error', 'Please fill all required fields')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          athleteId: form.athleteId.trim(),
          fatherName: form.fatherName.trim(),
          phone: form.phone.trim(),
          state: form.state.trim(),
          address: form.address.trim()
        })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setLoading(false)
        showMessage('error', data.message || 'Registration failed. Please try again.')
        return
      }

      setLoading(false)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onSuccess(data.user)
    } catch (err) {
      setLoading(false)
      showMessage('error', 'Unable to connect to server. Please try again.')
      console.error('Register error:', err)
    }
  }

  // Role card click animation
  const animateRoleCard = (e) => {
    const card = e.currentTarget.querySelector('.role-card-inner')
    gsap.from(card, { scale: 0.85, duration: 0.35, ease: 'back.out(2)' })
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">

      {/* Step Indicator */}
      <div className="step-indicator">
        {[1, 2, 3].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <div className={`step ${step === s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
              <span className="step-number">{step > s ? '✓' : s}</span>
              <small>{['Basic', 'Details', 'Extra'][i]}</small>
            </div>
            {s < 3 && <div className={`step-line ${step > s ? 'active' : ''}`} />}
          </div>
        ))}
      </div>

      {/* =============== STEP 1: Basic Info =============== */}
      {step === 1 && (
        <div className="form-step" ref={stepRef} key="step1">
          {/* Name */}
          <div className="form-group">
            <label>Full Name <span className="required">*</span></label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              <input type="text" placeholder="Enter your full name" value={form.name} onChange={e => update('name', e.target.value)} required />
            </div>
          </div>

          {/* Athlete ID */}
          <div className="form-group">
            <label>Athlete ID <span className="required">*</span></label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
              </svg>
              <input type="text" placeholder="Create a unique Athlete ID" value={form.athleteId} onChange={e => update('athleteId', e.target.value)} required />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password <span className="required">*</span></label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                required minLength={6}
              />
              <button type="button" className="toggle-password" onClick={() => setShowPw(p => !p)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
            <div className="password-strength">
              <div className={`strength-bar ${pwStrength}`} />
            </div>
          </div>

          {/* Role Selector */}
          <div className="form-group">
            <label>Role <span className="required">*</span></label>
            <div className="role-selector">
              {[
                { val: 'admin', label: 'Admin', iconClass: 'admin-icon', svg: <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></> },
                { val: 'selector', label: 'Selector', iconClass: 'selector-icon', svg: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></> },
                { val: 'coach', label: 'Coach', iconClass: 'coach-icon', svg: <><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></> },
                { val: 'athlete', label: 'Athlete', iconClass: 'athlete-icon', svg: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></> }
              ].map(role => (
                <label className="role-card" key={role.val} onClick={animateRoleCard}>
                  <input type="radio" name="role" value={role.val} checked={form.role === role.val} onChange={() => update('role', role.val)} />
                  <div className="role-card-inner">
                    <div className={`role-icon ${role.iconClass}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{role.svg}</svg>
                    </div>
                    <span>{role.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button type="button" className="submit-btn next-btn" onClick={goNext}>
            Next Step
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* =============== STEP 2: Personal Details =============== */}
      {step === 2 && (
        <div className="form-step" ref={stepRef} key="step2">
          {/* Gender */}
          <div className="form-group">
            <label>Gender <span className="required">*</span></label>
            <div className="gender-selector">
              {[
                { val: 'male', icon: '♂', label: 'Male' },
                { val: 'female', icon: '♀', label: 'Female' },
                { val: 'other', icon: '⚧', label: 'Other' }
              ].map(g => (
                <label className="gender-option" key={g.val}>
                  <input type="radio" name="gender" value={g.val} checked={form.gender === g.val} onChange={() => update('gender', g.val)} />
                  <div className="gender-inner">
                    <span className="gender-icon-text">{g.icon}</span>
                    <span>{g.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Father's Name */}
          <div className="form-group">
            <label>Father's Name <span className="required">*</span></label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <input type="text" placeholder="Enter father's name" value={form.fatherName} onChange={e => update('fatherName', e.target.value)} required />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="form-group">
            <label>Date of Birth <span className="required">*</span></label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input type="date" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} required />
            </div>
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label>Phone Number</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <input type="tel" placeholder="Enter phone number" value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>
          </div>

          <div className="step-buttons">
            <button type="button" className="submit-btn back-btn" onClick={goBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button type="button" className="submit-btn next-btn" onClick={goNext}>
              Next Step
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* =============== STEP 3: Extra Details =============== */}
      {step === 3 && (
        <div className="form-step" ref={stepRef} key="step3">
          {/* Sport */}
          <div className="form-group">
            <label>Sport</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
              </svg>
              <select value={form.sport} onChange={e => update('sport', e.target.value)}>
                <option value="">Select your sport</option>
                {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* State */}
          <div className="form-group">
            <label>State</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <input type="text" placeholder="Enter your state" value={form.state} onChange={e => update('state', e.target.value)} />
            </div>
          </div>

          {/* Address */}
          <div className="form-group">
            <label>Address</label>
            <div className="input-wrapper textarea-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ top: '14px' }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <textarea placeholder="Enter your address" rows={3} value={form.address} onChange={e => update('address', e.target.value)} />
            </div>
          </div>

          <div className="step-buttons">
            <button type="button" className="submit-btn back-btn" onClick={goBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button type="submit" className={`submit-btn register-btn ${loading ? 'loading' : ''}`}>
              <span className="btn-text">Create Account</span>
              <span className="btn-loader"></span>
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
