const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {      // athleteId of the recipient user
    type: String,
    required: true,
    index: true
  },
  recipientRole: {    // 'athlete' | 'coach' | 'admin' | 'selector'
    type: String,
    enum: ['athlete', 'coach', 'admin', 'selector'],
    default: 'athlete'
  },
  type: {             // 'doc_uploaded' | 'doc_verified' | 'doc_rejected' | 'training_added'
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  meta: {             // optional extra data (e.g. docId, sessionId)
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
