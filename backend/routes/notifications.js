const express = require('express');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Helper: create a notification safely ───
async function createNotification({ recipientId, recipientRole, type, title, message, meta = {} }) {
  try {
    if (mongoose.connection.readyState !== 1) return;
    await Notification.create({ recipientId, recipientRole, type, title, message, meta });
  } catch (err) {
    console.error('Notification create error:', err.message);
  }
}

// ─── GET /api/notifications/my  — fetch own notifications (last 30) ───
router.get('/my', verifyToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, notifications: [], unread: 0 });
    }

    const User = require('../models/User');
    const TrainingSession = require('../models/TrainingSession');

    const athleteId = req.user.athleteId;
    let athleteSport = (req.user.sport || '').trim().toLowerCase();
    if (!athleteSport && req.user.id) {
      const u = await User.findById(req.user.id).select('sport').maxTimeMS(1000);
      if (u && u.sport) athleteSport = u.sport.trim().toLowerCase();
    }

    const userIdentifier = req.user.athleteId || req.user.id;
    const escaped = (userIdentifier || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const notifications = await Notification
      .find({
        $or: [
          { recipientId: userIdentifier },
          { recipientId: req.user.athleteId },
          { recipientId: req.user.id },
          { recipientId: new RegExp(`^${escaped}$`, 'i') }
        ].filter(Boolean)
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .maxTimeMS(3000);

    const validNotifications = [];
    for (const note of notifications) {
      if (req.user.role === 'athlete' && note.type === 'training_added' && note.meta && note.meta.sessionId) {
        try {
          const session = await TrainingSession.findById(note.meta.sessionId).maxTimeMS(1000);
          if (session) {
            const sessionSport = (session.sport || '').trim().toLowerCase();
            const isGeneral = !sessionSport || sessionSport.includes('general');
            const isSportMatched = athleteSport && (sessionSport === athleteSport || sessionSport.includes(athleteSport) || athleteSport.includes(sessionSport));
            const isAssigned = (session.assignedAthletes && session.assignedAthletes.some(a => a.athleteId?.toLowerCase() === athleteId?.toLowerCase())) ||
                               (session.attendanceLog && session.attendanceLog.some(a => a.athleteId?.toLowerCase() === athleteId?.toLowerCase()));

            if (!isGeneral && !isSportMatched && !isAssigned) {
              continue; // Do not deliver training notification to unassigned athlete
            }
          }
        } catch {
          // If query fails, fall through
        }
      }
      validNotifications.push(note);
    }

    const unread = validNotifications.filter(n => !n.isRead).length;
    res.json({ success: true, notifications: validNotifications.slice(0, 30), unread });
  } catch (err) {
    console.error('Notifications fetch error:', err);
    res.json({ success: true, notifications: [], unread: 0 });
  }
});

// ─── PUT /api/notifications/read/:id  — mark one as read ───
router.put('/read/:id', verifyToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ success: true });
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: true });
  }
});

// ─── PUT /api/notifications/read-all  — mark all as read ───
router.put('/read-all', verifyToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ success: true });
    await Notification.updateMany(
      { recipientId: req.user.athleteId, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.json({ success: true });
  }
});

// ─── DELETE /api/notifications/clear-all — clear all notifications for current user ───
router.delete('/clear-all', verifyToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ success: true });
    const userIdentifier = req.user.athleteId || req.user.id;
    const escaped = (userIdentifier || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await Notification.deleteMany({
      $or: [
        { recipientId: userIdentifier },
        { recipientId: req.user.athleteId },
        { recipientId: req.user.id },
        { recipientId: new RegExp(`^${escaped}$`, 'i') }
      ].filter(Boolean)
    });
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (err) {
    console.error('Clear all notifications error:', err);
    res.json({ success: true });
  }
});

// ─── DELETE /api/notifications/:id — delete a specific notification ───
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ success: true });
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notification cleared' });
  } catch (err) {
    res.json({ success: true });
  }
});

module.exports = { router, createNotification };
