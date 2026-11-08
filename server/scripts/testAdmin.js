/**
 * Verification & Security Test Suite for MasterJiEstates Admin Dashboard & Property Moderation (Part 12)
 *
 * Tests:
 * 1. Unauthenticated rejection across all admin endpoints (401)
 * 2. Normal user authorization rejection across all admin endpoints (403)
 * 3. SuperAdmin authentication & overview dashboard metrics
 * 4. Property Moderation Queue retrieval & seller PII unmasking
 * 5. Listing Approval workflow (pending_review -> available, public directory activation)
 * 6. Listing Rejection workflow (mandatory reason, private status)
 * 7. Change Request workflow (mandatory remarks, seller re-edit capability, resubmission)
 * 8. Property Management state transitions (available -> under_negotiation -> sold -> withdrawn -> restored)
 * 9. Company-Owned Inventory management (creation, update, acquisition cost & internal notes privacy)
 * 10. Public DTO data leakage prevention (company financial metrics strictly omitted from public catalogue)
 * 11. User Management directory & anti-self-suspension security guard
 * 12. Lead Enquiries CRM & Site Visits dispatch operations
 * 13. Append-only administrative audit trail logging
 * 14. Public API regression testing
 */

import http from 'http';
import app from '../app.js';
import { generateToken } from '../utils/jwt.js';
import { inMemorySubmissionStore } from '../services/propertySubmissionService.js';
import { inMemoryEnquiries } from '../services/enquiryService.js';
import { inMemorySiteVisits } from '../services/siteVisitService.js';

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

function parseCookie(setCookieHeaders, cookieName) {
  if (!setCookieHeaders) return null;
  const list = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  for (const str of list) {
    if (str.startsWith(`${cookieName}=`)) {
      return str.split(';')[0].split('=')[1];
    }
  }
  return null;
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log(' MASTERJIESTATES PART 12: ADMIN BACK-OFFICE SUITE');
  console.log('======================================================\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    // -------------------------------------------------------------
    // Section 1: Unauthenticated Security Boundaries (Expecting 401)
    // -------------------------------------------------------------
    console.log('--- 1. Testing Unauthenticated Security Boundaries (Expecting 401) ---');
    {
      const resOverview = await requestJson(server, { path: '/api/admin/overview' });
      assert(resOverview.status === 401, 'Unauthenticated GET /api/admin/overview returns 401');

      const resMod = await requestJson(server, { path: '/api/admin/moderation' });
      assert(resMod.status === 401, 'Unauthenticated GET /api/admin/moderation returns 401');

      const resProps = await requestJson(server, { path: '/api/admin/properties' });
      assert(resProps.status === 401, 'Unauthenticated GET /api/admin/properties returns 401');

      const resUsers = await requestJson(server, { path: '/api/admin/users' });
      assert(resUsers.status === 401, 'Unauthenticated GET /api/admin/users returns 401');

      const resAudit = await requestJson(server, { path: '/api/admin/activity-logs' });
      assert(resAudit.status === 401, 'Unauthenticated GET /api/admin/activity-logs returns 401');

      const resComp = await requestJson(server, {
        method: 'POST',
        path: '/api/admin/properties/company',
        body: { title: 'Test' },
      });
      assert(resComp.status === 401, 'Unauthenticated POST /api/admin/properties/company returns 401');
    }

    // -------------------------------------------------------------
    // Section 2: Normal User Authorization Rejection (Expecting 403)
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Normal User Role-Based Access Control (Expecting 403) ---');
    const normalUserToken = generateToken({ id: 'user_norm_001', role: 'user', tokenVersion: 0 });
    const normalCookie = `mj_auth_token=${normalUserToken}`;

    {
      const resOverview = await requestJson(server, {
        path: '/api/admin/overview',
        headers: { Cookie: normalCookie },
      });
      assert(resOverview.status === 403, 'Normal user blocked from GET /api/admin/overview with 403 Forbidden');

      const resMod = await requestJson(server, {
        path: '/api/admin/moderation',
        headers: { Cookie: normalCookie },
      });
      assert(resMod.status === 403, 'Normal user blocked from GET /api/admin/moderation with 403 Forbidden');

      const resComp = await requestJson(server, {
        method: 'POST',
        path: '/api/admin/properties/company',
        headers: { Cookie: normalCookie },
        body: { title: 'Unauthorized' },
      });
      assert(resComp.status === 403, 'Normal user blocked from POST /api/admin/properties/company with 403 Forbidden');

      const resApprove = await requestJson(server, {
        method: 'POST',
        path: '/api/admin/moderation/demo_1/approve',
        headers: { Cookie: normalCookie },
        body: {},
      });
      assert(resApprove.status === 403, 'Normal user blocked from POST /api/admin/moderation/:id/approve with 403 Forbidden');

      const resUsers = await requestJson(server, {
        path: '/api/admin/users',
        headers: { Cookie: normalCookie },
      });
      assert(resUsers.status === 403, 'Normal user blocked from GET /api/admin/users with 403 Forbidden');
    }

    // -------------------------------------------------------------
    // Section 3: Setup Authorized Admin Session & CSRF
    // -------------------------------------------------------------
    console.log('\n--- 3. Setting Up Authorized Administrator Identity ---');
    const adminUserToken = generateToken({
      id: 'admin_test_001',
      role: 'admin',
      tokenVersion: 0,
      email: 'admin@masterjiestates.in',
      fullName: 'MasterJi SuperAdmin',
    });
    const adminAuthCookie = `mj_auth_token=${adminUserToken}`;

    // Obtain CSRF token
    const csrfResp = await requestJson(server, {
      path: '/api/auth/csrf',
      headers: { Cookie: adminAuthCookie },
    });
    const csrfCookieVal = parseCookie(csrfResp.headers['set-cookie'], 'mj_csrf_token');
    const csrfToken = csrfResp.body?.data?.csrfToken;

    const adminCookies = `${adminAuthCookie}; mj_csrf_token=${csrfCookieVal}`;
    const adminHeaders = {
      Cookie: adminCookies,
      'x-csrf-token': csrfToken,
    };

    assert(Boolean(csrfToken), 'Admin session and CSRF credentials generated successfully');

    // -------------------------------------------------------------
    // Section 4: Admin Overview Dashboard
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Admin Overview Dashboard ---');
    {
      const res = await requestJson(server, {
        path: '/api/admin/overview',
        headers: adminHeaders,
      });

      assert(res.status === 200, 'Admin accesses GET /api/admin/overview (200 OK)');
      assert(res.body?.data?.metrics !== undefined, 'Overview contains metrics object');
      assert(typeof res.body?.data?.metrics?.totalProperties === 'number', 'Metrics includes numeric totalProperties');
      assert(typeof res.body?.data?.metrics?.pendingApprovals === 'number', 'Metrics includes numeric pendingApprovals');
      assert(typeof res.body?.data?.databaseConnected === 'boolean', 'Overview honestly reports database status');
      assert(Array.isArray(res.body?.data?.recentSubmissions), 'Overview provides recentSubmissions array');
      assert(Array.isArray(res.body?.data?.recentActivities), 'Overview provides recentActivities array');
    }

    // -------------------------------------------------------------
    // Section 5: Moderation Queue & Property Approval
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Moderation Queue & Approval Workflow ---');
    // Seed a pending listing in in-memory store for testing
    const pendingPropId = `pending_test_${Date.now()}`;
    const pendingProperty = {
      id: pendingPropId,
      _id: pendingPropId,
      title: 'Magnificent Penthouse on Golf Course Road',
      description: 'A lavish four bedroom penthouse with panoramic skyline views of Golf Course Road, private elevator access, and Italian marble finishes throughout.',
      slug: `magnificent-penthouse-${Date.now()}`,
      category: 'apartment',
      categoryLabel: 'Apartments & Flats',
      listingType: 'brokerage',
      listingTypeLabel: 'Brokerage',
      price: 35000000,
      priceFormatted: '₹3.50 Cr',
      city: 'Gurugram',
      locality: 'Golf Course Road',
      state: 'Haryana',
      pincode: '122002',
      area: 3200,
      areaUnit: 'sqft',
      bedrooms: 4,
      bathrooms: 4,
      availabilityStatus: 'pending_review',
      availabilityLabel: 'Verification Pending',
      isDraft: false,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: {
        userId: 'user_seller_001',
        name: 'Sunil Mittal',
        phone: '9812345678',
        email: 'sunil.mittal@example.com',
      },
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200',
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200'],
    };
    inMemorySubmissionStore.set(pendingPropId, pendingProperty);

    {
      // 5.1 Query moderation queue
      const resQueue = await requestJson(server, {
        path: '/api/admin/moderation',
        headers: adminHeaders,
      });
      assert(resQueue.status === 200, 'Admin retrieves moderation queue (200 OK)');
      const match = resQueue.body?.data?.items?.find((p) => p.id === pendingPropId);
      assert(Boolean(match), 'Moderation queue contains the pending submission');

      // 5.2 Single property inspection
      const resInspect = await requestJson(server, {
        path: `/api/admin/moderation/${pendingPropId}`,
        headers: adminHeaders,
      });
      assert(resInspect.status === 200, 'Admin retrieves full details for review (200 OK)');
      assert(resInspect.body?.data?.owner?.phone === '9812345678', 'Seller contact info is accurately unmasked for admin review');

      // 5.3 Attempt approving an already available property should fail
      // Let's first test invalid approve on non-pending
      const resInvalidApprove = await requestJson(server, {
        method: 'POST',
        path: '/api/admin/moderation/demo-001/approve',
        headers: adminHeaders,
        body: {},
      });
      assert(resInvalidApprove.status === 400, 'Approving an already available property fails with 400 Bad Request');

      // 5.4 Valid approval of pending listing
      const resApprove = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/moderation/${pendingPropId}/approve`,
        headers: adminHeaders,
        body: { notes: 'Physical documents verified against registry records.' },
      });

      assert(resApprove.status === 200, 'Admin approves pending listing successfully (200 OK)');
      assert(resApprove.body?.data?.availabilityStatus === 'available', 'Listing status transitioned to "available"');
      assert(resApprove.body?.data?.isDraft === false, 'Listing isDraft is set to false');
      assert(resApprove.body?.data?.moderation?.status === 'approved', 'Moderation status recorded as "approved"');

      // 5.5 Verify listing is now accessible publicly
      const resPublic = await requestJson(server, {
        path: `/api/properties/${pendingPropId}`,
      });
      assert(resPublic.status === 200, 'PUBLIC CATALOGUE: Approved listing is now publicly viewable (200 OK)');
    }

    // -------------------------------------------------------------
    // Section 6: Rejection Workflow (Mandatory Reason)
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Listing Rejection Workflow ---');
    const rejectPropId = `reject_test_${Date.now()}`;
    inMemorySubmissionStore.set(rejectPropId, {
      ...pendingProperty,
      id: rejectPropId,
      _id: rejectPropId,
      title: 'Ineligible Plot Listing',
      availabilityStatus: 'pending_review',
    });

    {
      // 6.1 Reject without reason fails
      const resEmptyReason = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/moderation/${rejectPropId}/reject`,
        headers: adminHeaders,
        body: { reason: '' },
      });
      assert(resEmptyReason.status === 400, 'Rejection without reason is rejected with 400 Bad Request');

      // 6.2 Reject with too short reason fails
      const resShortReason = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/moderation/${rejectPropId}/reject`,
        headers: adminHeaders,
        body: { reason: 'No' },
      });
      assert(resShortReason.status === 400, 'Rejection with short reason is rejected with 400 Bad Request');

      // 6.3 Reject with valid reason succeeds
      const resReject = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/moderation/${rejectPropId}/reject`,
        headers: adminHeaders,
        body: { reason: 'Title documents do not match applicant identity credentials.' },
      });
      assert(resReject.status === 200, 'Admin rejects listing with valid reason (200 OK)');
      assert(resReject.body?.data?.availabilityStatus === 'rejected', 'Listing status updated to "rejected"');
      assert(resReject.body?.data?.moderation?.rejectionReason.length > 5, 'Rejection reason is stored in moderation object');

      // 6.4 Verify rejected listing remains hidden publicly
      const resPublicReject = await requestJson(server, {
        path: `/api/properties/${rejectPropId}`,
      });
      assert(resPublicReject.status === 404, 'PUBLIC PRIVACY: Rejected listing is strictly hidden from public catalogue (404 Not Found)');
    }

    // -------------------------------------------------------------
    // Section 7: Change Request & Resubmission Workflow
    // -------------------------------------------------------------
    console.log('\n--- 7. Testing Change Request & Resubmission Workflow ---');
    const changePropId = `changes_test_${Date.now()}`;
    const sellerId = 'seller_test_user_777';
    inMemorySubmissionStore.set(changePropId, {
      ...pendingProperty,
      id: changePropId,
      _id: changePropId,
      title: 'Luxury Villa with Low Resolution Photos',
      availabilityStatus: 'pending_review',
      owner: { userId: sellerId, name: 'Vikram Seth', email: 'vikram@example.com' },
    });

    {
      // 7.1 Request changes without remarks fails
      const resEmptyRemarks = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/moderation/${changePropId}/request-changes`,
        headers: adminHeaders,
        body: { remarks: '' },
      });
      assert(resEmptyRemarks.status === 400, 'Change request without remarks is rejected with 400 Bad Request');

      // 7.2 Request changes with valid remarks succeeds
      const resReqChanges = await requestJson(server, {
        method: 'POST',
        path: `/api/admin/moderation/${changePropId}/request-changes`,
        headers: adminHeaders,
        body: { remarks: 'Please upload higher resolution photos of the master bedroom and verify parking count.' },
      });
      assert(resReqChanges.status === 200, 'Admin requests changes successfully (200 OK)');
      assert(resReqChanges.body?.data?.availabilityStatus === 'changes_requested', 'Status updated to "changes_requested"');
      assert(resReqChanges.body?.data?.isDraft === true, 'Listing isDraft set to true to enable seller revision');

      // 7.3 Seller can now edit the draft
      const sellerToken = generateToken({ id: sellerId, role: 'user', tokenVersion: 0 });
      const sellerCookie = `mj_auth_token=${sellerToken}`;
      const sellerCsrfResp = await requestJson(server, { path: '/api/auth/csrf', headers: { Cookie: sellerCookie } });
      const sellerCsrfCookie = parseCookie(sellerCsrfResp.headers['set-cookie'], 'mj_csrf_token');
      const sellerHeaders = {
        Cookie: `${sellerCookie}; mj_csrf_token=${sellerCsrfCookie}`,
        'x-csrf-token': sellerCsrfResp.body?.data?.csrfToken,
      };

      const resSellerUpdate = await requestJson(server, {
        method: 'PATCH',
        path: `/api/dashboard/listings/draft/${changePropId}`,
        headers: sellerHeaders,
        body: { title: 'Luxury Villa with High Resolution Balcony Photos', parking: 3 },
      });
      assert(resSellerUpdate.status === 200, 'Seller can edit listing in "changes_requested" status (200 OK)');

      // 7.4 Seller resubmits listing for review
      const resResubmit = await requestJson(server, {
        method: 'POST',
        path: `/api/dashboard/listings/${changePropId}/submit`,
        headers: sellerHeaders,
        body: {},
      });
      assert(resResubmit.status === 200, 'Seller successfully resubmits listing for review (200 OK)');
      assert(resResubmit.body?.data?.availabilityStatus === 'pending_review', 'Listing transitions back to "pending_review"');
    }

    // -------------------------------------------------------------
    // Section 8: Property Management & State Transitions
    // -------------------------------------------------------------
    console.log('\n--- 8. Testing Property Management & Status Transitions ---');
    {
      const resAllProps = await requestJson(server, {
        path: '/api/admin/properties',
        headers: adminHeaders,
      });
      assert(resAllProps.status === 200, 'Admin retrieves property inventory (200 OK)');
      assert(Array.isArray(resAllProps.body?.data?.items), 'Properties response contains items array');

      // Transition to under_negotiation
      const resNeg = await requestJson(server, {
        method: 'PATCH',
        path: `/api/admin/properties/${pendingPropId}/status`,
        headers: adminHeaders,
        body: { status: 'under_negotiation' },
      });
      assert(resNeg.status === 200, 'Admin transitions property to "under_negotiation" (200 OK)');

      // Transition to sold
      const resSold = await requestJson(server, {
        method: 'PATCH',
        path: `/api/admin/properties/${pendingPropId}/status`,
        headers: adminHeaders,
        body: { status: 'sold' },
      });
      assert(resSold.status === 200, 'Admin transitions property to "sold" (200 OK)');

      // Transition to withdrawn
      const resWithdrawn = await requestJson(server, {
        method: 'PATCH',
        path: `/api/admin/properties/${pendingPropId}/status`,
        headers: adminHeaders,
        body: { status: 'withdrawn' },
      });
      assert(resWithdrawn.status === 200, 'Admin transitions property to "withdrawn" (200 OK)');

      // Restore to available
      const resRestore = await requestJson(server, {
        method: 'PATCH',
        path: `/api/admin/properties/${pendingPropId}/status`,
        headers: adminHeaders,
        body: { status: 'available' },
      });
      assert(resRestore.status === 200, 'Admin restores property to "available" (200 OK)');
    }

    // -------------------------------------------------------------
    // Section 9: Company-Owned Property Management & Financial Privacy
    // -------------------------------------------------------------
    console.log('\n--- 9. Testing Company-Owned Inventory & Financial Privacy ---');
    let companyPropId;
    {
      const companyPayload = {
        title: 'Central Park Resorts Sky Villa',
        category: 'villa',
        price: 45000000,
        acquisitionCost: 38000000,
        acquisitionDate: '2026-01-15',
        city: 'Gurugram',
        locality: 'Sohna Road',
        area: 4500,
        bedrooms: 5,
        bathrooms: 5,
        privateAddress: 'Villa 12, Phase 1, Central Park',
        internalNotes: 'Purchased directly from corporate liquidator. Clear title in vault.',
        availabilityStatus: 'available',
      };

      const resCreateCompany = await requestJson(server, {
        method: 'POST',
        path: '/api/admin/properties/company',
        headers: adminHeaders,
        body: companyPayload,
      });

      assert(resCreateCompany.status === 201, 'Admin onboards company-owned asset (201 Created)');
      companyPropId = resCreateCompany.body?.data?.id || resCreateCompany.body?.data?._id;
      assert(resCreateCompany.body?.data?.listingType === 'company_owned', 'Listing type is strictly "company_owned"');
      assert(resCreateCompany.body?.data?.acquisitionCost === 38000000, 'Admin receives acquisitionCost in response');
      assert(Boolean(resCreateCompany.body?.data?.internalNotes), 'Admin receives internalNotes in response');

      // 9.2 Admin single inspection returns private fields
      const resAdminInspect = await requestJson(server, {
        path: `/api/admin/properties/${companyPropId}`,
        headers: adminHeaders,
      });
      assert(resAdminInspect.status === 200, 'Admin inspects company asset (200 OK)');
      assert(resAdminInspect.body?.data?.acquisitionCost === 38000000, 'Admin inspection includes acquisitionCost');

      // 9.3 CRITICAL SECURITY CHECK: Public DTO must NEVER leak acquisitionCost, internalNotes, or privateAddress!
      const resPublicInspect = await requestJson(server, {
        path: `/api/properties/${companyPropId}`,
      });
      assert(resPublicInspect.status === 200, 'Public caller accesses company-owned listing (200 OK)');
      assert(resPublicInspect.body?.data?.acquisitionCost === undefined, 'PROPRIETARY PRIVACY ENFORCED: acquisitionCost is strictly UNDEFINED in public response');
      assert(resPublicInspect.body?.data?.internalNotes === undefined, 'PROPRIETARY PRIVACY ENFORCED: internalNotes is strictly UNDEFINED in public response');
      assert(resPublicInspect.body?.data?.privateAddress === undefined, 'PROPRIETARY PRIVACY ENFORCED: privateAddress is strictly UNDEFINED in public response');
    }

    // -------------------------------------------------------------
    // Section 10: User Management & Anti-Self-Suspension
    // -------------------------------------------------------------
    console.log('\n--- 10. Testing User Directory & Account Safety Controls ---');
    {
      const resUsers = await requestJson(server, {
        path: '/api/admin/users',
        headers: adminHeaders,
      });
      assert(resUsers.status === 200, 'Admin retrieves user directory (200 OK)');
      assert(Array.isArray(resUsers.body?.data?.items), 'Users list returned as array');

      // Verify passwords and tokens are never exposed
      const firstUser = resUsers.body?.data?.items?.[0];
      assert(firstUser?.passwordHash === undefined, 'SECURITY ENFORCED: passwordHash is strictly omitted from user directory');
      assert(firstUser?.passwordResetToken === undefined, 'SECURITY ENFORCED: passwordResetToken is strictly omitted from user directory');

      // Suspend target user
      const targetUser = resUsers.body?.data?.items?.find((u) => u.id !== 'admin_test_001');
      if (targetUser) {
        const resSuspend = await requestJson(server, {
          method: 'PATCH',
          path: `/api/admin/users/${targetUser.id}/status`,
          headers: adminHeaders,
          body: { status: 'suspended', reason: 'Policy violation' },
        });
        assert(resSuspend.status === 200, 'Admin suspends target user account (200 OK)');
        assert(resSuspend.body?.data?.accountStatus === 'suspended', 'Target account status set to "suspended"');

        // Reactivate
        const resActivate = await requestJson(server, {
          method: 'PATCH',
          path: `/api/admin/users/${targetUser.id}/status`,
          headers: adminHeaders,
          body: { status: 'active' },
        });
        assert(resActivate.status === 200, 'Admin reactivates target user account (200 OK)');
      }

      // SELF-LOCKOUT DEFENSE: Admin cannot suspend their own active account
      const resSelfSuspend = await requestJson(server, {
        method: 'PATCH',
        path: '/api/admin/users/admin_test_001/status',
        headers: adminHeaders,
        body: { status: 'suspended' },
      });
      assert(resSelfSuspend.status === 403, 'SECURITY ENFORCED: Admin self-suspension rejected with 403 Forbidden');
    }

    // -------------------------------------------------------------
    // Section 11: Enquiries & Site Visits Operations
    // -------------------------------------------------------------
    console.log('\n--- 11. Testing Enquiries CRM & Site Visits Dispatch ---');
    {
      // Enquiries
      const resEnq = await requestJson(server, {
        path: '/api/admin/enquiries',
        headers: adminHeaders,
      });
      assert(resEnq.status === 200, 'Admin retrieves all enquiries (200 OK)');

      // If enquiries exist, update one
      if (inMemoryEnquiries.length > 0) {
        const enqId = inMemoryEnquiries[0].referenceCode || inMemoryEnquiries[0].id;
        const resUpdateEnq = await requestJson(server, {
          method: 'PATCH',
          path: `/api/admin/enquiries/${enqId}`,
          headers: adminHeaders,
          body: { status: 'contacted', internalNotes: 'Advisor spoke with client. Interested in site tour.' },
        });
        assert(resUpdateEnq.status === 200, 'Admin updates enquiry disposition status and notes (200 OK)');
      }

      // Site visits
      const resVisits = await requestJson(server, {
        path: '/api/admin/site-visits',
        headers: adminHeaders,
      });
      assert(resVisits.status === 200, 'Admin retrieves all site visits (200 OK)');

      if (inMemorySiteVisits.length > 0) {
        const visitRef = inMemorySiteVisits[0].bookingReference || inMemorySiteVisits[0].id;
        const resUpdateVisit = await requestJson(server, {
          method: 'PATCH',
          path: `/api/admin/site-visits/${visitRef}`,
          headers: adminHeaders,
          body: { status: 'confirmed', internalNotes: 'Field executive assigned.' },
        });
        assert(resUpdateVisit.status === 200, 'Admin updates site visit confirmation (200 OK)');
      }
    }

    // -------------------------------------------------------------
    // Section 12: Append-Only Administrative Audit Trail
    // -------------------------------------------------------------
    console.log('\n--- 12. Testing Administrative Audit Trail ---');
    {
      const resLogs = await requestJson(server, {
        path: '/api/admin/activity-logs',
        headers: adminHeaders,
      });
      assert(resLogs.status === 200, 'Admin retrieves audit activity logs (200 OK)');
      assert(Array.isArray(resLogs.body?.data?.items), 'Audit logs returned as array');
      assert(resLogs.body?.data?.items?.length > 0, 'Audit trail contains recorded administrative operations');

      // Normal user cannot access audit trail
      const resUserLogs = await requestJson(server, {
        path: '/api/admin/activity-logs',
        headers: { Cookie: normalCookie },
      });
      assert(resUserLogs.status === 403, 'Normal user blocked from audit trail with 403 Forbidden');
    }

    // -------------------------------------------------------------
    // Section 13: Regression Testing Public Health & Properties
    // -------------------------------------------------------------
    console.log('\n--- 13. Regression Testing Public APIs ---');
    {
      const resHealth = await requestJson(server, { path: '/api/health' });
      assert(resHealth.status === 200, 'Public health endpoint operational (200 OK)');

      const resProps = await requestJson(server, { path: '/api/properties' });
      assert(resProps.status === 200, 'Public property catalogue functional (200 OK)');
    }

  } catch (err) {
    console.error('Fatal test execution error:', err);
    process.exitCode = 1;
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('\n======================================================');
  console.log(` RESULT: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('======================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTestSuite();
