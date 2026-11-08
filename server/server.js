import app from './app.js';
import { connectDatabase, closeDatabaseConnection } from './config/database.js';

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Connect to MongoDB Atlas (fails gracefully in dev, terminates with non-zero exit in prod)
connectDatabase().catch((err) => {
  if (isProduction) {
    console.error('[MasterJiEstates API] Fatal production startup error:', err.message);
    process.exit(1);
  }
  console.error('[MasterJiEstates API] Database startup warning:', err.message);
});

const server = app.listen(PORT, () => {
  console.log(`[MasterJiEstates API] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[MasterJiEstates API] Health check endpoint: http://localhost:${PORT}/api/health`);
  console.log(`[MasterJiEstates API] Readiness check endpoint: http://localhost:${PORT}/api/health/ready`);
  console.log(`[MasterJiEstates API] Properties catalogue endpoint: http://localhost:${PORT}/api/properties`);
});

// Handle graceful shutdown
const shutdown = async () => {
  console.log('[MasterJiEstates API] Shutting down gracefully...');
  await closeDatabaseConnection();
  server.close(() => {
    console.log('[MasterJiEstates API] HTTP server closed. Process terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
