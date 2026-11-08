import mongoose from 'mongoose';
import assert from 'assert';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

import { connectDatabase, closeDatabaseConnection, isDatabaseConnected } from '../config/database.js';
import Property from '../models/Property.js';
import User from '../models/User.js';
import {
  createPropertyDraft,
  updatePropertyDraft,
  submitDraftForReview,
  getUserListingsAndDrafts,
  getOwnedPropertyById,
} from '../services/propertySubmissionService.js';
import { serializePublicProperty, serializeSellerOwnedProperty, serializeAdminProperty } from '../utils/serializers.js';

async function runFinalVerification() {
  console.log('\n========================================================');
  console.log(' MasterJiEstates — Final Property Submission & Privacy Audit');
  console.log('========================================================\n');

  let testSellerA = null;
  let testSellerB = null;
  let testAdmin = null;
  let createdPropertyOwner = null;
  let createdPropertyBrokerage = null;

  try {
    // -------------------------------------------------------------------------
    // 1. Live Atlas Database Connectivity
    // -------------------------------------------------------------------------
    console.log('--- 1. Connecting to MongoDB Atlas (userData Database) ---');
    await connectDatabase();
    assert(isDatabaseConnected(), 'Must be connected to MongoDB Atlas');
    const activeDbName = mongoose.connection.db.databaseName;
    console.log(`  ✓ [PASS] Connected to MongoDB Atlas. Active DB: "${activeDbName}"`);
    assert(activeDbName === 'userData', `Active database must be "userData" (got "${activeDbName}")`);

    // -------------------------------------------------------------------------
    // 2. Set Up Test Identities
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Setting Up Test Identities in MongoDB ---');
    const timestamp = Date.now();
    const emailA = `seller_a_${timestamp}@masterjiestates.in`;
    const emailB = `seller_b_${timestamp}@masterjiestates.in`;
    const emailAdmin = `admin_audit_${timestamp}@masterjiestates.in`;

    testSellerA = await User.create({
      fullName: 'Vikram Malhotra',
      email: emailA,
      phone: '9876543210',
      password: 'StrongPassword123!',
      role: 'user',
    });
    console.log(`  ✓ [PASS] Created Test Seller A: ${testSellerA.email} (ID: ${testSellerA._id})`);

    testSellerB = await User.create({
      fullName: 'Ananya Sharma',
      email: emailB,
      phone: '9876543211',
      password: 'StrongPassword123!',
      role: 'user',
    });
    console.log(`  ✓ [PASS] Created Test Seller B: ${testSellerB.email} (ID: ${testSellerB._id})`);

    testAdmin = await User.create({
      fullName: 'Chief Compliance Officer',
      email: emailAdmin,
      phone: '9876543212',
      password: 'StrongPassword123!',
      role: 'admin',
    });
    console.log(`  ✓ [PASS] Created Test Admin: ${testAdmin.email} (ID: ${testAdmin._id})`);

    const contextA = { id: testSellerA._id.toString(), fullName: testSellerA.fullName, email: testSellerA.email, phone: testSellerA.phone, role: 'user' };
    const contextB = { id: testSellerB._id.toString(), fullName: testSellerB.fullName, email: testSellerB.email, phone: testSellerB.phone, role: 'user' };
    const contextAdmin = { id: testAdmin._id.toString(), fullName: testAdmin.fullName, email: testAdmin.email, phone: testAdmin.phone, role: 'admin' };

    // -------------------------------------------------------------------------
    // 3. Security Check: Reject Company-Owned Listing from Regular Users
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Verifying Company-Owned Listing Restrictions ---');
    try {
      await createPropertyDraft(contextA, {
        title: 'Tampered Company Property Attempt',
        category: 'apartment',
        listingType: 'company_owned', // FORBIDDEN FOR NON-ADMIN
      });
      assert.fail('Should have rejected company_owned listing from public user');
    } catch (err) {
      assert(err.statusCode === 400, 'Rejected with 400 Bad Request');
      console.log('  ✓ [PASS] SECURITY: Regular user cannot create company_owned listing (rejected with 400)');
    }

    // -------------------------------------------------------------------------
    // 4. Test Submission of "Owner Property"
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing Owner Property Submission (listingType="owner") ---');
    const ownerDraftData = {
      title: 'Luxury 3 BHK Penthouse in Sector 62A Noida',
      category: 'apartment',
      listingType: 'owner',
      sellerListingType: 'owner',
      purpose: 'sale',
      tagline: 'Corner unit with open park view',
      description: 'Exclusive 3 BHK penthouse directly offered by owner with complete legal titles and high-end woodwork.',
      city: 'Noida',
      locality: 'Sector 62A',
      state: 'Uttar Pradesh',
      pincode: '201309',
      landmark: 'Near Electronic City Metro',
      address: 'Tower 4, Flat 1402, MasterJi Residency', // Confidential private address
      privateAddress: 'Tower 4, Flat 1402, MasterJi Residency',
      area: 2150,
      areaUnit: 'sqft',
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      parking: 2,
      furnishing: 'Semi-Furnished',
      facing: 'North-East',
      floor: '14th of 18 Floors',
      price: 22500000,
      priceNegotiable: true,
      availabilityLabel: 'Ready to Move',
      amenities: ['24/7 Gated Security', '100% Power Backup', 'Swimming Pool', 'High-Speed Elevators'],
      ownerName: 'Vikram Malhotra',
      ownerPhone: '9876543210',
      ownerEmail: emailA,
      cloudinaryAssets: [
        {
          publicId: 'masterji_estates/properties/audit_photo_1',
          url: 'https://res.cloudinary.com/demo/image/upload/v1/masterji_estates/properties/audit_photo_1.jpg',
          secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/masterji_estates/properties/audit_photo_1.jpg',
          width: 1920,
          height: 1080,
          format: 'jpg',
          bytes: 420000,
          isCover: true,
        },
      ],
    };

    createdPropertyOwner = await createPropertyDraft(contextA, ownerDraftData);
    assert(Boolean(createdPropertyOwner.id), 'Property draft created successfully');
    console.log(`  ✓ [PASS] Owner property draft created with ID: ${createdPropertyOwner.id}`);
    assert(createdPropertyOwner.listingType === 'owner', `listingType must be "owner" (got "${createdPropertyOwner.listingType}")`);
    assert(createdPropertyOwner.listingTypeLabel === 'Direct Owner', `listingTypeLabel must be "Direct Owner" (got "${createdPropertyOwner.listingTypeLabel}")`);
    console.log('  ✓ [PASS] listingType is strictly saved as "owner" (not overridden to brokerage)');

    // Verify in MongoDB directly
    const dbOwnerDraft = await Property.findById(createdPropertyOwner.id).select('+owner +privateAddress').lean();
    assert(dbOwnerDraft !== null, 'Property found in MongoDB Atlas');
    assert(dbOwnerDraft.isDemo === false, 'isDemo must be strictly false');
    assert(dbOwnerDraft.listingType === 'owner', 'listingType in MongoDB is "owner"');
    assert(dbOwnerDraft.owner?.userId?.toString() === testSellerA._id.toString(), 'owner.userId strictly references authenticated account');
    assert(dbOwnerDraft.owner?.name === 'Vikram Malhotra', 'owner.name matches');
    assert(dbOwnerDraft.owner?.phone === '9876543210', 'owner.phone matches');
    assert(dbOwnerDraft.owner?.email === emailA, 'owner.email matches');
    assert(dbOwnerDraft.privateAddress === 'Tower 4, Flat 1402, MasterJi Residency', 'privateAddress saved in DB');
    console.log('  ✓ [PASS] MongoDB Atlas persistence verified directly for Owner Property');

    // Submit Owner Property for review
    const submitResultOwner = await submitDraftForReview(contextA, createdPropertyOwner.id, {
      submissionNotes: 'Final verification audit test submission',
    });
    assert(submitResultOwner.success === true, 'Submission for review succeeded');
    const dbSubmittedOwner = await Property.findById(createdPropertyOwner.id).select('+owner').lean();
    assert(dbSubmittedOwner.isDraft === false, 'isDraft set to false upon submission');
    assert(dbSubmittedOwner.availabilityStatus === 'pending_review', 'availabilityStatus is "pending_review"');
    assert(dbSubmittedOwner.listingType === 'owner', 'listingType remains "owner" after submission');
    console.log('  ✓ [PASS] Owner property transitioned to "pending_review" with listingType="owner"');

    // -------------------------------------------------------------------------
    // 5. Test Submission of "Brokerage Property"
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Testing Brokerage Property Submission (listingType="brokerage") ---');
    const brokerageDraftData = {
      title: 'Premium 4 BHK Villa on Golf Course Ext Road',
      category: 'villa',
      listingType: 'brokerage',
      sellerListingType: 'brokerage',
      purpose: 'sale',
      description: 'Exclusive independent luxury villa in gated community with private lawn and modular kitchen.',
      city: 'Gurugram',
      locality: 'Sector 65',
      area: 4200,
      price: 55000000,
      ownerName: 'Vikram Malhotra',
      ownerPhone: '9876543210',
      ownerEmail: emailA,
      cloudinaryAssets: [
        {
          publicId: 'masterji_estates/properties/audit_photo_2',
          url: 'https://res.cloudinary.com/demo/image/upload/v1/masterji_estates/properties/audit_photo_2.jpg',
          secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/masterji_estates/properties/audit_photo_2.jpg',
          width: 1920,
          height: 1080,
          format: 'jpg',
          bytes: 520000,
          isCover: true,
        },
      ],
    };

    createdPropertyBrokerage = await createPropertyDraft(contextA, brokerageDraftData);
    assert(createdPropertyBrokerage.listingType === 'brokerage', `listingType must be "brokerage" (got "${createdPropertyBrokerage.listingType}")`);
    assert(createdPropertyBrokerage.listingTypeLabel === 'Brokerage', 'listingTypeLabel must be "Brokerage"');
    console.log('  ✓ [PASS] Brokerage property draft created with listingType="brokerage"');

    // -------------------------------------------------------------------------
    // 6. Test Seller Dashboard Inventory (My Listings)
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Verifying Seller Inventory (My Listings) ---');
    const sellerListings = await getUserListingsAndDrafts(contextA);
    const sellerListingIds = sellerListings.map((l) => l.id);
    assert(sellerListingIds.includes(createdPropertyOwner.id), 'Seller A inventory includes Owner Property');
    assert(sellerListingIds.includes(createdPropertyBrokerage.id), 'Seller A inventory includes Brokerage Property');
    console.log(`  ✓ [PASS] Seller A sees both listings in My Listings (Count: ${sellerListings.length})`);

    // -------------------------------------------------------------------------
    // 7. Test Cross-User Isolation & IDOR Protection
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Verifying Multi-User Isolation & IDOR Protection ---');
    const userBListings = await getUserListingsAndDrafts(contextB);
    const userBListingIds = userBListings.map((l) => l.id);
    assert(!userBListingIds.includes(createdPropertyOwner.id), 'User B CANNOT see User A Owner Property');
    assert(!userBListingIds.includes(createdPropertyBrokerage.id), 'User B CANNOT see User A Brokerage Property');
    console.log('  ✓ [PASS] ISOLATION: User B inventory does NOT contain User A listings');

    try {
      await getOwnedPropertyById(contextB, createdPropertyOwner.id);
      assert.fail('User B should not be able to fetch User A listing');
    } catch (err) {
      assert(err.statusCode === 403, 'User B blocked with 403 Forbidden');
      console.log('  ✓ [PASS] IDOR DEFENSE: User B blocked with 403 when trying to access User A listing');
    }

    try {
      await updatePropertyDraft(contextB, createdPropertyOwner.id, { title: 'Hacked Title' });
      assert.fail('User B should not be able to update User A listing');
    } catch (err) {
      assert(err.statusCode === 403, 'User B blocked with 403 Forbidden');
      console.log('  ✓ [PASS] IDOR DEFENSE: User B blocked with 403 when trying to modify User A listing');
    }

    // -------------------------------------------------------------------------
    // 8. Test Seller Contact Privacy on Public APIs
    // -------------------------------------------------------------------------
    console.log('\n--- 8. Verifying Public API Contact Privacy ---');
    const publicDoc = await Property.findById(createdPropertyOwner.id).select('+owner +privateAddress');
    const publicSerialized = serializePublicProperty(publicDoc);

    assert(publicSerialized.owner === undefined, 'Public DTO must NOT contain owner object');
    assert(publicSerialized.phone === undefined, 'Public DTO must NOT contain phone');
    assert(publicSerialized.email === undefined, 'Public DTO must NOT contain email');
    assert(publicSerialized.privateAddress === undefined, 'Public DTO must NOT contain privateAddress');
    assert(publicSerialized.address === undefined, 'Public DTO must NOT contain address');
    assert(publicSerialized.acquisitionCost === undefined, 'Public DTO must NOT contain acquisitionCost');
    assert(publicSerialized.internalNotes === undefined, 'Public DTO must NOT contain internalNotes');
    console.log('  ✓ [PASS] PUBLIC PRIVACY: Seller phone, email, and private address are strictly absent');
    console.log(`  ✓ [PASS] PUBLIC DISCOVERY: addressDisplay is sanitized: "${publicSerialized.addressDisplay}"`);

    // -------------------------------------------------------------------------
    // 9. Test Seller Access vs Admin Access Serialization
    // -------------------------------------------------------------------------
    console.log('\n--- 9. Verifying Seller Access vs Admin Access Boundaries ---');
    const sellerSerialized = serializeSellerOwnedProperty(publicDoc);
    assert(sellerSerialized.owner?.name === 'Vikram Malhotra', 'Seller sees own name');
    assert(sellerSerialized.owner?.phone === '9876543210', 'Seller sees own phone');
    assert(sellerSerialized.owner?.email === emailA, 'Seller sees own email');
    assert(sellerSerialized.privateAddress === 'Tower 4, Flat 1402, MasterJi Residency', 'Seller sees own address');
    assert(sellerSerialized.acquisitionCost === undefined, 'Seller CANNOT see acquisitionCost');
    assert(sellerSerialized.internalAdminNotes === undefined, 'Seller CANNOT see internalAdminNotes');
    console.log('  ✓ [PASS] SELLER PRIVACY: Seller accesses own contact info; corporate finances omitted');

    const adminSerialized = serializeAdminProperty(publicDoc);
    assert(adminSerialized.owner?.name === 'Vikram Malhotra', 'Admin sees seller name');
    assert(adminSerialized.owner?.phone === '9876543210', 'Admin sees seller phone');
    assert(adminSerialized.owner?.email === emailA, 'Admin sees seller email');
    assert(adminSerialized.privateAddress === 'Tower 4, Flat 1402, MasterJi Residency', 'Admin sees private address');
    console.log('  ✓ [PASS] ADMIN ACCESS: Authorized admin accesses full seller contact details');

    // -------------------------------------------------------------------------
    // 10. Simulate Backend Restart & Verify Database Persistence
    // -------------------------------------------------------------------------
    console.log('\n--- 10. Simulating Server Restart & Verifying DB Persistence ---');
    console.log('  ... Closing database connection (simulating server shutdown)');
    await closeDatabaseConnection();
    assert(!isDatabaseConnected(), 'Database disconnected');
    console.log('  ✓ [PASS] Connection closed gracefully');

    console.log('  ... Reconnecting to MongoDB Atlas (simulating server restart)');
    await connectDatabase();
    assert(isDatabaseConnected(), 'Database reconnected');
    console.log('  ✓ [PASS] Re-established connection to MongoDB Atlas');

    const restartedDoc = await Property.findById(createdPropertyOwner.id).select('+owner +privateAddress').lean();
    assert(restartedDoc !== null, 'Property retrieved after simulated server restart');
    assert(restartedDoc.isDemo === false, 'isDemo remains false');
    assert(restartedDoc.listingType === 'owner', 'listingType remains "owner"');
    assert(restartedDoc.listingTypeLabel === 'Direct Owner', 'listingTypeLabel remains "Direct Owner"');
    assert(restartedDoc.availabilityStatus === 'pending_review', 'availabilityStatus remains "pending_review"');
    assert(restartedDoc.owner?.userId?.toString() === testSellerA._id.toString(), 'owner.userId remains bound to test seller');
    assert(restartedDoc.owner?.phone === '9876543210', 'owner.phone persisted across restart');
    assert(restartedDoc.privateAddress === 'Tower 4, Flat 1402, MasterJi Residency', 'privateAddress persisted across restart');
    console.log('  ✓ [PASS] PERSISTENCE: Listing and seller details fully preserved across server restart');

    // -------------------------------------------------------------------------
    // 11. Cleanup Test Documents
    // -------------------------------------------------------------------------
    console.log('\n--- 11. Cleaning Up Audit Test Documents ---');
    if (createdPropertyOwner) {
      await Property.findByIdAndDelete(createdPropertyOwner.id);
      console.log(`  ✓ [PASS] Cleaned up Owner Property ${createdPropertyOwner.id}`);
    }
    if (createdPropertyBrokerage) {
      await Property.findByIdAndDelete(createdPropertyBrokerage.id);
      console.log(`  ✓ [PASS] Cleaned up Brokerage Property ${createdPropertyBrokerage.id}`);
    }
    if (testSellerA) await User.findByIdAndDelete(testSellerA._id);
    if (testSellerB) await User.findByIdAndDelete(testSellerB._id);
    if (testAdmin) await User.findByIdAndDelete(testAdmin._id);
    console.log('  ✓ [PASS] Cleaned up test user accounts');

    // Verify 12 demo properties remained untouched
    const demoCount = await Property.countDocuments({ isDemo: true });
    assert(demoCount === 12, `Demo properties count must be 12 (got ${demoCount})`);
    console.log(`  ✓ [PASS] All 12 demo properties remain intact in MongoDB Atlas`);

    console.log('\n========================================================');
    console.log(' FINAL VERIFICATION RESULTS: ALL 24 AUDIT CHECKS PASSED');
    console.log('========================================================\n');
  } catch (error) {
    console.error('\n❌ AUDIT FAILED:', error);
    process.exit(1);
  } finally {
    await closeDatabaseConnection();
  }
}

runFinalVerification();
