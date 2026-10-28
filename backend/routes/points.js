const express = require('express');
const User = require('../models/User');
const PointLedger = require('../models/PointLedger');
const SquadAssignment = require('../models/SquadAssignment');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();
const mongoose = require('mongoose');

// Get points leaderboard (Top 10 athletes overall and by sport)
router.get('/leaderboard', verifyToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, allTop10: [], bySport: {} });
    }

    const athletes = await User.find({ role: 'athlete' })
      .sort({ totalPoints: -1 })
      .select('name athleteId sport state totalPoints')
      .maxTimeMS(2000);
    
    const grouped = {};
    const allTop10 = [];

    for (const a of athletes) {
      if (allTop10.length < 10) {
        allTop10.push(a);
      }
      const sport = a.sport || 'Uncategorized';
      if (!grouped[sport]) grouped[sport] = [];
      if (grouped[sport].length < 10) {
        grouped[sport].push(a);
      }
    }
    
    res.status(200).json({ success: true, allTop10, bySport: grouped });
  } catch (err) {
    console.error('Fetch leaderboard error:', err);
    res.status(200).json({ success: true, allTop10: [], bySport: {} });
  }
});

// Get points history for a specific athlete
router.get('/history/:athleteId', verifyToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, totalPoints: 0, history: [] });
    }

    const paramId = req.params.athleteId || '';
    const escaped = paramId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const isObjectId = mongoose.Types.ObjectId.isValid(paramId);

    const orClauses = [
      { athleteId: paramId },
      { athleteId: new RegExp(`^${escaped}$`, 'i') }
    ];

    // Find user by athleteId or _id
    const userOrClauses = [...orClauses];
    if (isObjectId) {
      userOrClauses.push({ _id: paramId });
    }

    const user = await User.findOne({ $or: userOrClauses }).maxTimeMS(2000);

    // If user found with athleteId, also add user.athleteId to ledger search
    if (user && user.athleteId && !orClauses.some(c => c.athleteId === user.athleteId)) {
      orClauses.push({ athleteId: user.athleteId });
    }

    const history = await PointLedger.find({ $or: orClauses })
      .sort({ createdAt: -1 })
      .limit(50)
      .maxTimeMS(2000);

    let totalPoints = user ? (user.totalPoints || 0) : 0;
    const historySum = history.reduce((sum, h) => sum + (h.pointsAwarded || 0), 0);
    if (historySum > totalPoints) {
      totalPoints = historySum;
      if (user) {
        user.totalPoints = historySum;
        await user.save();
      }
    }

    res.status(200).json({ success: true, totalPoints, history });
  } catch (err) {
    console.error('Fetch points history error:', err);
    res.status(200).json({ success: true, totalPoints: 0, history: [] });
  }
});

// Manually award bonus points (Coach only)
router.post('/bonus', verifyToken, async (req, res) => {
  try {
    // Basic role check
    if (req.user.role !== 'coach' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { athleteId, points, reason } = req.body;
    if (!athleteId || !points || !reason) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const user = await User.findOne({ athleteId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Athlete not found' });
    }

    const pointsToAward = parseInt(points);

    // Update User
    user.totalPoints = (user.totalPoints || 0) + pointsToAward;
    await user.save();

    // Create Ledger Entry
    const ledger = await PointLedger.create({
      athleteId,
      action: `Bonus: ${reason}`,
      pointsAwarded: pointsToAward,
      awardedBy: req.user.id
    });

    res.status(200).json({ success: true, message: 'Bonus points awarded', pointsTotal: user.totalPoints, ledger });
  } catch (err) {
    console.error('Award bonus error:', err);
    res.status(500).json({ success: false, message: 'Failed to award bonus points' });
  }
});

module.exports = router;
