const express = require('express');
const Candidate = require('../models/Candidate');
const TrainingSession = require('../models/TrainingSession');
const SquadAssignment = require('../models/SquadAssignment');

const router = express.Router();

const initialCandidates = [
  {
    athleteId: 'ATH-2024-001',
    name: 'Rajesh Kumar',
    sport: 'Athletics (100m)',
    state: 'Punjab',
    gender: 'male',
    age: 22,
    status: 'Shortlisted',
    scores: { speed: 94, stamina: 88, technique: 85, tactical: 82 },
    notes: 'Exceptional explosive speed in trial sprints. Strong candidate for 4x100m relay.'
  },
  {
    athleteId: 'ATH-2024-002',
    name: 'Priya Sharma',
    sport: 'Badminton',
    state: 'Haryana',
    gender: 'female',
    age: 20,
    status: 'Selected for State Squad',
    scores: { speed: 90, stamina: 92, technique: 96, tactical: 94 },
    notes: 'Outstanding footwork and wrist control. Former Junior State Champion.'
  },
  {
    athleteId: 'ATH-2024-003',
    name: 'Amitabh Verma',
    sport: 'Archery',
    state: 'Rajasthan',
    gender: 'male',
    age: 24,
    status: 'Under Review',
    scores: { speed: 75, stamina: 80, technique: 95, tactical: 90 },
    notes: 'Consistently hitting 10s at 70m distance under windy conditions.'
  },
  {
    athleteId: 'ATH-2024-004',
    name: 'Kavita Nair',
    sport: 'Swimming',
    state: 'Kerala',
    gender: 'female',
    age: 19,
    status: 'Shortlisted',
    scores: { speed: 92, stamina: 90, technique: 88, tactical: 86 },
    notes: 'Clocked personal best in 200m freestyle at regional qualifiers.'
  },
  {
    athleteId: 'ATH-2024-005',
    name: 'Gurpreet Singh',
    sport: 'Wrestling',
    state: 'Haryana',
    gender: 'male',
    age: 23,
    status: 'Under Review',
    scores: { speed: 82, stamina: 95, technique: 89, tactical: 87 },
    notes: 'Dominant posture in 74kg category trials.'
  },
  {
    athleteId: 'ATH-2024-006',
    name: 'Ananya Roy',
    sport: 'Football',
    state: 'West Bengal',
    gender: 'female',
    age: 21,
    status: 'On Hold',
    scores: { speed: 87, stamina: 85, technique: 84, tactical: 88 },
    notes: 'Creative playmaker with vision. Awaiting fitness certificate clearance.'
  }
];

const initialSessions = [
  {
    title: 'High-Intensity Sprint & Starts',
    date: '2026-08-28',
    time: '06:30 AM',
    sport: 'Athletics',
    duration: '90 mins',
    intensity: 'High',
    location: 'Main Synthetic Track',
    focus: 'Explosive start reaction times & drive phase biomechanics',
    status: 'Scheduled'
  },
  {
    title: 'Court Footwork & Agility Drills',
    date: '2026-08-29',
    time: '04:00 PM',
    sport: 'Badminton',
    duration: '120 mins',
    intensity: 'Medium',
    location: 'Indoor Badminton Hall 2',
    focus: 'Multi-directional shadow footwork & endurance rallies',
    status: 'Scheduled'
  },
  {
    title: 'Core Strength & Recovery Protocol',
    date: '2026-08-27',
    time: '07:00 AM',
    sport: 'General',
    duration: '60 mins',
    intensity: 'Low',
    location: 'Gymnasium & Hydrotherapy Pool',
    focus: 'Posterior chain stability and lactic acid flushing',
    status: 'Completed'
  }
];

const initialSquad = [
  { athleteId: 'ATH-2024-001', name: 'Rajesh Kumar', sport: 'Athletics (100m)', state: 'Punjab', attendance: '96%', sprintBest: '10.42s', fitnessScore: '92/100' },
  { athleteId: 'ATH-2024-002', name: 'Priya Sharma', sport: 'Badminton', state: 'Haryana', attendance: '98%', sprintBest: 'N/A', fitnessScore: '95/100' },
  { athleteId: 'ATH-2024-004', name: 'Kavita Nair', sport: 'Swimming', state: 'Kerala', attendance: '94%', sprintBest: 'N/A', fitnessScore: '89/100' }
];

async function autoSeedDatabase() {
  // Auto seeding disabled to maintain clean database without dummy data
  return;
}

router.post('/', async (req, res) => {
  try {
    const candidateCount = await Candidate.countDocuments();
    if (candidateCount === 0) await Candidate.insertMany(initialCandidates);
    const sessionCount = await TrainingSession.countDocuments();
    if (sessionCount === 0) await TrainingSession.insertMany(initialSessions);
    const squadCount = await SquadAssignment.countDocuments();
    if (squadCount === 0) await SquadAssignment.insertMany(initialSquad);

    res.status(200).json({ success: true, message: 'Database successfully seeded' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to seed database' });
  }
});

router.post('/clear', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const collections = ['candidates', 'trainingsessions', 'squadassignments', 'pointledgers', 'users'];
    for (const col of collections) {
      try {
        await mongoose.connection.collection(col).deleteMany({});
      } catch (e) {}
    }
    res.status(200).json({ success: true, message: 'All dummy data purged from database' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to clear database' });
  }
});

module.exports = { router, autoSeedDatabase };
