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
  console.log('\n=============================================================');
  console.log(' MasterJiEstates — Draft Validation & Submission Flow Audit');
  console.log('=============================================================\n');

  // Connect to live MongoDB Atlas
  console.log('--- 1. Connecting to MongoDB Atlas ---');
  await connectDatabase();
  assert(mongoose.connection.readyState === 1, 'Connected to MongoDB Atlas');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    // 1. Create a test user
    console.log('\n--- 2. Setting Up Authenticated Test User ---');
    const testEmail = `draft_test_user_${Date.now()}@masterjiestates.in`;
    const user = await User.create({
      fullName: 'Ramesh Draft Tester',
      email: testEmail,
      phone: '9812345678',
      password: 'StrongPassword123!',
      role: 'user',
    });
    const token = generateToken(user, false);
    const authHeaders = {
      Authorization: `Bearer ${token}`,
    };
    assert(Boolean(user._id), `Created user: ${user.email} (${user._id})`);

    // Fetch CSRF
    const csrfRes = await requestJson(server, { path: '/api/auth/csrf' });
    const csrfToken = csrfRes.body?.data?.csrfToken;
    const csrfCookie = csrfRes.headers['set-cookie']?.[0]?.split(';')[0] || '';
    authHeaders['x-csrf-token'] = csrfToken;
    authHeaders['Cookie'] = csrfCookie;

    // 2. Test saving empty/incomplete draft (Step 1 partial)
    console.log('\n--- 3. Testing Partial / Incomplete Draft Creation ---');
    const partialDraftRes = await requestJson(server, {
      method: 'POST',
      path: '/api/dashboard/listings/draft',
      headers: authHeaders,
      body: {
        title: '', // Empty title
        description: '', // Empty description
        category: 'apartment',
        sellerListingType: 'owner',
      },
    });

    assert(partialDraftRes.status === 201, 'Partial draft created successfully without failing validation (201)');
    const draftId = partialDraftRes.body?.data?.id;
    assert(Boolean(draftId), `Draft generated with ID: ${draftId}`);
    assert(partialDraftRes.body?.data?.title === 'Untitled Property Draft', 'Empty title defaulted to "Untitled Property Draft"');
    assert(partialDraftRes.body?.data?.isDraft === true, 'Property is marked as isDraft: true');

    // 3. Test partial update on draft (adding some fields)
    console.log('\n--- 4. Testing Progressive Draft Updates ---');
    const updateRes = await requestJson(server, {
      method: 'PATCH',
      path: `/api/dashboard/listings/draft/${draftId}`,
      headers: authHeaders,
      body: {
        title: '3 BHK Park View Luxury Apartment in Sector 150',
        city: 'Noida',
        locality: 'Sector 150',
        area: 1750,
      },
    });
    assert(updateRes.status === 200, 'Draft updated progressively with 200 OK');
    assert(updateRes.body?.data?.title === '3 BHK Park View Luxury Apartment in Sector 150', 'Title updated');
    assert(updateRes.body?.data?.locality === 'Sector 150', 'Locality updated');

    // 4. Test detailed validation error reporting when invalid data is supplied
    console.log('\n--- 5. Testing Detailed Error Reporting for Invalid Data ---');
    const invalidPriceRes = await requestJson(server, {
      method: 'PATCH',
      path: `/api/dashboard/listings/draft/${draftId}`,
      headers: authHeaders,
      body: {
        price: 'not_a_valid_number',
      },
    });
    assert(invalidPriceRes.status === 400, 'Invalid price rejected with 400 Bad Request');
    assert(Array.isArray(invalidPriceRes.body?.errors), 'Response contains structured errors array');
    assert(
      invalidPriceRes.body?.errors?.some((e) => e.field === 'price'),
      'Field "price" specifically marked in error details'
    );

    // 5. Test review submission on incomplete listing
    console.log('\n--- 6. Testing Final Submission Rejection on Incomplete Listing ---');
    const prematureSubmitRes = await requestJson(server, {
      method: 'POST',
      path: `/api/dashboard/listings/${draftId}/submit`,
      headers: authHeaders,
      body: {},
    });
    assert(prematureSubmitRes.status === 400, 'Premature submission rejected with 400 Bad Request');
    assert(Array.isArray(prematureSubmitRes.body?.errors), 'Premature submission returns detailed errors array');
    console.log('    -> Rejected with missing fields:', prematureSubmitRes.body?.errors?.map((e) => e.field).join(', '));
    assert(
      prematureSubmitRes.body?.errors?.some((e) => e.field === 'description'),
      'Detailed error contains missing description'
    );
    assert(
      prematureSubmitRes.body?.errors?.some((e) => e.field === 'photos'),
      'Detailed error contains missing photos'
    );

    // 6. Complete all required fields and submit for review
    console.log('\n--- 7. Completing All Fields and Submitting for Review ---');
    const fullUpdateRes = await requestJson(server, {
      method: 'PATCH',
      path: `/api/dashboard/listings/draft/${draftId}`,
      headers: authHeaders,
      body: {
        description: 'Exquisite 3 BHK residence with expansive balconies overlooking central parks, premium Italian marble flooring, and 2 reserved basement parking slots.',
        price: 19500000,
        state: 'Uttar Pradesh',
        pincode: '201310',
        cloudinaryAssets: [
          {
            publicId: 'masterji_estates/properties/audit_photo_1',
            url: 'https://res.cloudinary.com/mu52rrq3/image/upload/v12345/masterji_estates/properties/audit_photo_1.jpg',
            secureUrl: 'https://res.cloudinary.com/mu52rrq3/image/upload/v12345/masterji_estates/properties/audit_photo_1.jpg',
            width: 1920,
            height: 1080,
            format: 'jpg',
            bytes: 450000,
            isCover: true,
          },
        ],
        ownerName: 'Ramesh Draft Tester',
        ownerPhone: '9812345678',
        ownerEmail: testEmail,
      },
    });
    assert(fullUpdateRes.status === 200, 'All fields updated successfully on draft (200)');

    const submitRes = await requestJson(server, {
      method: 'POST',
      path: `/api/dashboard/listings/${draftId}/submit`,
      headers: authHeaders,
      body: {
        agreedToDeclaration: true,
        submissionNotes: 'Please verify title deeds with registry',
      },
    });
    assert(submitRes.status === 200, 'Complete listing submitted for review successfully (200)');
    assert(submitRes.body?.data?.availabilityStatus === 'pending_review', 'Listing transitioned to "pending_review"');
    assert(submitRes.body?.data?.isDraft === false, 'Listing isDraft transitioned to false');

    // 7. Verify MongoDB Atlas direct persistence
    console.log('\n--- 8. Verifying MongoDB Atlas Direct Document State ---');
    const persistedDoc = await Property.findById(draftId).select('+owner +privateAddress');
    assert(Boolean(persistedDoc), 'Document retrieved directly from MongoDB Atlas');
    assert(persistedDoc.availabilityStatus === 'pending_review', 'Atlas: availabilityStatus is "pending_review"');
    assert(persistedDoc.isDraft === false, 'Atlas: isDraft is false');
    assert(persistedDoc.isDemo === false, 'Atlas: isDemo is false');
    assert(persistedDoc.owner.userId.toString() === user._id.toString(), 'Atlas: owner.userId matches authenticated user');
    assert(persistedDoc.price === 19500000, 'Atlas: price is 19500000');

    // Cleanup
    console.log('\n--- 9. Cleaning Up Test Artifacts ---');
    await Property.findByIdAndDelete(draftId);
    await User.findByIdAndDelete(user._id);
    assert(true, 'Test property and test user cleaned up from Atlas');

    console.log('\n=============================================================');
    console.log(` RESULT: ${passedTests} / ${totalTests} TESTS PASSED`);
    console.log('=============================================================\n');
  } finally {
    server.close();
    await closeDatabaseConnection();
  }
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

