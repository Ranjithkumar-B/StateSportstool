const mongoose = require('mongoose');

const pointLedgerSchema = new mongoose.Schema({
  athleteId: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true
  },
  pointsAwarded: {
    type: Number,
    required: true
  },
  awardedBy: {
    type: String, // coachId or 'System'
    default: 'System'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PointLedger', pointLedgerSchema);
