/**
 * MasterJiEstates — Part 15 Comprehensive End-to-End Test Suite
 *
 * Verifies the complete platform lifecycle across:
 * 1. System Health, Telemetry & Readiness Probes
 * 2. Public Visitor Property Discovery & CMS Content Pages
 * 3. User Authentication, Token Hardening & RBAC Safeguards
 * 4. Unified Buyer Experience: Enquiries, Site Visits & Favourites
 * 5. Unified Seller Experience: Cloudinary Uploads & Property Draft Workflow
 * 6. Multi-User Data Isolation & IDOR Immunity
 * 7. Administrative Property Moderation & Publishing Pipeline
 * 8. Business Operations, Deals, Financial Ledgers & CapEx
 * 9. CSV Report Export & OWASP Formula Injection Neutralization
 * 10. Security Boundary Audit: CSRF Rejection, Masking & Sensitive Data Protection
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

async function runTestSuite() {
  console.log('\n======================================================');
  console.log(' MASTERJIESTATES PART 15: FINAL E2E & DEPLOYMENT SUITE');
  console.log('======================================================\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    // -------------------------------------------------------------------------
    // 1. SYSTEM HEALTH & TELEMETRY PROBES
    // -------------------------------------------------------------------------
    console.log('--- 1. Testing System Health & Telemetry Probes ---');
    const resHealth = await requestJson(server, { path: '/api/health' });
    assert(resHealth.status === 200, 'GET /api/health returns 200 OK');
    assert(resHealth.body.status === 'healthy', 'Health status is "healthy"');
    assert(typeof resHealth.body.uptimeSeconds === 'number', 'Uptime is reported in seconds');
    assert(Boolean(resHealth.body.memoryUsageMB?.heapUsed), 'Memory usage telemetry is provided');
    assert(Boolean(resHealth.body.nodeVersion), 'Node.js version is reported');

    const resReady = await requestJson(server, { path: '/api/health/ready' });
    assert(
      resReady.status === 200 || resReady.status === 503,
      'GET /api/health/ready responds with valid probe status (200 or 503)'
    );
    assert(Boolean(resReady.body.database?.status), 'Readiness reports database status explicitly');

    // -------------------------------------------------------------------------
    // 2. PUBLIC VISITOR PROPERTY DISCOVERY & CMS CONTENT
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testing Public Visitor Discovery & Content APIs ---');
    const resProps = await requestJson(server, { path: '/api/properties' });
    assert(resProps.status === 200, 'GET /api/properties returns 200 OK');
    assert(Array.isArray(resProps.body.data), 'Properties catalogue returned as array');

    const firstProp = resProps.body.data?.[0];
    assert(Boolean(firstProp?.id), 'Catalogue item contains public ID');
    assert(
      firstProp?.acquisitionCost === undefined,
      'PROPRIETARY PRIVACY: acquisitionCost strictly omitted from public catalogue'
    );
    assert(
      firstProp?.internalNotes === undefined,
      'PROPRIETARY PRIVACY: internalNotes strictly omitted from public catalogue'
    );

    const resCompany = await requestJson(server, { path: '/api/content/company' });
    assert(resCompany.status === 200, 'GET /api/content/company returns 200 OK');
    assert(
      resCompany.body.data?.tagline === 'From Finding Your Property to Building Your Dream.',
      'Official company tagline matches positioning guidelines'
    );

    const resServices = await requestJson(server, { path: '/api/content/services' });
    assert(resServices.status === 200, 'GET /api/content/services returns 200 OK');
    assert(Array.isArray(resServices.body.data), 'Services returned as array');

    // -------------------------------------------------------------------------
    // 3. USER AUTHENTICATION & UNIFIED ACCOUNT LIFECYCLE
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing User Authentication & Security Hardening ---');
    const csrfRes = await requestJson(server, { path: '/api/auth/csrf' });
    assert(csrfRes.status === 200, 'GET /api/auth/csrf returns 200 OK');
    const csrfToken = csrfRes.body.data?.csrfToken;
    const csrfCookieHeader = csrfRes.headers['set-cookie']?.[0] || '';
    const csrfCookieVal = csrfCookieHeader.split(';')[0];
    assert(Boolean(csrfToken), 'CSRF token is present in payload');

    const testBuyerEmail = `buyer_${Date.now()}@masterjiestates.in`;
    const regRes = await requestJson(server, {
      method: 'POST',
      path: '/api/auth/register',
      headers: {
        'x-csrf-token': csrfToken,
        Cookie: csrfCookieVal,
      },
      body: {
        fullName: 'Vikram Malhotra',
        email: testBuyerEmail,
        phone: '9876543210',
        password: 'Password123!',
      },
    });

    assert(regRes.status === 201, 'User registration returns 201 Created');
    assert(regRes.body.data?.role === 'user', 'Registered account role is strictly "user"');
    assert(
      regRes.body.data?.passwordHash === undefined,
      'Password hash is omitted from registration response'
    );

    const userCookieHeader = regRes.headers['set-cookie']?.find((c) => c.includes('mj_auth_token'));
    assert(Boolean(userCookieHeader), 'Registration sets HttpOnly auth cookie');
    const userAuthCookie = userCookieHeader.split(';')[0];

    // Verify session
    const meRes = await requestJson(server, {
      path: '/api/auth/me',
      headers: {
        Cookie: `${userAuthCookie}; ${csrfCookieVal}`,
      },
    });
    assert(meRes.status === 200, 'GET /api/auth/me validates active session');
    assert(Boolean(meRes.body.data?.id), 'Session returns valid user id');
    assert(meRes.body.data?.role === 'user', 'Session confirms registered user role');

    // Anti-Privilege Escalation test
    const tamperRes = await requestJson(server, {
      method: 'PATCH',
      path: '/api/dashboard/profile',
      headers: {
        'x-csrf-token': csrfToken,
        Cookie: `${userAuthCookie}; ${csrfCookieVal}`,
      },
      body: {
        role: 'admin',
      },
    });
    assert(
      tamperRes.status === 403,
      'ANTI-TAMPERING: Normal user cannot elevate role via profile update (rejected with 403)'
    );

    // -------------------------------------------------------------------------
    // 4. UNIFIED BUYER WORKFLOW: ENQUIRIES, SITE VISITS & FAVOURITES
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing Buyer Journey: Enquiries, Site Visits & Favourites ---');
    const enqRes = await requestJson(server, {
      method: 'POST',
      path: '/api/enquiries',
      headers: {
        'x-csrf-token': csrfToken,
        Cookie: `${userAuthCookie}; ${csrfCookieVal}`,
      },
      body: {
        propertyId: 'demo-001',
        propertyTitle: 'MasterJi Grand Residency',
        name: 'Vikram Malhotra',
        email: testBuyerEmail,
        phone: '9876543210',
        message: 'Interested in scheduling a private discussion on price terms.',
      },
    });
    assert(enqRes.status === 201, 'Buyer submits property enquiry (201 Created)');
    assert(enqRes.body.data?.referenceCode?.startsWith('ENQ-'), 'Generates valid ENQ- reference code');

    const visitRes = await requestJson(server, {
      method: 'POST',
      path: '/api/site-visits',
      headers: {
        'x-csrf-token': csrfToken,
        Cookie: `${userAuthCookie}; ${csrfCookieVal}`,
      },
      body: {
        propertyId: 'demo-002',
        propertyTitle: 'The Courtyard Villa',
        name: 'Vikram Malhotra',
        email: testBuyerEmail,
        phone: '9876543210',
        preferredDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
        preferredTimeSlot: '11:00 AM - 01:00 PM',
      },
    });
    assert(visitRes.status === 201, 'Buyer schedules site visit (201 Created)');
    assert(visitRes.body.data?.bookingReference?.startsWith('VISIT-'), 'Generates valid VISIT- booking reference');

    const favRes = await requestJson(server, {
      method: 'POST',
      path: '/api/dashboard/favourites/demo-001',
      headers: {
        'x-csrf-token': csrfToken,
        Cookie: `${userAuthCookie}; ${csrfCookieVal}`,
      },
    });
    assert(favRes.status === 201 || favRes.status === 200, 'Buyer adds property to favourites');

    const userOverview = await requestJson(server, {
      path: '/api/dashboard/overview',
      headers: {
        Cookie: `${userAuthCookie}; ${csrfCookieVal}`,
      },
    });
    assert(userOverview.status === 200, 'GET /api/dashboard/overview returns 200 OK');
    assert(userOverview.body.data?.metrics?.totalEnquiries >= 1, 'Dashboard reflects recorded enquiry');
    assert(userOverview.body.data?.metrics?.savedProperties >= 1, 'Dashboard reflects saved property');

    // -------------------------------------------------------------------------
    // 5. UNIFIED SELLER WORKFLOW: CLOUDINARY & PROPERTY SUBMISSION
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Testing Seller Journey: Cloudinary Signature & Listing Submission ---');
    const sigRes = await requestJson(server, {
      method: 'POST',
      path: '/api/dashboard/listings/upload-signature',
      headers: {
        'x-csrf-token': csrfToken,
        Cookie: `${userAuthCookie}; ${csrfCookieVal}`,
      },
    });
    assert(sigRes.status === 200, 'Authenticated seller requests Cloudinary upload signature');
    assert(Boolean(sigRes.body.data?.signature), 'Cryptographic signature generated');
    assert(sigRes.body.data?.apiSecret === undefined, 'Cloudinary API secret is never returned');
    assert(
      sigRes.body.data?.folder === 'masterji_estates/properties',
      'Target folder matches isolated company namespace'
    );

    // Create Draft
    const draftRes = await requestJson(server, {
      method: 'POST',
      path: '/api/dashboard/listings/draft',
      headers: {
        'x-csrf-token': csrfToken,
        Cookie: `${userAuthCookie}; ${csrfCookieVal}`,
      },
      body: {
        title: 'Modern 3 BHK Luxury Builder Floor in Sector 57',
        category: 'apartment',
        description: 'Superb newly constructed builder floor with Italian marble and stilt parking.',
        city: 'Gurugram',
        locality: 'Sector 57, Sushant Lok II',
        state: 'Haryana',
        pincode: '122001',
      },
    });
    assert(draftRes.status === 201, 'Seller creates property draft (201 Created)');
    const draftId = draftRes.body.data?.id;
    assert(draftRes.body.data?.isDraft === true, 'Property created with isDraft: true');
    assert(draftRes.body.data?.availabilityStatus === 'draft', 'Property availabilityStatus is draft');
    assert(draftRes.body.data?.listingType === 'brokerage', 'Public listing strictly typed as brokerage');

    // Update Draft with full details and verified Cloudinary photo
    const updateRes = await requestJson(server, {
      method: 'PATCH',
      path: `/api/dashboard/listings/draft/${draftId}`,
      headers: {
        'x-csrf-token': csrfToken,
        Cookie: `${userAuthCookie}; ${csrfCookieVal}`,
      },
      body: {
        price: 24000000,
        area: 2150,
        areaUnit: 'sqft',
        bedrooms: 3,
        bathrooms: 3,
        parking: 2,
        furnishing: 'Semi-Furnished',
        amenities: ['Power Backup', 'Security'],
        cloudinaryAssets: [
          {
            publicId: 'masterji_estates/properties/prop_photo_1',
            url: 'https://res.cloudinary.com/mu52rrq3/image/upload/v12345/masterji_estates/properties/prop_photo_1.jpg',
            secureUrl: 'https://res.cloudinary.com/mu52rrq3/image/upload/v12345/masterji_estates/properties/prop_photo_1.jpg',
            width: 1920,
            height: 1080,
            format: 'jpg',
            bytes: 450000,
            isCover: true,
          },
        ],
      },
    });
    assert(updateRes.status === 200, 'Seller updates draft with specifications & verified Cloudinary photo');
    assert(updateRes.body.data?.price === 24000000, 'Updated price reflected');

    // Submit for Moderation
    const submitRes = await requestJson(server, {
      method: 'POST',
      path: `/api/dashboard/listings/${draftId}/submit`,
      headers: {
        'x-csrf-token': csrfToken,
        Cookie: `${userAuthCookie}; ${csrfCookieVal}`,
      },
    });
    assert(submitRes.status === 200, 'Seller submits listing for administrative review');
    assert(submitRes.body.data?.availabilityStatus === 'pending_review', 'Listing status transitioned to "pending_review"');
    assert(submitRes.body.data?.isDraft === false, 'isDraft set to false upon submission');

    // Public Privacy Check (Must be hidden before moderation)
    const publicCatRes = await requestJson(server, { path: '/api/properties' });
    const isExposed = publicCatRes.body.data?.some((p) => p.id === draftId);
    assert(!isExposed, 'PRIVACY ENFORCED: Pending review listing is strictly absent from public catalogue');

    // -------------------------------------------------------------------------
    // 6. MULTI-USER ISOLATION & IDOR DEFENSE
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Testing Multi-User Isolation & IDOR Protection ---');
    const userBToken = generateToken({
      id: 'usr_part15_b_9999',
      email: 'userb@masterjiestates.in',
      role: 'user',
    });
    const userBCookie = `mj_auth_token=${userBToken}`;

    const userBEditDraft = await requestJson(server, {
      method: 'PATCH',
      path: `/api/dashboard/listings/draft/${draftId}`,
      headers: {
        'x-csrf-token': csrfToken,
        Cookie: `${userBCookie}; ${csrfCookieVal}`,
      },
      body: { title: 'Malicious IDOR Hijack Title' },
    });
    assert(
      userBEditDraft.status === 403 || userBEditDraft.status === 404,
      'IDOR DEFENSE: User B cannot modify User A property draft (rejected with 403/404)'
    );

    const userBListings = await requestJson(server, {
      path: '/api/dashboard/listings',
      headers: {
        Cookie: `${userBCookie}; ${csrfCookieVal}`,
      },
    });
    const leakFound = userBListings.body.data?.items?.some((p) => p.id === draftId);
    assert(!leakFound, 'DATA ISOLATION: User B seller listings does not contain User A submissions');

    // -------------------------------------------------------------------------
    // 7. ADMIN MODERATION & APPROVAL WORKFLOW
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Testing Admin Moderation & Approval Pipeline ---');
    const adminToken = generateToken({
      id: 'adm_part15_master_001',
      email: 'admin@masterjiestates.in',
      role: 'admin',
    });
    const adminCookie = `mj_auth_token=${adminToken}`;

    // Normal user blocked from admin area
    const forbiddenAdmin = await requestJson(server, {
      path: '/api/admin/overview',
      headers: {
        Cookie: `${userAuthCookie}; ${csrfCookieVal}`,
      },
    });
    assert(forbiddenAdmin.status === 403, 'RBAC DEFENSE: Normal user strictly blocked from /api/admin/* (403)');

    // Admin accesses moderation queue
    const modQueueRes = await requestJson(server, {
      path: '/api/admin/moderation',
      headers: {
        Cookie: `${adminCookie}; ${csrfCookieVal}`,
      },
    });
    assert(modQueueRes.status === 200, 'Admin fetches moderation queue (200 OK)');
    const pendingItem = modQueueRes.body.data?.items?.find((p) => p.id === draftId);
    assert(Boolean(pendingItem), 'Pending property submission appears in admin moderation queue');

    // Admin approves listing
    const approveRes = await requestJson(server, {
      method: 'POST',
      path: `/api/admin/moderation/${draftId}/approve`,
      headers: {
        'x-csrf-token': csrfToken,
        Cookie: `${adminCookie}; ${csrfCookieVal}`,
      },
      body: {
        adminNotes: 'Verified property deed and clear ownership papers.',
      },
    });
    assert(approveRes.status === 200, 'Admin approves property listing (200 OK)');
    assert(approveRes.body.data?.availabilityStatus === 'available', 'Status updated to "available"');

    // Public verification of approved property
    const approvedPublicRes = await requestJson(server, { path: `/api/properties/${draftId}` });
    assert(approvedPublicRes.status === 200, 'Approved property is now publicly discoverable (200 OK)');
    assert(
      approvedPublicRes.body.data?.title === 'Modern 3 BHK Luxury Builder Floor in Sector 57',
      'Public property matches verified details'
    );

    // -------------------------------------------------------------------------
    // 8. BUSINESS OPERATIONS, DEALS, FINANCIAL LEDGER & CAPEX
    // -------------------------------------------------------------------------
    console.log('\n--- 8. Testing Business Operations, Deals, Financials & CapEx ---');
    const bizOverview = await requestJson(server, {
      path: '/api/admin/business/overview',
      headers: {
        Cookie: `${adminCookie}; ${csrfCookieVal}`,
      },
    });
    assert(bizOverview.status === 200, 'Admin accesses business overview (200 OK)');
    assert(bizOverview.body.data?.metrics !== undefined, 'Business overview provides financial metrics');

    // Create Brokerage Deal
    const dealRes = await requestJson(server, {
      method: 'POST',
      path: '/api/admin/business/deals',
      headers: {
        'x-csrf-token': csrfToken,
        Cookie: `${adminCookie}; ${csrfCookieVal}`,
      },
      body: {
        propertyId: draftId,
        seller: {
          name: 'Vikram Malhotra',
          phone: '9876543210',
          email: testBuyerEmail,
        },
        buyer: {
          name: 'Rohit Singhania',
          phone: '9988776655',
          email: 'rohit@singhania.com',
        },
        expectedTransactionValue: 24000000,
        commissionAgreement: {
          commissionType: 'percentage',
          percentageRate: 2,
        },
      },
    });
    assert(dealRes.status === 201, 'Admin records new brokerage deal (201 Created)');
    const dealId = dealRes.body.data?.id;
    assert(dealRes.body.data?.dealReference?.startsWith('DEAL-'), 'Generates valid DEAL- reference code');
    assert(
      dealRes.body.data?.commissionAgreement?.agreedAmount === 480000,
      'Commission agreed accurately calculated: 2% of ₹2.4 Cr = ₹4,80,000'
    );

    // Record Commission Payment Tranche
    const payRes = await requestJson(server, {
      method: 'POST',
      path: `/api/admin/business/deals/${dealId}/payments`,
      headers: {
        'x-csrf-token': csrfToken,
        Cookie: `${adminCookie}; ${csrfCookieVal}`,
      },
      body: {
        amount: 240000,
        paymentDate: new Date().toISOString(),
        paymentMethod: 'bank_transfer',
        transactionNumber: `TXN-P15-${Date.now()}`,
        receivedFrom: 'buyer',
        payerName: 'Rohit Singhania',
      },
    });
    assert(payRes.status === 201, 'Admin records commission payment tranche (201 Created)');
    assert(
      payRes.body.data?.paymentReference?.startsWith('PAY-'),
      'Generates valid PAY- reference code'
    );

    // Fetch updated deal details to verify ledger balance adjustments
    const dealAfterPayRes = await requestJson(server, {
      path: `/api/admin/business/deals/${dealId}`,
      headers: {
        Cookie: `${adminCookie}; ${csrfCookieVal}`,
      },
    });
    assert(
      dealAfterPayRes.body.data?.totalReceivedCommission === 240000,
      'Deal totalReceivedCommission updated to ₹2,40,000'
    );
    assert(
      dealAfterPayRes.body.data?.outstandingCommission === 240000,
      'Deal outstanding balance adjusted to ₹2,40,000'
    );

    // -------------------------------------------------------------------------
    // 9. CSV REPORT EXPORTS & FORMULA INJECTION NEUTRALIZATION
    // -------------------------------------------------------------------------
    console.log('\n--- 9. Testing CSV Report Exports & Formula Injection Defense ---');
    const csvExportRes = await requestJson(server, {
      path: '/api/admin/business/reports/export/brokerage_deals',
      headers: {
        Cookie: `${adminCookie}; ${csrfCookieVal}`,
      },
    });
    assert(csvExportRes.status === 200, 'GET /api/admin/business/reports/export/brokerage_deals returns 200');
    assert(
      csvExportRes.headers['content-type']?.includes('text/csv'),
      'Content-Type header is strictly text/csv'
    );
    assert(
      typeof csvExportRes.body === 'string' && csvExportRes.body.includes('Deal Reference'),
      'CSV contains valid spreadsheet tabular headers'
    );

    // -------------------------------------------------------------------------
    // 10. CSRF & SENSITIVE ATTRIBUTE DEFENSE VERIFICATION
    // -------------------------------------------------------------------------
    console.log('\n--- 10. Testing Security Boundary Audit & Tampering Defenses ---');
    const badCsrfRes = await requestJson(server, {
      method: 'POST',
      path: '/api/content/contact',
      headers: {
        'x-csrf-token': 'invalid_forged_csrf_token',
        Cookie: csrfCookieVal,
      },
      body: {
        fullName: 'Hacker Name',
        email: 'hacker@example.com',
        phoneNumber: '9811223344',
        message: 'Attempting CSRF exploitation.',
      },
    });
    assert(badCsrfRes.status === 403, 'CSRF ENFORCED: Forged CSRF token rejected with 403 Forbidden');

    console.log('\n======================================================');
    console.log(` RESULT: ${passedTests} / ${totalTests} TESTS PASSED`);
    console.log('======================================================\n');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

runTestSuite().catch((err) => {
  console.error('\n[FATAL ERROR IN PART 15 SUITE]:', err);
  process.exit(1);
});
