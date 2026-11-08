import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDatabase, closeDatabaseConnection, isDatabaseConnected } from '../config/database.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Enquiry from '../models/Enquiry.js';
import SiteVisit from '../models/SiteVisit.js';
import { createPropertyDraft, updatePropertyDraft, submitDraftForReview, getUserListingsAndDrafts } from '../services/propertySubmissionService.js';
import { listProperties, getPropertyById } from '../services/propertyService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

let passed = 0;
let total = 0;

function assert(condition, testName) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

async function runLiveMongoAudit() {
  console.log('========================================================');
  console.log(' MasterJiEstates — Live MongoDB Atlas & Persistence Audit');
  console.log('========================================================\n');

  // 1. Connection & Database verification
  console.log('--- 1. Testing MongoDB Atlas Connectivity & DB Name ---');
  const connected = await connectDatabase();
  assert(connected && isDatabaseConnected(), 'Successfully established live connection to MongoDB Atlas');
  assert(mongoose.connection.name === 'userData', `Active database is strictly "userData" (got "${mongoose.connection.name}")`);

  // 2. Collection Inspection
  console.log('\n--- 2. Inspecting Collections in userData ---');
  const collections = await mongoose.connection.db.listCollections().toArray();
  const colNames = collections.map((c) => c.name);
  console.log('  Found collections:', colNames.join(', '));
  assert(colNames.includes('properties'), 'Collection "properties" exists');
  assert(colNames.includes('users'), 'Collection "users" exists');
  assert(colNames.includes('enquiries'), 'Collection "enquiries" exists');
  assert(colNames.includes('sitevisits'), 'Collection "sitevisits" exists');

  // 3. Demo Properties Verification
  console.log('\n--- 3. Verifying Seeded Demo Properties ---');
  const demoCount = await Property.countDocuments({ isDemo: true });
  assert(demoCount === 12, `All 12 demo properties exist in MongoDB Atlas (got ${demoCount})`);

  const sampleDemo = await Property.findOne({ demoId: 'demo-001' }).lean();
  assert(sampleDemo !== null, 'Found demo-001 in MongoDB');
  assert(sampleDemo?.isDemo === true, 'demo-001 has isDemo: true');
  assert(Boolean(sampleDemo?.title), 'demo-001 retains proper title');
  assert(Array.isArray(sampleDemo?.images) && sampleDemo.images.length > 0, 'demo-001 retains image assets');

  // 4. Testing User Persistence
  console.log('\n--- 4. Testing User Persistence in MongoDB ---');
  const testEmail = `live_seller_${Date.now()}@masterjiestates.in`;
  const testUser = await User.create({
    fullName: 'Live Test Seller',
    email: testEmail,
    phone: '9876543210',
    role: 'user',
    accountStatus: 'active',
  });

  assert(Boolean(testUser._id), 'User saved to MongoDB with valid ObjectId');
  const foundUser = await User.findById(testUser._id);
  assert(foundUser?.email === testEmail, 'User retrieved from MongoDB by _id');

  // 5. Testing Logged-in Seller Property Submission Flow
  console.log('\n--- 5. Testing Logged-in Seller Property Submission Workflow ---');
  const userContext = {
    id: testUser._id.toString(),
    fullName: testUser.fullName,
    email: testUser.email,
    phone: testUser.phone,
    role: testUser.role,
  };

  // Step A: Create Draft
  const draftPayload = {
    title: 'Live Verified 3 BHK Penthouse with Private Terrace',
    category: 'apartment',
    price: 18500000,
    area: 2400,
    city: 'Noida',
    locality: 'Sector 62',
    description: 'A genuine high-floor penthouse verified through automated integration testing suite.',
    amenities: ['Power Backup', 'Lift', 'Clubhouse'],
  };

  const createdDraft = await createPropertyDraft(userContext, draftPayload);
  assert(Boolean(createdDraft.id), 'Property draft created successfully');
  assert(createdDraft.availabilityStatus === 'draft', 'Initial availability status is "draft"');
  assert(createdDraft.listingType === 'brokerage', 'Listing type is strictly enforced as "brokerage"');

  // Verify in MongoDB directly
  const dbDraft = await Property.findById(createdDraft.id).select('+owner').lean();
  assert(dbDraft !== null, 'Property draft permanently saved in MongoDB Atlas');
  assert(dbDraft.isDemo === false, 'User listing has isDemo: false');
  assert(dbDraft.owner?.userId?.toString() === testUser._id.toString(), 'Property owner strictly bound to authenticated user ID');
  assert(dbDraft.owner?.email === testEmail, 'Property owner email correctly recorded');

  // Step B: Update Draft with Verified Cloudinary Asset
  const updatePayload = {
    ...draftPayload,
    price: 19000000,
    cloudinaryAssets: [
      {
        publicId: 'masterji_estates/properties/live_test_photo',
        url: 'https://res.cloudinary.com/mu52rrq3/image/upload/v1/masterji_estates/properties/live_test_photo.jpg',
        secureUrl: 'https://res.cloudinary.com/mu52rrq3/image/upload/v1/masterji_estates/properties/live_test_photo.jpg',
        width: 1920,
        height: 1080,
        format: 'jpg',
        bytes: 524288,
        isCover: true,
      },
    ],
  };

  const updatedDraft = await updatePropertyDraft(userContext, createdDraft.id, updatePayload);
  assert(updatedDraft.price === 19000000, 'Draft price updated in MongoDB');
  assert(updatedDraft.imageUrl.includes('res.cloudinary.com'), 'Cloudinary cover image URL saved');

  // Step C: Submit for Administrative Review
  const submitResult = await submitDraftForReview(userContext, createdDraft.id, {
    submissionNotes: 'Submitted by verified live test seller',
  });
  assert(submitResult.success === true, 'Draft submitted for moderation review');
  assert(submitResult.property.availabilityStatus === 'pending_review', 'Status transitioned to "pending_review"');

  // Confirm pending_review is HIDDEN from public catalog
  const publicCatalog = await listProperties({ city: 'Noida' });
  const appearsInPublic = publicCatalog.properties.some((p) => p.id === createdDraft.id);
  assert(!appearsInPublic, 'SECURITY: Pending review listing is strictly absent from public catalogue');

  // Step D: Retrieve via Seller Dashboard
  const sellerListings = await getUserListingsAndDrafts(userContext);
  const foundInSellerList = sellerListings.find((p) => p.id === createdDraft.id);
  assert(Boolean(foundInSellerList), 'Submitted property appears in seller dashboard inventory');
  assert(foundInSellerList?.availabilityStatus === 'pending_review', 'Seller sees correct "pending_review" status');

  // Step E: Isolation from other users
  const unauthorizedUser = {
    id: new mongoose.Types.ObjectId().toString(),
    fullName: 'Eve Imposter',
    email: 'eve@unauthorized.com',
    phone: '9999999999',
    role: 'user',
  };

  const unauthorizedListings = await getUserListingsAndDrafts(unauthorizedUser);
  const leakedToUnauthorized = unauthorizedListings.some((p) => p.id === createdDraft.id);
  assert(!leakedToUnauthorized, 'SECURITY: User B cannot see User A seller listing');

  // 6. Clean up test records
  console.log('\n--- 6. Cleaning Up Test Data ---');
  await Property.findByIdAndDelete(createdDraft.id);
  await User.findByIdAndDelete(testUser._id);
  const remainingCheck = await Property.findById(createdDraft.id);
  assert(remainingCheck === null, 'Test property cleaned up cleanly from MongoDB');

  // 7. Re-confirm 12 demo properties remain intact
  const finalDemoCount = await Property.countDocuments({ isDemo: true });
  assert(finalDemoCount === 12, '12 demo properties remain intact and untouched');

  console.log('\n========================================================');
  console.log(` RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log('========================================================\n');

  await closeDatabaseConnection();
  process.exit(passed === total ? 0 : 1);
}

runLiveMongoAudit().catch(async (err) => {
  console.error('Audit failed with error:', err);
  await closeDatabaseConnection();
  process.exit(1);
});

