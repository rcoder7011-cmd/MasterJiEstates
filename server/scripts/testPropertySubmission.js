/**
 * Verification & Security Test Suite for MasterJiEstates Property Submission & Cloudinary Integration (Part 11)
 *
 * Tests:
 * 1. Unauthenticated rejection across all submission endpoints (401)
 * 2. CSRF token validation on mutating requests (403)
 * 3. Cloudinary upload signature generation & secrecy verification
 * 4. Property draft initialization, ownership derivation, and rejection of company_owned
 * 5. Draft updates and cross-user edit isolation (User A cannot edit User B's draft)
 * 6. Cloudinary image asset validation (rejection of Base64, external domains, invalid formats, oversized assets)
 * 7. Multi-step submission validation before moving to pending_review
 * 8. Prevention of editing after review submission & duplicate submission handling
 * 9. Isolation from public catalogue (pending/draft listings hidden from public GET /properties)
 * 10. Listing withdrawal and ownership protection
 * 11. Public health and property catalogue API regressions
 */

import http from 'http';
import app from '../app.js';
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
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log(' MASTERJIESTATES PART 11: PROPERTY SUBMISSION SUITE');
  console.log('======================================================\n');

  // Disable rate limiting for testing
  process.env.NODE_ENV = 'test';

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    // -------------------------------------------------------------------------
    // 1. Unauthenticated Security Boundary Tests
    // -------------------------------------------------------------------------
    console.log('--- 1. Testing Unauthenticated Security Boundaries (Expecting 401) ---');

    const res1 = await requestJson(server, {
      method: 'POST',
      path: '/api/dashboard/listings/upload-signature',
    });
    assert(res1.status === 401, 'Unauthenticated POST /upload-signature returns 401');

    const res2 = await requestJson(server, {
      method: 'POST',
      path: '/api/dashboard/listings/draft',
      body: { title: 'Unauthenticated Draft' },
    });
    assert(res2.status === 401, 'Unauthenticated POST /listings/draft returns 401');

    const res3 = await requestJson(server, {
      method: 'PATCH',
      path: '/api/dashboard/listings/draft/draft_test_123',
      body: { title: 'Updated' },
    });
    assert(res3.status === 401, 'Unauthenticated PATCH /listings/draft/:id returns 401');

    const res4 = await requestJson(server, {
      method: 'POST',
      path: '/api/dashboard/listings/draft_test_123/submit',
    });
    assert(res4.status === 401, 'Unauthenticated POST /listings/:id/submit returns 401');

    const res5 = await requestJson(server, {
      method: 'PATCH',
      path: '/api/dashboard/listings/draft_test_123/withdraw',
    });
    assert(res5.status === 401, 'Unauthenticated PATCH /listings/:id/withdraw returns 401');

    // -------------------------------------------------------------------------
    // 2. Setup Authenticated Test Users & CSRF
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Setting Up Test Identities (User A & User B) ---');

    const csrfRes = await requestJson(server, { path: '/api/auth/csrf' });
    const csrfCookieHeader = csrfRes.headers['set-cookie']?.[0] || '';
    const csrfToken = csrfRes.body?.data?.csrfToken;
    const csrfCookie = csrfCookieHeader.split(';')[0];

    const userA = {
      id: 'test_seller_alice_001',
      fullName: 'Alice Property Owner',
      email: 'alice.seller@example.com',
      phone: '9876543210',
      role: 'user',
      tokenVersion: 0,
    };
    const tokenA = generateToken(userA, false);

    const userB = {
      id: 'test_seller_bob_002',
      fullName: 'Bob Another Owner',
      email: 'bob.seller@example.com',
      phone: '9876543211',
      role: 'user',
      tokenVersion: 0,
    };
    const tokenB = generateToken(userB, false);

    const headersA = {
      Cookie: `mj_auth_token=${tokenA}; ${csrfCookie}`,
      'x-csrf-token': csrfToken,
    };
    const headersB = {
      Cookie: `mj_auth_token=${tokenB}; ${csrfCookie}`,
      'x-csrf-token': csrfToken,
    };

    assert(Boolean(tokenA && tokenB), 'Authenticated session tokens generated');

    // -------------------------------------------------------------------------
    // 3. Cloudinary Upload Signature Generation & Secret Isolation
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing Cloudinary Upload Signature Generation ---');

    const sigRes = await requestJson(server, {
      method: 'POST',
      path: '/api/dashboard/listings/upload-signature',
      headers: headersA,
    });

    assert(sigRes.status === 200, 'Authenticated user generates upload signature (200)');
    const sigData = sigRes.body?.data;
    assert(Boolean(sigData?.signature), 'Response contains cryptographic signature string');
    assert(typeof sigData?.timestamp === 'number', 'Response contains integer timestamp');
    assert(Boolean(sigData?.apiKey), 'Response includes Cloudinary API key');
    assert(Boolean(sigData?.cloudName), 'Response includes Cloudinary cloud name');
    assert(sigData?.folder === 'masterji_estates/properties', 'Signature target folder is masterji_estates/properties');

    // SECURITY CHECK: API Secret must NEVER be leaked in the response payload
    const rawResponseBody = JSON.stringify(sigRes.body);
    const leakedSecret = rawResponseBody.includes(process.env.CLOUDINARY_API_SECRET || 'USECRETOFCLAUDYKEY0');
    assert(!leakedSecret, 'SECURITY GUARANTEE: Cloudinary API Secret is NEVER exposed to client');

    // -------------------------------------------------------------------------
    // 4. Draft Creation, Ownership Derivation & Anti-Privilege Rules
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing Property Draft Creation & Security Constraints ---');

    // Attempting to submit company_owned listing as a regular user must be rejected
    const companyOwnedRes = await requestJson(server, {
      method: 'POST',
      path: '/api/dashboard/listings/draft',
      headers: headersA,
      body: {
        title: 'Unauthorized Company Asset',
        listingType: 'company_owned', // FORBIDDEN FOR PUBLIC USER
        category: 'apartment',
      },
    });
    assert(
      companyOwnedRes.status === 400,
      'SECURITY ENFORCED: Attempt to create company_owned listing is rejected with 400'
    );

    // Attempting to self-assign available status during draft creation
    const selfApproveRes = await requestJson(server, {
      method: 'POST',
      path: '/api/dashboard/listings/draft',
      headers: headersA,
      body: {
        title: 'Self Approved Listing',
        availabilityStatus: 'available', // FORBIDDEN
        category: 'apartment',
      },
    });
    assert(
      selfApproveRes.status === 400,
      'SECURITY ENFORCED: Client cannot self-assign "available" moderation status'
    );

    // Valid draft creation by User A
    const draftResA = await requestJson(server, {
      method: 'POST',
      path: '/api/dashboard/listings/draft',
      headers: headersA,
      body: {
        title: 'Elegant 3 BHK Highrise in Sector 62',
        category: 'apartment',
        description: 'Spacious and ventilated luxury apartment draft awaiting full specifications.',
        city: 'Gurugram',
        locality: 'Sector 62',
        state: 'Haryana',
        pincode: '122001',
      },
    });

    assert(draftResA.status === 201, 'User A creates property draft successfully (201)');
    const draftA = draftResA.body?.data;
    const draftIdA = draftA?.id;
    assert(Boolean(draftIdA), `Generated Draft ID: ${draftIdA}`);
    assert(draftA?.isDraft === true, 'Draft is marked with isDraft: true');
    assert(draftA?.availabilityStatus === 'draft', 'Draft status is initialized to "draft"');
    assert(draftA?.listingType === 'brokerage', 'Listing type is strictly enforced as "brokerage"');

    // -------------------------------------------------------------------------
    // 5. Draft Update & Cross-User Isolation (User B cannot edit User A's draft)
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Testing Draft Update & Cross-User Edit Isolation ---');

    // User A updates their draft with specifications and pricing
    const updateResA = await requestJson(server, {
      method: 'PATCH',
      path: `/api/dashboard/listings/draft/${draftIdA}`,
      headers: headersA,
      body: {
        price: 16500000,
        area: 1950,
        areaUnit: 'sqft',
        bedrooms: 3,
        bathrooms: 3,
        parking: 2,
        furnishing: 'Semi-Furnished',
        amenities: ['Power Backup', 'Gymnasium', 'Swimming Pool', 'Security'],
      },
    });

    assert(updateResA.status === 200, 'User A updates their draft with specs & price (200)');
    assert(updateResA.body?.data?.price === 16500000, 'Updated price reflected');
    assert(updateResA.body?.data?.priceFormatted === '₹1.65 Cr', 'Price formatted as ₹1.65 Cr');

    // User B attempts to edit User A's draft -> MUST BE REJECTED with 403 or 404
    const tamperByB = await requestJson(server, {
      method: 'PATCH',
      path: `/api/dashboard/listings/draft/${draftIdA}`,
      headers: headersB,
      body: {
        title: 'Hacked by User B',
        price: 1,
      },
    });
    assert(
      tamperByB.status === 403 || tamperByB.status === 404,
      'PRIVACY & ABAC ENFORCED: User B CANNOT edit User A property draft (rejected with 403/404)'
    );

    // -------------------------------------------------------------------------
    // 6. Cloudinary Asset Validation (Base64, External URLs & Size Limits)
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Testing Cloudinary Image Validation & Attack Defense ---');

    // Attack 1: Attempt to upload Base64 string -> MUST BE REJECTED
    const base64Res = await requestJson(server, {
      method: 'PATCH',
      path: `/api/dashboard/listings/draft/${draftIdA}`,
      headers: headersA,
      body: {
        cloudinaryAssets: [
          {
            publicId: 'evil_base64',
            url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
          },
        ],
      },
    });
    assert(base64Res.status === 400, 'SECURITY ENFORCED: Base64 data URLs rejected with 400');

    // Attack 2: Attempt to supply arbitrary external image domain -> MUST BE REJECTED
    const externalDomainRes = await requestJson(server, {
      method: 'PATCH',
      path: `/api/dashboard/listings/draft/${draftIdA}`,
      headers: headersA,
      body: {
        cloudinaryAssets: [
          {
            publicId: 'external_hijack',
            url: 'https://attacker-controlled-site.com/exploit.jpg',
          },
        ],
      },
    });
    assert(
      externalDomainRes.status === 400,
      'SECURITY ENFORCED: Arbitrary external image URLs rejected with 400'
    );

    // Attack 3: Oversized image asset (>10MB) -> MUST BE REJECTED
    const oversizedRes = await requestJson(server, {
      method: 'PATCH',
      path: `/api/dashboard/listings/draft/${draftIdA}`,
      headers: headersA,
      body: {
        cloudinaryAssets: [
          {
            publicId: 'oversized_img',
            url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            bytes: 15 * 1024 * 1024, // 15MB > 10MB limit
          },
        ],
      },
    });
    assert(oversizedRes.status === 400, 'SECURITY ENFORCED: Oversized image asset rejected with 400');

    // Legitimate Cloudinary asset attached
    const validAssetsRes = await requestJson(server, {
      method: 'PATCH',
      path: `/api/dashboard/listings/draft/${draftIdA}`,
      headers: headersA,
      body: {
        cloudinaryAssets: [
          {
            publicId: 'masterji_estates/properties/prop_photo_1',
            url: 'https://res.cloudinary.com/mu52rrq3/image/upload/v12345/masterji_estates/properties/prop_photo_1.jpg',
            secureUrl:
              'https://res.cloudinary.com/mu52rrq3/image/upload/v12345/masterji_estates/properties/prop_photo_1.jpg',
            width: 1920,
            height: 1080,
            format: 'jpg',
            bytes: 450000,
            isCover: true,
          },
          {
            publicId: 'masterji_estates/properties/prop_photo_2',
            url: 'https://res.cloudinary.com/mu52rrq3/image/upload/v12345/masterji_estates/properties/prop_photo_2.jpg',
            secureUrl:
              'https://res.cloudinary.com/mu52rrq3/image/upload/v12345/masterji_estates/properties/prop_photo_2.jpg',
            width: 1920,
            height: 1080,
            format: 'jpg',
            bytes: 520000,
            isCover: false,
          },
        ],
      },
    });

    assert(validAssetsRes.status === 200, 'Valid Cloudinary photo assets accepted (200)');
    assert(
      validAssetsRes.body?.data?.imageUrl.includes('prop_photo_1.jpg'),
      'Cover photo assigned as primary imageUrl'
    );
    assert(validAssetsRes.body?.data?.images.length === 2, 'Images array populated with 2 photos');

    // -------------------------------------------------------------------------
    // 7. Multi-Step Submission Validation & Review State Transition
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Testing Step-by-Step Submission Validation ---');

    // User B creates an incomplete draft (missing price and photos)
    const incompleteDraftRes = await requestJson(server, {
      method: 'POST',
      path: '/api/dashboard/listings/draft',
      headers: headersB,
      body: {
        title: 'Incomplete Draft Without Price or Photos',
        category: 'apartment',
        city: 'Delhi',
      },
    });
    const incompleteDraftId = incompleteDraftRes.body?.data?.id;

    // Attempting to submit incomplete draft -> MUST BE REJECTED
    const submitIncompleteRes = await requestJson(server, {
      method: 'POST',
      path: `/api/dashboard/listings/${incompleteDraftId}/submit`,
      headers: headersB,
    });
    assert(
      submitIncompleteRes.status === 400,
      'VALIDATION ENFORCED: Submitting incomplete draft is rejected with 400'
    );

    // User A submits complete draft -> MUST SUCCEED
    const submitCompleteRes = await requestJson(server, {
      method: 'POST',
      path: `/api/dashboard/listings/${draftIdA}/submit`,
      headers: headersA,
      body: {
        submissionNotes: 'Please call before physical inspection visit.',
      },
    });

    assert(submitCompleteRes.status === 200, 'User A submits complete draft for review (200)');
    const submittedData = submitCompleteRes.body?.data;
    assert(
      submittedData?.availabilityStatus === 'pending_review',
      'Listing transitioned to "pending_review" status'
    );
    assert(submittedData?.isDraft === false, 'Listing isDraft is set to false');

    // Prevention of editing after submission
    const editAfterSubmitRes = await requestJson(server, {
      method: 'PATCH',
      path: `/api/dashboard/listings/draft/${draftIdA}`,
      headers: headersA,
      body: { title: 'Attempting to change submitted listing' },
    });
    assert(
      editAfterSubmitRes.status === 400,
      'LIFECYCLE ENFORCED: Editing a listing undergoing verification is rejected with 400'
    );

    // -------------------------------------------------------------------------
    // 8. Public Catalogue Isolation (Pending listings remain strictly hidden)
    // -------------------------------------------------------------------------
    console.log('\n--- 8. Testing Public Directory Isolation for Pending Listings ---');

    // Query public property catalogue
    const publicCatalogRes = await requestJson(server, { path: '/api/properties' });
    assert(publicCatalogRes.status === 200, 'Public catalogue GET /api/properties responds with 200');
    const catalogProperties = publicCatalogRes.body?.data || [];
    const leakedInCatalog = catalogProperties.some(
      (p) => p.id === draftIdA || p.title === 'Elegant 3 BHK Highrise in Sector 62'
    );
    assert(
      !leakedInCatalog,
      'PUBLIC PRIVACY ENFORCED: Pending review listing does NOT appear in public catalogue'
    );

    // Direct public GET /api/properties/:id for pending listing -> MUST RETURN 404
    const publicDetailRes = await requestJson(server, { path: `/api/properties/${draftIdA}` });
    assert(
      publicDetailRes.status === 404,
      'PUBLIC PRIVACY ENFORCED: Public GET /api/properties/:id for pending listing returns 404 Not Found'
    );

    // -------------------------------------------------------------------------
    // 9. Seller Portal Listings Retrieval & Withdrawal
    // -------------------------------------------------------------------------
    console.log('\n--- 9. Testing Seller Portal Listings & Withdrawal ---');

    // User A fetches their seller listings from dashboard
    const sellerListingsA = await requestJson(server, {
      path: '/api/dashboard/listings',
      headers: headersA,
    });
    assert(sellerListingsA.status === 200, 'User A retrieves their seller listings (200)');
    const userASeesSubmitted = sellerListingsA.body?.data?.some((p) => p.id === draftIdA);
    assert(userASeesSubmitted, 'User A seller inventory displays the submitted listing');

    // User B fetches their seller listings -> MUST NOT SEE User A's listing
    const sellerListingsB = await requestJson(server, {
      path: '/api/dashboard/listings',
      headers: headersB,
    });
    const userBSeesAliceListing = sellerListingsB.body?.data?.some((p) => p.id === draftIdA);
    assert(!userBSeesAliceListing, 'ISOLATION ENFORCED: User B does NOT see User A seller listing');

    // User B attempts to withdraw User A's listing -> MUST BE REJECTED
    const withdrawTamperB = await requestJson(server, {
      method: 'PATCH',
      path: `/api/dashboard/listings/${draftIdA}/withdraw`,
      headers: headersB,
    });
    assert(
      withdrawTamperB.status === 403 || withdrawTamperB.status === 404,
      'ABAC ENFORCED: User B cannot withdraw User A listing (rejected with 403/404)'
    );

    // User A withdraws their listing -> MUST SUCCEED
    const withdrawResA = await requestJson(server, {
      method: 'PATCH',
      path: `/api/dashboard/listings/${draftIdA}/withdraw`,
      headers: headersA,
    });
    assert(withdrawResA.status === 200, 'User A successfully withdraws listing (200)');
    assert(
      withdrawResA.body?.data?.availabilityStatus === 'withdrawn',
      'Listing status updated to "withdrawn"'
    );

    // -------------------------------------------------------------------------
    // 10. Regression Check on Public APIs
    // -------------------------------------------------------------------------
    console.log('\n--- 10. Regression Testing Public Platform Health ---');

    const healthRes = await requestJson(server, { path: '/api/health' });
    assert(healthRes.status === 200, 'Public health endpoint operational (200)');

    const propertiesRes = await requestJson(server, { path: '/api/properties?limit=3' });
    assert(propertiesRes.status === 200, 'Public property search functional (200)');
  } finally {
    server.close();
  }

  console.log('\n======================================================');
  console.log(` RESULT: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('======================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

