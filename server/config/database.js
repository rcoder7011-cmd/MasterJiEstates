import mongoose from 'mongoose';
import dns from 'dns';

// Ensure reliable public DNS for Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // If restricted, fallback to default resolver
}

/**
 * Utility to safely mask connection string credentials for log diagnostics.
 * Prevents passwords from leaking into system logs.
 */
function maskConnectionString(uri) {
  if (!uri) return 'None';
  try {
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  } catch {
    return 'Masked URI';
  }
}

let isConnecting = false;

/**
 * Connect to MongoDB Atlas using Mongoose.
 * Validates configuration, handles connection events, and fails gracefully
 * without crashing the process if database credentials are not yet configured.
 */
export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!uri) {
    const warnMsg =
      '[MasterJiEstates DB] Warning: MONGODB_URI environment variable is not defined.';
    if (isProduction) {
      console.error(
        `${warnMsg} In production mode, database connectivity is strictly required. Refusing to start in disconnected mode.`
      );
      throw new Error('MONGODB_URI is required in production environment.');
    }
    console.warn(
      `${warnMsg} Operating in development fallback mode. Configure server/.env to enable MongoDB Atlas.`
    );
    return false;
  }

  // Already connected
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  // Connection in progress
  if (isConnecting) {
    return false;
  }

  try {
    isConnecting = true;
    console.log(`[MasterJiEstates DB] Connecting to database: ${maskConnectionString(uri)}`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // Timeout fast if Atlas cluster is unreachable
      autoIndex: !isProduction, // Build indexes in dev, omit in high-scale prod
    });

    console.log(`[MasterJiEstates DB] MongoDB Atlas connection successfully established. Active database: "${mongoose.connection.name}".`);
    isConnecting = false;
    return true;
  } catch (error) {
    isConnecting = false;
    const errorMsg = `[MasterJiEstates DB] Connection Error: Unable to connect to MongoDB Atlas (${error.message}).`;
    if (isProduction) {
      console.error(
        `${errorMsg} Critical production failure: Cannot operate without persistent database connection.`
      );
      throw error;
    }
    console.error(
      `${errorMsg} Server will continue running in development fallback mode.`
    );
    return false;
  }
}

/**
 * Check if the database connection is currently active and ready.
 * @returns {boolean}
 */
export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Safely close database connection during graceful shutdown.
 */
export async function closeDatabaseConnection() {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.close();
      console.log('[MasterJiEstates DB] Database connection closed gracefully.');
    } catch (err) {
      console.error('[MasterJiEstates DB] Error closing database connection:', err.message);
    }
  }
}

// Connection event listeners for observability
mongoose.connection.on('disconnected', () => {
  console.warn('[MasterJiEstates DB] MongoDB Atlas disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MasterJiEstates DB] MongoDB Atlas reconnected.');
});

