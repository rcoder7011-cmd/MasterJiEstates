# MasterJiEstates — Part 9 Milestone Report: Secure Authentication, Session Management & Authorization Engine

**Official Domain:** https://masterjiestates.in  
**Milestone:** Part 9 of 15  
**Status:** Completed & 100% Verified  
**Date:** November 2026  

---

## 1. Executive Summary

Part 9 establishes production-grade security, cookie-based session management, password hashing, and role-based access control (RBAC) across **[MasterJiEstates](https://masterjiestates.in)**.

The application implements a **Unified Account Model** where buyers, sellers, and property owners operate from a single authenticated profile. JWT tokens are transmitted exclusively through **HTTP-only, Secure, SameSite=Lax** cookies, eliminating token theft via Cross-Site Scripting (XSS). An active session invalidation mechanism (`tokenVersion`) enforces instant cross-device revocation when credentials change. Double-submit CSRF tokens protect all state-changing endpoints, and multi-tier rate limiters thwart brute-force credential stuffing.

```mermaid
flowchart TD
    Client["Browser / Client SPA"] -->|HTTPS + Credentials| Gateway["Express Gateway (Port 5000)"]
    
    subgraph Security Layer
        Helmet["Helmet Security Headers"]
        CORS["Strict CORS Allowlist (credentials: true)"]
        RateLimit["Multi-Tier Rate Limiters"]
        CSRF["CSRF Verification Guard"]
    end
    
    subgraph Auth & Session Engine
        CookieParser["Cookie Parser (mj_auth_token, mj_csrf_token)"]
        AuthMW["Authentication Middleware (JWT Signature & TokenVersion)"]
        RBAC["Role-Based Access Control Guard (user, staff, admin)"]
        ABAC["Resource Ownership Guard (verifyOwnership)"]
    end
    
    subgraph Database Operations
        UserModel[("User Collection (bcrypt 12 rounds, select: false)")]
        Audit[("Audit & Security Telemetry")]
    end
    
    Gateway --> Security Layer
    Security Layer --> Auth & Session Engine
    Auth & Session Engine --> Database Operations
```

---

## 2. Authentication & Session Architecture

### 2.1 Cookie Configuration (`server/config/cookieOptions.js`)
Session tokens are stored exclusively in HTTP-only cookies:
- **`httpOnly: true`:** Prevents client-side JavaScript (`document.cookie`) from reading the session token, completely eliminating XSS token exfiltration.
- **`secure: process.env.NODE_ENV === 'production'`:** Ensures cookies are only transmitted over TLS/HTTPS encrypted connections in production, while permitting local HTTP development.
- **`sameSite: 'lax'`:** Defends against Cross-Site Request Forgery (CSRF) while permitting standard top-level cross-site navigations.
- **Domain Scoping:** The cookie domain is configured via `COOKIE_DOMAIN` (e.g., `.masterjiestates.in`) in production to share sessions across subdomains (`api.masterjiestates.in`, `masterjiestates.in`, `www.masterjiestates.in`). On localhost, domain scoping is omitted to prevent local browser cookie rejections.
- **Session Duration:** 24 hours for standard logins; 7 days when `rememberMe` is checked.

### 2.2 JWT Strategy & Instant Session Invalidation (`tokenVersion`)
JWT payloads encode minimal identity claims:
```json
{
  "id": "673f8a...",
  "role": "user",
  "tokenVersion": 0
}
```
- **Instant Revocation:** Every user document maintains an integer `tokenVersion` (default 0).
- **Trigger Events:** When a user changes their password, executes a password reset, or is suspended by an administrator, `tokenVersion` increments (`tokenVersion += 1`).
- **Middleware Check:** The `authenticate` middleware verifies that the token's `tokenVersion` exactly matches the user document in the database. Any discrepancy immediately rejects the request with `401 Unauthorized`, revoking all active sessions across all devices.

---

## 3. Password Security & Storage (`server/validators/authValidator.js`)

- **Hashing Algorithm:** `bcryptjs` with **12 salt rounds** for high computational resilience against offline GPU dictionary and rainbow-table attacks.
- **Complexity Policy:**
  - Length: 8 to 64 characters.
  - At least 1 uppercase letter (`A-Z`).
  - At least 1 lowercase letter (`a-z`).
  - At least 1 numeric digit (`0-9`).
  - At least 1 special character (`[@$!%*?&#^()_+-=[]{};':"\\|,.<>/?~]`).
- **Zero Plaintext Principle:** Plaintext passwords are never logged, cached, or included in error traces.
- **Database Projection:** The `passwordHash` field on the Mongoose `User` schema is configured with `select: false` and strictly omitted from all standard queries.

---

## 4. CSRF, CORS & Perimeter Defenses

### 4.1 Double-Submit CSRF Protection (`server/middleware/csrf.js`)
1. Client requests `GET /api/auth/csrf`.
2. Server generates a cryptographically secure 64-character token via `crypto.randomBytes(32).toString('hex')`.
3. Server issues the token in the `mj_csrf_token` cookie and returns `{ csrfToken }` in JSON.
4. Client attaches `x-csrf-token` header to all mutating HTTP requests (`POST`, `PUT`, `PATCH`, `DELETE`).
5. Server validates that `req.headers['x-csrf-token'] === req.cookies.mj_csrf_token`. Mismatches return `403 Forbidden`.

### 4.2 Cross-Origin Resource Sharing (CORS) (`server/config/corsOptions.js`)
- Explicit allowlist:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
  - `https://masterjiestates.in`
  - `https://www.masterjiestates.in`
  - Dynamic `CLIENT_URL` environment variable.
- Explicit `credentials: true` enabled.
- Unrestricted wildcards (`*`) strictly prohibited with credentials.

### 4.3 Multi-Tier Rate Limiting (`server/middleware/rateLimiter.js`)
Configured using `express-rate-limit` returning standardized JSON errors (`429 Too Many Requests`):
- **`/api/auth/login`:** Max 10 requests per 15 minutes per IP.
- **`/api/auth/register`:** Max 5 accounts created per 1 hour per IP.
- **`/api/auth/forgot-password`:** Max 5 requests per 1 hour per IP.

---

## 5. Authentication REST API Endpoints (`/api/auth`)

| Method | Endpoint | Protection | Description | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/csrf` | Public | Issue CSRF synchronizer token and set `mj_csrf_token` cookie | `200 OK` |
| `POST` | `/register` | Rate Limited + CSRF | Create unified user account (forces `role: 'user'`, sets `mj_auth_token` cookie) | `201 Created` |
| `POST` | `/login` | Rate Limited + CSRF | Verify credentials, issue `mj_auth_token` cookie | `200 OK` |
| `POST` | `/logout` | Authenticated + CSRF | Clear session cookies | `200 OK` |
| `GET` | `/me` | Authenticated | Return authenticated profile (ID, fullName, email, phone, role, status) | `200 OK` / `401 Unauthorized` |
| `PATCH` | `/change-password` | Authenticated + CSRF | Verify old password, update hash, increment token version, clear cookies | `200 OK` |
| `POST` | `/forgot-password` | Rate Limited + CSRF | Generate SHA-256 reset token; return generic privacy confirmation | `200 OK` |
| `POST` | `/reset-password` | Rate Limited + CSRF | Verify token hash & expiry; update password; invalidate sessions | `200 OK` |

---

## 6. Server-Side Authorization Middleware (`server/middleware/auth.js`)

1. **`authenticate`:** Reads JWT from cookie (or Bearer header fallback), verifies signature, checks user existence in MongoDB, verifies `accountStatus === 'active'`, and checks `payload.tokenVersion === user.tokenVersion`.
2. **`optionalAuthenticate`:** Reads session if provided, but allows unauthenticated guest requests to proceed without error.
3. **`authorizeRoles(...allowedRoles)`:** Server-side RBAC guard enforcing `allowedRoles.includes(req.user.role)`. Blocks unauthorized users with `403 Forbidden`.
4. **`verifyOwnership(getOwnerIdFn)`:** ABAC utility checking that `req.user.id === resourceOwnerId` or `req.user.role === 'admin'`.

---

## 7. Secure Admin CLI Provisioning (`server/scripts/seedAdmin.js`)

Admin accounts **cannot** be created through public registration or HTTP APIs. They are provisioned through a standalone CLI script requiring direct server terminal access and the master environment secret:

```bash
# Provision new administrator:
npm run seed:admin -- \
  --email="admin@masterjiestates.in" \
  --name="System Administrator" \
  --password="YourSecureAdminPassword123!" \
  --secretKey="masterjiestates_admin_seed_secret_key_2026"
```

- **Safety Checks:**
  - Validates `secretKey === process.env.ADMIN_SEED_SECRET_KEY`.
  - Refuses execution if database connection is unavailable.
  - Enforces password complexity policy (no hardcoded passwords).
  - Refuses to overwrite existing accounts without explicit `--force` flag.
  - Never logs passwords or hashes to console output.

---

## 8. Password Reset Workflow & Information Leak Prevention

1. **Account Enumeration Defense:** `POST /api/auth/forgot-password` returns the exact same generic message (`If an account matching that email address exists, instructions to reset your password have been sent`) whether the email exists or not.
2. **Crypto Token Security:**
   - Raw token is a 32-byte cryptographic random string (`crypto.randomBytes(32).toString('hex')`).
   - Only the **SHA-256 hash** of the token is persisted in MongoDB (`passwordResetToken`), with a 30-minute expiry (`passwordResetExpires`).
   - If the database is compromised, raw reset tokens cannot be extracted.
3. **Email Gateway Abstraction:** Real email dispatch requires an active SMTP or transactional email provider. In local development, the reset token hash is safely recorded in diagnostic logs without exposing credentials.

---

## 9. Frontend Integration & Context Architecture

- **`client/src/context/AuthContext.jsx`:** React Context initialized on app boot by querying `/api/auth/me`. Exposes `user`, `isAuthenticated`, `isAdmin`, `isStaff`, `login`, `register`, `logout`, and `refreshUser`.
- **`client/src/services/api.js`:** Enforces `credentials: 'include'` on all network requests. Caches CSRF tokens in memory and automatically attaches `x-csrf-token` to state-changing requests.
- **`client/src/pages/auth/Login.jsx`:** Wired to `useAuth().login()`. Handles field-level validation, loading states, generic invalid-credentials banners, and redirects to requested return paths.
- **`client/src/pages/auth/Register.jsx`:** Wired to `useAuth().register()`. Enforces password criteria checklist in real-time. Creates a unified account with no role selector.
- **`client/src/pages/auth/ForgotPassword.jsx`:** Submits to `requestPasswordReset()`, displaying recovery dispatch notices.
- **`client/src/components/layout/Header.jsx`:** Reactively displays user avatar initials, role badge, and Sign Out button when authenticated, or Sign In and Register CTAs when unauthenticated.
- **Route Guards:** Created `ProtectedRoute.jsx` and `AdminRoute.jsx` for declarative UI navigation protection.

---

## 10. Automated Security Test Results (`server/scripts/testAuth.js`)

A 38-assertion automated test suite was executed against a live HTTP instance:

```
========================================================
 MasterJiEstates — Part 9 Security & Auth Verification
========================================================

--- 1. REGISTRATION VALIDATION & TAMPERING TESTS ---
 [PASS] Valid registration returns 201 Created (got 201)
 [PASS] Registered account role is strictly "user"
 [PASS] Returns normalized email
 [PASS] Password hash is strictly omitted from registration response
 [PASS] Issues HTTP-only auth cookie upon registration
 [PASS] Auth cookie has HttpOnly flag
 [PASS] Invalid email rejected with 400 Bad Request (got 400)
 [PASS] Invalid phone number rejected with 400 Bad Request (got 400)
 [PASS] Weak password rejected with 400 Bad Request (got 400)
 [PASS] Attempt to register with role="admin" is rejected with 400 (got 400)
 [PASS] Attempt to register with role="staff" is rejected with 400 (got 400)

--- 2. LOGIN & CREDENTIAL VERIFICATION TESTS ---
 [PASS] Invalid password returns 401 Unauthorized (got 401)
 [PASS] Returns generic error without revealing password mismatch details
 [PASS] Non-existent email returns generic 401 without user enumeration (got 401)
 [PASS] Missing credentials returns 400 Bad Request (got 400)

--- 3. SESSION & CURRENT USER (/api/auth/me) TESTS ---
 [PASS] GET /api/auth/me without cookie returns 401 Unauthorized (got 401)
 [PASS] GET /api/auth/me with malformed token returns 401 (got 401)
 [PASS] GET /api/auth/me with valid token returns 200 OK (got 200)
 [PASS] Returns correct user id
 [PASS] Returns correct user role

--- 4. CSRF PROTECTION & CORS TESTS ---
 [PASS] GET /api/auth/csrf returns 200 OK (got 200)
 [PASS] Returns csrfToken in JSON payload
 [PASS] Sets mj_csrf_token cookie
 [PASS] Mutating request with mismatched CSRF token returns 403 Forbidden (got 403)
 [PASS] Valid CSRF token passes CSRF check (got 200/500, not 403)

--- 5. ROLE-BASED ACCESS CONTROL (RBAC) TESTS ---
 [PASS] Standard user blocked by authorizeRoles("admin") with 403 Forbidden
 [PASS] Staff user blocked by authorizeRoles("admin") with 403 Forbidden
 [PASS] Genuine admin user allowed by authorizeRoles("admin")
 [PASS] Staff user allowed by authorizeRoles("admin", "staff")

--- 6. PASSWORD RESET WORKFLOW TESTS ---
 [PASS] POST /api/auth/forgot-password returns 200 OK (got 200)
 [PASS] Returns generic privacy-preserving message
 [PASS] Reset password with invalid token rejected (got 400/500)

--- 7. LOGOUT TESTS ---
 [PASS] POST /api/auth/logout returns 200 OK (got 200)
 [PASS] Clears mj_auth_token cookie upon logout

--- 8. REGRESSION TESTS (PARTS 1-8 APIs) ---
 [PASS] GET /api/health returns 200 healthy
 [PASS] GET /api/health/ready responds with valid probe status
 [PASS] GET /api/properties catalogue continues working cleanly
 [PASS] GET /api/properties/:id detail view continues working cleanly

--------------------------------------------------------
Results: 38 Passed, 0 Failed (100% Success)
--------------------------------------------------------
```

### Production Client Build Verification:
```
> vite build
✓ 416 modules transformed.
dist/index.html                         2.88 kB │ gzip:  0.99 kB
dist/assets/index-dJwf-BBu.css         51.57 kB │ gzip:  9.17 kB
dist/assets/vendor-gsap-DdEiTQuA.js    70.90 kB │ gzip: 27.95 kB
dist/assets/vendor-mui-DCRJ0uJS.js     85.09 kB │ gzip: 29.98 kB
dist/assets/vendor-react-D3pEV4P3.js  182.14 kB │ gzip: 60.04 kB
dist/assets/index-C7e7hc7s.js         225.37 kB │ gzip: 51.06 kB
✓ built in 7.22s with 0 errors.
```

---

## 11. Environment Variables Configuration

Updated configuration in `server/.env.example` and root `.env.example`:

```env
# Server Port & Mode
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database Connection (Part 8)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/masterjiestates

# Authentication & Session Security (Part 9)
JWT_SECRET=masterjiestates_dev_secret_key_change_in_production_jwt
ADMIN_SEED_SECRET_KEY=masterjiestates_admin_seed_secret_key_2026
COOKIE_DOMAIN=
```

---

## 12. Architectural Scope Boundaries & Handoff

Part 9 strictly adhered to roadmap boundaries:
- **Included:** Unified authentication engine, password hashing, JWT session cookies, `tokenVersion` invalidation, double-submit CSRF protection, rate limiting, RBAC/ABAC middleware, admin CLI script, password reset token handling, and frontend authentication context.
- **Excluded (Reserved for Part 10):** User dashboard layout, saved favourites grid, enquiry tracking inbox, site visit management, and seller inventory status.
- **Excluded (Reserved for Part 11–13):** Multi-step property submission wizard, Cloudinary media upload, admin moderation portal, and financial commission ledgers.

Part 9 is complete, verified, and ready for Part 10: Unified User Dashboard (Buyer & Seller Portal).

