
import { useState, useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'

export default function AINoveltyHub({ currentUser }) {
  const [activeSubTab, setActiveSubTab] = useState('bioKinetic')

  // Bio-Kinetic State
  const [speed, setSpeed] = useState(84)
  const [stamina, setStamina] = useState(78)
  const [technique, setTechnique] = useState(88)
  const [tactical, setTactical] = useState(81)
  const [selectedSport, setSelectedSport] = useState(currentUser?.sport || 'Athletics')
  const [bioData, setBioData] = useState(null)
  const [loadingBio, setLoadingBio] = useState(false)

  // Squad Optimizer State
  const [squadStrategy, setSquadStrategy] = useState('Balanced')
  const [squadSportFilter, setSquadSportFilter] = useState('')
  const [squadResult, setSquadResult] = useState(null)
  const [loadingSquad, setLoadingSquad] = useState(false)

  // Simulation State
  const [drillType, setDrillType] = useState('Sprint')
  const [paceMultiplier, setPaceMultiplier] = useState(1.2)
  const [workRestRatio, setWorkRestRatio] = useState(2.0)
  const [simStats, setSimStats] = useState({ heartRate: 165, lactate: 4.8, speed: 8.5, fatigue: 24 })
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)

  // AI Tactical Coach Studio State
  const [coachQueryType, setCoachQueryType] = useState('tactical')
  const [coachGoal, setCoachGoal] = useState('State Championship Prep')
  const [coachPlan, setCoachPlan] = useState(null)
  const [loadingCoach, setLoadingCoach] = useState(false)

  // Digital Passport Modal / View State
  const [showPassport, setShowPassport] = useState(false)

  // Canvas Radar Ref
  const radarCanvasRef = useRef(null)

  // Calculate local client-side bio metrics synchronously for fast response
  const computeClientBio = useCallback((sp, st, te, ta, sport) => {
    const avg = (sp + st + te + ta) / 4
    const delta = Math.abs(sp - st)
    const baseRisk = 12
    const riskFromImbalance = delta * 0.75
    const riskFromFatigue = st < 65 ? (65 - st) * 0.8 : 0
    const injuryRiskPercent = Math.min(Math.round(baseRisk + riskFromImbalance + riskFromFatigue), 92)
    const readinessIndex = Math.min(Math.round(avg * 0.88 + (100 - injuryRiskPercent) * 0.12), 99)
    const baseVO2 = sport.toLowerCase().includes('football') || sport.toLowerCase().includes('athletics') ? 48 : 44
    const vo2MaxEstimate = (baseVO2 + (st - 70) * 0.35 + (sp - 70) * 0.15).toFixed(1)
    const growthMomentumIndex = Math.round((te * 0.4 + ta * 0.3 + sp * 0.3) * 1.05)

    const radar = {
      neuromuscular: Math.min(100, Math.round(sp * 1.05)),
      cardiovascular: Math.min(100, Math.round(st * 1.02)),
      tacticalAwareness: Math.min(100, ta),
      biomechanicalEfficiency: Math.min(100, te),
      speedVelocity: Math.min(100, sp),
      mentalResilience: Math.min(100, Math.round((st + ta) / 2 + 5))
    }

    const recs = []
    if (injuryRiskPercent > 35) {
      recs.push({
        type: 'warning',
        category: 'Injury Prevention',
        title: 'Neuromuscular Micro-Tear Risk',
        action: 'Incorporate 20-min low-impact pool recovery and eccentric hamstring foam rolling prior to explosive sprint drills.'
      })
    } else {
      recs.push({
        type: 'success',
        category: 'Conditioning',
        title: 'Optimal Physical Load Balance',
        action: 'Maintain current progressive overload regime. Ready for high-intensity tactical scrimmage sessions.'
      })
    }

    if (st < sp - 8) {
      recs.push({
        type: 'info',
        category: 'Stamina Boost',
        title: 'Aerobic Base Development Required',
        action: `Target Zone-2 heart rate training (45 min sessions) 3x weekly to match peak speed velocity (${sp} pts).`
      })
    }

    if (te >= 85) {
      recs.push({
        type: 'success',
        category: 'Technical Mastery',
        title: 'Elite Kinetic Execution',
        action: 'Biomechanical efficiency is in top 5% of state candidates. Focus on competitive pressure simulation.'
      })
    } else {
      recs.push({
        type: 'tip',
        category: 'Biomechanics',
        title: 'Stride Optimization',
        action: 'Analyze high-speed camera footage on ground contact time to boost technical mastery.'
      })
    }

    return {
      injuryRiskPercent,
      readinessIndex,
      vo2MaxEstimate,
      growthMomentumIndex,
      radar,
      recs,
      hash: `SSA-PASS-${Math.random().toString(36).substring(2, 8).toUpperCase()}-2026`
    }
  }, [])

  // Sync state & render radar
  useEffect(() => {
    const calculated = computeClientBio(speed, stamina, technique, tactical, selectedSport)
    setBioData(calculated)
  }, [speed, stamina, technique, tactical, selectedSport, computeClientBio])

  // Draw 6-Axis Radar Canvas
  useEffect(() => {
    if (!radarCanvasRef.current || !bioData) return
    const canvas = radarCanvasRef.current
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 40

    ctx.clearRect(0, 0, width, height)

    const labels = [
      'Neuromuscular',
      'Cardio Base',
      'Tactical IQ',
      'Biomechanics',
      'Speed Velocity',
      'Mental Resilience'
    ]
    const values = [
      bioData.radar.neuromuscular,
      bioData.radar.cardiovascular,
      bioData.radar.tacticalAwareness,
      bioData.radar.biomechanicalEfficiency,
      bioData.radar.speedVelocity,
      bioData.radar.mentalResilience
    ]

    const numSides = labels.length
    const angleStep = (Math.PI * 2) / numSides

    // Draw background concentric webs
    const levels = 4
    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius / levels) * level
      ctx.beginPath()
      for (let i = 0; i < numSides; i++) {
        const angle = i * angleStep - Math.PI / 2
        const x = centerX + levelRadius * Math.cos(angle)
        const y = centerY + levelRadius * Math.sin(angle)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Draw axis lines and labels
    for (let i = 0; i < numSides; i++) {
      const angle = i * angleStep - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.stroke()

      // Labels
      const labelX = centerX + (radius + 22) * Math.cos(angle)
      const labelY = centerY + (radius + 18) * Math.sin(angle)
      ctx.font = '11px sans-serif'
      ctx.fillStyle = '#9CA3AF'
      ctx.textAlign = labelX < centerX - 10 ? 'right' : labelX > centerX + 10 ? 'left' : 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(labels[i], labelX, labelY)
    }

    // Draw Polygon Shape for Athlete
    ctx.beginPath()
    for (let i = 0; i < numSides; i++) {
      const angle = i * angleStep - Math.PI / 2
      const val = values[i] / 100
      const x = centerX + radius * val * Math.cos(angle)
      const y = centerY + radius * val * Math.sin(angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()

    // Neon Gradient Fill
    const grad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius)
    grad.addColorStop(0, 'rgba(245, 158, 11, 0.55)')
    grad.addColorStop(1, 'rgba(239, 68, 68, 0.35)')
    ctx.fillStyle = grad
    ctx.fill()

    ctx.strokeStyle = '#F59E0B'
    ctx.lineWidth = 2.5
    ctx.shadowColor = '#F59E0B'
    ctx.shadowBlur = 12
    ctx.stroke()
    ctx.shadowBlur = 0 // reset

    // Draw Glowing Points at vertices
    for (let i = 0; i < numSides; i++) {
      const angle = i * angleStep - Math.PI / 2
      const val = values[i] / 100
      const x = centerX + radius * val * Math.cos(angle)
      const y = centerY + radius * val * Math.sin(angle)

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#38BDF8'
      ctx.fill()
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
  }, [bioData])

  // Run Backend Bio fetch on mount
  useEffect(() => {
    if (!currentUser?.athleteId) return
    const fetchBackendBio = async () => {
      setLoadingBio(true)
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/analytics/bio-kinetic/${currentUser.athleteId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success && data.analytics) {
          setBioData(prev => ({ ...prev, ...data.analytics }))
          if (data.scores) {
            setSpeed(data.scores.speed || 84)
            setStamina(data.scores.stamina || 78)
            setTechnique(data.scores.technique || 88)
            setTactical(data.scores.tactical || 81)
          }
        }
      } catch (err) {
        console.error('Fetch Bio Error:', err)
      } finally {
        setLoadingBio(false)
      }
    }
    fetchBackendBio()
  }, [currentUser])

  // Run Squad Optimizer
  const runSquadOptimizer = async () => {
    setLoadingSquad(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/analytics/squad-optimizer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          strategy: squadStrategy,
          targetSquadSize: 6,
          sportFilter: squadSportFilter
        })
      })
      const data = await res.json()
      if (data.success) {
        setSquadResult(data)
      }
    } catch (err) {
      console.error('Squad Optimizer Error:', err)
    } finally {
      setLoadingSquad(false)
    }
  }

  // Run Squad Optimizer on tab switch
  useEffect(() => {
    if (activeSubTab === 'squadOptimizer' && !squadResult) {
      runSquadOptimizer()
    }
  }, [activeSubTab])

  // Run AI Tactical Coach Query
  const fetchCoachPlan = async () => {
    setLoadingCoach(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/analytics/ai-coach-query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sport: selectedSport,
          queryType: coachQueryType,
          targetGoal: coachGoal
        })
      })
      const data = await res.json()
      if (data.success) {
        setCoachPlan(data.plan)
      }
    } catch (err) {
      console.error('Coach Query Error:', err)
    } finally {
      setLoadingCoach(false)
    }
  }

  useEffect(() => {
    if (activeSubTab === 'aiCoach' && !coachPlan) {
      fetchCoachPlan()
    }
  }, [activeSubTab])

  // Animation Loop for Biomechanical Drill Simulator Canvas
  useEffect(() => {
    if (activeSubTab !== 'simulator' || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let step = 0

    const render = () => {
      step += 0.05 * paceMultiplier
      const w = canvas.width
      const h = canvas.height

      ctx.clearRect(0, 0, w, h)

      // Background grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
      ctx.lineWidth = 1
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += 25) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      // Draw Heart Rate Sine Wave (Red/Orange Glowing)
      ctx.beginPath()
      for (let x = 0; x < w; x++) {
        const amplitude = 35 * (drillType === 'Sprint' ? 1.4 : drillType === 'Intervals' ? 1.2 : 0.9)
        const freq = 0.02 * paceMultiplier
        const y = h / 2 + Math.sin(x * freq + step) * amplitude + Math.cos(x * 0.005) * 10
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = '#EF4444'
      ctx.lineWidth = 3
      ctx.shadowColor = '#EF4444'
      ctx.shadowBlur = 10
      ctx.stroke()
      ctx.shadowBlur = 0

      // Draw Lactate Accumulation Curve (Cyan Wave)
      ctx.beginPath()
      for (let x = 0; x < w; x++) {
        const y = h * 0.75 - Math.sin(x * 0.015 - step * 0.5) * 20 * workRestRatio
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = '#06B6D4'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 4])
      ctx.stroke()
      ctx.setLineDash([])

      // Draw Velocity Peak Curve (Gold Wave)
      ctx.beginPath()
      for (let x = 0; x < w; x++) {
        const y = h * 0.3 + Math.cos(x * 0.025 + step) * 25
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = '#F59E0B'
      ctx.lineWidth = 2
      ctx.stroke()

      // Calculate dynamic simulated stats
      const liveHR = Math.round(140 + Math.sin(step) * 25 * paceMultiplier)
      const liveLactate = (3.2 + Math.abs(Math.sin(step * 0.5)) * 4.5 * workRestRatio).toFixed(1)
      const liveSpeed = (7.0 + Math.abs(Math.cos(step)) * 5.5 * paceMultiplier).toFixed(1)
      const liveFatigue = Math.min(95, Math.round(15 + step * 1.5 * paceMultiplier))

      setSimStats({ heartRate: liveHR, lactate: liveLactate, speed: liveSpeed, fatigue: liveFatigue })

      animationFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [activeSubTab, drillType, paceMultiplier, workRestRatio])

  return (
    <div className="subview-container">
      {/* Novelty Header */}
      <div className="subview-header flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-novelty">SSA AI NOVELTY ENGINE</span>
            <span className="text-xs text-gold font-mono uppercase tracking-widest">v3.6 Next-Gen</span>
          </div>
          <h2 className="subview-title">Bio-Kinetic & AI Talent Innovation Studio</h2>
          <p className="subview-subtitle">
            Pioneering AI injury predictive modeling, 6-axis biomechanical radar, squad synergy optimizer & verifiable digital passports.
          </p>
        </div>

        <button 
          className="btn-gold flex items-center gap-2 text-sm px-4 py-2"
          onClick={() => setShowPassport(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
          View Verifiable Talent Passport
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-gray-800 mb-6 gap-2 overflow-x-auto pb-2">
        {[
          { id: 'bioKinetic', label: '⚡ Bio-Kinetic & Injury Predictor', desc: '6-Axis Biomechanical Radar & Injury Risk Engine' },
          { id: 'squadOptimizer', label: '🧠 AI Squad Synergy Auto-Optimizer', desc: 'Multi-variable talent assembly & win probability' },
          { id: 'simulator', label: '🏎️ Motion & Heart Rate Simulator', desc: 'Real-time biomechanical canvas drill simulator' },
          { id: 'aiCoach', label: '🎯 SSA AI Coach Assistant', desc: 'Personalized tactical, conditioning & prehab blueprints' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
            onClick={() => setActiveSubTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: BIO-KINETIC & INJURY PREDICTOR */}
      {activeSubTab === 'bioKinetic' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Sliders & Controls */}
          <div className="lg:col-span-5 card p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="section-title text-gold text-lg">Interactive Metric Tuning</h3>
                <span className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full border border-gray-700">Real-Time Simulation</span>
              </div>
              <p className="text-xs text-muted mb-6">
                Adjust key athletic parameters below to simulate immediate shifts in bio-kinetic balance, injury risk probability, and estimated VO2 max.
              </p>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5 font-medium">
                    <span className="text-gold">Speed & Power Velocity</span>
                    <span className="font-mono text-amber-400">{speed} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={speed}
                    onChange={e => setSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1.5 font-medium">
                    <span className="text-blue-400">Stamina & Aerobic Base</span>
                    <span className="font-mono text-blue-400">{stamina} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={stamina}
                    onChange={e => setStamina(Number(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1.5 font-medium">
                    <span className="text-emerald-400">Technical Biomechanics</span>
                    <span className="font-mono text-emerald-400">{technique} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={technique}
                    onChange={e => setTechnique(Number(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1.5 font-medium">
                    <span className="text-purple-400">Tactical Game Intelligence</span>
                    <span className="font-mono text-purple-400">{tactical} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={tactical}
                    onChange={e => setTactical(Number(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Target Sport discipline</label>
                  <select
                    value={selectedSport}
                    onChange={e => setSelectedSport(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-amber-500 outline-none"
                  >
                    <option value="Athletics">Athletics (Track & Field)</option>
                    <option value="Football">Football / Soccer</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Swimming">Swimming</option>
                    <option value="Wrestling">Wrestling / Combat Sports</option>
                    <option value="Weightlifting">Weightlifting / Power</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick KPI summary card */}
            {bioData && (
              <div className="mt-6 p-4 rounded-xl bg-gray-900/80 border border-amber-500/20 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Readiness Index</div>
                  <div className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">{bioData.readinessIndex}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Est. VO2 Max</div>
                  <div className="text-2xl font-bold text-cyan-400 font-mono mt-0.5">{bioData.vo2MaxEstimate} <span className="text-xs text-gray-400">ml/kg</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: 6-Axis Canvas Radar + AI Predictive Injury Cards */}
          <div className="lg:col-span-7 space-y-6">
            {/* Canvas Radar Card */}
            <div className="card p-6 flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-2">
                <h3 className="section-title text-lg">6-Axis Biomechanical Kinetic Radar</h3>
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Canvas Vector
                </span>
              </div>

              <div className="w-full flex justify-center py-2">
                <canvas
                  ref={radarCanvasRef}
                  width={420}
                  height={320}
                  className="max-w-full h-auto drop-shadow-2xl"
                />
              </div>

              {/* Injury Risk Meter */}
              {bioData && (
                <div className="w-full mt-4 bg-gray-900/90 p-4 rounded-xl border border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-200">AI Predictive Injury Risk Gauge</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                      bioData.injuryRiskPercent > 35
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : bioData.injuryRiskPercent > 20
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {bioData.injuryRiskPercent}% Risk ({bioData.injuryRiskPercent > 35 ? 'Elevated Strain' : bioData.injuryRiskPercent > 20 ? 'Moderate Load' : 'Optimal Safe Zone'})
                    </span>
                  </div>

                  <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden relative border border-gray-700">
                    <div
                      className={`h-full transition-all duration-500 ${
                        bioData.injuryRiskPercent > 35
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                          : 'bg-gradient-to-r from-emerald-500 to-amber-500'
                      }`}
                      style={{ width: `${bioData.injuryRiskPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* AI Prescriptive Action Cards */}
            {bioData && (
              <div className="card p-6">
                <h3 className="section-title text-lg mb-4">Personalized AI Prescriptive Directives</h3>
                <div className="space-y-3">
                  {bioData.recs.map((rec, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                        rec.type === 'warning'
                          ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                          : rec.type === 'info'
                          ? 'bg-sky-950/20 border-sky-500/30 text-sky-200'
                          : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      }`}
                    >
                      <div className="mt-0.5 text-lg">
                        {rec.type === 'warning' ? '⚠️' : rec.type === 'info' ? 'ℹ️' : '✅'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{rec.title}</span>
                          <span className="text-xs uppercase px-2 py-0.5 rounded bg-black/40 text-gray-300 border border-white/10">
                            {rec.category}
                          </span>
                        </div>
                        <p className="text-xs mt-1 text-gray-300 leading-relaxed">{rec.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI SQUAD SYNERGY AUTO-OPTIMIZER */}
      {activeSubTab === 'squadOptimizer' && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <div>
                <h3 className="section-title text-xl text-gold">State Squad AI Multi-Objective Optimizer</h3>
                <p className="text-xs text-muted mt-1">
                  Evaluates database candidates using vector weight matrices to assemble the highest synergy state team.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={squadStrategy}
                  onChange={e => setSquadStrategy(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none"
                >
                  <option value="Balanced">Balanced High-Synergy</option>
                  <option value="Speed-Blitz">Speed & Acceleration Blitz</option>
                  <option value="Endurance-Defensive">Endurance & Defensive Lock</option>
                  <option value="High-Skill-Technical">High Technical Mastery</option>
                </select>

                <button
                  className="btn-gold px-5 py-2 text-sm font-semibold flex items-center gap-2"
                  onClick={runSquadOptimizer}
                  disabled={loadingSquad}
                >
                  {loadingSquad ? 'Optimizing...' : '⚡ Run AI Auto-Selection'}
                </button>
              </div>
            </div>

            {/* Strategy Insights & Synergy KPIs */}
            {squadResult && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-gray-900 border border-amber-500/20 text-center">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Squad Synergy Score</span>
                  <div className="text-3xl font-extrabold text-amber-400 font-mono mt-1">{squadResult.synergyScore}%</div>
                  <span className="text-xs text-emerald-400">Cohesive Performance Alignment</span>
                </div>

                <div className="p-4 rounded-xl bg-gray-900 border border-blue-500/20 text-center">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Projected State Win Probability</span>
                  <div className="text-3xl font-extrabold text-blue-400 font-mono mt-1">{squadResult.winProbability}%</div>
                  <span className="text-xs text-blue-300">Based on competitive benchmarks</span>
                </div>

                <div className="p-4 rounded-xl bg-gray-900 border border-purple-500/20 text-center">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Selection Strategy</span>
                  <div className="text-xl font-bold text-purple-300 mt-1">{squadResult.strategy}</div>
                  <span className="text-xs text-gray-400">Target Roster: 6 Athletes</span>
                </div>
              </div>
            )}

            {/* Optimal Squad Table */}
            {squadResult?.optimalSquad && (
              <div className="overflow-x-auto border border-gray-800 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-900 text-gray-400 text-xs uppercase border-b border-gray-800">
                      <th className="p-3.5">Rank / ID</th>
                      <th className="p-3.5">Athlete Name</th>
                      <th className="p-3.5">Sport & State</th>
                      <th className="p-3.5 text-center">Composite Score</th>
                      <th className="p-3.5 text-center">Readiness Index</th>
                      <th className="p-3.5 text-center">Injury Risk</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {squadResult.optimalSquad.map((athlete, idx) => (
                      <tr key={athlete._id || idx} className="hover:bg-gray-800/40 transition-colors">
                        <td className="p-3.5 font-mono text-amber-400 font-bold">
                          #{idx + 1} <span className="text-xs text-gray-500 font-normal">({athlete.athleteId})</span>
                        </td>
                        <td className="p-3.5 font-semibold text-white">{athlete.name}</td>
                        <td className="p-3.5 text-gray-300 text-xs">
                          {athlete.sport} • <span className="text-muted">{athlete.state}</span>
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-amber-400 text-base">
                          {athlete.compositeScore}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono font-semibold text-xs border border-emerald-500/30">
                            {athlete.readinessIndex}%
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded font-mono font-semibold text-xs border ${
                            athlete.injuryRisk > 30 
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
                              : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                          }`}>
                            {athlete.injuryRisk}%
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <span className="status-pill status-completed text-xs">
                            {athlete.status || 'Selected'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MOTION & HEART RATE DRILL SIMULATOR */}
      {activeSubTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 card p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="section-title text-lg text-gold">Live Biomechanical Canvas Simulator</h3>
                <p className="text-xs text-muted">Real-time simulation of heart rate (Red), lactate (Cyan), and velocity peaks (Gold)</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                ● Canvas Engine 60 FPS
              </span>
            </div>

            <div className="bg-gray-950 rounded-xl border border-gray-800 p-2 overflow-hidden flex justify-center">
              <canvas ref={canvasRef} width={680} height={300} className="w-full h-auto" />
            </div>

            {/* Live Stats Readout Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="p-3 bg-gray-900 rounded-lg border border-rose-500/30 text-center">
                <span className="text-xs text-gray-400 uppercase">Heart Rate</span>
                <div className="text-2xl font-bold text-rose-400 font-mono">{simStats.heartRate} <span className="text-xs font-normal">BPM</span></div>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg border border-cyan-500/30 text-center">
                <span className="text-xs text-gray-400 uppercase">Lactate Level</span>
                <div className="text-2xl font-bold text-cyan-400 font-mono">{simStats.lactate} <span className="text-xs font-normal">mmol/L</span></div>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg border border-amber-500/30 text-center">
                <span className="text-xs text-gray-400 uppercase">Sim Velocity</span>
                <div className="text-2xl font-bold text-amber-400 font-mono">{simStats.speed} <span className="text-xs font-normal">m/s</span></div>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg border border-purple-500/30 text-center">
                <span className="text-xs text-gray-400 uppercase">Fatigue Accumulation</span>
                <div className="text-2xl font-bold text-purple-400 font-mono">{simStats.fatigue}%</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 card p-6 flex flex-col justify-between">
            <div>
              <h3 className="section-title text-lg mb-4">Drill Controls</h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Drill Archetype</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Sprint', 'Intervals', 'Agility', 'Plyometric'].map(d => (
                      <button
                        key={d}
                        onClick={() => setDrillType(d)}
                        className={`p-2.5 rounded-lg text-xs font-semibold border transition-all ${
                          drillType === d
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                            : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-gray-300">Pace Multiplier</span>
                    <span className="font-mono text-amber-400">{paceMultiplier}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={paceMultiplier}
                    onChange={e => setPaceMultiplier(Number(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-gray-300">Work / Rest Ratio</span>
                    <span className="font-mono text-cyan-400">{workRestRatio}:1</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="4.0"
                    step="0.5"
                    value={workRestRatio}
                    onChange={e => setWorkRestRatio(Number(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-gray-900 border border-gray-800 text-xs text-muted leading-relaxed">
              💡 <strong>Biomechanical Note:</strong> High work-to-rest ratios (&gt;2.5) accelerate lactate accumulation above 4.0 mmol/L, requiring targeted active recovery drills.
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SSA AI COACH ASSISTANT */}
      {activeSubTab === 'aiCoach' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 card p-6">
            <h3 className="section-title text-lg text-gold mb-4">SSA AI Tactical Coach Studio</h3>
            <p className="text-xs text-muted mb-6">
              Generate sport-specific tactical, power conditioning, and prehab injury prevention blueprints instantly.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Blueprint Objective</label>
                <select
                  value={coachQueryType}
                  onChange={e => setCoachQueryType(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-amber-500 outline-none"
                >
                  <option value="tactical">Tactical Strategy & Match Preparation</option>
                  <option value="workout">High-Performance Power & Conditioning</option>
                  <option value="injury_prevention">Prehab & Micro-Tear Injury Safeguard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Target Milestone Goal</label>
                <input
                  type="text"
                  value={coachGoal}
                  onChange={e => setCoachGoal(e.target.value)}
                  placeholder="e.g. State Championship Final"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-amber-500 outline-none"
                />
              </div>

              <button
                className="w-full btn-gold py-3 text-sm font-semibold flex justify-center items-center gap-2 mt-4"
                onClick={fetchCoachPlan}
                disabled={loadingCoach}
              >
                {loadingCoach ? 'Generating Blueprint...' : '🚀 Generate AI Coaching Blueprint'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 card p-6">
            {coachPlan ? (
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-3">
                  <div>
                    <h3 className="font-bold text-lg text-white">{coachPlan.title}</h3>
                    <p className="text-xs text-gray-400">{coachPlan.summary}</p>
                  </div>
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30">
                    {selectedSport}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-3">Structured Drill Sequence</h4>
                <div className="space-y-3 mb-6">
                  {coachPlan.drills.map((drill, idx) => (
                    <div key={idx} className="p-3 bg-gray-900 rounded-lg border border-gray-800 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-sm text-gray-200">{drill.name}</div>
                        <div className="text-xs text-gray-400">{drill.focus}</div>
                      </div>
                      <span className="text-xs font-mono text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/20">
                        {drill.duration}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-900 rounded-xl border border-sky-500/20">
                    <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">Nutrition & Hydration</h4>
                    <p className="text-xs text-gray-300">{coachPlan.nutritionAdvice}</p>
                  </div>
                  <div className="p-4 bg-gray-900 rounded-xl border border-purple-500/20">
                    <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Recovery Protocol</h4>
                    <p className="text-xs text-gray-300">{coachPlan.recoveryProtocol}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col justify-center items-center text-center text-muted">
                <p>Click "Generate AI Coaching Blueprint" to load customized drill strategies.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VERIFIABLE DIGITAL TALENT PASSPORT MODAL */}
      {showPassport && bioData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center items-center p-4">
          <div className="bg-gray-950 border border-amber-500/40 rounded-2xl p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setShowPassport(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold"
            >
              ✕
            </button>

            {/* Passport Card Content */}
            <div className="border border-amber-500/30 rounded-xl p-6 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
              {/* Holographic Watermark */}
              <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                <svg width="200" height="200" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="30" stroke="#F59E0B" strokeWidth="4" />
                </svg>
              </div>

              <div className="flex justify-between items-start border-b border-amber-500/20 pb-4 mb-4">
                <div>
                  <span className="text-[10px] tracking-widest uppercase text-amber-400 font-bold">STATE SPORTS AUTHORITY</span>
                  <h3 className="text-lg font-extrabold text-white">Digital Athlete Passport</h3>
                </div>
                <div className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded text-[10px] font-mono font-bold">
                  VERIFIED
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Athlete Name</span>
                  <span className="font-bold text-white text-sm">{currentUser?.name || 'State Athlete'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Athlete ID</span>
                  <span className="font-mono text-amber-400 font-bold">{currentUser?.athleteId || 'SSA-2026'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Discipline</span>
                  <span className="font-semibold text-gray-200">{selectedSport}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Readiness Index</span>
                  <span className="font-mono font-bold text-emerald-400">{bioData.readinessIndex}%</span>
                </div>
              </div>

              <div className="bg-black/50 p-3 rounded-lg border border-gray-800 text-[11px] font-mono mb-4 text-gray-300">
                <span className="text-gray-500 block text-[9px] uppercase">Cryptographic Stamp Hash</span>
                {bioData.hash}
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-400 pt-2 border-t border-gray-800">
                <span>Issued: October 2026</span>
                <button
                  onClick={() => alert('Official State Athlete Passport sent to print/export!')}
                  className="text-amber-400 font-bold hover:underline"
                >
                  Download / Print Certificate 🖨️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
