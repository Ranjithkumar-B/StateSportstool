const express = require('express');
const { verifyToken, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const SquadAssignment = require('../models/SquadAssignment');
const TrainingSession = require('../models/TrainingSession');

const router = express.Router();

const mongoose = require('mongoose');

// ======================== GET DASHBOARD DATA (Protected) ========================
router.get('/', verifyToken, async (req, res) => {
  try {
    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        if (req.user.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
          user = await User.findById(req.user.id).select('-password').maxTimeMS(2000);
        }
        if (!user && req.user.athleteId) {
          const escapedId = req.user.athleteId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          user = await User.findOne({
            $or: [
              { athleteId: req.user.athleteId },
              { athleteId: new RegExp(`^${escapedId}$`, 'i') }
            ]
          }).select('-password').maxTimeMS(2000);
        }
      } catch (dbErr) {
        console.warn('Dashboard DB lookup bypassed:', dbErr.message);
      }
    }

    if (!user) {
      user = {
        _id: req.user.id,
        name: req.user.name || 'State User',
        athleteId: req.user.athleteId || 'SSA-2026',
        role: req.user.role || 'athlete',
        gender: req.user.gender || 'male',
        sport: req.user.sport || 'Athletics',
        state: req.user.state || 'State Academy',
        phone: req.user.phone || '9876543210',
        address: req.user.address || 'State Sports Complex'
      };
    }

    // Role-specific dashboard data
    let dashboardData = {};

    switch (user.role) {
      case 'admin':
        let totalUsers = 0, athletes = 0, coaches = 0, selectors = 0;
        if (mongoose.connection.readyState === 1) {
          try {
            const [tU, aC, cC, sC] = await Promise.all([
              User.countDocuments().maxTimeMS(1200),
              User.countDocuments({ role: 'athlete' }).maxTimeMS(1200),
              User.countDocuments({ role: 'coach' }).maxTimeMS(1200),
              User.countDocuments({ role: 'selector' }).maxTimeMS(1200)
            ]);
            totalUsers = tU; athletes = aC; coaches = cC; selectors = sC;
          } catch (e) {}
        }
        dashboardData = {
          title: 'Admin Dashboard',
          subtitle: 'Full System Management',
          stats: { totalUsers, athletes, coaches, selectors },
          features: [
            'Manage all users and roles',
            'View performance reports',
            'System configuration',
            'Selection panel oversight'
          ]
        };
        break;

      case 'selector':
        let selectableAthletes = 0;
        if (mongoose.connection.readyState === 1) {
          try {
            selectableAthletes = await User.countDocuments({ role: 'athlete' }).maxTimeMS(1200);
          } catch (e) {}
        }
        dashboardData = {
          title: 'Selector Dashboard',
          subtitle: 'Athlete Selection & Review',
          stats: { athletesAvailable: selectableAthletes },
          features: [
            'Review athlete performance',
            'Selection panel management',
            'Shortlist athletes',
            'Generate selection reports'
          ]
        };
        break;

      case 'coach':
        let assignedAthletes = 0, scheduledSessions = 0;
        if (mongoose.connection.readyState === 1) {
          try {
            const [aCount, sCount] = await Promise.all([
              SquadAssignment.countDocuments().maxTimeMS(1200),
              TrainingSession.countDocuments().maxTimeMS(1200)
            ]);
            assignedAthletes = aCount;
            scheduledSessions = sCount;
          } catch (e) {}
        }
        dashboardData = {
          title: 'Coach Dashboard',
          subtitle: 'Training & Performance Tracking',
          stats: { assignedAthletes, scheduledSessions },
          features: [
            'View assigned athletes',
            'Create training schedules',
            'Track athlete progress',
            'Submit performance reports'
          ]
        };
        break;

      case 'athlete':
        let assignedCoachName = null;
        if (mongoose.connection.readyState === 1) {
          try {
            const escapedAthleteId = (user.athleteId || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const escapedName = (user.name || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const assignment = await SquadAssignment.findOne({
              $or: [
                { athleteId: user.athleteId },
                { athleteId: new RegExp(`^${escapedAthleteId}$`, 'i') },
                { name: new RegExp(`^${escapedName}$`, 'i') }
              ]
            }).maxTimeMS(2000);

            if (assignment && assignment.coachId) {
              const coachUser = await User.findById(assignment.coachId).select('name').maxTimeMS(2000);
              if (coachUser && coachUser.name) assignedCoachName = coachUser.name;
            }

            if (!assignedCoachName && user.sport) {
              const coachUser = await User.findOne({ role: 'coach', sport: user.sport }).select('name').maxTimeMS(2000);
              if (coachUser && coachUser.name) assignedCoachName = coachUser.name;
            }

            if (!assignedCoachName) {
              const anyCoach = await User.findOne({ role: 'coach' }).select('name').maxTimeMS(2000);
              if (anyCoach && anyCoach.name) assignedCoachName = anyCoach.name;
            }
          } catch (e) {
            console.error('Error finding athlete assigned coach:', e);
          }
        }

        let athleteTotalPoints = user.totalPoints || 0;
        if (mongoose.connection.readyState === 1) {
          try {
            const PointLedger = require('../models/PointLedger');
            const userHistory = await PointLedger.find({
              $or: [
                { athleteId: user.athleteId },
                { athleteId: new RegExp(`^${(user.athleteId || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
              ]
            }).maxTimeMS(1200);

            const ledgerSum = userHistory.reduce((s, h) => s + (h.pointsAwarded || 0), 0);
            if (ledgerSum > athleteTotalPoints) {
              athleteTotalPoints = ledgerSum;
              user.totalPoints = ledgerSum;
              await user.save();
            }
          } catch (e) {
            console.error('Error computing athlete points in dashboard:', e);
          }
        }

        dashboardData = {
          title: 'Athlete Dashboard',
          subtitle: 'Your Performance Hub',
          assignedCoach: assignedCoachName,
          stats: {
            totalPoints: athleteTotalPoints,
            tier: athleteTotalPoints >= 250 ? 'Tier 3 (Elite)' : athleteTotalPoints >= 100 ? 'Tier 2 (Contender)' : 'Tier 1 (Rising)'
          },
          features: [
            'View personal performance stats',
            'Check upcoming events',
            'View training schedule',
            'Track selection status'
          ]
        };
        break;

      default:
        dashboardData = { title: 'Dashboard', features: [] };
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        athleteId: user.athleteId,
        role: user.role,
        gender: user.gender,
        sport: user.sport,
        state: user.state,
        phone: user.phone,
        address: user.address,
        totalPoints: user.totalPoints || dashboardData.stats?.totalPoints || 0,
        assignedCoach: dashboardData.assignedCoach || null
      },
      dashboard: dashboardData
    });

  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error loading dashboard.'
    });
  }
});

// ======================== GET ALL REGISTERED USERS ========================
router.get('/users', verifyToken, authorize('admin', 'coach', 'selector'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ======================== UPDATE USER PROFILE (MongoDB) ========================
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { phone, sport, state, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { phone, sport, state, address } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ======================== DELETE REGISTERED USER (Admin Only) ========================
router.delete('/users/:id', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const targetId = req.params.id;

    // Prevent admin from deleting themselves
    if (req.user && (req.user.id === targetId || req.user.athleteId === targetId)) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    let userToDelete = null;
    if (mongoose.Types.ObjectId.isValid(targetId)) {
      userToDelete = await User.findById(targetId);
    }
    if (!userToDelete) {
      userToDelete = await User.findOne({ athleteId: targetId });
    }

    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Safety: prevent deleting primary demo admin if athleteId === 'admin'
    if (userToDelete.athleteId === 'admin' && userToDelete.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Primary system admin account cannot be deleted.' });
    }

    // Delete user from User model
    await User.findByIdAndDelete(userToDelete._id);

    // Also cascade cleanup associated records
    try {
      const Candidate = require('../models/Candidate');
      const SquadAssignment = require('../models/SquadAssignment');
      const PointLedger = require('../models/PointLedger');

      await Promise.all([
        Candidate.deleteMany({ athleteId: userToDelete.athleteId }).catch(() => {}),
        SquadAssignment.deleteMany({ athleteId: userToDelete.athleteId }).catch(() => {}),
        PointLedger.deleteMany({ athleteId: userToDelete.athleteId }).catch(() => {})
      ]);
    } catch (cleanupErr) {
      console.warn('Cleanup warning on user deletion:', cleanupErr.message);
    }

    res.status(200).json({ success: true, message: `User "${userToDelete.name}" deleted successfully.` });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting user.' });
  }
});

module.exports = router;
