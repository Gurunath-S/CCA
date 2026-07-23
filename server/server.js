require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const characterRoutes = require('./routes/characterRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const noteRoutes = require('./routes/noteRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Server status check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Route registrations
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/admin', adminRoutes);

const errorHandler = require('./middleware/errorHandler');

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Centralized error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Character Coach Server running on port ${PORT}`);
});
