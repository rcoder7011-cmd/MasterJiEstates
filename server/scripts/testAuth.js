process.env.NODE_ENV = 'test';

import app from '../app.js';
import { generateToken } from '../utils/jwt.js';
import { AUTH_COOKIE_NAME, CSRF_COOKIE_NAME } from '../config/cookieOptions.js';
import { authorizeRoles } from '../middleware/auth.js';

async function runSecurityTests() {
  console.log('========================================================');
  console.log(' MasterJiEstates — Part 9 Security & Auth Verification');
  console.log('========================================================\n');

  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Test Server] Running on ${baseUrl}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` [PASS] ${message}`);
      passed++;
    } else {
      console.error(` [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    console.log('--- 1. REGISTRATION VALIDATION & TAMPERING TESTS ---');

    // Test 1.1: Valid Registration
    let res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Vikram Malhotra',
        email: 'vikram.malhotra@test.com',
        phone: '9876501234',
        password: 'StrongPassword123!',
      }),
    });
    let data = await res.json();
    assert(res.status === 201, `Valid registration returns 201 Created (got ${res.status})`);
    assert(data.data?.role === 'user', 'Registered account role is strictly "user"');
    assert(data.data?.email === 'vikram.malhotra@test.com', 'Returns normalized email');
    assert(!data.data?.passwordHash, 'Password hash is strictly omitted from registration response');

    const setCookieHeader = res.headers.get('set-cookie') || '';
    assert(setCookieHeader.includes(AUTH_COOKIE_NAME), 'Issues HTTP-only auth cookie upon registration');
    assert(setCookieHeader.includes('HttpOnly'), 'Auth cookie has HttpOnly flag');

    // Test 1.2: Invalid Email Rejection
    res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Vikram M',
        email: 'invalid-email-format',
        phone: '9876501234',
        password: 'StrongPassword123!',
      }),
    });
    assert(res.status === 400, `Invalid email rejected with 400 Bad Request (got ${res.status})`);

    // Test 1.3: Invalid Indian Phone Rejection
    res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Vikram M',
        email: 'vikram.test2@example.com',
        phone: '12345',
        password: 'StrongPassword123!',
      }),
    });
    assert(res.status === 400, `Invalid phone number rejected with 400 Bad Request (got ${res.status})`);

    // Test 1.4: Weak Password Rejection
    res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Vikram M',
        email: 'vikram.test3@example.com',
        phone: '9876501234',
        password: 'weak',
      }),
    });
    assert(res.status === 400, `Weak password rejected with 400 Bad Request (got ${res.status})`);

    // Test 1.5: Privilege Escalation Attempt (Tampering with role="admin")
    res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Hacker User',
        email: 'hacker.admin@example.com',
        phone: '9876509999',
        password: 'StrongPassword123!',
        role: 'admin',
      }),
    });
    assert(res.status === 400, `Attempt to register with role="admin" is rejected with 400 (got ${res.status})`);

    // Test 1.6: Privilege Escalation Attempt (Tampering with role="staff")
    res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Hacker Staff',
        email: 'hacker.staff@example.com',
        phone: '9876509998',
        password: 'StrongPassword123!',
        role: 'staff',
      }),
    });
    assert(res.status === 400, `Attempt to register with role="staff" is rejected with 400 (got ${res.status})`);

    console.log('\n--- 2. LOGIN & CREDENTIAL VERIFICATION TESTS ---');

    // Test 2.1: Login with invalid password
    res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vikram.malhotra@test.com',
        password: 'WrongPassword123!',
      }),
    });
    data = await res.json();
    assert(res.status === 401, `Invalid password returns 401 Unauthorized (got ${res.status})`);
    assert(data.message?.includes('Invalid email or password'), 'Returns generic error without revealing password mismatch details');

    // Test 2.2: Login with non-existent email
    res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nobody_exists@masterjiestates.in',
        password: 'Password123!',
      }),
    });
    assert(res.status === 401, `Non-existent email returns generic 401 without user enumeration (got ${res.status})`);

    // Test 2.3: Login with missing fields
    res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: '',
        password: '',
      }),
    });
    assert(res.status === 400, `Missing credentials returns 400 Bad Request (got ${res.status})`);

    console.log('\n--- 3. SESSION & CURRENT USER (/api/auth/me) TESTS ---');

    // Test 3.1: /api/auth/me without cookie returns 401
    res = await fetch(`${baseUrl}/api/auth/me`);
    assert(res.status === 401, `GET /api/auth/me without cookie returns 401 Unauthorized (got ${res.status})`);

    // Test 3.2: /api/auth/me with invalid token returns 401
    res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: `${AUTH_COOKIE_NAME}=invalid.garbage.token` },
    });
    assert(res.status === 401, `GET /api/auth/me with malformed token returns 401 (got ${res.status})`);

    // Test 3.3: /api/auth/me with valid signed token returns user DTO
    const testUser = { id: 'usr_valid_123', role: 'user', tokenVersion: 0 };
    const validToken = generateToken(testUser, false);
    res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: `${AUTH_COOKIE_NAME}=${validToken}` },
    });
    data = await res.json();
    assert(res.status === 200, `GET /api/auth/me with valid token returns 200 OK (got ${res.status})`);
    assert(data.data?.id === 'usr_valid_123', 'Returns correct user id');
    assert(data.data?.role === 'user', 'Returns correct user role');

    console.log('\n--- 4. CSRF PROTECTION & CORS TESTS ---');

    // Test 4.1: GET /api/auth/csrf issues CSRF token and cookie
    res = await fetch(`${baseUrl}/api/auth/csrf`);
    data = await res.json();
    assert(res.status === 200, `GET /api/auth/csrf returns 200 OK (got ${res.status})`);
    assert(Boolean(data.data?.csrfToken), 'Returns csrfToken in JSON payload');
    const csrfToken = data.data?.csrfToken;

    const csrfCookieHeader = res.headers.get('set-cookie') || '';
    assert(csrfCookieHeader.includes(CSRF_COOKIE_NAME), 'Sets mj_csrf_token cookie');

    // Test 4.2: Mutating request with invalid CSRF token rejected with 403
    res = await fetch(`${baseUrl}/api/auth/change-password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${AUTH_COOKIE_NAME}=${validToken}; ${CSRF_COOKIE_NAME}=${csrfToken}`,
        'x-csrf-token': 'wrong-token-value',
      },
      body: JSON.stringify({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      }),
    });
    assert(res.status === 403, `Mutating request with mismatched CSRF token returns 403 Forbidden (got ${res.status})`);

    // Test 4.3: Mutating request with valid matching CSRF token passes CSRF guard
    res = await fetch(`${baseUrl}/api/auth/change-password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${AUTH_COOKIE_NAME}=${validToken}; ${CSRF_COOKIE_NAME}=${csrfToken}`,
        'x-csrf-token': csrfToken,
      },
      body: JSON.stringify({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      }),
    });
    assert(res.status !== 403, `Valid CSRF token passes CSRF check (got ${res.status}, not 403)`);

    console.log('\n--- 5. ROLE-BASED ACCESS CONTROL (RBAC) TESTS ---');

    // Test 5.1: Non-admin user blocked from admin-only route
    const adminGuard = authorizeRoles('admin');
    let guardReq = { user: { id: 'usr_normal', role: 'user' } };
    let guardRes = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(p) { this.body = p; return this; }
    };
    let nextCalled = false;
    adminGuard(guardReq, guardRes, () => { nextCalled = true; });
    assert(!nextCalled && guardRes.statusCode === 403, 'Standard user blocked by authorizeRoles("admin") with 403 Forbidden');

    // Test 5.2: Staff user blocked from admin-only route
    guardReq = { user: { id: 'usr_staff', role: 'staff' } };
    guardRes = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(p) { this.body = p; return this; }
    };
    nextCalled = false;
    adminGuard(guardReq, guardRes, () => { nextCalled = true; });
    assert(!nextCalled && guardRes.statusCode === 403, 'Staff user blocked by authorizeRoles("admin") with 403 Forbidden');

    // Test 5.3: Genuine admin allowed
    guardReq = { user: { id: 'usr_admin', role: 'admin' } };
    nextCalled = false;
    adminGuard(guardReq, guardRes, () => { nextCalled = true; });
    assert(nextCalled, 'Genuine admin user allowed by authorizeRoles("admin")');

    // Test 5.4: Multi-role authorization
    const staffOrAdminGuard = authorizeRoles('admin', 'staff');
    guardReq = { user: { id: 'usr_staff', role: 'staff' } };
    nextCalled = false;
    staffOrAdminGuard(guardReq, guardRes, () => { nextCalled = true; });
    assert(nextCalled, 'Staff user allowed by authorizeRoles("admin", "staff")');

    console.log('\n--- 6. PASSWORD RESET WORKFLOW TESTS ---');

    // Test 6.1: Forgot password returns generic response without account disclosure
    res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'any_random_email@example.com' }),
    });
    data = await res.json();
    assert(res.status === 200, `POST /api/auth/forgot-password returns 200 OK (got ${res.status})`);
    assert(data.message?.includes('instructions to reset your password have been sent'), 'Returns generic privacy-preserving message');

    // Test 6.2: Reset password with invalid token
    res = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'fake-invalid-token',
        newPassword: 'NewStrongPassword123!',
      }),
    });
    assert(res.status === 400 || res.status === 500, `Reset password with invalid token rejected (got ${res.status})`);

    console.log('\n--- 7. LOGOUT TESTS ---');

    // Test 7.1: Logout clears authentication cookie
    res = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Cookie: `${AUTH_COOKIE_NAME}=${validToken}; ${CSRF_COOKIE_NAME}=${csrfToken}`,
        'x-csrf-token': csrfToken,
      },
    });
    assert(res.status === 200, `POST /api/auth/logout returns 200 OK (got ${res.status})`);
    const logoutCookieHeader = res.headers.get('set-cookie') || '';
    assert(
      logoutCookieHeader.includes(`${AUTH_COOKIE_NAME}=;`) || logoutCookieHeader.includes('Expires='),
      'Clears mj_auth_token cookie upon logout'
    );

    console.log('\n--- 8. REGRESSION TESTS (PARTS 1-8 APIs) ---');

    // Test 8.1: Health check
    res = await fetch(`${baseUrl}/api/health`);
    data = await res.json();
    assert(res.status === 200 && data.status === 'healthy', 'GET /api/health returns 200 healthy');

    // Test 8.2: Readiness check
    res = await fetch(`${baseUrl}/api/health/ready`);
    assert(res.status === 200 || res.status === 503, 'GET /api/health/ready responds with valid probe status');

    // Test 8.3: Property catalogue browsing
    res = await fetch(`${baseUrl}/api/properties`);
    data = await res.json();
    assert(res.status === 200 && Array.isArray(data.data), 'GET /api/properties catalogue continues working cleanly');

    // Test 8.4: Single property detail
    res = await fetch(`${baseUrl}/api/properties/demo-001`);
    data = await res.json();
    assert(res.status === 200 && data.data?.title, 'GET /api/properties/:id detail view continues working cleanly');

    console.log('\n--------------------------------------------------------');
    console.log(`Results: ${passed} Passed, ${failed} Failed`);
    console.log('--------------------------------------------------------\n');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
  }

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('ALL SECURITY & AUTHENTICATION TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  }
}

runSecurityTests();
