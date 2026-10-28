const mongoose = require('mongoose');

const squadAssignmentSchema = new mongoose.Schema({
  coachId: {
    type: String,
    required: false
  },
  athleteId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  sport: {
    type: String,
    default: 'Athletics'
  },
  state: {
    type: String,
    default: 'State Academy'
  },
  attendance: {
    type: String,
    default: '100%'
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  attendedSessions: {
    type: Number,
    default: 0
  },
  fitnessScore: {
    type: String,
    default: '90/100'
  },
  sprintBest: {
    type: String,
    default: 'N/A'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SquadAssignment', squadAssignmentSchema);
