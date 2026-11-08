import { Router } from 'express';
import mongoose from 'mongoose';
import { isDatabaseConnected } from '../config/database.js';

const router = Router();

// GET /api/health (Liveness Probe)
router.get('/health', (req, res) => {
  const mem = process.memoryUsage();
  res.status(200).json({
    success: true,
    statusCode: 200,
    status: 'healthy',
    application: 'MasterJiEstates API',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: {
      rss: Math.round(mem.rss / (1024 * 1024)),
      heapUsed: Math.round(mem.heapUsed / (1024 * 1024)),
      heapTotal: Math.round(mem.heapTotal / (1024 * 1024)),
    },
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/health/ready (Readiness Probe with Database Connectivity Status)
router.get('/health/ready', (req, res) => {
  const dbConnected = isDatabaseConnected();
  const dbState = mongoose.connection.readyState;
  const stateNames = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isProd = process.env.NODE_ENV === 'production';

  if (dbConnected) {
    return res.status(200).json({
      success: true,
      statusCode: 200,
      status: 'ready',
      database: {
        status: 'connected',
        readyState: dbState,
        stateName: stateNames[dbState] || 'unknown',
        provider: 'MongoDB Atlas',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // If in production and DB is not connected, service is not ready
  return res.status(503).json({
    success: false,
    statusCode: 503,
    status: isProd ? 'unhealthy' : 'degraded',
    database: {
      status: 'disconnected',
      readyState: dbState,
      stateName: stateNames[dbState] || 'unknown',
      notice: isProd
        ? 'MongoDB Atlas is not reachable. Database connection is required in production.'
        : 'MongoDB Atlas connection is not established. Fallback demo data will be served in development.',
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
