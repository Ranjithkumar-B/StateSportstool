const express = require('express');
const TrainingSession = require('../models/TrainingSession');
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');
const { createNotification } = require('./notifications');

const router = express.Router();
const mongoose = require('mongoose');

const fallbackSessions = [];

// Get all training sessions
router.get('/', verifyToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, sessions: fallbackSessions });
    }

    let query = {};
    if (req.user && req.user.role === 'coach') {
      const coachIdentifiers = [req.user.id, req.user._id, req.user.athleteId].filter(Boolean).map(x => x.toString());
      query = { coachId: { $in: coachIdentifiers } };
    }

    let sessions = await TrainingSession.find(query).sort({ createdAt: -1 }).maxTimeMS(2000);

    // If logged-in user is an athlete, only show sessions matching their sport or General Conditioning
    if (req.user && req.user.role === 'athlete') {
      const athleteUser = await User.findById(req.user.id).select('sport athleteId').maxTimeMS(1000);
      const athleteSport = (athleteUser?.sport || req.user.sport || '').trim().toLowerCase();
      const athleteId = athleteUser?.athleteId || req.user.athleteId;

      sessions = sessions.filter(session => {
        const sessionSport = (session.sport || '').trim().toLowerCase();
        // General conditioning applies to everyone
        if (!sessionSport || sessionSport.includes('general')) return true;
        
        // Exact or partial sport match (e.g. Athletics (100m) vs Athletics)
        if (athleteSport && (sessionSport === athleteSport || sessionSport.includes(athleteSport) || athleteSport.includes(sessionSport))) {
          return true;
        }

        // Or explicitly in assignedAthletes / attendanceLog
        const inAssigned = session.assignedAthletes && session.assignedAthletes.some(a => a.athleteId === athleteId);
        const inLog = session.attendanceLog && session.attendanceLog.some(a => a.athleteId === athleteId);
        return inAssigned || inLog;
      });
    }

    res.status(200).json({ success: true, sessions });
  } catch (err) {
    console.error('Fetch training sessions error:', err);
    res.status(200).json({ success: true, sessions: [] });
  }
});

// Create a new training session - assigns exclusively to athletes of the selected sport
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, date, time, sport, duration, intensity, location, focus, assignedAthletes } = req.body;
    if (!title || !date || !location) {
      return res.status(400).json({ success: false, message: 'Title, date, and location are required' });
    }

    const sessionSport = sport || 'Athletics';
    const isGeneral = !sessionSport || sessionSport.toLowerCase().includes('general');

    let matchingAthletes = [];

    // If explicit assignedAthletes provided from the client
    if (Array.isArray(assignedAthletes) && assignedAthletes.length > 0) {
      matchingAthletes = assignedAthletes.map(a => ({
        athleteId: a.athleteId || a._id || a.id,
        athleteName: a.name || a.athleteName || 'Athlete',
        sport: a.sport || sessionSport
      }));
    } else if (mongoose.connection.readyState === 1) {
      // Find squad athletes who belong to this coach and sport
      const SquadAssignment = require('../models/SquadAssignment');
      const coachIdentifiers = [req.user.id, req.user._id, req.user.athleteId].filter(Boolean).map(x => x.toString());
      const coachFilter = { coachId: { $in: coachIdentifiers } };

      if (isGeneral) {
        const allSquad = await SquadAssignment.find(coachFilter).select('athleteId name sport').maxTimeMS(2000);
        matchingAthletes = allSquad.map(a => ({ athleteId: a.athleteId, athleteName: a.name, sport: a.sport }));
      } else {
        const regex = new RegExp(`^${sessionSport.trim()}`, 'i');
        const squadAthletes = await SquadAssignment.find({
          ...coachFilter,
          sport: regex
        }).select('athleteId name sport').maxTimeMS(2000);

        matchingAthletes = squadAthletes.map(a => ({
          athleteId: a.athleteId,
          athleteName: a.name,
          sport: a.sport || sessionSport
        }));

        // If no squad athletes found, look up registered athletes strictly of this sport
        if (matchingAthletes.length === 0) {
          const userAthletes = await User.find({
            role: 'athlete',
            sport: regex
          }).select('athleteId name sport').maxTimeMS(2000);

          matchingAthletes = userAthletes.map(a => ({
            athleteId: a.athleteId,
            athleteName: a.name,
            sport: a.sport || sessionSport
          }));
        }
      }
    }

    const session = new TrainingSession({
      coachId: req.user.id,
      title,
      date,
      time: time || '07:00 AM',
      sport: sessionSport,
      duration: duration || '60 mins',
      intensity: intensity || 'High',
      location,
      focus: focus || '',
      status: 'Scheduled',
      assignedAthletes: matchingAthletes
    });

    await session.save();

    // ── Dispatch Notifications to Assigned Athletes & Coach ──
    if (mongoose.connection.readyState === 1) {
      const coachUser = await User.findById(req.user.id).select('name').maxTimeMS(1000);
      const coachName = coachUser?.name || 'Your Coach';

      // 1. Notify Assigned Athletes
      for (const athlete of matchingAthletes) {
        if (!athlete.athleteId) continue;
        await createNotification({
          recipientId: athlete.athleteId,
          recipientRole: 'athlete',
          type: 'training_added',
          title: `New ${sessionSport} Training Session`,
          message: `📋 Coach ${coachName} scheduled "${title}" (${sessionSport}) on ${date}${time ? ' at ' + time : ''} — ${location}.`,
          meta: { sessionId: session._id, sport: sessionSport }
        });
      }

      // 2. Notify Coach (so coach's notification bell updates immediately)
      const coachRecipient = req.user.athleteId || req.user.email || req.user.id;
      const athleteNames = matchingAthletes.map(a => a.athleteName).join(', ');
      await createNotification({
        recipientId: coachRecipient,
        recipientRole: 'coach',
        type: 'training_added',
        title: `Training Session Scheduled`,
        message: `📋 Scheduled "${title}" (${sessionSport}) on ${date} at ${time || '07:00 AM'}${athleteNames ? ' for ' + athleteNames : ''}.`,
        meta: { sessionId: session._id, sport: sessionSport }
      });
    }

    res.status(201).json({ success: true, session });
  } catch (err) {
    console.error('Create training session error:', err);
    res.status(500).json({ success: false, message: 'Failed to create training session' });
  }
});

// Toggle session completion status
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const session = await TrainingSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Training session not found' });
    }

    session.status = session.status === 'Scheduled' ? 'Completed' : 'Scheduled';
    await session.save();

    res.status(200).json({ success: true, session });
  } catch (err) {
    console.error('Toggle status error:', err);
    res.status(500).json({ success: false, message: 'Failed to toggle status' });
  }
});

// Submit session attendance & update athlete attendance percentage
router.post('/:id/attendance', verifyToken, async (req, res) => {
  try {
    const { attendanceLog } = req.body;
    if (!Array.isArray(attendanceLog)) {
      return res.status(400).json({ success: false, message: 'attendanceLog array required' });
    }

    const session = await TrainingSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Training session not found' });
    }

    session.attendanceLog = attendanceLog;
    session.status = 'Completed';
    await session.save();

    // Update SquadAssignment documents for each athlete
    const SquadAssignment = require('../models/SquadAssignment');
    const User = require('../models/User');
    const PointLedger = require('../models/PointLedger');

    for (const item of attendanceLog) {
      if (!item.athleteId) continue;
      
      const mongoose = require('mongoose');
      let query = { athleteId: item.athleteId };
      if (mongoose.Types.ObjectId.isValid(item.athleteId)) {
        query = { $or: [{ athleteId: item.athleteId }, { _id: item.athleteId }] };
      }
      
      const squadRecord = await SquadAssignment.findOne(query);

      if (squadRecord) {
        squadRecord.totalSessions = (squadRecord.totalSessions || 0) + 1;
        if (item.status === 'Present' || item.status === 'Late') {
          squadRecord.attendedSessions = (squadRecord.attendedSessions || 0) + 1;
        }
        const pct = Math.round((squadRecord.attendedSessions / squadRecord.totalSessions) * 100);
        squadRecord.attendance = `${pct}%`;
        await squadRecord.save();

        // AWARD POINTS
        let pointsToAward = 0;
        let actionStr = '';
        if (item.status === 'Present') {
          pointsToAward = 10;
          actionStr = `Attended training session: ${session.title}`;
        } else if (item.status === 'Late') {
          pointsToAward = 5;
          actionStr = `Attended training session (Late): ${session.title}`;
        }

        if (pointsToAward > 0) {
          const user = await User.findOne({ athleteId: squadRecord.athleteId });
          if (user) {
             user.totalPoints = (user.totalPoints || 0) + pointsToAward;
             await user.save();
             
             await PointLedger.create({
                athleteId: squadRecord.athleteId,
                action: actionStr,
                pointsAwarded: pointsToAward,
                awardedBy: req.user.id
             });
          }
        }
      }
    }

    res.status(200).json({ success: true, message: 'Session attendance saved and attendance rates updated', session });
  } catch (err) {
    console.error('Submit attendance error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit attendance' });
  }
});

// Delete a training session
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await TrainingSession.findByIdAndDelete(req.params.id);
    }
    res.status(200).json({ success: true, message: 'Training session deleted successfully' });
  } catch (err) {
    console.error('Delete training session error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete training session' });
  }
});

module.exports = router;
