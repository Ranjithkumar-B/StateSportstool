const express = require('express');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const SquadAssignment = require('../models/SquadAssignment');
const { verifyToken } = require('../middleware/authMiddleware');
const { createNotification } = require('./notifications');

const router = express.Router();
const mongoose = require('mongoose');

// Helper to notify the athlete's respective coach and athlete when selected/shortlisted
async function notifyRespectiveCoach(candidate, newStatus, selectorUser) {
  try {
    if (!candidate) return;

    // Resolve selector display name
    let selectorName = 'State Selection Committee';
    if (selectorUser) {
      if (selectorUser.name) {
        selectorName = selectorUser.name;
      } else if (selectorUser.id && mongoose.Types.ObjectId.isValid(selectorUser.id)) {
        const sUser = await User.findById(selectorUser.id).select('name').lean().catch(() => null);
        if (sUser && sUser.name) selectorName = sUser.name;
      }
    }

    // 1. Locate coach via SquadAssignment
    let coach = null;
    const squad = await SquadAssignment.findOne({
      $or: [
        { athleteId: candidate.athleteId },
        { name: new RegExp(`^${candidate.name}$`, 'i') }
      ]
    }).lean().maxTimeMS(2000).catch(() => null);

    if (squad && squad.coachId) {
      if (mongoose.Types.ObjectId.isValid(squad.coachId)) {
        coach = await User.findById(squad.coachId).lean().maxTimeMS(2000).catch(() => null);
      }
      if (!coach) {
        coach = await User.findOne({ athleteId: squad.coachId }).lean().maxTimeMS(2000).catch(() => null);
      }
    }

    // 2. Fallback: If no direct squad assignment, find coach matching the candidate's sport
    if (!coach && candidate.sport) {
      const cleanSport = candidate.sport.trim().toLowerCase();
      const coaches = await User.find({ role: 'coach' }).lean().maxTimeMS(2000).catch(() => []);
      coach = coaches.find(c => {
        const cs = (c.sport || '').trim().toLowerCase();
        return cs && (cs === cleanSport || cs.includes(cleanSport) || cleanSport.includes(cs));
      }) || (coaches.length > 0 ? coaches[0] : null);
    }

    const isStateSquad = newStatus === 'Selected for State Squad';
    const isShortlisted = newStatus === 'Shortlisted';

    let coachTitle = `🎖️ Athlete Selected: ${candidate.name}`;
    let coachMessage = `State Selector ${selectorName} has updated ${candidate.name} (${candidate.sport}) to "${newStatus}".`;
    let type = 'candidate_selected';

    if (isStateSquad) {
      coachTitle = `🏆 State Squad Selection: ${candidate.name}`;
      coachMessage = `Official Selection! Your athlete ${candidate.name} (${candidate.sport}) has been selected for the State Squad by Selector ${selectorName}.`;
      type = 'candidate_selected';
    } else if (isShortlisted) {
      coachTitle = `⭐ Athlete Shortlisted: ${candidate.name}`;
      coachMessage = `Great news! Selector ${selectorName} has shortlisted your athlete ${candidate.name} (${candidate.sport}) for the State Academy Squad.`;
      type = 'candidate_shortlisted';
    }

    // Send notification to Coach
    if (coach) {
      const coachRecipientId = coach.athleteId || coach._id.toString();
      await createNotification({
        recipientId: coachRecipientId,
        recipientRole: 'coach',
        type,
        title: coachTitle,
        message: coachMessage,
        meta: {
          candidateId: candidate._id?.toString(),
          athleteId: candidate.athleteId,
          athleteName: candidate.name,
          sport: candidate.sport,
          status: newStatus,
          selectorName
        }
      });
      console.log(`[Notification] Selection alert sent to Coach: ${coach.name} (${coachRecipientId}) for athlete: ${candidate.name}`);
    }

    // Also send confirmation notification to the Athlete
    if (candidate.athleteId && (isShortlisted || isStateSquad)) {
      const athleteTitle = isStateSquad ? `🏆 You Have Been Selected for the State Squad!` : `⭐ You Have Been Shortlisted!`;
      const athleteMsg = isStateSquad
        ? `Congratulations ${candidate.name}! State Selector ${selectorName} has officially selected you for the State Squad in ${candidate.sport}.`
        : `Congratulations ${candidate.name}! State Selector ${selectorName} has shortlisted you for the State Academy Squad in ${candidate.sport}.`;

      await createNotification({
        recipientId: candidate.athleteId,
        recipientRole: 'athlete',
        type,
        title: athleteTitle,
        message: athleteMsg,
        meta: {
          candidateId: candidate._id?.toString(),
          athleteId: candidate.athleteId,
          status: newStatus,
          selectorName
        }
      });
    }
  } catch (err) {
    console.error('Error notifying respective coach:', err);
  }
}

const fallbackCandidates = [];

// Get candidate trial records ONLY for registered athletes
router.get('/', verifyToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, candidates: fallbackCandidates });
    }

    // 1. Fetch all users registered as 'athlete'
    const registeredAthletes = await User.find({ role: 'athlete' }).maxTimeMS(2000);
    const athleteIds = registeredAthletes.map(u => u.athleteId);

    // 2. Remove any old candidate records that don't match registered athletes
    await Candidate.deleteMany({ athleteId: { $nin: athleteIds } }).maxTimeMS(2000);

    // 3. Ensure every registered athlete has a Candidate scorecard in MongoDB
    for (const athleteUser of registeredAthletes) {
      let candidate = await Candidate.findOne({ athleteId: athleteUser.athleteId }).maxTimeMS(2000);
      if (!candidate) {
        candidate = new Candidate({
          athleteId: athleteUser.athleteId,
          name: athleteUser.name,
          sport: athleteUser.sport || 'General Sports',
          state: athleteUser.state || 'State Academy',
          gender: athleteUser.gender || 'male',
          status: 'Under Review',
          scores: { speed: 80, stamina: 80, technique: 80, tactical: 80 },
          notes: ''
        });
        await candidate.save();
      } else {
        // Sync sport/state changes if updated in user profile
        let changed = false;
        if (athleteUser.sport && candidate.sport !== athleteUser.sport) {
          candidate.sport = athleteUser.sport;
          changed = true;
        }
        if (athleteUser.state && candidate.state !== athleteUser.state) {
          candidate.state = athleteUser.state;
          changed = true;
        }
        if (changed) await candidate.save();
      }
    }

    const candidates = await Candidate.find().maxTimeMS(2000);
    res.status(200).json({ success: true, candidates });
  } catch (err) {
    console.error('Fetch candidates error:', err.message);
    res.status(200).json({ success: true, candidates: [] });
  }
});

// Update candidate evaluation scorecard and status
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { status, notes, scores } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (scores) updateData.scores = scores;

    const mongoose = require('mongoose');
    let candidate = null;

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      candidate = await Candidate.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );
    }

    if (!candidate) {
      candidate = await Candidate.findOneAndUpdate(
        { athleteId: req.params.id },
        { $set: updateData },
        { new: true }
      );
    }

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    if (status) {
      notifyRespectiveCoach(candidate, status, req.user);
    }

    res.status(200).json({ success: true, candidate });
  } catch (err) {
    console.error('Update candidate error:', err);
    res.status(500).json({ success: false, message: 'Failed to update candidate' });
  }
});

// Toggle candidate shortlist
router.put('/:id/shortlist', verifyToken, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    let candidate = null;

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      candidate = await Candidate.findById(req.params.id);
    }
    if (!candidate) {
      candidate = await Candidate.findOne({ athleteId: req.params.id });
    }

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    candidate.status = candidate.status === 'Shortlisted' ? 'Under Review' : 'Shortlisted';
    await candidate.save();

    if (candidate.status === 'Shortlisted') {
      notifyRespectiveCoach(candidate, 'Shortlisted', req.user);
    }

    res.status(200).json({ success: true, candidate });
  } catch (err) {
    console.error('Toggle shortlist error:', err);
    res.status(500).json({ success: false, message: 'Failed to toggle shortlist' });
  }
});

module.exports = router;
