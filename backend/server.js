const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// --------------- Middleware ---------------
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// --------------- Routes ---------------
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const candidateRoutes = require('./routes/candidates');
const trainingRoutes = require('./routes/trainings');
const squadRoutes = require('./routes/squads');
const pointsRoute = require('./routes/points');
const analyticsRoutes = require('./routes/analytics');
const kycRoutes = require('./routes/kyc');
const { router: notificationRoutes } = require('./routes/notifications');
const { router: seedRoutes, autoSeedDatabase } = require('./routes/seed');

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/squads', squadRoutes);
app.use('/api/points', pointsRoute);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/seed', seedRoutes);

// Health check API
app.get('/api/health', (req, res) => {
  res.json({ message: 'State Sports Academy API is running 🏅' });
});

// --------------- Static Serving ---------------
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stateSportsAcademy';
const PORT = process.env.PORT || 5000;

// Start Express server immediately so HTTP endpoints are accessible
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Connect to MongoDB asynchronously
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.warn('⚠️ MongoDB connection warning:', err.message);
    console.warn('💡 Tip: Ensure MongoDB service is running on mongodb://localhost:27017');
  });


