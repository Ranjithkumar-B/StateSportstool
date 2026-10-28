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
      return res.status(200).json({ success: true, squad: fallbackSquad, assignedDirectory: {} });
    }

    const Candidate = require('../models/Candidate');
    const User = require('../models/User');

    // Build coach isolation query
    let query = {};
    if (req.user && req.user.role === 'coach') {
      const coachIdentifiers = [req.user.id, req.user._id, req.user.athleteId].filter(Boolean).map(x => x.toString());
      query = { coachId: { $in: coachIdentifiers } };
    } else if (req.user && req.user.role === 'athlete') {
      const athleteIdentifiers = [req.user.athleteId, req.user.id, req.user._id].filter(Boolean).map(x => x.toString());
      query = { athleteId: { $in: athleteIdentifiers } };
    } else if (req.query.coachId) {
      query = { coachId: req.query.coachId };
    }

    const [squad, allAssignments, allCoaches] = await Promise.all([
      SquadAssignment.find(query).lean().sort({ createdAt: -1 }).maxTimeMS(2500),
      SquadAssignment.find().select('athleteId coachId name').lean().maxTimeMS(2500).catch(() => []),
      User.find({ role: 'coach' }).select('name athleteId').lean().maxTimeMS(2500).catch(() => [])
    ]);

    // Build coach mapping for all assignments across academy
    const coachMap = new Map();
    for (const c of allCoaches) {
      coachMap.set(c._id.toString(), c.name);
      if (c.athleteId) coachMap.set(c.athleteId.toString(), c.name);
    }

    const assignedDirectory = {};
    for (const a of allAssignments) {
      if (a.athleteId) {
        assignedDirectory[a.athleteId] = {
          coachId: a.coachId ? a.coachId.toString() : null,
          coachName: a.coachId ? (coachMap.get(a.coachId.toString()) || 'Assigned Coach') : 'Assigned'
        };
      }
    }

    // Batch fetch candidate scores and user points for this coach's squad
    const athleteIds = squad.map(a => a.athleteId).filter(Boolean);
    const [candidates, users] = await Promise.all([
      Candidate.find({ athleteId: { $in: athleteIds } }).lean().maxTimeMS(2000).catch(() => []),
      User.find({ athleteId: { $in: athleteIds } }).lean().maxTimeMS(2000).catch(() => [])
    ]);

    const candidateMap = new Map(candidates.map(c => [c.athleteId, c]));
    const userMap = new Map(users.map(u => [u.athleteId, u]));

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

    res.status(200).json({ success: true, squad, assignedDirectory });
  } catch (err) {
    console.error('Fetch squad error:', err);
    res.status(200).json({ success: true, squad: [], assignedDirectory: {} });
  }
});

// Assign registered athlete to squad
router.post('/', verifyToken, async (req, res) => {
  try {
    const { athleteId, name, sport, state } = req.body;
    if (!athleteId || !name) {
      return res.status(400).json({ success: false, message: 'Athlete ID and name required' });
    }

    const User = require('../models/User');
    const coachIdentifiers = [req.user.id, req.user._id, req.user.athleteId].filter(Boolean).map(x => x.toString());

    // 1. Check if athlete is already in THIS coach's squad
    const existingInMySquad = await SquadAssignment.findOne({
      athleteId,
      coachId: { $in: coachIdentifiers }
    });
    if (existingInMySquad) {
      return res.status(400).json({ success: false, message: 'Athlete is already in your squad' });
    }

    // 2. Check if athlete is assigned to another coach
    const existingOther = await SquadAssignment.findOne({ athleteId });
    if (existingOther && existingOther.coachId && !coachIdentifiers.includes(existingOther.coachId.toString())) {
      let otherCoachName = 'another coach';
      try {
        const oc = await User.findById(existingOther.coachId).select('name');
        if (oc && oc.name) otherCoachName = `Coach ${oc.name}`;
      } catch (e) {}

      return res.status(400).json({
        success: false,
        message: `${name} is already assigned to ${otherCoachName}. Each coach manages their assigned squad separately.`
      });
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

    let assignment;
    if (existingOther && (!existingOther.coachId || existingOther.coachId === '')) {
      existingOther.coachId = req.user.id;
      existingOther.sport = sport || existingOther.sport || 'General Sports';
      await existingOther.save();
      assignment = existingOther;
    } else {
      assignment = new SquadAssignment({
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
    }

    // Update athlete User document with assignedCoach name
    try {
      const coachUser = await User.findById(req.user.id).select('name');
      if (coachUser && coachUser.name) {
        await User.findOneAndUpdate(
          { athleteId },
          { assignedCoach: coachUser.name }
        );
      }
    } catch (e) {}

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
    const User = require('../models/User');
    const id = req.params.id;
    let deleted = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await SquadAssignment.findByIdAndDelete(id);
    }

    if (!deleted) {
      deleted = await SquadAssignment.findOneAndDelete({ athleteId: id });
    }

    // If deleted, clear assignedCoach from athlete user profile
    if (deleted && deleted.athleteId) {
      try {
        await User.findOneAndUpdate(
          { athleteId: deleted.athleteId },
          { $unset: { assignedCoach: 1 } }
        );
      } catch (e) {}
    }

    res.status(200).json({ success: true, message: 'Athlete removed from squad' });
  } catch (err) {
    console.error('Remove squad error:', err);
    res.status(500).json({ success: false, message: 'Failed to remove athlete' });
  }
});

module.exports = router;
