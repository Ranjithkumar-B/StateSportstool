const express = require('express');
const mongoose = require('mongoose');
const KycDocument = require('../models/KycDocument');
const User = require('../models/User');
const { verifyToken, authorize } = require('../middleware/authMiddleware');
const { createNotification } = require('./notifications');

const router = express.Router();

// ─── Fallback data when MongoDB is unavailable ───
const fallbackDocs = [
  { _id: 'fd1', athleteId: 'ATH-2024-001', athleteName: 'Rajesh Kumar', sport: 'Athletics', docType: 'Birth Certificate', fileName: 'rajesh_birth_cert.pdf', fileSize: '1.2 MB', status: 'Pending', createdAt: new Date() },
  { _id: 'fd2', athleteId: 'ATH-2024-002', athleteName: 'Priya Sharma', sport: 'Badminton', docType: 'Medical Report', fileName: 'priya_medical.pdf', fileSize: '2.1 MB', status: 'Pending', createdAt: new Date() },
];

// ─── GET /api/kyc/my  — Athlete fetches own documents ───
router.get('/my', verifyToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, documents: fallbackDocs.filter(d => d.athleteId === req.user.athleteId) });
    }
    const docs = await KycDocument.find({ athleteId: req.user.athleteId })
      .sort({ createdAt: -1 })
      .maxTimeMS(3000);
    res.json({ success: true, documents: docs });
  } catch (err) {
    console.error('KYC fetch error:', err);
    res.json({ success: true, documents: [] });
  }
});

// ─── POST /api/kyc/upload  — Athlete uploads a document ───
router.post('/upload', verifyToken, async (req, res) => {
  try {
    const { docType, fileName, fileSize, fileData, fileType } = req.body;
    if (!docType || !fileName) {
      return res.status(400).json({ success: false, message: 'Document type and file name are required' });
    }

    let athleteName = req.user.name || 'Unknown';
    let sport = '';
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user.id).select('name sport').maxTimeMS(2000);
      if (user) { athleteName = user.name; sport = user.sport || ''; }
    }

    if (mongoose.connection.readyState !== 1) {
      const demoDoc = {
        _id: 'fd_' + Date.now(),
        athleteId: req.user.athleteId,
        athleteName,
        sport,
        docType,
        fileName,
        fileSize: fileSize || '0 KB',
        fileData: fileData || '',
        fileType: fileType || '',
        status: 'Pending',
        createdAt: new Date()
      };
      fallbackDocs.unshift(demoDoc);
      return res.json({ success: true, message: 'Document uploaded. Sent to coach for verification.', document: demoDoc });
    }

    const doc = await KycDocument.create({
      athleteId: req.user.athleteId,
      athleteName,
      sport,
      docType,
      fileName,
      fileSize: fileSize || '0 KB',
      fileData: fileData || '',
      fileType: fileType || '',
      status: 'Pending'
    });

    // ── Notify all coaches about new document upload ──
    if (mongoose.connection.readyState === 1) {
      const coaches = await User.find({ role: 'coach' }).select('athleteId').maxTimeMS(2000);
      for (const coach of coaches) {
        await createNotification({
          recipientId: coach.athleteId,
          recipientRole: 'coach',
          type: 'doc_uploaded',
          title: 'New Document Uploaded',
          message: `${athleteName} uploaded a ${docType} for verification.`,
          meta: { docId: doc._id, athleteId: req.user.athleteId }
        });
      }
    }

    res.json({ success: true, message: 'Document uploaded. Sent to coach for verification.', document: doc });
  } catch (err) {
    console.error('KYC upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload document' });
  }
});

// ─── GET /api/kyc/pending  — Coach fetches all pending documents ───
router.get('/pending', verifyToken, authorize('coach', 'admin'), async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, documents: fallbackDocs });
    }
    const docs = await KycDocument.find({ status: 'Pending' })
      .sort({ createdAt: -1 })
      .maxTimeMS(3000);
    res.json({ success: true, documents: docs });
  } catch (err) {
    console.error('KYC pending fetch error:', err);
    res.json({ success: true, documents: [] });
  }
});

// ─── GET /api/kyc/all  — Coach fetches all documents (any status) ───
router.get('/all', verifyToken, authorize('coach', 'admin'), async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, documents: fallbackDocs });
    }
    const docs = await KycDocument.find()
      .sort({ createdAt: -1 })
      .maxTimeMS(3000);
    res.json({ success: true, documents: docs });
  } catch (err) {
    console.error('KYC all fetch error:', err);
    res.json({ success: true, documents: [] });
  }
});

// ─── PUT /api/kyc/verify/:id  — Coach verifies or rejects a document ───
router.put('/verify/:id', verifyToken, authorize('coach', 'admin'), async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    if (!status || !['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Verified or Rejected' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, message: `Document ${status.toLowerCase()} successfully (demo mode)` });
    }

    const doc = await KycDocument.findByIdAndUpdate(
      req.params.id,
      { status, reviewedBy: req.user.athleteId || req.user.id, reviewNote: reviewNote || '', reviewedAt: new Date() },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // ── Notify the athlete about the decision ──
    const icon = status === 'Verified' ? '✅' : '❌';
    const noteText = reviewNote ? ` Note: ${reviewNote}` : '';
    await createNotification({
      recipientId: doc.athleteId,
      recipientRole: 'athlete',
      type: status === 'Verified' ? 'doc_verified' : 'doc_rejected',
      title: `Document ${status}`,
      message: `${icon} Your ${doc.docType} has been ${status.toLowerCase()} by the coach.${noteText}`,
      meta: { docId: doc._id, status }
    });

    res.json({ success: true, message: `Document ${status.toLowerCase()} successfully`, document: doc });
  } catch (err) {
    console.error('KYC verify error:', err);
    res.status(500).json({ success: false, message: 'Failed to verify document' });
  }
});

// ─── DELETE /api/kyc/:id  — Athlete or Coach/Admin deletes a document ───
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const docId = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      const idx = fallbackDocs.findIndex(d => d._id === docId);
      if (idx !== -1) {
        fallbackDocs.splice(idx, 1);
      }
      return res.json({ success: true, message: 'Document deleted successfully', deletedId: docId });
    }

    let query = { _id: docId };
    if (req.user.role === 'athlete') {
      let athleteId = req.user.athleteId;
      if (!athleteId) {
        const user = await User.findById(req.user.id).select('athleteId').maxTimeMS(2000);
        if (user) athleteId = user.athleteId;
      }
      if (athleteId) {
        query.athleteId = athleteId;
      }
    }

    const doc = await KycDocument.findOneAndDelete(query);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found or unauthorized' });
    }

    // Notify coaches if athlete deleted their document
    if (req.user.role === 'athlete') {
      try {
        const coaches = await User.find({ role: 'coach' }).select('athleteId').maxTimeMS(2000);
        for (const coach of coaches) {
          await createNotification({
            recipientId: coach.athleteId,
            recipientRole: 'coach',
            type: 'doc_deleted',
            title: 'Document Removed',
            message: `${doc.athleteName || 'An athlete'} removed their ${doc.docType} (${doc.fileName}).`,
            meta: { athleteId: doc.athleteId, docType: doc.docType }
          });
        }
      } catch (notifErr) {
        console.error('Notification error on doc deletion:', notifErr);
      }
    }

    res.json({ success: true, message: 'Document deleted successfully', deletedId: docId });
  } catch (err) {
    console.error('KYC delete error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete document' });
  }
});

module.exports = router;
