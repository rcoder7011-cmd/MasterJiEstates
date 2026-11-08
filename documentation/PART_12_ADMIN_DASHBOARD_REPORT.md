# MasterJiEstates — Part 12: Admin Dashboard, Property Moderation & Approval Workflow Report

**Project:** MasterJiEstates  
**Official Domain:** https://masterjiestates.in  
**Milestone:** Part 12 of 15  
**Date of Completion:** 2026-11-07  
**Status:** COMPLETE — 100% Pass Rate (76/76 Admin Tests, 206/206 Platform Total)

---

## 1. Executive Summary

Part 12 introduces the dedicated administrative back-office and property moderation engine for MasterJiEstates. The system provides an end-to-end operational dashboard (`/admin`) for estate managers, verifiers, and super-administrators, enforcing role-based access control (RBAC) at both backend route boundaries and client-side navigation.

All seller submissions generated via Part 11 flow into an administrative moderation queue, where administrators inspect unmasked seller PII, physical title records, and Cloudinary media assets before executing state transitions (`approve`, `reject`, `request-changes`). Company-owned assets are maintained in a segregated repository with strict server-level shielding of proprietary financial metrics (`acquisitionCost`, `acquisitionDate`, `internalNotes`, `privateAddress`).

The administrative suite also encompasses user governance with instant JWT session invalidation, a lead CRM inbox with disposition tracking, physical site visit dispatch management, and an append-only audit trail logging every administrative intervention.

---

## 2. Core Architecture & Security Enforcement

### 2.1 Backend RBAC & Middleware Chain

All back-office endpoints are mounted under `/api/admin` with a strict middleware pipeline:

```text
Request ──▶ csrfProvider ──▶ authenticate ──▶ authorizeRoles('admin') ──▶ verifyCsrfToken (on state mutations) ──▶ Controller
```

- **Unauthenticated requests** terminate immediately with `401 Unauthorized`.
- **Authenticated non-admin users** (`role: 'user'` or `role: 'staff'`) terminate with `403 Forbidden` (`Access denied. Required role(s): admin`).
- **State-mutating operations** (POST, PATCH, DELETE) require a valid cryptographic `x-csrf-token` header matching the signed double-submit cookie.
- **Admin self-protection:** Administrators cannot suspend their own accounts, preventing accidental back-office lockout.

### 2.2 Proprietary Data Shielding (Company-Owned Assets)

Company-owned listings require tracking acquisition costs, internal notes, and private street addresses that must never leak to prospective buyers, competitors, or search engines.

```text
Database Schema (Property.js)
├── acquisitionCost    ──▶ select: false
├── acquisitionDate    ──▶ select: false
├── internalNotes      ──▶ select: false
├── privateAddress     ──▶ select: false
└── owner              ──▶ select: false
```

- **Public Serializer (`serializePublicProperty`):** Strictly omits `acquisitionCost`, `acquisitionDate`, `internalNotes`, `privateAddress`, `owner`, and `moderation`.
- **Admin Serializer (`serializeAdminProperty`):** Safely projects company financials and unmasked owner PII exclusively for authorized administrators.

---

## 3. Implemented Modules & Features

### 3.1 Admin Overview Dashboard (`AdminOverview.jsx`)
- **Key Performance Indicators (KPIs):** Real-time metrics computed directly from database records or synchronized in-memory stores:
  - Total Properties in Inventory
  - Pending Review Listings (highlighted in amber)
  - Published / Active Listings
  - Rejected Listings & Withdrawn Listings
  - Total Registered Platform Users
  - Inquiries & Scheduled Tours
- **System Health Monitor:** Honest database status indicator displaying "Atlas MongoDB Connected" (Green) or "Offline / In-Memory Mock Mode" (Amber).
- **Recent Submissions Feed:** Quick-action cards displaying recent seller submissions awaiting review.
- **Recent Administrative Activities:** Real-time stream of audit trail logs.

### 3.2 Property Moderation Queue (`PropertyModeration.jsx` & `PropertyReview.jsx`)
- **Moderation Table:** Searchable, filterable list of listings in `pending_review` status.
- **Comprehensive Review Sheet (`PropertyReview.jsx`):**
  - **Unmasked Seller PII:** Displays seller's full legal name, verified email, and contact phone number.
  - **High-Resolution Photo Gallery:** Cloudinary image inspection with zoom and thumbnail navigation.
  - **Location & Pricing Breakdown:** City, locality, state, pincode, price formatting, price per sqft.
  - **Property Specs & Features:** Bedrooms, bathrooms, balconies, furnished status, parking spaces.
- **Three Moderation State Actions:**
  1. **Approve Listing:**
     - Transition: `pending_review` ──▶ `available`
     - State mutation: `isDraft: false`, `moderation.status: 'approved'`
     - Public activation: Immediately indexed in public search and catalogue.
     - Audit logging: Records approval with optional internal administrative notes.
  2. **Reject Listing:**
     - Transition: `pending_review` ──▶ `rejected`
     - Enforcement: Requires mandatory rejection reason (minimum 5 characters).
     - Privacy: Strictly excluded from public catalogue; seller retains history with explanation.
     - Audit logging: Records rejection reason in audit trail.
  3. **Request Changes:**
     - Transition: `pending_review` ──▶ `changes_requested`
     - Enforcement: Requires mandatory remarks specifying required corrections (minimum 5 characters).
     - State mutation: `isDraft: true`, enabling the seller to edit their draft and resubmit.
     - Audit logging: Records change remarks in audit trail.

### 3.3 Property Inventory Management (`PropertyManagement.jsx`)
- Full platform property directory supporting pagination, search, category filters, and status filters (`available`, `under_negotiation`, `sold`, `withdrawn`, `rejected`).
- Quick status switcher modal allowing administrative state transitions (`under_negotiation`, `sold`, `withdrawn`, `available`).

### 3.4 Company-Owned Inventory Management (`CompanyInventory.jsx`)
- Dedicated portal for managing company-purchased distress sales, bank liquidations, and developer bulk acquisitions.
- Modal dialog for onboarding and updating company-owned assets:
  - Purchase Price / Acquisition Cost (₹)
  - Acquisition Date
  - Legal Private Address / Title deed registration number
  - Internal Advisory Notes
- Real-time margin and gross profit yield calculations on the admin interface.

### 3.5 User Management & Account Governance (`UserManagement.jsx`)
- Searchable user directory with role filters (`user`, `admin`, `staff`) and status filters (`active`, `suspended`).
- Displays submitted listing counts per user.
- **Account Suspension & Token Revocation:**
  - One-click account suspension toggling `accountStatus: 'suspended'`.
  - Atomically increments `tokenVersion`, instantly invalidating all active JWT sessions on the next request.
  - Anti-self-suspension guard prevents an administrator from locking their own account.
- **Data Protection:** User password hashes and password reset tokens are strictly excluded from all API responses.

### 3.6 Lead CRM Inbox (`AdminEnquiries.jsx`)
- Centralized inbox of customer buyer inquiries across all platform properties.
- Displays unmasked buyer contact information (name, email, phone) and message.
- Disposition status workflow: `new` ──▶ `contacted` ──▶ `qualified` ──▶ `closed` ──▶ `archived`.
- Administrative internal notes editor for tracking client preferences and interaction history.

### 3.7 Site Visits Schedule & Dispatch (`AdminSiteVisits.jsx`)
- Central calendar schedule of physical property inspections.
- Unmasked customer contact details, property snippet, preferred tour date, and time slot.
- Tour state management:
  - **Confirm Visit:** Transitions tour to `confirmed`, sets internal logistics notes.
  - **Reschedule Visit:** Updates tour date and time slot.
  - **Cancel Visit:** Requires cancellation reason and updates status to `cancelled`.

### 3.8 Append-Only Audit Trail (`AdminActivityLogs.jsx`)
- Dedicated Mongoose schema (`AuditLog.js`) and bounded in-memory circular buffer recording all administrative actions:
  - `adminId`, `adminEmail`, `adminName`
  - `action` (`property_approved`, `property_rejected`, `property_changes_requested`, `company_property_created`, `user_status_updated`, `enquiry_status_updated`, `site_visit_updated`)
  - `targetType` & `targetId`
  - `reason` & `metadata`
  - Immutable ISO timestamp

---

## 4. API Endpoints Reference

All endpoints prefixed with `/api/admin`:

| Method | Endpoint | Description | Guard |
| :--- | :--- | :--- | :--- |
| `GET` | `/overview` | Key administrative metrics, DB health, recent activity | `authenticate`, `admin` |
| `GET` | `/moderation` | Moderation queue for `pending_review` listings | `authenticate`, `admin` |
| `GET` | `/moderation/:id` | Full listing review payload with unmasked seller PII | `authenticate`, `admin` |
| `POST` | `/moderation/:id/approve` | Approve listing (`pending_review` -> `available`) | `verifyCsrfToken`, `admin` |
| `POST` | `/moderation/:id/reject` | Reject listing with mandatory reason (>= 5 chars) | `verifyCsrfToken`, `admin` |
| `POST` | `/moderation/:id/request-changes` | Request modifications from seller (>= 5 chars) | `verifyCsrfToken`, `admin` |
| `GET` | `/properties` | All-property inventory with search & pagination | `authenticate`, `admin` |
| `GET` | `/properties/:id` | Single property inspection with internal metrics | `authenticate`, `admin` |
| `PATCH` | `/properties/:id/status` | Update listing status (`under_negotiation`, `sold`, etc.) | `verifyCsrfToken`, `admin` |
| `POST` | `/properties/company` | Onboard company-owned property asset | `verifyCsrfToken`, `admin` |
| `PATCH` | `/properties/company/:id` | Update company-owned property asset details | `verifyCsrfToken`, `admin` |
| `GET` | `/users` | User directory with submitted property counts | `authenticate`, `admin` |
| `PATCH` | `/users/:id/status` | Suspend or reactivate user account + invalidate JWT | `verifyCsrfToken`, `admin` |
| `GET` | `/enquiries` | Lead CRM inbox across all properties | `authenticate`, `admin` |
| `PATCH` | `/enquiries/:id` | Update inquiry disposition status & internal notes | `verifyCsrfToken`, `admin` |
| `GET` | `/site-visits` | Site visits inspection schedule | `authenticate`, `admin` |
| `PATCH` | `/site-visits/:id` | Confirm, reschedule, or cancel site visit tour | `verifyCsrfToken`, `admin` |
| `GET` | `/activity-logs` | Retrieve append-only administrative audit trail | `authenticate`, `admin` |

---

## 5. Verification & Testing Results

### 5.1 Test Execution Summary

The Part 12 automated verification suite (`server/scripts/testAdmin.js`) executed 13 comprehensive sections covering authorization boundaries, moderation workflows, company data protection, user governance, CRM dispatch, and audit logging.

```text
======================================================
 MASTERJIESTATES PART 12: ADMIN BACK-OFFICE SUITE
======================================================

--- 1. Testing Unauthenticated Security Boundaries (Expecting 401) ---
  ✓ [PASS] Unauthenticated GET /api/admin/overview returns 401
  ✓ [PASS] Unauthenticated GET /api/admin/moderation returns 401
  ✓ [PASS] Unauthenticated GET /api/admin/properties returns 401
  ✓ [PASS] Unauthenticated GET /api/admin/users returns 401
  ✓ [PASS] Unauthenticated GET /api/admin/activity-logs returns 401
  ✓ [PASS] Unauthenticated POST /api/admin/properties/company returns 401

--- 2. Testing Normal User Role-Based Access Control (Expecting 403) ---
  ✓ [PASS] Normal user blocked from GET /api/admin/overview with 403 Forbidden
  ✓ [PASS] Normal user blocked from GET /api/admin/moderation with 403 Forbidden
  ✓ [PASS] Normal user blocked from POST /api/admin/properties/company with 403 Forbidden
  ✓ [PASS] Normal user blocked from POST /api/admin/moderation/:id/approve with 403 Forbidden
  ✓ [PASS] Normal user blocked from GET /api/admin/users with 403 Forbidden

--- 3. Setting Up Authorized Administrator Identity ---
  ✓ [PASS] Admin session and CSRF credentials generated successfully

--- 4. Testing Admin Overview Dashboard ---
  ✓ [PASS] Admin accesses GET /api/admin/overview (200 OK)
  ✓ [PASS] Overview contains metrics object
  ✓ [PASS] Metrics includes numeric totalProperties
  ✓ [PASS] Metrics includes numeric pendingApprovals
  ✓ [PASS] Overview honestly reports database status
  ✓ [PASS] Overview provides recentSubmissions array
  ✓ [PASS] Overview provides recentActivities array

--- 5. Testing Moderation Queue & Approval Workflow ---
  ✓ [PASS] Admin retrieves moderation queue (200 OK)
  ✓ [PASS] Moderation queue contains the pending submission
  ✓ [PASS] Admin retrieves full details for review (200 OK)
  ✓ [PASS] Seller contact info is accurately unmasked for admin review
  ✓ [PASS] Approving an already available property fails with 400 Bad Request
  ✓ [PASS] Admin approves pending listing successfully (200 OK)
  ✓ [PASS] Listing status transitioned to "available"
  ✓ [PASS] Listing isDraft is set to false
  ✓ [PASS] Moderation status recorded as "approved"
  ✓ [PASS] PUBLIC CATALOGUE: Approved listing is now publicly viewable (200 OK)

--- 6. Testing Listing Rejection Workflow ---
  ✓ [PASS] Rejection without reason is rejected with 400 Bad Request
  ✓ [PASS] Rejection with short reason is rejected with 400 Bad Request
  ✓ [PASS] Admin rejects listing with valid reason (200 OK)
  ✓ [PASS] Listing status updated to "rejected"
  ✓ [PASS] Rejection reason is stored in moderation object
  ✓ [PASS] PUBLIC PRIVACY: Rejected listing is strictly hidden from public catalogue (404 Not Found)

--- 7. Testing Change Request & Resubmission Workflow ---
  ✓ [PASS] Change request without remarks is rejected with 400 Bad Request
  ✓ [PASS] Admin requests changes successfully (200 OK)
  ✓ [PASS] Status updated to "changes_requested"
  ✓ [PASS] Listing isDraft set to true to enable seller revision
  ✓ [PASS] Seller can edit listing in "changes_requested" status (200 OK)
  ✓ [PASS] Seller successfully resubmits listing for review (200 OK)
  ✓ [PASS] Listing transitions back to "pending_review"

--- 8. Testing Property Management & Status Transitions ---
  ✓ [PASS] Admin retrieves property inventory (200 OK)
  ✓ [PASS] Properties response contains items array
  ✓ [PASS] Admin transitions property to "under_negotiation" (200 OK)
  ✓ [PASS] Admin transitions property to "sold" (200 OK)
  ✓ [PASS] Admin transitions property to "withdrawn" (200 OK)
  ✓ [PASS] Admin restores property to "available" (200 OK)

--- 9. Testing Company-Owned Inventory & Financial Privacy ---
  ✓ [PASS] Admin onboards company-owned asset (201 Created)
  ✓ [PASS] Listing type is strictly "company_owned"
  ✓ [PASS] Admin receives acquisitionCost in response
  ✓ [PASS] Admin receives internalNotes in response
  ✓ [PASS] Admin inspects company asset (200 OK)
  ✓ [PASS] Admin inspection includes acquisitionCost
  ✓ [PASS] Public caller accesses company-owned listing (200 OK)
  ✓ [PASS] PROPRIETARY PRIVACY ENFORCED: acquisitionCost is strictly UNDEFINED in public response
  ✓ [PASS] PROPRIETARY PRIVACY ENFORCED: internalNotes is strictly UNDEFINED in public response
  ✓ [PASS] PROPRIETARY PRIVACY ENFORCED: privateAddress is strictly UNDEFINED in public response

--- 10. Testing User Directory & Account Safety Controls ---
  ✓ [PASS] Admin retrieves user directory (200 OK)
  ✓ [PASS] Users list returned as array
  ✓ [PASS] SECURITY ENFORCED: passwordHash is strictly omitted from user directory
  ✓ [PASS] SECURITY ENFORCED: passwordResetToken is strictly omitted from user directory
  ✓ [PASS] Admin suspends target user account (200 OK)
  ✓ [PASS] Target account status set to "suspended"
  ✓ [PASS] Admin reactivates target user account (200 OK)
  ✓ [PASS] SECURITY ENFORCED: Admin self-suspension rejected with 403 Forbidden

--- 11. Testing Enquiries CRM & Site Visits Dispatch ---
  ✓ [PASS] Admin retrieves all enquiries (200 OK)
  ✓ [PASS] Admin updates enquiry disposition status and notes (200 OK)
  ✓ [PASS] Admin retrieves all site visits (200 OK)
  ✓ [PASS] Admin updates site visit confirmation (200 OK)

--- 12. Testing Administrative Audit Trail ---
  ✓ [PASS] Admin retrieves audit activity logs (200 OK)
  ✓ [PASS] Audit logs returned as array
  ✓ [PASS] Audit trail contains recorded administrative operations
  ✓ [PASS] Normal user blocked from audit trail with 403 Forbidden

--- 13. Regression Testing Public APIs ---
  ✓ [PASS] Public health endpoint operational (200 OK)
  ✓ [PASS] Public property catalogue functional (200 OK)

======================================================
 RESULT: 76 / 76 TESTS PASSED
======================================================
```

### 5.2 Full Platform Regression Results

All previous milestone test suites were executed concurrently with 100% pass rates:

| Test Suite | Milestone | Tests Run | Tests Passed | Pass Rate |
| :--- | :--- | :--- | :--- | :--- |
| `testAuth.js` | Part 9: Auth & Security | 38 | 38 | 100% |
| `testDashboard.js` | Part 10: User Dashboard | 46 | 46 | 100% |
| `testPropertySubmission.js` | Part 11: Property Submission | 46 | 46 | 100% |
| `testAdmin.js` | Part 12: Admin & Moderation | 76 | 76 | 100% |
| **Total Platform Tests** | **All Modules** | **206** | **206** | **100%** |

### 5.3 Client Production Build

```bash
npm run build --prefix client
```
- Modules Transformed: 452
- Build Output: 0 errors, 0 warnings
- Total JavaScript: 799.43 kB (212.85 kB gzip) across vendor chunks
- Total CSS: 68.41 kB (11.54 kB gzip)
- Build Time: 6.78s

---

## 6. Admin Account Provisioning Guide

Admin accounts cannot be self-registered via public forms. They must be provisioned using the CLI provisioning utility:

```bash
cd server
node scripts/seedAdmin.js \
  --email="admin@masterjiestates.in" \
  --password="<StrongPasswordHere>" \
  --secretKey="<ADMIN_SEED_SECRET_KEY>" \
  --name="MasterJi Administrator" \
  --phone="9876543210"
```

### Security Safeguards in `seedAdmin.js`:
1. Requires matching `ADMIN_SEED_SECRET_KEY` from `server/.env`.
2. Validates password complexity (minimum 8 chars, uppercase, lowercase, number, special character).
3. Connects to database and verifies connection health before writing.
4. Uses `bcrypt` with cost factor 12.
5. Sets `role: 'admin'`, `accountStatus: 'active'`, `isEmailVerified: true`.
6. Increments `tokenVersion` to invalidate any pre-existing sessions.

---

## 7. Status of Database & Cloudinary Services

- **MongoDB Atlas:** The database connection manager uses demo credentials in local development. When MongoDB Atlas is unavailable or network restricted, the server gracefully engages its high-fidelity in-memory state engine. When valid production Atlas credentials are provided, all Mongoose models (`Property`, `User`, `Enquiry`, `SiteVisit`, `AuditLog`) persist automatically.
- **Cloudinary Integration:** Server-side upload signatures (`POST /api/dashboard/upload-signature`) are computed using HMAC-SHA256 with the Cloudinary API secret stored securely on the backend. The API secret is never exposed to the client.

---

## 8. Milestone Boundaries & Non-Scope Confirmation

As mandated by project guidelines, **Part 12 is strictly bounded**:
- **No Financial / Commission Ledgers:** Agent commission splitting, transaction accounting, and brokerage financial ledgers are reserved for Part 13.
- **No Payment Gateways:** Real-money processing (Razorpay, Stripe) is excluded.
- **No External SMS/Email SMTP:** Notification stubs and in-memory mock dispatches are used.
- **Development has stopped at Part 12.** Part 13 will commence only after explicit authorization.

