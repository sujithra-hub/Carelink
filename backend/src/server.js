import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import { isSupabaseConfigured } from './supabaseClient.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root Healthcheck
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'CareLink Smart Hospital Management & Queue API',
    supabaseConnected: isSupabaseConfigured,
    endpoints: {
      auth: '/api/auth/login',
      hospitals: '/api/hospitals',
      queue: '/api/queue',
      appointments: '/api/appointments'
    }
  });
});

// Mount Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 CareLink Backend Server running at http://localhost:${PORT}`);
  console.log(`📡 Supabase Connected: ${isSupabaseConfigured ? '✅ YES' : '⚠️ Fallback Mode (Config needed in .env)'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`======================================================\n`);
});
