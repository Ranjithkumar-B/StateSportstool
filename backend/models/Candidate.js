const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  athleteId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  sport: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    default: 'male'
  },
  age: {
    type: Number,
    default: 20
  },
  status: {
    type: String,
    enum: ['Under Review', 'Shortlisted', 'Selected for State Squad', 'On Hold'],
    default: 'Under Review'
  },
  scores: {
    speed: { type: Number, default: 80 },
    stamina: { type: Number, default: 80 },
    technique: { type: Number, default: 80 },
    tactical: { type: Number, default: 80 }
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Candidate', candidateSchema);
