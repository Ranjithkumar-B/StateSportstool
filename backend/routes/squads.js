const express = require('express');
const SquadAssignment = require('../models/SquadAssignment');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();
const mongoose = require('mongoose');

const fallbackSquad = [];

// Get assigned squad athletes
router.get('/', verifyToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, squad: fallbackSquad });
    }

    const Candidate = require('../models/Candidate');
    const User = require('../models/User');
    const squad = await SquadAssignment.find().lean().sort({ createdAt: -1 }).maxTimeMS(2000);
    
    // Batch fetch candidates, users, and coaches
    const athleteIds = squad.map(a => a.athleteId).filter(Boolean);
    const coachIds = squad.map(a => a.coachId).filter(Boolean);
    const [candidates, users, coaches] = await Promise.all([
      Candidate.find({ athleteId: { $in: athleteIds } }).lean().maxTimeMS(2000).catch(() => []),
      User.find({ athleteId: { $in: athleteIds } }).lean().maxTimeMS(2000).catch(() => []),
      User.find({ _id: { $in: coachIds } }).select('name').lean().maxTimeMS(2000).catch(() => [])
    ]);

    const candidateMap = new Map(candidates.map(c => [c.athleteId, c]));
    const userMap = new Map(users.map(u => [u.athleteId, u]));
    const coachMap = new Map(coaches.map(c => [c._id.toString(), c.name]));

    for (let athlete of squad) {
      const candidate = candidateMap.get(athlete.athleteId);
      if (candidate && candidate.scores) {
        const { speed, stamina, technique, tactical } = candidate.scores;
        const average = Math.round(((speed || 0) + (stamina || 0) + (technique || 0) + (tactical || 0)) / 4);
        athlete.fitnessScore = `${average}/100`;
      }
      const user = userMap.get(athlete.athleteId);
      if (user) {
        athlete.totalPoints = user.totalPoints || 0;
      }
      if (athlete.coachId && coachMap.has(athlete.coachId.toString())) {
        athlete.coachName = coachMap.get(athlete.coachId.toString());
      }
    }
    
    res.status(200).json({ success: true, squad });
  } catch (err) {
    console.error('Fetch squad error:', err);
    res.status(200).json({ success: true, squad: [] });
  }
});

// Assign registered athlete to squad
router.post('/', verifyToken, async (req, res) => {
  try {
    const { athleteId, name, sport, state } = req.body;
    if (!athleteId || !name) {
      return res.status(400).json({ success: false, message: 'Athlete ID and name required' });
    }

    const existing = await SquadAssignment.findOne({ athleteId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Athlete already assigned to squad' });
    }

    // Calculate initial fitness score if candidate evaluation exists
    const Candidate = require('../models/Candidate');
    const candidate = await Candidate.findOne({ athleteId });
    let fitnessScore = '90/100'; // Default fallback
    
    if (candidate && candidate.scores) {
      const { speed, stamina, technique, tactical } = candidate.scores;
      const average = Math.round(((speed || 0) + (stamina || 0) + (technique || 0) + (tactical || 0)) / 4);
      fitnessScore = `${average}/100`;
    }

    const assignment = new SquadAssignment({
      coachId: req.user.id,
      athleteId,
      name,
      sport: sport || 'General Sports',
      state: state || 'State Academy',
      attendance: '100%',
      fitnessScore,
      sprintBest: sport?.includes('Athletics') ? '10.80s' : 'N/A'
    });

    await assignment.save();
    res.status(201).json({ success: true, assignment });
  } catch (err) {
    console.error('Assign squad error:', err);
    res.status(500).json({ success: false, message: 'Failed to assign athlete to squad' });
  }
});

// Remove athlete from squad
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const id = req.params.id;
    let deleted = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await SquadAssignment.findByIdAndDelete(id);
    }
    
    if (!deleted) {
      await SquadAssignment.findOneAndDelete({ athleteId: id });
    }

    res.status(200).json({ success: true, message: 'Athlete removed from squad' });
  } catch (err) {
    console.error('Remove squad error:', err);
    res.status(500).json({ success: false, message: 'Failed to remove athlete' });
  }
});

module.exports = router;
