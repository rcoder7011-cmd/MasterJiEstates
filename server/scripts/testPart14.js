/**
 * Verification & Security Test Suite for MasterJiEstates Part 14:
 * Additional Services, Company Pages & Legal Disclaimers
 */

import http from 'http';
import app from '../app.js';
import { generateToken } from '../utils/jwt.js';
import {
  inMemoryContactMessages,
  inMemorySiteContent,
  initializeDefaultContent,
} from '../services/contentService.js';

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
  const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  for (const h of headers) {
    const parts = h.split(';')[0].split('=');
    if (parts[0].trim() === cookieName) {
      return parts.slice(1).join('=');
    }
  }
  return null;
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log(' MASTERJIESTATES PART 14: SERVICES, PAGES & LEGAL SUITE');
  console.log('======================================================\n');

  initializeDefaultContent();

  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    // -------------------------------------------------------------
    // Section 1: Public Content Retrieval Endpoints
    // -------------------------------------------------------------
    console.log('--- 1. Testing Public Content Retrieval Endpoints ---');
    {
      // 1.1 Company Information
      const resCompany = await requestJson(server, { path: '/api/content/company' });
      assert(resCompany.status === 200, 'GET /api/content/company returns 200 OK');
      assert(resCompany.body?.data?.brandName === 'MasterJiEstates', 'Brand name is MasterJiEstates');
      assert(
        resCompany.body?.data?.tagline === 'From Finding Your Property to Building Your Dream.',
        'Tagline is "From Finding Your Property to Building Your Dream."'
      );
      assert(
        resCompany.body?.data?.officialDomain === 'https://masterjiestates.in',
        'Official domain configured as https://masterjiestates.in'
      );
      assert(
        Array.isArray(resCompany.body?.data?.primaryFocus),
        'Primary focus areas returned as array'
      );

      // 1.2 Services Retrieval
      const resServices = await requestJson(server, { path: '/api/content/services' });
      assert(resServices.status === 200, 'GET /api/content/services returns 200 OK');
      assert(Array.isArray(resServices.body?.data), 'Services returned as array');

      const coreServices = resServices.body?.data?.filter((s) => s.category === 'real_estate');
      const alliedServices = resServices.body?.data?.filter((s) => s.category === 'allied');
      assert(coreServices.length >= 4, 'Includes at least 4 core real-estate services');
      assert(alliedServices.length >= 5, 'Includes at least 5 allied home services');

      // 1.3 Service Filtering by Category
      const resCoreFilter = await requestJson(server, { path: '/api/content/services?category=real_estate' });
      assert(
        resCoreFilter.body?.data?.every((s) => s.category === 'real_estate'),
        'Category filter ?category=real_estate returns only real-estate services'
      );

      // 1.4 Service Delivery Types & Honest Labeling
      const directServices = resServices.body?.data?.filter((s) => s.deliveryType === 'direct');
      const partnerServices = resServices.body?.data?.filter((s) => s.deliveryType === 'verified_partner');
      const comingSoonServices = resServices.body?.data?.filter((s) => s.deliveryType === 'coming_soon');
      assert(directServices.length > 0, 'Contains services with deliveryType="direct"');
      assert(partnerServices.length > 0, 'Contains services with deliveryType="verified_partner"');
      assert(comingSoonServices.length > 0, 'Contains services with deliveryType="coming_soon"');

      // 1.5 Frequently Asked Questions (FAQs)
      const resFaqs = await requestJson(server, { path: '/api/content/faqs' });
      assert(resFaqs.status === 200, 'GET /api/content/faqs returns 200 OK');
      assert(Array.isArray(resFaqs.body?.data), 'FAQs returned as array');
      assert(resFaqs.body?.data?.length >= 15, 'Contains at least 15 categorized FAQs');

      // 1.6 FAQ Category Filtering & Search
      const resBrokerageFaqs = await requestJson(server, { path: '/api/content/faqs?category=brokerage' });
      assert(
        resBrokerageFaqs.body?.data?.every((f) => f.category === 'brokerage'),
        'Filtering FAQs by category=brokerage returns brokerage questions only'
      );

      const resSearchFaqs = await requestJson(server, { path: '/api/content/faqs?search=verification' });
      assert(
        resSearchFaqs.body?.data?.length > 0,
        'Searching FAQs with keyword "verification" yields relevant results'
      );
    }

    // -------------------------------------------------------------
    // Section 2: Statutory Legal Pages Content
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Statutory Legal Pages Content ---');
    {
      const legalPages = [
        'privacy_policy',
        'terms_and_conditions',
        'disclaimer',
        'brokerage_policy',
        'cookie_policy',
      ];

      for (const page of legalPages) {
        const resLegal = await requestJson(server, { path: `/api/content/legal/${page}` });
        assert(resLegal.status === 200, `GET /api/content/legal/${page} returns 200 OK`);
        assert(Boolean(resLegal.body?.data?.title), `${page} contains title`);
        assert(Array.isArray(resLegal.body?.data?.sections), `${page} contains sections array`);
        assert(
          Boolean(resLegal.body?.data?.legalNotice),
          `${page} contains mandatory professional legal review warning notice`
        );
      }

      // Invalid legal page rejected with 404
      const resInvalidLegal = await requestJson(server, { path: '/api/content/legal/non_existent_page' });
      assert(resInvalidLegal.status === 404, 'Invalid legal page returns 404 Not Found');
    }

    // -------------------------------------------------------------
    // Section 3: Public Contact Form Submission & Validation
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Public Contact Form Submission & Validation ---');
    let testContactRef = null;
    {
      // 3.1 Fetch CSRF Token for public submission
      const csrfRes = await requestJson(server, { path: '/api/auth/csrf' });
      const csrfToken = csrfRes.body?.data?.csrfToken;
      const csrfCookie = parseCookie(csrfRes.headers['set-cookie'], 'mj_csrf_token');
      const publicHeaders = {
        Cookie: `mj_csrf_token=${csrfCookie}`,
        'x-csrf-token': csrfToken,
      };

      // 3.2 Submission with mismatched CSRF rejected with 403
      const resBadCsrf = await requestJson(server, {
        method: 'POST',
        path: '/api/content/contact',
        headers: {
          Cookie: `mj_csrf_token=${csrfCookie}`,
          'x-csrf-token': 'wrong-csrf-token',
        },
        body: { name: 'Test User' },
      });
      assert(resBadCsrf.status === 403, 'Contact submission with mismatched CSRF token returns 403 Forbidden');

      // 3.3 Missing / Invalid Name
      const resBadName = await requestJson(server, {
        method: 'POST',
        path: '/api/content/contact',
        headers: publicHeaders,
        body: {
          name: 'A', // too short
          email: 'user@example.com',
          phone: '9876543210',
          subject: 'Test Subject',
          message: 'This is a valid message length.',
        },
      });
      assert(resBadName.status === 400, 'Name with < 2 characters rejected with 400 Bad Request');

      // 3.4 Invalid Email format
      const resBadEmail = await requestJson(server, {
        method: 'POST',
        path: '/api/content/contact',
        headers: publicHeaders,
        body: {
          name: 'Vikram Joshi',
          email: 'not-an-email',
          phone: '9876543210',
          subject: 'Test Subject',
          message: 'This is a valid message length.',
        },
      });
      assert(resBadEmail.status === 400, 'Invalid email format rejected with 400 Bad Request');

      // 3.5 Invalid 10-digit Indian Mobile
      const resBadPhone = await requestJson(server, {
        method: 'POST',
        path: '/api/content/contact',
        headers: publicHeaders,
        body: {
          name: 'Vikram Joshi',
          email: 'vikram@example.com',
          phone: '12345', // invalid
          subject: 'Test Subject',
          message: 'This is a valid message length.',
        },
      });
      assert(resBadPhone.status === 400, 'Invalid phone number rejected with 400 Bad Request');

      // 3.6 Short Message (< 10 chars)
      const resShortMsg = await requestJson(server, {
        method: 'POST',
        path: '/api/content/contact',
        headers: publicHeaders,
        body: {
          name: 'Vikram Joshi',
          email: 'vikram@example.com',
          phone: '9876543210',
          subject: 'Test Subject',
          message: 'Hello', // too short
        },
      });
      assert(resShortMsg.status === 400, 'Message with < 10 characters rejected with 400 Bad Request');

      // 3.7 Valid Contact Message Submission
      const validPayload = {
        name: 'Dr. Sameer Verma',
        email: 'sameer.verma@example.com',
        phone: '9811223344',
        subject: 'Inquiry regarding 4 BHK Penthouse on Golf Course Ext Road',
        message:
          'I am looking to schedule a private inspection for my family this coming Saturday afternoon. Please advise on document requirements.',
      };

      const resValidContact = await requestJson(server, {
        method: 'POST',
        path: '/api/content/contact',
        headers: publicHeaders,
        body: validPayload,
      });

      assert(resValidContact.status === 201, 'Valid contact inquiry created successfully (201 Created)');
      testContactRef = resValidContact.body?.data?.referenceCode;
      assert(
        testContactRef?.startsWith('CONT-'),
        'Generated unique contact reference starting with CONT-'
      );
      assert(
        resValidContact.body?.data?.email === 'sameer.verma@example.com',
        'Response echoes sanitized sender email'
      );
    }

    // -------------------------------------------------------------
    // Section 4: Contact Messages Access Control & RBAC
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Contact Messages Access Control & RBAC ---');
    {
      // 4.1 Unauthenticated access to contact messages rejected (401)
      const resUnauth = await requestJson(server, { path: '/api/admin/content/messages' });
      assert(resUnauth.status === 401, 'Unauthenticated GET /api/admin/content/messages returns 401 Unauthorized');

      // 4.2 Normal user blocked from contact messages (403)
      const userToken = generateToken({ id: 'usr_normal_001', role: 'user', tokenVersion: 0 });
      const resNormalUser = await requestJson(server, {
        path: '/api/admin/content/messages',
        headers: { Cookie: `mj_auth_token=${userToken}` },
      });
      assert(resNormalUser.status === 403, 'Normal user blocked from contact messages with 403 Forbidden');

      // 4.3 Authorized Administrator access
      const adminToken = generateToken({
        id: 'usr_admin_001',
        role: 'admin',
        tokenVersion: 1,
        fullName: 'MasterJi SuperAdmin',
        email: 'admin@masterjiestates.in',
      });
      const adminCookie = `mj_auth_token=${adminToken}`;

      const csrfAdminRes = await requestJson(server, {
        path: '/api/auth/csrf',
        headers: { Cookie: adminCookie },
      });
      const adminCsrfToken = csrfAdminRes.body?.data?.csrfToken;
      const adminCsrfCookie = parseCookie(csrfAdminRes.headers['set-cookie'], 'mj_csrf_token');

      const adminHeaders = {
        Cookie: `${adminCookie}; mj_csrf_token=${adminCsrfCookie}`,
        'x-csrf-token': adminCsrfToken,
      };

      const resAdminMessages = await requestJson(server, {
        path: '/api/admin/content/messages',
        headers: adminHeaders,
      });
      assert(resAdminMessages.status === 200, 'Admin fetches contact messages inbox (200 OK)');
      assert(Array.isArray(resAdminMessages.body?.data?.items), 'Inbox returned as items array');

      const foundMsg = resAdminMessages.body?.data?.items?.find((m) => m.referenceCode === testContactRef);
      assert(Boolean(foundMsg), 'Submitted contact message appears in admin inbox');

      // 4.4 Admin updates message disposition status
      if (foundMsg) {
        const resUpdateMsg = await requestJson(server, {
          method: 'PATCH',
          path: `/api/admin/content/messages/${foundMsg.id || foundMsg._id}`,
          headers: adminHeaders,
          body: {
            status: 'responded',
            adminNotes: 'Contacted Dr. Verma via phone; site visit scheduled for Saturday 2:00 PM.',
          },
        });
        assert(resUpdateMsg.status === 200, 'Admin updates message disposition to "responded" (200 OK)');
        assert(
          resUpdateMsg.body?.data?.status === 'responded',
          'Message status recorded as responded'
        );
      }
    }

    // -------------------------------------------------------------
    // Section 5: Admin Content Management (CMS)
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Admin Content Management (CMS) ---');
    {
      const adminToken = generateToken({
        id: 'usr_admin_001',
        role: 'admin',
        tokenVersion: 1,
        fullName: 'MasterJi SuperAdmin',
      });
      const adminCookie = `mj_auth_token=${adminToken}`;

      const csrfAdminRes = await requestJson(server, {
        path: '/api/auth/csrf',
        headers: { Cookie: adminCookie },
      });
      const adminCsrfToken = csrfAdminRes.body?.data?.csrfToken;
      const adminCsrfCookie = parseCookie(csrfAdminRes.headers['set-cookie'], 'mj_csrf_token');

      const adminHeaders = {
        Cookie: `${adminCookie}; mj_csrf_token=${adminCsrfCookie}`,
        'x-csrf-token': adminCsrfToken,
      };

      // 5.1 Admin fetches all content
      const resAllContent = await requestJson(server, {
        path: '/api/admin/content',
        headers: adminHeaders,
      });
      assert(resAllContent.status === 200, 'Admin fetches all content sections (200 OK)');
      assert(Boolean(resAllContent.body?.data?.company), 'Includes company data');
      assert(Array.isArray(resAllContent.body?.data?.services), 'Includes services array');
      assert(Array.isArray(resAllContent.body?.data?.faqs), 'Includes faqs array');

      // 5.2 Normal user blocked from updating content (403)
      const userToken = generateToken({ id: 'usr_normal_001', role: 'user', tokenVersion: 0 });
      const resUserUpdate = await requestJson(server, {
        method: 'PUT',
        path: '/api/admin/content/company',
        headers: { Cookie: `mj_auth_token=${userToken}`, 'x-csrf-token': 'any' },
        body: { brandName: 'Hacked Name' },
      });
      assert(resUserUpdate.status === 403, 'Normal user blocked from updating content with 403 Forbidden');

      // 5.3 Admin updates company profile
      const updatedCompanyData = {
        ...resAllContent.body?.data?.company,
        tagline: 'From Finding Your Property to Building Your Dream.',
        contactInfo: {
          ...resAllContent.body?.data?.company?.contactInfo,
          phone: '+91 99903 16186',
        },
      };

      const resAdminUpdate = await requestJson(server, {
        method: 'PUT',
        path: '/api/admin/content/company',
        headers: adminHeaders,
        body: updatedCompanyData,
      });
      assert(resAdminUpdate.status === 200, 'Admin updates company content section (200 OK)');

      // 5.4 Verify update is reflected on public endpoint
      const resPublicVerify = await requestJson(server, { path: '/api/content/company' });
      assert(
        resPublicVerify.body?.data?.contactInfo?.phone === '+91 99903 16186',
        'Updated company details immediately reflected on public API'
      );
    }

    // -------------------------------------------------------------
    // Section 6: Regression Testing on Existing APIs
    // -------------------------------------------------------------
    console.log('\n--- 6. Regression Testing on Existing APIs ---');
    {
      const resHealth = await requestJson(server, { path: '/api/health' });
      assert(resHealth.status === 200, 'Public health endpoint operational (200 OK)');

      const resProperties = await requestJson(server, { path: '/api/properties' });
      assert(resProperties.status === 200, 'Public property catalogue functional (200 OK)');
    }
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

runTestSuite().catch((err) => {
  console.error('Fatal error running Part 14 test suite:', err);
  process.exit(1);
});
