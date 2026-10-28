const mongoose = require('mongoose');

const trainingSessionSchema = new mongoose.Schema({
  coachId: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    default: '07:00 AM'
  },
  sport: {
    type: String,
    default: 'Athletics'
  },
  duration: {
    type: String,
    default: '60 mins'
  },
  intensity: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'High'
  },
  location: {
    type: String,
    required: true
  },
  focus: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed'],
    default: 'Scheduled'
  },
  assignedAthletes: [
    {
      athleteId: String,
      athleteName: String,
      sport: String
    }
  ],
  attendanceLog: [
    {
      athleteId: String,
      athleteName: String,
      status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('TrainingSession', trainingSessionSchema);
