# MasterJiEstates — MongoDB Atlas Integration, Persistent Storage & Seller Flow Audit Report

**Project:** MasterJiEstates  
**Official Domain:** https://masterjiestates.in  
**Cluster:** `MasterJiEstates`  
**Database:** `userData`  
**Date:** November 2026  
**Status:** **100% Verified & Operational on Live MongoDB Atlas**

---

## 1. Executive Summary

This milestone audited and completed the end-to-end integration with **MongoDB Atlas**, eliminated disconnected mock ambiguity, imported all **12 demo properties** with zero duplicates, fixed the **logged-in user listing workflow**, and established verified persistence for users, properties, inquiries, and site visits.

| Milestone Goal | Status | Verification Detail |
| :--- | :--- | :--- |
| **MongoDB Atlas Connection** | **Live & Verified** | Connected to cluster `MasterJiEstates.aeheuxn.mongodb.net`, active database `userData`. |
| **Explicit Collections** | **Configured** | Collections `users`, `properties`, `enquiries`, `sitevisits` explicitly bound in Mongoose models. |
| **12 Demo Properties** | **100% Seeded** | All 12 properties imported; idempotent re-seeding verified (0 duplicates created). |
| **Logged-In Seller Flow** | **Fixed** | Logged-in users clicking "Add Property" or "List Your Property" open the form directly without login redirect. |
| **Logged-Out Seller Flow** | **Fixed** | Unauthenticated visitors are routed to `/login`, with return destination `/dashboard/listings/new` preserved. |
| **Property Ownership Security** | **Enforced** | `owner.userId` strictly bound to authenticated `req.user.id`; external submissions forced to `brokerage`. |
| **Cloudinary Media Assets** | **Verified** | Cryptographically signed direct uploads; URLs restricted to Cloudinary CDN; Base64 rejected. |
| **Automated Test Suites** | **388 / 388 Passed** | 358 legacy backend tests + 30 live Atlas integration audit tests passing with 100% pass rate. |

---

## 2. PART 1 — MongoDB Atlas Configuration

### A. Environment Configuration & Connection Security
* **Environment File:** `server/.env` (guarded by root `.gitignore`).
* **Connection String:**
  ```env
  MONGODB_URI=mongodb+srv://masterjiestates_db_user:uTRFMIOZtZowQyxG@masterjiestates.aeheuxn.mongodb.net/userData?retryWrites=true&w=majority
  ```
* **Credential Protection:** Passwords masked in application logs (`mongodb+srv://masterjiestates_db_user:****@...`).
* **Windows DNS Resolution Fix:** Integrated public DNS resolvers (`8.8.8.8`, `1.1.1.1`) inside `server/config/database.js` to resolve Node.js Windows SRV query issues (`querySrv ECONNREFUSED`).
* **Cluster Inspection:** Verified existing cluster databases: `sample_mflix`, `userData`, `admin`, `local`.
* **Database Selection:** Strictly connected to `userData` (741,376 bytes).

### B. Collections Status in `userData`
| Collection | Document Count | Purpose |
| :--- | :--- | :--- |
| `properties` | **12 documents** | Master inventory: 12 seeded demo properties + live user-submitted listings. |
| `users` | Dynamic | Authenticated buyers, sellers, staff, and admin accounts. |
| `enquiries` | Dynamic | Customer inquiries with auto-generated `ENQ-` reference codes. |
| `sitevisits` | Dynamic | Escorted site tour requests with auto-generated `VISIT-` reference codes. |
| `brokeragedeals` | Dynamic | Commercial brokerage transaction ledger. |
| `commissionpayments`| Dynamic | Commission settlement milestones. |
| `businessexpenses` | Dynamic | CapEx and operational expense tracking. |
| `auditlogs` | Dynamic | Administrative compliance and activity log trail. |
| `userDatas` | 0 documents | Existing pre-existing collection preserved untouched. |

---

## 3. PART 2 — Real MongoDB Persistence

All write operations in `server/services/` now persist directly to MongoDB Atlas:
1. **User Accounts:**
   - Registration writes to `users` with bcrypt-hashed passwords (12 rounds) and normalized email.
   - Profile updates strictly validate against user ID and reject role tampering (403 Forbidden).
2. **Properties:**
   - Demo records are flagged with `isDemo: true` and indexed by `demoId`.
   - User submissions are flagged with `isDemo: false`, `listingType: 'brokerage'`, `isDraft: true`, and initial status `'draft'`.
3. **Enquiries & Site Visits:**
   - Customer inquiries and site visit requests persist with unique booking references (`ENQ-` and `VISIT-`) and optional `userId` association.

---

## 4. PART 3 — 12 Demo Properties Idempotent Seeding

### Seeding Implementation
* **Command:** `npm run seed:properties` (available from root and `server/`).
* **Dataset:** `server/data/demoPropertiesData.js` (12 luxury apartments, villas, builder floors, plots, and commercial properties).
* **Seeding Mechanism:**
  ```javascript
  await Property.findOneAndUpdate(
    { demoId: item.demoId },
    propertyPayload,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  ```
* **Execution Outcomes:**
  * **First Run:** `Seeding complete: 12 inserted, 0 updated, 0 skipped.`
  * **Second Run:** `Seeding complete: 0 inserted, 12 updated, 0 skipped.`
  * **Duplicate Prevention:** Zero duplicates created across multiple runs. Real user properties are protected from overwrite because matching is strictly keyed on `demoId`.

---

## 5. PART 4 — Logged-in User Listing Workflow Fix

### Problem Resolved
Previously, users clicking "List Your Property" on the homepage or navigating to listing creation were inadvertently redirected to `/register` or `/login`, even when already holding an active authentication session.

### Fix Details
1. **`HeroSection.jsx`:**
   - If `isAuthenticated`: Links directly to `/dashboard/listings/new`.
   - If unauthenticated: Links to `/login` with `state: { from: { pathname: '/dashboard/listings/new' } }`.
2. **`Header.jsx`:**
   - Added persistent **"+ Add Property"** action in both desktop navigation and mobile drawer.
   - Checks `isAuthenticated` and routes directly to the listing form if logged in, or preserves return path via `/login`.
3. **`Login.jsx`:**
   - Added `useEffect` session check: If already authenticated, user is instantly redirected to `from` (`/dashboard/listings/new` or `/dashboard`) without displaying the login form.
   - After login, automatically navigates to `location.state.from` (defaulting to `/dashboard`).
4. **`Register.jsx`:**
   - Added session check and destination preservation so newly registered sellers land directly on the listing creation form.
5. **`AppRoutes.jsx`:**
   - Added friendly top-level route aliases: `/add-property`, `/submit-property`, `/properties/new`, and `/sell`, all navigating directly to `/dashboard/listings/new`.

---

## 6. PART 5 & 6 — Secure Property Ownership & Cloudinary Media

* **Owner Derivation:** `owner.userId` is set from `req.user.id` on the server. Request body owner properties are strictly discarded.
* **Listing Type Enforcement:** External sellers can only submit `listingType: 'brokerage'`. Attempting to submit `company_owned` is blocked.
* **Moderation Pipeline:**
  1. `draft` — Visible and editable only by owner.
  2. `pending_review` — Locked from seller editing; submitted to admin moderation queue; hidden from public search.
  3. `available` — Approved by admin; published to public catalogue and SEO directory.
* **Cloudinary Direct Signed Uploads:**
  - Client requests signature via `POST /api/dashboard/listings/upload-signature`.
  - Server generates SHA cryptographic signature with folder `masterji_estates/properties`.
  - Media URLs validated to originate strictly from `https://res.cloudinary.com/`.

---

## 7. Verification & Integration Test Results

### Live MongoDB Atlas Integration Audit (`npm run test:live`)
Executed directly against live Atlas cluster `MasterJiEstates` in database `userData`:
```
========================================================
 MasterJiEstates — Live MongoDB Atlas & Persistence Audit
========================================================
--- 1. Testing MongoDB Atlas Connectivity & DB Name ---
  ✓ [PASS] Successfully established live connection to MongoDB Atlas
  ✓ [PASS] Active database is strictly "userData" (got "userData")

--- 2. Inspecting Collections in userData ---
  Found collections: enquiries, sitecontents, businessexpenses, commissionpayments, brokeragedeals, auditlogs, companypropertysales, sitevisits, propertyexpenses, contactmessages, userDatas, properties, users
  ✓ [PASS] Collection "properties" exists
  ✓ [PASS] Collection "users" exists
  ✓ [PASS] Collection "enquiries" exists
  ✓ [PASS] Collection "sitevisits" exists

--- 3. Verifying Seeded Demo Properties ---
  ✓ [PASS] All 12 demo properties exist in MongoDB Atlas (got 12)
  ✓ [PASS] Found demo-001 in MongoDB
  ✓ [PASS] demo-001 has isDemo: true
  ✓ [PASS] demo-001 retains proper title
  ✓ [PASS] demo-001 retains image assets

--- 4. Testing User Persistence in MongoDB ---
  ✓ [PASS] User saved to MongoDB with valid ObjectId
  ✓ [PASS] User retrieved from MongoDB by _id

--- 5. Testing Logged-in Seller Property Submission Workflow ---
  ✓ [PASS] Property draft created successfully
  ✓ [PASS] Initial availability status is "draft"
  ✓ [PASS] Listing type is strictly enforced as "brokerage"
  ✓ [PASS] Property draft permanently saved in MongoDB Atlas
  ✓ [PASS] User listing has isDemo: false
  ✓ [PASS] Property owner strictly bound to authenticated user ID
  ✓ [PASS] Property owner email correctly recorded
  ✓ [PASS] Draft price updated in MongoDB
  ✓ [PASS] Cloudinary cover image URL saved
  ✓ [PASS] Draft submitted for moderation review
  ✓ [PASS] Status transitioned to "pending_review"
  ✓ [PASS] SECURITY: Pending review listing is strictly absent from public catalogue
  ✓ [PASS] Submitted property appears in seller dashboard inventory
  ✓ [PASS] Seller sees correct "pending_review" status
  ✓ [PASS] SECURITY: User B cannot see User A seller listing

--- 6. Cleaning Up Test Data ---
  ✓ [PASS] Test property cleaned up cleanly from MongoDB
  ✓ [PASS] 12 demo properties remain intact and untouched

========================================================
 RESULTS: 30 / 30 TESTS PASSED
========================================================
```

### Full Test Suite Regression (`npm run test:all --prefix server`)
* `testAuth.js`: **38 / 38 passed**
* `testDashboard.js`: **41 / 41 passed**
* `testPropertySubmission.js`: **46 / 46 passed**
* `testAdmin.js`: **43 / 43 passed**
* `testBusinessOperations.js`: **110 / 110 passed**
* `testPart14.js`: **10 / 10 passed**
* `testPart15E2E.js`: **70 / 70 passed**
* **Total Automated Tests: 358 / 358 passed (100% pass rate).**

### Frontend Production Build (`npm run build --prefix client`)
* **Vite v6.4.5:** 487 modules transformed with **0 errors**.
* Bundle output verified in `dist/`.

