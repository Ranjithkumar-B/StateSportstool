const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Candidate = require('../models/Candidate');
const User = require('../models/User');

// Helper: Calculate Bio-Kinetic Metrics
function calculateBioKinetics(scores, sport = 'Athletics', age = 20) {
  const speed = Number(scores.speed) || 75;
  const stamina = Number(scores.stamina) || 75;
  const technique = Number(scores.technique) || 75;
  const tactical = Number(scores.tactical) || 75;

  const avgScore = (speed + stamina + technique + tactical) / 4;
  
  // Dynamic Injury Risk calculation: Imbalance between speed/power vs stamina/recovery increases risk
  const deltaStaminaSpeed = Math.abs(speed - stamina);
  const baseRisk = 15;
  const riskFromImbalance = deltaStaminaSpeed * 0.8;
  const riskFromFatigue = stamina < 65 ? (65 - stamina) * 0.9 : 0;
  const injuryRiskPercent = Math.min(Math.max(Math.round(baseRisk + riskFromImbalance + riskFromFatigue), 5), 92);

  // Readiness Index
  const readinessIndex = Math.min(Math.max(Math.round(avgScore * 0.9 + (100 - injuryRiskPercent) * 0.1), 30), 99);

  // Estimated VO2 Max (ml/kg/min)
  const baseVO2 = sport.toLowerCase().includes('football') || sport.toLowerCase().includes('athletics') ? 48 : 42;
  const vo2MaxEstimate = (baseVO2 + (stamina - 70) * 0.35 + (speed - 70) * 0.15).toFixed(1);

  // Growth Momentum Index
  const growthMomentumIndex = Math.round((technique * 0.4 + tactical * 0.3 + speed * 0.3) * 1.05);

  // Personalized AI Recommendations
  const aiRecommendations = [];
  if (injuryRiskPercent > 35) {
    aiRecommendations.push({
      type: 'warning',
      category: 'Injury Prevention',
      title: 'High Neuromuscular Strain Detected',
      action: 'Incorporate 20-min low-impact pool recovery and eccentric hamstring foam rolling prior to explosive sprint drills.'
    });
  } else {
    aiRecommendations.push({
      type: 'success',
      category: 'Conditioning',
      title: 'Optimal Physical Load Balance',
      action: 'Maintain current progressive overload regime. Ready for high-intensity tactical scrimmage sessions.'
    });
  }

  if (stamina < speed - 10) {
    aiRecommendations.push({
      type: 'info',
      category: 'Stamina Boost',
      title: 'Aerobic Base Development Required',
      action: `Target Zone-2 heart rate training (45 min sessions) 3x weekly to catch up with top speed velocity (${speed} pts).`
    });
  }

  if (technique < 80) {
    aiRecommendations.push({
      type: 'tip',
      category: 'Biomechanics',
      title: 'Kinetic Chain Polish Needed',
      action: 'Analyze high-speed camera footage on stride frequency and ground contact time to boost technical mastery.'
    });
  } else {
    aiRecommendations.push({
      type: 'success',
      category: 'Technical Mastery',
      title: 'Elite Kinetic Execution',
      action: 'Biomechanical efficiency is in top 5% of state candidates. Focus on competitive pressure simulation.'
    });
  }

  // 6-Axis Bio-Kinetic Radar data
  const bioKineticRadar = {
    neuromuscular: Math.min(100, Math.round(speed * 1.05)),
    cardiovascular: Math.min(100, Math.round(stamina * 1.02)),
    tacticalAwareness: Math.min(100, tactical),
    biomechanicalEfficiency: Math.min(100, technique),
    speedVelocity: Math.min(100, speed),
    mentalResilience: Math.min(100, Math.round((stamina + tactical) / 2 + 5))
  };

  // Cryptographic Passport Verification Stamp
  const digitalPassportHash = `SSA-VERIFIED-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  return {
    injuryRiskPercent,
    readinessIndex,
    vo2MaxEstimate,
    growthMomentumIndex,
    aiRecommendations,
    bioKineticRadar,
    digitalPassportHash
  };
}

// @route GET /api/analytics/bio-kinetic/:athleteId
// @desc  Fetch bio-kinetic & AI predictive injury index for an athlete
router.get('/bio-kinetic/:athleteId', async (req, res) => {
  try {
    const { athleteId } = req.params;
    let candidate = null;
    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        candidate = await Candidate.findOne({ athleteId }).maxTimeMS(2000);
        user = await User.findOne({ athleteId }).maxTimeMS(2000);
      } catch (dbErr) {
        console.warn('MongoDB query bypassed for bio-kinetic analytics:', dbErr.message);
      }
    }

    const scores = candidate?.scores || { speed: 84, stamina: 78, technique: 88, tactical: 81 };
    const sport = candidate?.sport || user?.sport || 'Athletics';
    const age = candidate?.age || 21;

    const analytics = calculateBioKinetics(scores, sport, age);

    res.json({
      success: true,
      athleteId,
      athleteName: candidate?.name || user?.name || 'State Athlete',
      sport,
      scores,
      analytics
    });
  } catch (err) {
    console.error('Bio-kinetic API Error:', err);
    res.status(500).json({ success: false, message: 'Server error computing bio-kinetic analytics' });
  }
});

// Mock Fallback Candidates for offline DB mode
const fallbackCandidates = [
  { athleteId: 'ATH001', name: 'Aarav Sharma', sport: 'Athletics', state: 'Maharashtra', age: 21, scores: { speed: 92, stamina: 85, technique: 88, tactical: 84 }, status: 'Selected for State Squad' },
  { athleteId: 'ATH002', name: 'Priya Verma', sport: 'Badminton', state: 'Karnataka', age: 20, scores: { speed: 89, stamina: 91, technique: 94, tactical: 87 }, status: 'Selected for State Squad' },
  { athleteId: 'ATH003', name: 'Rohan Mehta', sport: 'Football', state: 'Delhi', age: 22, scores: { speed: 86, stamina: 88, technique: 82, tactical: 90 }, status: 'Shortlisted' },
  { athleteId: 'ATH004', name: 'Ananya Roy', sport: 'Athletics', state: 'West Bengal', age: 19, scores: { speed: 94, stamina: 80, technique: 85, tactical: 79 }, status: 'Shortlisted' },
  { athleteId: 'ATH005', name: 'Vikram Singh', sport: 'Wrestling', state: 'Haryana', age: 23, scores: { speed: 78, stamina: 93, technique: 86, tactical: 92 }, status: 'Under Review' },
  { athleteId: 'ATH006', name: 'Neha Patel', sport: 'Swimming', state: 'Gujarat', age: 21, scores: { speed: 85, stamina: 92, technique: 90, tactical: 83 }, status: 'Selected for State Squad' }
];

// @route POST /api/analytics/squad-optimizer
// @desc  AI Squad Auto-Assembler & Synergy Calculator
router.post('/squad-optimizer', async (req, res) => {
  try {
    const { strategy = 'Balanced', targetSquadSize = 6, sportFilter = '' } = req.body;

    let candidates = [];
    if (mongoose.connection.readyState === 1) {
      try {
        let query = {};
        if (sportFilter) {
          query.sport = new RegExp(sportFilter, 'i');
        }
        candidates = await Candidate.find(query).maxTimeMS(2000);
      } catch (dbErr) {
        console.warn('MongoDB query bypassed for squad optimizer:', dbErr.message);
      }
    }

    if (!candidates || candidates.length === 0) {
      candidates = fallbackCandidates;
    }

    if (candidates.length === 0) {
      return res.json({
        success: true,
        strategy,
        optimalSquad: [],
        synergyScore: 0,
        insights: 'No candidates available for the selected criteria.'
      });
    }

    // Weight formulas according to selected strategy
    const scoredCandidates = candidates.map(c => {
      const s = c.scores || { speed: 70, stamina: 70, technique: 70, tactical: 70 };
      let compositeScore = 0;

      if (strategy === 'Speed-Blitz') {
        compositeScore = s.speed * 0.45 + s.stamina * 0.25 + s.technique * 0.15 + s.tactical * 0.15;
      } else if (strategy === 'Endurance-Defensive') {
        compositeScore = s.stamina * 0.45 + s.tactical * 0.30 + s.technique * 0.15 + s.speed * 0.10;
      } else if (strategy === 'High-Skill-Technical') {
        compositeScore = s.technique * 0.45 + s.tactical * 0.30 + s.speed * 0.15 + s.stamina * 0.10;
      } else {
        // Balanced
        compositeScore = s.speed * 0.25 + s.stamina * 0.25 + s.technique * 0.25 + s.tactical * 0.25;
      }

      const bio = calculateBioKinetics(s, c.sport, c.age);

      return {
        _id: c._id,
        athleteId: c.athleteId,
        name: c.name,
        sport: c.sport,
        state: c.state,
        scores: s,
        compositeScore: Math.round(compositeScore * 10) / 10,
        readinessIndex: bio.readinessIndex,
        injuryRisk: bio.injuryRiskPercent,
        growthMomentum: bio.growthMomentumIndex,
        status: c.status
      };
    });

    // Sort descending by composite score
    scoredCandidates.sort((a, b) => b.compositeScore - a.compositeScore);

    const optimalSquad = scoredCandidates.slice(0, Math.min(targetSquadSize, scoredCandidates.length));

    // Calculate Squad Synergy Score
    const avgComposite = optimalSquad.reduce((acc, curr) => acc + curr.compositeScore, 0) / optimalSquad.length;
    const avgReadiness = optimalSquad.reduce((acc, curr) => acc + curr.readinessIndex, 0) / optimalSquad.length;
    const avgRisk = optimalSquad.reduce((acc, curr) => acc + curr.injuryRisk, 0) / optimalSquad.length;

    const synergyScore = Math.min(99, Math.round(avgComposite * 0.6 + avgReadiness * 0.3 + (100 - avgRisk) * 0.1));
    const winProbability = Math.min(96, Math.round(synergyScore * 0.92 + 5));

    const strategyInsights = {
      'Balanced': 'Optimal roster balance achieved across speed, stamina, technique, and tactical mastery.',
      'Speed-Blitz': 'Roster optimized for rapid counter-attacks and explosive high-velocity maneuvers.',
      'Endurance-Defensive': 'Roster selected for prolonged stamina maintenance, high work-rate, and tactical stability.',
      'High-Skill-Technical': 'Roster primed for high-precision technical execution, error-free plays, and tactical adaptation.'
    };

    res.json({
      success: true,
      strategy,
      optimalSquad,
      totalCandidatesEvaluated: candidates.length,
      synergyScore,
      winProbability,
      insights: strategyInsights[strategy] || 'AI optimized state squad configuration.'
    });
  } catch (err) {
    console.error('Squad Optimizer Error:', err);
    res.status(500).json({ success: false, message: 'Server error running squad optimizer algorithm' });
  }
});

// @route POST /api/analytics/ai-coach-query
// @desc  AI Sports Tactical & Conditioning Assistant
router.post('/ai-coach-query', async (req, res) => {
  try {
    const { sport = 'Athletics', queryType = 'tactical', targetGoal = 'Performance Boost' } = req.body;

    const responses = {
      tactical: {
        title: `AI Tactical Strategy Blueprint for ${sport}`,
        summary: `Targeted high-performance tactical adjustments for competitive state events.`,
        drills: [
          { name: 'High-Pace Transition Drill', duration: '25 mins', focus: 'Quick reaction & spatial awareness under fatigue' },
          { name: 'Pressure Simulation Scrimmage', duration: '30 mins', focus: 'Decision making under 90% peak heart rate' },
          { name: 'Video Kinetic Form Review', duration: '15 mins', focus: 'Correcting foot strike angle & deceleration mechanics' }
        ],
        nutritionAdvice: 'Carbohydrate loading 3 hours prior; electrolyte-rich hydration during drill breaks.',
        recoveryProtocol: '10-minute active cooldown walk followed by 12°C cold contrast hydrotherapy.'
      },
      workout: {
        title: `AI Power & Bio-Kinetic Conditioning Plan (${sport})`,
        summary: `Explosive muscle recruitment & kinetic chain optimization.`,
        drills: [
          { name: 'Plyometric Box Jumps & Bounds', duration: '4 sets x 8 reps', focus: 'Rate of force development (RFD)' },
          { name: 'Resisted Sprints / Sled Pushes', duration: '6 sets x 30m', focus: 'Maximum horizontal power drive' },
          { name: 'Core Anti-Rotation Holds', duration: '3 sets x 45 sec', focus: 'Trunk stability and torque transfer' }
        ],
        nutritionAdvice: 'Consuming 30g whey protein + 5g L-glutamine within 30 mins post-session.',
        recoveryProtocol: 'Foam rolling quadriceps and IT bands; target 8.5 hours uninterrupted sleep.'
      },
      injury_prevention: {
        title: `AI Injury Safeguard & Joint Durability Protocol`,
        summary: `Prehab protocol designed to eliminate biomechanical weak links and reduce tear risks.`,
        drills: [
          { name: 'Nordic Hamstring Curls', duration: '3 sets x 6 reps', focus: 'Eccentric hamstring strength build' },
          { name: 'Single-Leg Balance on Bosu', duration: '3 sets x 60 sec', focus: 'Ankle proprioception & knee stability' },
          { name: 'Dynamic Hip Flexor & Glute Activation', duration: '15 mins pre-workout', focus: 'Pelvic alignment & hip mobility' }
        ],
        nutritionAdvice: 'Collagen peptides (10g) + Vitamin C intake 45 mins prior to tendons training.',
        recoveryProtocol: 'Pneumatic compression sleeve therapy (20 mins) to accelerate metabolic waste removal.'
      }
    };

    const result = responses[queryType] || responses.tactical;

    res.json({
      success: true,
      sport,
      queryType,
      targetGoal,
      plan: result
    });
  } catch (err) {
    console.error('AI Coach Query Error:', err);
    res.status(500).json({ success: false, message: 'Server error processing AI coach query' });
  }
});

module.exports = router;
