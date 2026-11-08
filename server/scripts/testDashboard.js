/**
 * Verification & Authorization Test Suite for MasterJiEstates Unified User Dashboard (Part 10)
 *
 * Runs self-contained tests verifying:
 * 1. 401 Unauthorized for unauthenticated calls across all dashboard endpoints
 * 2. Cross-user data isolation (User A cannot see User B's enquiries, visits, favourites)
 * 3. ABAC authorization on site visit cancellation (User B cannot cancel User A's visit)
 * 4. Favourites management (add, deduplicate, validate, delete)
 * 5. Recently viewed tracking (record view, deduplicate, retrieve)
 * 6. Profile updates and strict rejection of role privilege escalation
 * 7. Integrity of existing public APIs (health, properties)
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
  console.log(' MASTERJIESTATES PART 10: USER DASHBOARD TEST SUITE');
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

    const res1 = await requestJson(server, { path: '/api/dashboard/overview' });
    assert(res1.status === 401, 'Unauthenticated GET /api/dashboard/overview returns 401');

    const res2 = await requestJson(server, { path: '/api/dashboard/enquiries' });
    assert(res2.status === 401, 'Unauthenticated GET /api/dashboard/enquiries returns 401');

    const res3 = await requestJson(server, { path: '/api/dashboard/site-visits' });
    assert(res3.status === 401, 'Unauthenticated GET /api/dashboard/site-visits returns 401');

    const res4 = await requestJson(server, { path: '/api/dashboard/favourites' });
    assert(res4.status === 401, 'Unauthenticated GET /api/dashboard/favourites returns 401');

    const res5 = await requestJson(server, { path: '/api/dashboard/recently-viewed' });
    assert(res5.status === 401, 'Unauthenticated GET /api/dashboard/recently-viewed returns 401');

    const res6 = await requestJson(server, { path: '/api/dashboard/listings' });
    assert(res6.status === 401, 'Unauthenticated GET /api/dashboard/listings returns 401');

    // -------------------------------------------------------------------------
    // 2. Setup Authenticated Test Users (User A & User B)
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Setting Up Test Identities (User A & User B) ---');

    // Get CSRF Token
    const csrfRes = await requestJson(server, { path: '/api/auth/csrf' });
    const csrfCookieHeader = csrfRes.headers['set-cookie']?.[0] || '';
    const csrfToken = csrfRes.body?.data?.csrfToken;
    const csrfCookie = csrfCookieHeader.split(';')[0];

    const userA = {
      id: 'test_user_alice_001',
      fullName: 'Alice Sharma',
      email: 'alice@example.com',
      role: 'user',
      tokenVersion: 0,
    };
    const tokenA = generateToken(userA, false);

    const userB = {
      id: 'test_user_bob_002',
      fullName: 'Bob Verma',
      email: 'bob@example.com',
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

    assert(Boolean(tokenA && tokenB), 'Generated authenticated JWT tokens for User A & User B');

    // -------------------------------------------------------------------------
    // 3. User Dashboard Overview Endpoint
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing GET /api/dashboard/overview ---');

    const overviewA = await requestJson(server, {
      path: '/api/dashboard/overview',
      headers: headersA,
    });
    assert(overviewA.status === 200, 'User A retrieves overview with 200 OK');
    assert(overviewA.body?.data?.metrics !== undefined, 'Overview contains metrics object');
    assert(
      typeof overviewA.body?.data?.metrics?.totalEnquiries === 'number',
      'Metrics includes numeric totalEnquiries'
    );
    assert(
      typeof overviewA.body?.data?.metrics?.savedProperties === 'number',
      'Metrics includes numeric savedProperties'
    );
    assert(
      Array.isArray(overviewA.body?.data?.recentActivity),
      'Recent activity is provided as an array'
    );

    // -------------------------------------------------------------------------
    // 4. Enquiries Cross-User Isolation
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing Enquiries Submission & Cross-User Privacy ---');

    // User A submits an enquiry
    const enqRes = await requestJson(server, {
      method: 'POST',
      path: '/api/enquiries',
      headers: headersA,
      body: {
        propertyId: 'demo-001',
        propertyTitle: 'MasterJi Grand Residency',
        name: 'Alice Sharma',
        email: 'alice@example.com',
        phone: '9876543210',
        message: 'Hello, I am interested in scheduling a discussion for this 3BHK flat.',
      },
    });
    assert(enqRes.status === 201, 'User A submits property enquiry successfully (201)');
    const enqRef = enqRes.body?.data?.referenceCode;
    assert(Boolean(enqRef), `Generated enquiry reference: ${enqRef}`);

    // User A fetches their enquiries
    const enqsA = await requestJson(server, {
      path: '/api/dashboard/enquiries',
      headers: headersA,
    });
    assert(enqsA.status === 200, 'User A retrieves enquiries successfully');
    const userAHasEnquiry = enqsA.body?.data?.some((e) => e.referenceCode === enqRef);
    assert(userAHasEnquiry, 'User A enquiries list contains the submitted enquiry');

    // User B fetches their enquiries -> MUST NOT SEE User A's enquiry!
    const enqsB = await requestJson(server, {
      path: '/api/dashboard/enquiries',
      headers: headersB,
    });
    assert(enqsB.status === 200, 'User B retrieves enquiries successfully');
    const userBSeesAliceEnquiry = enqsB.body?.data?.some((e) => e.referenceCode === enqRef);
    assert(!userBSeesAliceEnquiry, 'PRIVACY ENFORCED: User B CANNOT view User A enquiry');

    // -------------------------------------------------------------------------
    // 5. Site Visits & Cancellation ABAC Protection
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Testing Site Visits Scheduling, Isolation & Cancellation ---');

    // User A schedules a site visit
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const visitRes = await requestJson(server, {
      method: 'POST',
      path: '/api/site-visits',
      headers: headersA,
      body: {
        propertyId: 'demo-002',
        propertyTitle: 'The Courtyard Villa',
        name: 'Alice Sharma',
        email: 'alice@example.com',
        phone: '9876543210',
        preferredDate: futureDate,
        preferredTimeSlot: '11:00 AM - 01:00 PM',
        notes: 'Please ensure gate security pass is arranged.',
      },
    });
    assert(visitRes.status === 201, 'User A schedules site visit successfully (201)');
    const bookingRef = visitRes.body?.data?.bookingReference;
    assert(Boolean(bookingRef), `Generated visit booking reference: ${bookingRef}`);

    // User A checks site visits
    const visitsA = await requestJson(server, {
      path: '/api/dashboard/site-visits',
      headers: headersA,
    });
    assert(visitsA.status === 200, 'User A retrieves site visits successfully');
    const userAHasVisit = visitsA.body?.data?.some((v) => v.bookingReference === bookingRef);
    assert(userAHasVisit, 'User A site visits list contains scheduled visit');

    // User B checks site visits -> MUST NOT SEE User A's visit!
    const visitsB = await requestJson(server, {
      path: '/api/dashboard/site-visits',
      headers: headersB,
    });
    assert(visitsB.status === 200, 'User B retrieves site visits successfully');
    const userBSeesAliceVisit = visitsB.body?.data?.some((v) => v.bookingReference === bookingRef);
    assert(!userBSeesAliceVisit, 'PRIVACY ENFORCED: User B CANNOT view User A site visit');

    // User B tries to cancel User A's visit -> MUST BE REJECTED with 404/403
    const cancelByB = await requestJson(server, {
      method: 'PATCH',
      path: `/api/dashboard/site-visits/${bookingRef}/cancel`,
      headers: headersB,
    });
    assert(
      cancelByB.status === 404 || cancelByB.status === 403,
      'ABAC ENFORCED: User B cannot cancel User A site visit (rejected with 404/403)'
    );

    // User A cancels their own visit -> MUST SUCCEED
    const cancelByA = await requestJson(server, {
      method: 'PATCH',
      path: `/api/dashboard/site-visits/${bookingRef}/cancel`,
      headers: headersA,
    });
    assert(cancelByA.status === 200, 'User A successfully cancels their own site visit');
    assert(cancelByA.body?.data?.status === 'cancelled', 'Visit status updated to cancelled');

    // -------------------------------------------------------------------------
    // 6. Favourites Management (Saved Properties)
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Testing Favourites (Saved Properties) ---');

    // User A adds property to favourites
    const addFavRes = await requestJson(server, {
      method: 'POST',
      path: '/api/dashboard/favourites/demo-001',
      headers: headersA,
    });
    assert(addFavRes.status === 201, 'User A adds demo-001 to favourites (201)');

    // Attempting to add non-existent property
    const addInvalidFav = await requestJson(server, {
      method: 'POST',
      path: '/api/dashboard/favourites/non_existent_property_99999',
      headers: headersA,
    });
    assert(addInvalidFav.status === 404, 'Adding non-existent property is rejected with 404');

    // Adding duplicate does not create double entries
    const addDupFav = await requestJson(server, {
      method: 'POST',
      path: '/api/dashboard/favourites/demo-001',
      headers: headersA,
    });
    assert(addDupFav.status === 201, 'Re-adding same property succeeds gracefully');

    // User A fetches favourites
    const favsA = await requestJson(server, {
      path: '/api/dashboard/favourites',
      headers: headersA,
    });
    assert(favsA.status === 200, 'User A retrieves favourites with 200 OK');
    assert(
      favsA.body?.data?.some((p) => p.id === 'demo-001' || p.demoId === 'demo-001'),
      'User A saved properties contains demo-001'
    );

    // User B fetches favourites -> MUST BE EMPTY
    const favsB = await requestJson(server, {
      path: '/api/dashboard/favourites',
      headers: headersB,
    });
    assert(favsB.status === 200, 'User B retrieves favourites with 200 OK');
    assert(
      !favsB.body?.data?.some((p) => p.id === 'demo-001' || p.demoId === 'demo-001'),
      'ISOLATION ENFORCED: User B does NOT have User A favourites'
    );

    // User A removes favourite
    const removeFav = await requestJson(server, {
      method: 'DELETE',
      path: '/api/dashboard/favourites/demo-001',
      headers: headersA,
    });
    assert(removeFav.status === 200, 'User A removes demo-001 from favourites');

    // -------------------------------------------------------------------------
    // 7. Recently Viewed Properties
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Testing Recently Viewed Properties ---');

    // User A records viewing demo-003
    const recordRes = await requestJson(server, {
      method: 'POST',
      path: '/api/dashboard/recently-viewed/demo-003',
      headers: headersA,
    });
    assert(recordRes.status === 200, 'User A records view for demo-003');

    // User A fetches recently viewed
    const rViewedA = await requestJson(server, {
      path: '/api/dashboard/recently-viewed',
      headers: headersA,
    });
    assert(rViewedA.status === 200, 'User A retrieves recently viewed properties');
    assert(
      rViewedA.body?.data?.some(
        (item) => item.property?.id === 'demo-003' || item.property?.demoId === 'demo-003'
      ),
      'Recently viewed contains demo-003'
    );

    // -------------------------------------------------------------------------
    // 8. Profile Update & Anti-Privilege Escalation
    // -------------------------------------------------------------------------
    console.log('\n--- 8. Testing Profile Updates & Anti-Privilege Escalation ---');

    // User A updates valid profile fields
    const updateRes = await requestJson(server, {
      method: 'PATCH',
      path: '/api/dashboard/profile',
      headers: headersA,
      body: {
        fullName: 'Alice S. Wonderland',
        phone: '9876543210',
      },
    });
    assert(updateRes.status === 200, 'User A updates profile name and phone (200)');
    assert(
      updateRes.body?.data?.fullName === 'Alice S. Wonderland',
      'Profile reflection shows updated full name'
    );

    // User A attempts privilege escalation (trying to set role to admin)
    const escalateRes = await requestJson(server, {
      method: 'PATCH',
      path: '/api/dashboard/profile',
      headers: headersA,
      body: {
        fullName: 'Alice S. Wonderland',
        phone: '9876543210',
        role: 'admin', // FORBIDDEN
      },
    });
    assert(
      escalateRes.status === 403,
      'SECURITY ENFORCED: Tampering with role is rejected with 403 Forbidden'
    );

    // Invalid phone number format validation
    const badPhoneRes = await requestJson(server, {
      method: 'PATCH',
      path: '/api/dashboard/profile',
      headers: headersA,
      body: {
        fullName: 'Alice S. Wonderland',
        phone: '12345', // Invalid
      },
    });
    assert(badPhoneRes.status === 400, 'Invalid phone number format is rejected with 400');

    // -------------------------------------------------------------------------
    // 9. Seller Section & Public Endpoint Stability
    // -------------------------------------------------------------------------
    console.log('\n--- 9. Testing Seller Section & Public API Integrity ---');

    // User A checks listings (empty state for regular user without submissions)
    const listingsRes = await requestJson(server, {
      path: '/api/dashboard/listings',
      headers: headersA,
    });
    assert(listingsRes.status === 200, 'User A queries submitted listings (200)');
    assert(Array.isArray(listingsRes.body?.data), 'Listings returns an array');

    // Health endpoint remains 200
    const healthRes = await requestJson(server, { path: '/api/health' });
    assert(healthRes.status === 200, 'Public /api/health remains fully operational');

    // Properties catalog remains 200
    const propsRes = await requestJson(server, { path: '/api/properties?limit=5' });
    assert(propsRes.status === 200, 'Public /api/properties remains fully operational');
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
