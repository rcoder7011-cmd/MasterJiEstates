# MasterJiEstates — Part 8 Milestone Report: Backend REST API & MongoDB Database Foundation

**Official Domain:** https://masterjiestates.in  
**Milestone:** Part 8 of 15  
**Status:** Completed & Fully Verified  
**Date:** November 2026  

---

## 1. Executive Summary

Part 8 of the MasterJiEstates engineering roadmap establishes the complete backend architecture, database modeling, and REST API foundation. It transitions the application from a client-only prototype into a database-backed system powered by **Node.js**, **Express**, **MongoDB Atlas**, and **Mongoose**.

All public property catalogue operations, lead generation, and escorted site visit workflows are connected through standardized REST APIs, while privacy safeguards protect sensitive owner contact details and back-office metrics from public exposure.

A **hybrid architecture** guarantees zero downtime: the frontend client communicates with the backend REST endpoints with automatic, resilient fallback to demonstration data if the local backend server is offline or operating in disconnected development mode.

```mermaid
flowchart TD
    Client["React Frontend (Vite SPA)"] -->|HTTP /api| Express["Express REST API (Port 5000)"]
    Express --> HealthRoutes["Health & Readiness Probes"]
    Express --> PropertyRoutes["Property Catalogue Routes"]
    Express --> EnquiryRoutes["Lead Enquiry Routes"]
    Express --> SiteVisitRoutes["Site Visit Routes"]

    PropertyRoutes --> PropertyService["Property Service & DTO Serializer"]
    EnquiryRoutes --> EnquiryService["Enquiry Service"]
    SiteVisitRoutes --> SiteVisitService["Site Visit Service"]

    PropertyService --> MongoDB[("MongoDB Atlas Database")]
    EnquiryService --> MongoDB
    SiteVisitService --> MongoDB

    PropertyService -.->|Fallback if Offline| DemoData["Demo Dataset Fallback"]
    EnquiryService -.->|Fallback if Offline| MemoryCRM["Demo CRM Ingestion"]
    SiteVisitService -.->|Fallback if Offline| MemoryVisits["Demo Booking Ingestion"]
```

---

## 2. Database Connection Architecture (`server/config/database.js`)

The database connection is managed as a resilient singleton that isolates credentials, logs masked diagnostics, and gracefully handles cloud connectivity interruptions:

- **Credential Masking:** Prevents passwords and cluster tokens from leaking into console logs or crash dumps by masking URIs (`mongodb+srv://admin:****@cluster.mongodb.net/...`).
- **Resilient Non-Crashing Startup:** If `MONGODB_URI` is unconfigured or Atlas is unreachable due to network restrictions, the server emits a structured diagnostic warning and continues running. HTTP static and health routes remain accessible.
- **Fast Timeout Detection:** Configured with `serverSelectionTimeoutMS: 5000` to prevent request hangs when cloud clusters are unreachable.
- **Graceful Process Termination:** Intercepts `SIGINT` and `SIGTERM` signals to cleanly close database connection pools before process exit.
- **Connectivity Helper (`isDatabaseConnected()`):** Exposes connection state to health probes and service query layers.

---

## 3. Database Models & Schema Specifications (`server/models/`)

### 3.1 `User.js` — Unified Account Schema
Central model for buyers, sellers, agents, and administrators.
- `fullName`: String, required, 2–100 characters.
- `email`: String, required, unique, lowercase, regex-validated.
- `phone`: String, required, 10-digit Indian mobile regex (`^[6-9]\d{9}$`).
- `passwordHash`: String, `select: false` (strictly omitted from queries).
- `role`: Enum `['user', 'staff', 'admin']`, default `'user'`.
- `accountStatus`: Enum `['active', 'suspended', 'pending']`, default `'active'`.
- `isEmailVerified` & `isPhoneVerified`: Booleans tracking multi-factor verification state.
- `timestamps`: Automatic `createdAt` and `updatedAt`.

### 3.2 `Property.js` — Inventory & Listing Schema
Supports both **Company-Owned** inventory (`MasterJi Direct`) and **Brokerage Mandates**.
- `title`: String, required, indexed for full-text search.
- `slug`: String, unique, indexed for canonical SEO routing (`/properties/slug/:slug`).
- `demoId`: String, sparse index for backward-compatible demo identification (`demo-001`).
- `description`: String, required narrative description.
- `category`: Enum `['apartment', 'villa', 'residential_plot', 'commercial_property', 'independent_house', 'commercial_building', 'other']`.
- `listingType`: Enum `['company_owned', 'brokerage']`, default `'brokerage'`.
- `price`: Number, required, minimum 0.
- `priceNegotiable`: Boolean, default true.
- `city` & `locality`: Strings, indexed for faceted filtering.
- `addressDisplay`: String, sanitized public address (e.g., "Golf Course Ext Rd, Sector 65, Gurugram").
- `area`: Number, square footage.
- `bedrooms`, `bathrooms`, `parking`: Numeric specifications.
- `furnishing`, `floor`, `facing`: Physical attributes.
- `availabilityStatus`: Enum `['available', 'under_negotiation', 'sold', 'withdrawn', 'pending_review']`.
- `images`: Array of high-resolution image URLs.
- `amenities`: Array of feature tags.
- `featured`: Boolean, indexed for homepage carousel priority.
- `isDemo`: Boolean, flag identifying demonstration records.
- **Strict Privacy Protections (`select: false`):**
  - `privateAddress`: Full street address/unit number (accessible to admin only).
  - `owner`: Object containing owner name, phone, email, or user ref (accessible to admin only).
  - `acquisitionCost`: Internal purchase price for company-owned assets (accessible to admin only).
  - `internalNotes`: Confidential brokerage/negotiation memos (accessible to admin only).

### 3.3 `Enquiry.js` — Inbound Lead Management Schema
Tracks buyer and investor interest generated from property pages.
- `propertyId`: String / ObjectId referencing the target listing.
- `propertyTitle`: Snapshot string for audit continuity.
- `name`: Inquirer's full name (2–100 chars).
- `email`: Contact email address.
- `phone`: 10-digit Indian mobile number (`^[6-9]\d{9}$`).
- `message`: Inquirer's custom message (10–1000 chars).
- `status`: Enum `['new', 'contacted', 'follow_up', 'converted', 'closed']`, default `'new'`.
- `referenceCode`: Unique tracking code generated on submission (e.g., `ENQ-20261107-7429`).
- `assignedTo`: Reference to staff user.
- `timestamps`: Automatic tracking.

### 3.4 `SiteVisit.js` — Escorted Physical Walkthrough Schema
Coordinates on-site property walkthroughs with field advisors.
- `propertyId` & `propertyTitle`: Target property reference.
- `name`, `email`, `phone`: Visitor contact information.
- `preferredDate`: Date object, validated to prevent booking dates in the past.
- `preferredTimeSlot`: String (Morning, Afternoon, Evening).
- `notes`: Optional special visitor requests.
- `status`: Enum `['requested', 'confirmed', 'completed', 'cancelled']`, default `'requested'`.
- `bookingReference`: Unique booking code (e.g., `VISIT-20261107-5912`).
- `assignedStaffId`: Reference to field executive.

---

## 4. Privacy Architecture & Public DTO Serialization (`server/utils/serializers.js`)

MasterJiEstates enforces strict data confidentiality. No database document is returned to public clients without serialization through `serializePublicProperty()`:

1. **Explicit Whitelist Projection:** Only public fields (`title`, `slug`, `price`, `addressDisplay`, `images`, `amenities`, `specs`) are returned.
2. **Private Field Omission:** Internal fields (`privateAddress`, `owner`, `acquisitionCost`, `internalNotes`, `__v`) are systematically stripped.
3. **Format Standardization:** Automatically generates formatted Indian currency strings (`₹1.85 Cr`, `₹68 Lakhs`) and human-readable segment badges (`MasterJi Direct`, `Brokerage`).

---

## 5. REST API Endpoints Specification

All endpoints return a standardized JSON response envelope:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human-readable status",
  "data": { ... },
  "meta": { ... }
}
```

| Method | Endpoint | Description | Request Query / Body | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service Liveness Probe | None | `200 OK` |
| `GET` | `/api/health/ready` | Service Readiness Probe (DB Check) | None | `200 OK` (connected) / `503 Degraded` (disconnected) |
| `GET` | `/api/properties` | Paginated Catalogue Browsing | `city`, `locality`, `category`, `listingType`, `status`, `minPrice`, `maxPrice`, `bedrooms`, `search`, `sort`, `page`, `limit` | `200 OK` + `meta` pagination |
| `GET` | `/api/properties/:id` | Single Property by ID | URL parameter `:id` | `200 OK` or `404 Not Found` |
| `GET` | `/api/properties/slug/:slug` | Single Property by SEO Slug | URL parameter `:slug` | `200 OK` or `404 Not Found` |
| `POST` | `/api/enquiries` | Submit Property Enquiry | `{ propertyId, name, email, phone, message }` | `201 Created` + Reference Code (`ENQ-...`) |
| `POST` | `/api/site-visits` | Schedule Escorted Site Visit | `{ propertyId, name, email, phone, preferredDate, preferredTimeSlot, notes }` | `201 Created` + Reference Code (`VISIT-...`) |

---

## 6. Manual Idempotent Seeder (`server/scripts/seedDemoProperties.js`)

To populate MongoDB Atlas with initial demonstration data without creating duplicate entries:

```bash
# From workspace root:
npm run seed:server

# Or inside server directory:
cd server && npm run seed
```

- **Upsert Strategy:** Matches records by unique canonical `slug`. Existing documents are updated in-place; new documents are inserted.
- **Safety Guarantee:** The seed script must be triggered manually and will **never** run automatically on server restart, ensuring production data safety.

---

## 7. Hybrid Frontend Integration (`client/src/services/api.js`)

The React frontend integrates with the backend API while guaranteeing zero UI degradation:

1. **`PropertyListing.jsx`:** Queries `GET /api/properties` with reactive URL parameters. Displays dynamic property cards with total result counters, pagination, and a status pill indicating live database or demonstration mode.
2. **`PropertyDetails.jsx`:** Queries `GET /api/properties/:id` asynchronously. Features a loading skeleton during network transit and displays real property details.
3. **`PropertyEnquiryCard.jsx`:** Submits to `POST /api/enquiries`. Validates inputs on client and server, displaying real reference IDs (`ENQ-YYYYMMDD-XXXX`).
4. **`SiteVisitModal.jsx`:** Submits to `POST /api/site-visits`. Blocks past dates, submits to backend, and displays confirmed booking references (`VISIT-YYYYMMDD-XXXX`).

---

## 8. Verification & Test Execution Results

### 8.1 Backend Controller & Validation Integration Tests
```
--- DIRECT CONTROLLER TESTS ---
1. getProperties status: 200 Count: 12 Total: 12
2. getProperties (Gurugram) status: 200 Count: 2
3. getPropertyById (demo-001) status: 200 Title: Modern 3 BHK Luxury Apartment
4. getPropertyBySlug status: 200 Title: Contemporary 4 BHK Designer Villa
5. submitEnquiry (valid) status: 201 Ref: ENQ-20261107-3642
6. submitEnquiry (invalid phone) status: 400 Errors: [ 'phone', 'message' ]
7. scheduleSiteVisit (valid) status: 201 Ref: VISIT-20261107-5912
8. scheduleSiteVisit (past date) status: 400 Errors: [ 'preferredDate' ]
--- ALL CONTROLLER TESTS PASSED (100% SUCCESS) ---
```

### 8.2 Frontend Production Build Verification
```
> vite build
✓ 415 modules transformed.
dist/index.html                         2.88 kB │ gzip:  0.99 kB
dist/assets/index-CHEsZwkH.css         51.36 kB │ gzip:  9.13 kB
dist/assets/vendor-gsap-DdEiTQuA.js    70.90 kB │ gzip: 27.95 kB
dist/assets/vendor-mui-DCRJ0uJS.js     85.09 kB │ gzip: 29.98 kB
dist/assets/vendor-react-D3pEV4P3.js  182.14 kB │ gzip: 60.04 kB
dist/assets/index-29ZGFYcm.js         220.75 kB │ gzip: 49.72 kB
✓ built in 9.88s with 0 errors.
```

---

## 9. Scope Boundaries & Next Phase Handoff

Part 8 strictly adhered to architectural boundaries:
- **Included:** Database connection, Mongoose schemas, public REST APIs, lead enquiry ingestion, site visit scheduling, public serialization, manual seeder, and frontend hybrid integration.
- **Excluded (Reserved for Part 9):** User authentication, password hashing (`bcrypt`), JWT token generation, cookie sessions, user login/registration endpoints, and RBAC authorization middleware.

Part 8 is complete, verified, and ready for Part 9: Secure Authentication, Session & Authorization Engine.

