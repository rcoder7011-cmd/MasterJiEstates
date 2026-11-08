import http from 'http';
import mongoose from 'mongoose';
import app from '../app.js';
import { connectDatabase, closeDatabaseConnection } from '../config/database.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import { generateToken } from '../utils/jwt.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

async function requestJson(server, { method = 'GET', path, headers = {}, body = null }) {
  const addr = server.address();
  const port = addr.port;

  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch {
            json = raw;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('\n====================================================================');
  console.log(' MasterJiEstates — End-to-End Publication & Privacy Verification');
  console.log('====================================================================\n');

  console.log('--- 1. Connecting to MongoDB Atlas ---');
  await connectDatabase();
  assert(mongoose.connection.readyState === 1, 'Connected to MongoDB Atlas');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    // 1. Fetch CSRF token
    const csrfRes = await requestJson(server, { path: '/api/auth/csrf' });
    const csrfToken = csrfRes.body?.data?.csrfToken;
    const csrfCookie = csrfRes.headers['set-cookie']?.[0]?.split(';')[0] || '';

    // 2. Setup Identities
    console.log('\n--- 2. Setting Up Test Identities in MongoDB ---');
    const timestamp = Date.now();
    const sellerUser = await User.create({
      fullName: 'Vikram Rajput',
      email: `vikram_seller_${timestamp}@masterjiestates.in`,
      phone: '9899887766',
      password: 'StrongPassword123!',
      role: 'user',
    });
    const sellerToken = generateToken(sellerUser, false);
    const sellerHeaders = {
      Authorization: `Bearer ${sellerToken}`,
      'x-csrf-token': csrfToken,
      Cookie: csrfCookie,
    };

    const otherUser = await User.create({
      fullName: 'Sunita Sharma',
      email: `sunita_buyer_${timestamp}@masterjiestates.in`,
      phone: '9877665544',
      password: 'StrongPassword123!',
      role: 'user',
    });
    const otherToken = generateToken(otherUser, false);
    const otherHeaders = {
      Authorization: `Bearer ${otherToken}`,
      'x-csrf-token': csrfToken,
      Cookie: csrfCookie,
    };

    const adminUser = await User.create({
      fullName: 'Chief Moderator Admin',
      email: `chief_admin_${timestamp}@masterjiestates.in`,
      phone: '9811223344',
      password: 'AdminPassword123!',
      role: 'admin',
    });
    const adminToken = generateToken(adminUser, false);
    const adminHeaders = {
      Authorization: `Bearer ${adminToken}`,
      'x-csrf-token': csrfToken,
      Cookie: csrfCookie,
    };

    assert(Boolean(sellerUser._id), `Seller created: ${sellerUser.email}`);
    assert(Boolean(adminUser._id), `Admin created: ${adminUser.email}`);

    // 3. Seller submits a property
    console.log('\n--- 3. Seller Submits Property Listing ---');
    const propertyPayload = {
      title: `E2E Penthouse Suite ${timestamp}`,
      category: 'apartment',
      listingType: 'owner',
      sellerListingType: 'owner',
      purpose: 'sale',
      tagline: 'Panoramic views and private terrace',
      description: 'Ultra-exclusive 4 BHK duplex penthouse located in Prime Sector 128, Noida with Italian marble and smart automation.',
      city: 'Noida',
      locality: 'Sector 128',
      address: 'Tower A, Penthouse 2401, Sovereign Residences',
      state: 'Uttar Pradesh',
      pincode: '201304',
      area: 4200,
      areaUnit: 'sqft',
      bedrooms: 4,
      bathrooms: 5,
      parking: 3,
      price: 45000000,
      priceNegotiable: true,
      ownerName: 'Vikram Rajput',
      ownerPhone: '9899887766',
      ownerEmail: sellerUser.email,
      cloudinaryAssets: [
        {
          publicId: 'masterji_estates/properties/audit_penthouse_1',
          url: 'https://res.cloudinary.com/mu52rrq3/image/upload/v12345/masterji_estates/properties/audit_penthouse_1.jpg',
          secureUrl: 'https://res.cloudinary.com/mu52rrq3/image/upload/v12345/masterji_estates/properties/audit_penthouse_1.jpg',
          width: 1920,
          height: 1080,
          format: 'jpg',
          bytes: 850000,
          isCover: true,
        },
      ],
    };

    // Initialize draft
    const draftRes = await requestJson(server, {
      method: 'POST',
      path: '/api/dashboard/listings/draft',
      headers: sellerHeaders,
      body: propertyPayload,
    });
    assert(draftRes.status === 201, 'Property draft initialized (201)');
    const propertyId = draftRes.body?.data?.id;
    const propertySlug = draftRes.body?.data?.slug;
    assert(Boolean(propertyId), `Property initialized with ID: ${propertyId}`);

    // Submit for review
    const submitRes = await requestJson(server, {
      method: 'POST',
      path: `/api/dashboard/listings/${propertyId}/submit`,
      headers: sellerHeaders,
      body: {
        ...propertyPayload,
        agreedToDeclaration: true,
        submissionNotes: 'Please review and publish.',
      },
    });
    assert(submitRes.status === 200, 'Property submitted for review successfully (200)');
    assert(submitRes.body?.data?.availabilityStatus === 'pending_review', 'Listing status is pending_review');

    // 4. Verify Privacy Before Approval
    console.log('\n--- 4. Verifying Privacy & Isolation for Pending Review Listing ---');

    // Public catalogue GET /api/properties
    const publicListBefore = await requestJson(server, { path: '/api/properties' });
    const appearsInPublicBefore = publicListBefore.body?.data?.some((p) => p.id === propertyId || p.slug === propertySlug);
    assert(!appearsInPublicBefore, 'PUBLIC CATALOGUE: Pending property does NOT appear in public catalogue');

    // Public search by title
    const searchBefore = await requestJson(server, {
      path: `/api/properties?search=${encodeURIComponent(`Penthouse Suite ${timestamp}`)}`,
    });
    assert(searchBefore.body?.data?.length === 0, 'PUBLIC SEARCH: Search does NOT return pending listing');

    // Public category filter
    const categoryBefore = await requestJson(server, { path: '/api/properties?category=apartment' });
    const inCategoryBefore = categoryBefore.body?.data?.some((p) => p.id === propertyId);
    assert(!inCategoryBefore, 'PUBLIC CATEGORY: Category filter does NOT return pending listing');

    // Public location filter
    const locationBefore = await requestJson(server, { path: '/api/properties?locality=Sector%20128' });
    const inLocationBefore = locationBefore.body?.data?.some((p) => p.id === propertyId);
    assert(!inLocationBefore, 'PUBLIC LOCATION: Location search does NOT return pending listing');

    // Direct public detail lookup -> 404
    const publicDetailBefore = await requestJson(server, { path: `/api/properties/${propertyId}` });
    assert(publicDetailBefore.status === 404, 'PUBLIC DETAIL ID: Direct lookup returns 404 Not Found for pending property');

    const publicSlugBefore = await requestJson(server, { path: `/api/properties/slug/${propertySlug}` });
    assert(publicSlugBefore.status === 404, 'PUBLIC SLUG: Direct slug lookup returns 404 Not Found for pending property');

    // Seller sees it in their own dashboard
    const sellerListingsRes = await requestJson(server, {
      path: '/api/dashboard/listings',
      headers: sellerHeaders,
    });
    const sellerSeesIt = sellerListingsRes.body?.data?.some((p) => p.id === propertyId);
    assert(sellerSeesIt, 'SELLER DASHBOARD: Submitting owner sees their pending property in My Listings');

    // Other user DOES NOT see seller's listing
    const otherListingsRes = await requestJson(server, {
      path: '/api/dashboard/listings',
      headers: otherHeaders,
    });
    const otherSeesIt = otherListingsRes.body?.data?.some((p) => p.id === propertyId);
    assert(!otherSeesIt, 'MULTI-USER ISOLATION: Other user does NOT see seller property in their dashboard');

    // 5. Admin Moderation & Approval
    console.log('\n--- 5. Admin Reviews & Approves Property ---');
    const adminQueueRes = await requestJson(server, {
      path: '/api/admin/moderation',
      headers: adminHeaders,
    });
    const inQueue = adminQueueRes.body?.data?.items?.some((p) => p.id === propertyId);
    assert(inQueue, 'ADMIN QUEUE: Property appears in admin moderation queue');

    // Admin inspects detail (includes seller contact info)
    const adminDetailRes = await requestJson(server, {
      path: `/api/admin/moderation/${propertyId}`,
      headers: adminHeaders,
    });
    assert(adminDetailRes.status === 200, 'ADMIN DETAIL: Admin can retrieve full property details');
    assert(adminDetailRes.body?.data?.owner?.phone === '9899887766', 'ADMIN DETAIL: Admin can see seller phone');
    assert(adminDetailRes.body?.data?.owner?.email === sellerUser.email, 'ADMIN DETAIL: Admin can see seller email');

    // Admin approves property
    const approveRes = await requestJson(server, {
      method: 'POST',
      path: `/api/admin/moderation/${propertyId}/approve`,
      headers: adminHeaders,
      body: { notes: 'Verified title deed and photos with Noida authority.' },
    });
    assert(approveRes.status === 200, 'ADMIN APPROVE: Property successfully approved by admin (200)');
    assert(approveRes.body?.data?.availabilityStatus === 'available', 'Status updated to "available"');

    // 6. Verify Full Public Visibility After Approval
    console.log('\n--- 6. Verifying Public Visibility & Discovery After Approval ---');

    // 1. All Properties Catalogue
    const publicListAfter = await requestJson(server, { path: '/api/properties' });
    const inCatalogueAfter = publicListAfter.body?.data?.some((p) => p.id === propertyId);
    assert(inCatalogueAfter, 'ALL PROPERTIES: Approved user property appears in public property catalogue');

    // 2. Category Search
    const categoryAfter = await requestJson(server, { path: '/api/properties?category=apartment' });
    const inCategoryAfter = categoryAfter.body?.data?.some((p) => p.id === propertyId);
    assert(inCategoryAfter, 'CATEGORY FILTER: Approved property appears in "apartment" category');

    // 3. Location-Based Filter
    const locationAfter = await requestJson(server, { path: '/api/properties?locality=Sector%20128' });
    const inLocationAfter = locationAfter.body?.data?.some((p) => p.id === propertyId);
    assert(inLocationAfter, 'LOCATION FILTER: Approved property appears in location search for "Sector 128"');

    // 4. Keyword Search
    const searchAfter = await requestJson(server, {
      path: `/api/properties?search=${encodeURIComponent(`Penthouse Suite ${timestamp}`)}`,
    });
    const inSearchAfter = searchAfter.body?.data?.some((p) => p.id === propertyId);
    assert(inSearchAfter, 'KEYWORD SEARCH: Approved property appears in title search');

    // 5. Public Details by ID
    const publicDetailAfter = await requestJson(server, { path: `/api/properties/${propertyId}` });
    assert(publicDetailAfter.status === 200, 'PUBLIC DETAILS ID: Direct ID lookup succeeds (200)');
    assert(publicDetailAfter.body?.data?.title === propertyPayload.title, 'PUBLIC DETAILS: Correct property title returned');
    assert(publicDetailAfter.body?.data?.price === 45000000, 'PUBLIC DETAILS: Correct price returned');
    assert(publicDetailAfter.body?.data?.priceFormatted === '₹4.50 Cr', 'PUBLIC DETAILS: Price formatted as ₹4.50 Cr');

    // 6. Public Details by Slug
    const publicSlugAfter = await requestJson(server, { path: `/api/properties/slug/${propertySlug}` });
    assert(publicSlugAfter.status === 200, 'PUBLIC DETAILS SLUG: Direct slug lookup succeeds (200)');

    // 7. Strict Privacy Verification on Public Response
    console.log('\n--- 7. Verifying Seller Privacy on Public Response ---');
    const pubData = publicDetailAfter.body?.data;
    assert(pubData.owner === undefined, 'PUBLIC PRIVACY: owner object is strictly UNDEFINED in public response');
    assert(pubData.phone === undefined, 'PUBLIC PRIVACY: seller phone is strictly UNDEFINED');
    assert(pubData.email === undefined, 'PUBLIC PRIVACY: seller email is strictly UNDEFINED');
    assert(pubData.privateAddress === undefined, 'PUBLIC PRIVACY: private street address is strictly UNDEFINED');
    assert(pubData.addressDisplay === 'Sector 128, Noida', 'PUBLIC PRIVACY: addressDisplay is sanitized locality/city');

    // 8. Owner Still Sees Approved Listing
    console.log('\n--- 8. Verifying Owner Sees Approved Listing ---');
    const sellerListingsAfter = await requestJson(server, {
      path: '/api/dashboard/listings',
      headers: sellerHeaders,
    });
    const sellerListing = sellerListingsAfter.body?.data?.find((p) => p.id === propertyId);
    assert(Boolean(sellerListing), 'SELLER INVENTORY: Owner still sees property in My Listings');
    assert(sellerListing?.availabilityStatus === 'available', 'SELLER INVENTORY: Status is displayed as "available"');

    // 9. Cleanup
    console.log('\n--- 9. Cleaning Up Test Artifacts ---');
    await Property.findByIdAndDelete(propertyId);
    await User.findByIdAndDelete(sellerUser._id);
    await User.findByIdAndDelete(otherUser._id);
    await User.findByIdAndDelete(adminUser._id);
    assert(true, 'Test property and users deleted from Atlas');

    console.log('\n====================================================================');
    console.log(` RESULT: ${passedTests} / ${totalTests} TESTS PASSED`);
    console.log('====================================================================\n');
  } finally {
    server.close();
    await closeDatabaseConnection();
  }
}

run().catch((err) => {
  console.error('Fatal error in E2E publication test:', err);
  process.exit(1);
});
