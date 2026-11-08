import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase, closeDatabaseConnection, isDatabaseConnected } from '../config/database.js';
import Property from '../models/Property.js';
import { demoPropertiesData } from '../data/demoPropertiesData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load server/.env regardless of current working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

/**
 * Idempotent seed script to populate MongoDB Atlas with 12 demo properties.
 * Can be run repeatedly without creating duplicate entries (upsert by stable unique demoId).
 * Protects real user-submitted properties from being overwritten or modified.
 */
async function seedDemoProperties() {
  console.log('========================================================');
  console.log(' MasterJiEstates — Demo Properties Database Seeder');
  console.log('========================================================\n');

  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in server/.env.');
    console.error('Please configure your MongoDB Atlas connection string before running the seed script.');
    console.error('Example: MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/userData?retryWrites=true&w=majority\n');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  const connected = await connectDatabase();

  if (!connected || !isDatabaseConnected()) {
    console.error('\nFailed to connect to MongoDB Atlas. Please verify your network access and database credentials in server/.env.\n');
    process.exit(1);
  }

  console.log(`Connected. Starting idempotent upsert of ${demoPropertiesData.length} demo properties into collection "properties"...\n`);

  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const item of demoPropertiesData) {
    try {
      const existing = await Property.findOne({ demoId: item.demoId });

      const propertyPayload = {
        ...item,
        isDemo: true,
        // Guarantee private back-office demo placeholder fields
        privateAddress: `Confidential Plot/Flat Record, ${item.locality}, ${item.city}`,
        internalNotes: 'Illustrative catalog inventory seeded for MasterJiEstates demonstration purposes.',
      };

      await Property.findOneAndUpdate(
        { demoId: item.demoId },
        propertyPayload,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      if (existing) {
        updatedCount++;
        console.log(` [UPDATED] ${item.demoId} — ${item.title.slice(0, 50)}...`);
      } else {
        insertedCount++;
        console.log(` [INSERTED] ${item.demoId} — ${item.title.slice(0, 50)}...`);
      }
    } catch (err) {
      console.error(` [ERROR] Failed to seed ${item.demoId} (${item.slug}):`, err.message);
      skippedCount++;
    }
  }

  console.log('\n--------------------------------------------------------');
  console.log(`Seeding complete: ${insertedCount} inserted, ${updatedCount} updated, ${skippedCount} skipped.`);
  console.log('--------------------------------------------------------\n');

  await closeDatabaseConnection();
  process.exit(0);
}

seedDemoProperties().catch(async (error) => {
  console.error('Unexpected seeding error:', error);
  await closeDatabaseConnection();
  process.exit(1);
});
