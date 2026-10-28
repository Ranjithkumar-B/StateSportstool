const mongoose = require('mongoose');

const kycDocumentSchema = new mongoose.Schema({
  athleteId: {
    type: String,
    required: [true, 'Athlete ID is required'],
    trim: true
  },
  athleteName: {
    type: String,
    trim: true
  },
  sport: {
    type: String,
    trim: true
  },
  docType: {
    type: String,
    required: true,
    enum: ['Birth Certificate', 'Achievement Certificate', 'Medical Report', 'Aadhaar Card'],
    trim: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  reviewedBy: {
    type: String,
    trim: true
  },
  reviewNote: {
    type: String,
    trim: true
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('KycDocument', kycDocumentSchema);
