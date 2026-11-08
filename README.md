# MasterJiEstates — Enterprise Real Estate Platform

> **"MasterJiEstates — From Finding Your Property to Building Your Dream."**  
> Official Domain: [https://masterjiestates.in](https://masterjiestates.in) | API Subdomain: `https://api.masterjiestates.in`

---

## 1. Project Introduction

**MasterJiEstates** is an enterprise-grade digital real estate brokerage and proprietary asset management platform engineered specifically for the Indian real estate market. The platform bridges property buyers, external property owners, and internal real estate operators through a secure, mediated transaction workflow.

Unlike open classifieds that expose personal phone numbers and promote unverified listings, MasterJiEstates protects owner privacy, verifies property titles, manages physical site visits, and oversees price negotiations from initial inquiry through to deed registration.

The platform operates using two primary commercial models:
- **Brokerage Property Model:** External owners submit listings; MasterJiEstates verifies ownership, masks personal contact information, coordinates site visits and negotiations, and earns an agreed brokerage commission.
- **Company-Owned Property Model:** MasterJiEstates independently acquires properties with clear titles, showcases them with a "MasterJi Direct" badge, and realizes direct margins upon resale, keeping internal acquisition costs strictly confidential.

---

## 2. Project Technology Stack

- **Frontend:**
  - React.js (v18.3.x) with JavaScript (ES6+ / JSX)
  - React Router DOM (v7) for client-side routing & URL query parameter synchronization
  - Vite (v6.x) build tool & local development server with optimized vendor code-splitting
  - Tailwind CSS (v3.4.x) for layout, responsive typography, and design tokens
  - Material UI (MUI v6) with Emotion cache prepending for accessible data-dense UI components
  - GSAP (v3.12.x) for selective entrance and scroll animations
- **Backend:**
  - Node.js (v20+ LTS) runtime
  - Express.js (v4.21.x) RESTful API framework
  - Helmet for security headers and CORS origin whitelisting
  - Dotenv for environment configuration
- **Database (Planned for Part 8):**
  - MongoDB Atlas Cloud NoSQL database with Mongoose ODM
- **Media Infrastructure (Planned for Part 11):**
  - Cloudinary for image storage, optimization, and watermarking

---

## 3. Implemented User Experiences

### A. Complete Website Content Cleanup & UX Optimization
- **Removal of Internal Development Callouts:** Stripped all legacy development notices, milestone callouts ("Part 5 Prototype Notice", "Part 7 Milestone Notice"), and layout verification disclaimers from the public site.
- **Elimination of Database Status Leaks:** Removed public database connection indicators ("Live Database Connected", "Demonstration Catalog", "Offline mode fallback") so that internal technical infrastructure is strictly concealed from customers.
- **Removal of Overlaid Badges:** Deleted the hardcoded "Illustrative Listing" badge from all grid and list property cards.
- **Customer-Friendly Form Responses:** Replaced internal developer terms like "Local Test Mode" and "Lead Registered in CRM" with clear, polite customer feedback ("Enquiry Received", "Visit Request Received", "Scheduling Visit...").
- **Statutory Disclosure Cleanup:** Refactored the legal notice banner to remove "draft informational disclosures" and present clean, professional statutory notices.
- **Developer Overlay Removal:** Removed the `<DevNavSwitcher />` floating bar to ensure uncluttered mobile and desktop viewports.
- **Interactive UX Improvements:** Replaced dead text links with real routes, fixed button contrast on the homepage hero, and directed modal CTAs straight to dedicated property details pages.

### B. Branding, Official Logo, WhatsApp & Udyam Registration
- **Official 3:2 PNG Logo:** Detected genuine `1536 x 1024` PNG in root, deployed as `/logo.png`, browser favicon, and `<Logo />` component with dark/light background variants. Replaces generic text emblems across Header, Footer, Auth Layout, Admin Sidebar, User Dashboard, and Contact pages.
- **Strict Contact Credentials:**
  - Official Calling Phone: `+91 9990316186` (Click-to-call: `tel:+919990316186`)
  - Official WhatsApp: `+91 7011202089` (Click-to-chat: `https://wa.me/917011202089?text=...`)
  - Official Email: `masterjiestates@gmail.com`
  - Office Address: `Noida Sector 62A, Uttar Pradesh, India`
  - Service Regions: `Delhi`, `Uttar Pradesh`, `Ghaziabad`, `Noida`, `Gurugram`
- **Udyam Compliance Badge (`<UdyamBadge />`):** Displays statutory *"Udyam Registered Enterprise"* indicator linking to the official government portal (`https://udyamregistration.gov.in/UdyamRegistration.aspx`) with strict avoidance of fabricated registration numbers or unverified government seals.
- **Multichannel WhatsApp Click-to-Chat:** Centralized `companyConfig.js` generates route-aware, contextual pre-filled messages. Features `<FloatingWhatsApp />` with pulse beacon and tooltip (auto-hidden on private dashboards), plus embedded inquiry buttons on property cards, property details mobile conversion bar, enquiry card, service cards, and homepage CTA sections.
- **5-Column Corporate Footer Redesign:** Includes Logo, Udyam badge, direct phone and WhatsApp touchpoints, support email, Noida Sector 62A office location, service areas directory, and quick links.

### B. Final Testing, Optimization & Production Deployment (Part 15 — FINAL MILESTONE)
- **Frontend Route Code-Splitting & Performance:** Implemented dynamic `React.lazy()` imports for all 30+ pages with `<Suspense fallback={<PageLoader />}>` in `AppRoutes.jsx`. Transformed frontend bundle footprint from **644 kB down to 74.36 kB** (gzip: 18.88 kB), completely resolving Vite chunk size warnings and optimizing Core Web Vitals (LCP, INP, CLS).
- **Branded 404 Error Page (`NotFound.jsx`):** Custom 404 page styled with company navy and gold accents, offering navigation CTAs back to Homepage, Properties Catalogue, and Client Support. Includes SPA fallback routing via `client/public/_redirects`.
- **Search Engine Optimization & Crawler Directives:** Built `client/public/robots.txt` disallowing private user dashboards and admin portals while allowing public catalog pages, plus `client/public/sitemap.xml` indexing all canonical public URLs with priority weights.
- **Fail-Safe Database Production Architecture:** Updated `database.js` and `server.js` so that in `NODE_ENV=production`, failure to establish a connection to MongoDB Atlas results in an immediate, explicit process exit (`process.exit(1)`). In-memory mock mode is strictly restricted to development and testing environments.
- **Observability & Diagnostics:** Enhanced `/api/health` with process uptime (in seconds), memory telemetry (RSS, heapUsed, heapTotal in MB), and Node version; enhanced `/api/health/ready` with detailed Mongoose readyState reporting.
- **OWASP CSV Formula Injection Defense:** Neutralized spreadsheet formula injection across all financial CSV exports (`brokerage_deals`, `commission_ledger`, `company_sales`, `business_expenses`) by prepending `'` to fields starting with `=`, `+`, `-`, `@`, `\t`, `\r`, or `%`.
- **Production Deployment Runbook:** Comprehensive documentation in `documentation/PRODUCTION_RUNBOOK.md` detailing exact environment variable templates, Cloudflare Pages frontend setup, Render backend deployment, and custom domain DNS mapping (`masterjiestates.in`, `api.masterjiestates.in`).
- **Comprehensive E2E Verification Suite:** Added `server/scripts/testPart15E2E.js` with 70 end-to-end integration assertions covering visitor discovery, buyer enquiries, site visits, Cloudinary uploads, seller drafts, moderation approval, deals, payments, and anti-tampering guards.
- **Automated Verification:** 70 / 70 Part 15 E2E test assertions passing; **449 / 449 platform test assertions passing across all 7 suites (100% pass rate)**.

### B. Additional Services, Company Pages & Legal Disclaimers (Part 14)
- **Real Estate & Allied Services Hub (`ServicesPage.jsx`):** Primary real estate brokerage services (Buying Representation, Selling Mandates, MasterJi Direct Assets, Registry & Conveyance Coordination) complemented by allied home living solutions (Home Loans Assistance, Turnkey Interior Design, Architecture & Structural Planning, Carpentry & Woodwork, Furniture Solutions, Software & PropTech Tools). Configurable delivery status badges (`direct`, `verified_partner`, `coming_soon`, `unavailable`) with transparent partner disclaimers.
- **Company Identity & Philosophy (`AboutUs.jsx`):** Clear brand positioning under the official tagline *"From Finding Your Property to Building Your Dream."* Details how MasterJiEstates protects buyers and sellers with title scrutiny, escorted site visits, and owner phone number masking. Strict avoidance of unconfirmed founding dates or fabricated awards.
- **Public Contact Engine (`ContactUs.jsx`):** Comprehensive inquiry form with client/server validation, 10-digit Indian phone checks, double-submit CSRF defense, IP rate limiting (`contactLimiter`), unique reference code issuance (`CONT-YYYYMMDD-XXXX`), and configurable headquarters contact information.
- **Categorized Knowledge Base (`FAQPage.jsx`):** Searchable, categorized accordion covering property browsing, inquiry workflows, buying/selling checklists, seller submission wizard, moderation & approvals, site visit scheduling, brokerage terms, allied services, and DPDP privacy protection.
- **Statutory Legal Disclosures:** Dedicated legal policy suite with sidebar navigation and mandatory Indian advocate legal review disclaimer:
  - `PrivacyPolicy.jsx` (`/privacy-policy`): DPDP Act 2023 compliance principles, purpose of data collection, non-disclosure guarantee, seller phone number masking, and grievance officer redressal.
  - `TermsAndConditions.jsx` (`/terms-and-conditions` & `/terms`): Terms of platform use, intermediary technological status, property listing disclaimer, buyer due diligence requirements, and liability boundaries.
  - `Disclaimer.jsx` (`/disclaimer`): Real estate statutory notice stating that property dimensions and prices are indicative; MasterJiEstates does not warrant absolute title or guarantee capital appreciation or loan approvals.
  - `BrokeragePolicy.jsx` (`/brokerage-policy`): Transparent brokerage policy explaining that commissions are determined solely via individualized written representation agreements; zero buyer brokerage on "MasterJi Direct" inventory; tranche payment schedules.
  - `CookiePolicy.jsx` (`/cookie-policy`): Accurate disclosure of essential session (`mj_auth_token`) and CSRF (`mj_csrf_token`) cookies with zero third-party advertising tracking.
- **Admin Content & Inquiries Management (`ContentManagement.jsx`):** Back-office administrative console (`/admin/content`) for updating company profile info, managing service visibility/delivery models, inspecting and updating public contact inquiries with admin notes, and reviewing published FAQs.
- **Search Engine Optimization (SEO):** Reusable `SEOHead.jsx` managing canonical URLs (`https://masterjiestates.in/...`), meta descriptions, Open Graph protocol tags, and robots directives (`index, follow` on public pages; `noindex, nofollow` on back-office and user dashboards).
- **Automated Verification:** 63 / 63 Part 14 test assertions passing (`server/scripts/testPart14.js`).

### B. Business Operations, Brokerage Deals & Financial Management (Part 13)
- **Role-Based Access Control (RBAC):** Dedicated administrative business suite (`/admin/business`) guarded by `AdminRoute` on the frontend and `authenticate` + `authorizeRoles('admin')` across all `/api/admin/business/*` endpoints. Non-admins receive `403 Forbidden`; unauthenticated requests terminate with `401 Unauthorized`.
- **Business Operations Overview Dashboard (`BusinessOverview.jsx`):** Real-time operational metrics (active deals, completed deals, commission agreed, commission received, outstanding commission, company acquisition cost basis, company property expenses, company sales revenue, gross profit, pending payments) with date range filters (`this_month`, `last_month`, `last_3_months`, `this_year`, `all`) and live stream of recent financial transactions.
- **Brokerage Deals Pipeline (`BrokerageDeals.jsx` & `DealDetails.jsx`):** 8-stage transaction lifecycle (`lead`, `negotiation`, `agreement_pending`, `agreement_signed`, `transaction_in_progress`, `completed`, `cancelled`, `on_hold`) linking properties, buyers, sellers, and responsible estate agents. Single deal inspection sheet showing counterparty identities, deed value tracking, commission revision modal, and embedded payment ledger.
- **Brokerage Commission Engine & Revisions:** Flexible terms per deal (percentage rate or fixed amount), payer assignment (`seller`, `buyer`, `both`, `other`), and dynamic calculation on confirmed deed values. Mandatory justification reasons (min 5 chars) for all term revisions, with previous terms immutably preserved in `revisionHistory`.
- **Commission Payment Ledger (`CommissionLedger.jsx`):** Multi-instalment payment tracking, transaction reference / UTR logging, overpayment guards, duplicate UTR prevention, and audited payment reversals with mandatory reason restoring deal balances.
- **Company-Owned Property Financials & CapEx (`CompanyPropertyFinancials.jsx`):** Landed capital investment tracking combining acquisition costs with itemized capital expenditures (`registration`, `renovation`, `repair_maintenance`, `legal_documentation`, `brokerage_paid`, etc.) and audited expense reversals.
- **Company Property Resale & Gross Margins:** Resale execution recording `saleAmount`, `agreementReference`, `buyer` identity, and `paymentReceived`. Automated calculation of landed basis (`totalInvestment = acquisitionCost + expenses`), `grossProfit`, and `grossMarginPercentage`, automatically transitioning property status to `sold`.
- **General Operating Expenses (`BusinessExpenses.jsx`):** Non-property business overhead tracking (`office_rent`, `software_subscriptions`, `marketing`, `travel`, `utilities`, `professional_services`, `staff_costs`, `other`) with category filtering and audited reversals.
- **Financial Reports & Authorized CSV Exports (`FinancialReports.jsx`):** Pipeline distribution analytics, payer breakdowns, and 4 authorized one-click CSV export streams (`brokerage_deals`, `commission_ledger`, `company_sales`, `business_expenses`).
- **Data Protection & Proprietary Privacy Defense:** Strict server-side shielding guaranteeing that `acquisitionCost`, `totalExpenses`, `grossProfit`, and commission terms are strictly omitted from public catalogue DTOs.
- **Automated Verification:** 110 / 110 Part 13 test assertions passing (`server/scripts/testBusinessOperations.js`).

### B. Admin Dashboard, Property Moderation & Approval Workflow (Part 12)
- **Role-Based Access Control (RBAC):** Dedicated administrative portal (`/admin`) guarded by `AdminRoute` on the frontend and `authenticate` + `authorizeRoles('admin')` across all `/api/admin/*` endpoints. Non-admins receive `403 Forbidden`; unauthenticated requests terminate with `401 Unauthorized`.
- **Admin Overview Dashboard (`AdminOverview.jsx`):** Real-time operational metrics (Total properties, pending approvals, published, rejected, withdrawn, registered users, enquiries, upcoming site visits). Honest database monitor displaying real-time Atlas connection status or in-memory mock mode. Live streams for recent submissions and administrative audit activities.
- **Property Moderation Engine (`PropertyModeration.jsx` & `PropertyReview.jsx`):**
  - Moderation queue listing seller submissions in `pending_review` status with search and category filters.
  - Review sheet revealing unmasked seller contact information (name, email, phone), property specifications, and photo gallery.
  - **Approve Action:** Eligible for `pending_review` listings, transitioning status to `available` (`isDraft: false`), indexing the property on the public catalogue, and recording audit history.
  - **Reject Action:** Enforces mandatory rejection reason (min 5 chars), transitions status to `rejected`, keeps property hidden from public catalogue, and preserves seller submission history.
  - **Request Changes Action:** Enforces mandatory change remarks (min 5 chars), transitions status to `changes_requested` (`isDraft: true`), allowing the seller to edit their listing in the seller dashboard and resubmit for verification.
- **Property Inventory Management (`PropertyManagement.jsx`):** Central directory of all properties across all statuses with search, category/status filters, and administrative lifecycle actions (`under_negotiation`, `sold`, `withdrawn`, `available`).
- **Company-Owned Property Management (`CompanyInventory.jsx`):** Administrative onboarding and editing of `company_owned` assets (distress sales, bank liquidations). Captures `acquisitionCost`, `acquisitionDate`, `internalNotes`, and `privateAddress`. Enforces strict server-side shielding (`select: false`, omitted from `serializePublicProperty`), ensuring company acquisition costs and margins never leak to public buyers or competitor search scrapers.
- **User Governance & Account Safety (`UserManagement.jsx`):** Searchable user directory with submitted listing counters, account suspension/reactivation actions, instant JWT session invalidation via `tokenVersion`, anti-self-suspension guard, and strict omission of password hashes and reset tokens.
- **Lead Enquiries CRM & Site Visits Dispatch (`AdminEnquiries.jsx` & `AdminSiteVisits.jsx`):** Centralized buyer enquiry inbox with disposition updates (`new`, `contacted`, `qualified`, `closed`) and internal advisory notes. Site visit calendar with inspection scheduling, confirmation, rescheduling, and cancellation with recorded reason.
- **Append-Only Audit Trail (`AdminActivityLogs.jsx`):** Central audit logging engine recording every administrative intervention (`AuditLog` Mongoose collection and bounded memory buffer) with admin identity, action type, target ID, reason, and timestamp.
- **Automated Verification:** 76 / 76 Part 12 admin test assertions passing (`server/scripts/testAdmin.js`).

### B. Property Submission System + Cloudinary Integration (Part 11)
- **Direct Signed Cloudinary Upload:** Secure signed upload architecture using official `cloudinary` v2 SDK (`server/config/cloudinary.js`, `server/services/cloudinaryService.js`). Generates time-limited cryptographic upload signatures on the backend, streaming image files directly from client browser to Cloudinary CDN with live progress indicators. Server never holds multipart buffers, and `CLOUDINARY_API_SECRET` is never exposed.
- **Strict Media Validation Defense:** Validates image format (`jpg`, `jpeg`, `png`, `webp`), restricts uploads to 10MB per file and 15 images per property. Rejects Base64 data strings (`data:image/...`), unverified external URLs, and oversized assets.
- **6-Step Guided Submission Wizard (`SubmitProperty.jsx`):**
  - **Step 1 (Basic Info):** Property Title, Category selection, Tagline, and Detailed Description.
  - **Step 2 (Location):** City, Locality/Sector, State, 6-digit Indian PIN Code validator, Landmark, and owner privacy guarantee badge.
  - **Step 3 (Specifications):** Built-up area with unit selector (`sq ft`, `sq yd`, `sq m`, `acres`), BHK, Bathrooms, Reserved Parking, Furnishing, Facing orientation, and 16 luxury amenities toggles.
  - **Step 4 (Pricing):** Asking price in INR with live Crores/Lakhs calculation (`₹X.XX Cr`), negotiable toggle, availability timeline, and brokerage mandate representation agreement.
  - **Step 5 (Showcase Photos):** Drag-and-drop or file selector, thumbnail gallery, cover photo badge selector, deletion, upload queue progress bars (0–100%), and demo photo fallback for local testing.
  - **Step 6 (Review & Submit):** Comprehensive summary card previewing photos, specs, location, and pricing with jump-to-step links, draft saving, and final submission to the curation desk.
- **Draft & Submission Lifecycle:**
  - Initial creation sets `isDraft: true`, `availabilityStatus: 'draft'`, and strictly forces `listingType = 'brokerage'`.
  - Submitting transitions listing to `pending_review` (`isDraft: false`), setting `submittedAt` and locking client edits.
  - Unapproved or pending listings are strictly isolated from the public directory (returning 404 to guests).
- **Seller Inventory Portal Updates (`MyListings.jsx`):** Direct navigation to `/dashboard/listings/new`, "Continue Draft ✎" links to `/dashboard/listings/edit/:id`, "Withdraw Listing" action with status tracking, and Draft status badges.
- **Automated Verification:** 46 / 46 Part 11 backend test suite assertions passing (`scripts/testPropertySubmission.js`).

### B. Unified User Dashboard — Buyer & Seller Portal (Part 10)
- **Unified Identity Architecture:** A single registered account seamlessly supports both buyer and seller actions without bifurcated registration or separate portals.
- **Neumorphic Dashboard Shell (`DashboardLayout.jsx`):** Left navigation sidebar with active state highlights, greeting header with authenticated user's first name, role badge, responsive mobile drawer, and accessible keyboard navigation.
- **Dashboard Overview (`Overview.jsx`):** Live metric cards for Total Inquiries, Upcoming Site Visits, Saved Properties, and My Active Listings. Genuine recent activity feed derived from user interactions; clear zero states when no data is recorded.
- **My Inquiries Tracker (`MyEnquiries.jsx`):** Complete inquiry ledger filtered by status (`Received`, `Contacted`, `In Progress`, `Closed`). Each inquiry card displays property thumbnail, title, reference code (`ENQ-YYYYMMDD-XXXX`), submission date, status badge, message preview, and direct listing link.
- **Site Visits Manager (`SiteVisits.jsx`):** Scheduled escorted property visits split into Upcoming and Past/Cancelled tabs. Displays date, time slot, property info, reference code (`VISIT-YYYYMMDD-XXXX`), and cancellation controls with confirmation modal.
- **Saved Properties (`SavedProperties.jsx`):** Persistent collection of shortlisted properties linked to the user account. Allows quick removal, links directly to property details, and synchronizes globally with `useFavourites()` hook.
- **Recently Viewed Properties (`RecentlyViewed.jsx`):** Automatically logs properties viewed by authenticated users (capped at 20, deduplicated, sorted newest first) with relative timestamp labels.
- **My Listings — Seller Portal (`MyListings.jsx`):** Seller inventory view displaying assets submitted by the authenticated user with status badges (`Verification Pending`, `Active on Portal`, `Under Negotiation`, `Sold`). Informative banner explaining verification and "+ Submit New Property" action pointing to Part 11 wizard.
- **Account Settings & Security (`AccountSettings.jsx`):** Personal profile form (Full Name, 10-digit Indian Mobile) with server-side validation and anti-privilege escalation (role modification strictly blocked). Embedded change password form utilizing Part 9 `tokenVersion` session invalidation.
- **Security & Authorization Protections:** Strict `authenticate` middleware on all `/api/dashboard/*` endpoints. User identity derived exclusively from signed JWT cookie. Strict cross-user data isolation and ABAC ownership enforcement verified by 46 automated tests.

### B. Secure Authentication, Session & Authorization Engine (Part 9)
- **Token & Session Architecture:** JSON Web Tokens signed with server secret, transmitted exclusively via `HttpOnly`, `Secure`, `SameSite=Lax` cookies (`mj_auth_token`). Access tokens strictly omitted from browser storage (`localStorage`/`sessionStorage`) to eliminate XSS token theft.
- **Session Revocation Strategy:** Dynamic `tokenVersion` state on `User` schema. Changing passwords or administrative suspensions instantly invalidates active tokens across all devices.
- **CSRF Defense Engine (`server/middleware/csrf.js`):** Double-Submit synchronizer token pattern via `/api/auth/csrf` and `mj_csrf_token` cookie, validating `x-csrf-token` on mutating requests.
- **Multi-Tier Rate Limiting (`server/middleware/rateLimiter.js`):** Throttling brute force attacks on `/api/auth/login` (10 requests / 15 mins), registration spam (5 accounts / 1 hr), and password reset requests.
- **Password Security:** Salted hashes with `bcryptjs` (12 rounds). Strict password complexity verification (8–64 characters, uppercase, lowercase, numbers, special characters).
- **Authentication Endpoints (`server/routes/authRoutes.js`):**
  - `POST /api/auth/register`: Public unified account registration (forces `role: 'user'`, strictly prevents privilege tampering).
  - `POST /api/auth/login`: Credential validation with generic error responses against account enumeration.
  - `POST /api/auth/logout`: Clears session cookies cleanly.
  - `GET /api/auth/me`: Returns safe user profile DTO.
  - `GET /api/auth/csrf`: Issues CSRF token.
  - `PATCH /api/auth/change-password`: Verifies current password, updates hash, increments token version.
  - `POST /api/auth/forgot-password`: Generates secure SHA-256 token hash with 30-minute expiry; generic privacy response.
  - `POST /api/auth/reset-password`: Validates unexpired token hash and updates credentials.
- **Role-Based & Ownership Guards (`server/middleware/auth.js`):**
  - `authenticate`: Validates JWT, user state, account status (`active`), and token version.
  - `authorizeRoles('admin', 'staff')`: Backend-enforced RBAC protection.
  - `verifyOwnership`: Resource ownership validation ground-work for future property operations.
- **Admin CLI Provisioning (`server/scripts/seedAdmin.js`):** Standalone CLI command `npm run seed:admin` requiring `ADMIN_SEED_SECRET_KEY` and explicit inputs; never hardcodes default passwords.
- **Frontend State Management (`client/src/context/AuthContext.jsx`):** Lightweight React Context handling session bootstrap, login, register, and logout, reflected in `Header.jsx` with user avatar initials, role pills, and route guards (`ProtectedRoute.jsx`, `AdminRoute.jsx`).

### B. Backend REST API & MongoDB Database Foundation (Part 8)
- **Database Engine & Connection (`server/config/database.js`):** Singleton Mongoose connection manager with connection string password masking, fast timeout handling, graceful process termination, and non-crashing behavior when Atlas is offline.
- **Data Models (`server/models/`):**
  - `User.js`: Unified account schema with RBAC roles, contact verification flags, and security projections.
  - `Property.js`: Multi-model schema supporting company-owned inventory and owner brokerage listings, geospatial index, full-text search index, compound filter indexes, and private field projections (`privateAddress`, `owner`, `acquisitionCost`, `internalNotes` strictly excluded from public queries).
  - `Enquiry.js`: Lead tracking records with automated unique reference IDs (`ENQ-YYYYMMDD-XXXX`), contact validation, and status lifecycle.
  - `SiteVisit.js`: Escorted tour booking records with automated unique references (`VISIT-YYYYMMDD-XXXX`), slot selection, and past-date prevention.
- **REST API Endpoints:**
  - `GET /api/health`: Liveness probe.
  - `GET /api/health/ready`: Readiness probe verifying MongoDB Atlas connectivity.
  - `GET /api/properties`: Faceted catalogue browsing with server-side multi-criteria filtering, sorting, pagination, and public DTO projection.
  - `GET /api/properties/:id`: Single property retrieval by MongoDB ObjectId or demo identifier.
  - `GET /api/properties/slug/:slug`: Single property retrieval by canonical SEO slug.
  - `POST /api/enquiries`: Validated lead submission returning unique tracking code.
  - `POST /api/site-visits`: Validated escorted tour scheduling with slot management.
- **Manual Idempotent Seeder (`server/scripts/seedDemoProperties.js`):** `npm run seed:properties` populates MongoDB Atlas (`userData` database) with all 12 demo properties without creating duplicates.
- **Live MongoDB Atlas Audit (`server/scripts/testMongoLiveIntegration.js`):** `npm run test:live --prefix server` executes a 30-step end-to-end integration and security audit against the live MongoDB Atlas cluster.
- **Hybrid Frontend API Client (`client/src/services/api.js`):** Seamless API integration connecting `PropertyListing`, `PropertyDetails`, `PropertyEnquiryCard`, and `SiteVisitModal`, with resilient demo dataset fallback when running in disconnected development mode.

### B. Property Details & Buyer Enquiry Experience (Part 7)
- **Dedicated Details Page (`/properties/:id`):** Immersive, high-trust property landing experience supporting all 12 demo listings with automatic Not-Found handling.
- **Image Gallery & Lightbox (`PropertyGallery.jsx`):** Primary image stage, thumbnail carousel, prev/next arrows, image counter, and fullscreen lightbox modal with keyboard navigation (`Esc`, `ArrowLeft`, `ArrowRight`).
- **Overview & Quick Actions (`PropertyOverview.jsx`):** Price in INR, rate per sq ft, public display address, visual favorite toggle, Web Share API with clipboard copy fallback and toast confirmation, and site visit request trigger.
- **Specifications Grid (`PropertySpecifications.jsx`):** Dynamic specifications (Carpet Area, BHK, Bathrooms, Parking, Furnishing, Floor, Facing, Category) cleanly omitting missing or inapplicable attributes.
- **Description & Taglines (`PropertyDescription.jsx`):** Narrative property overview and highlight tagline banners.
- **Amenities Grid (`PropertyAmenities.jsx`):** Categorized SVG icon grid (Power Backup, Security, Parking, Clubhouse, Pool, etc.).
- **Location & Privacy Banner (`PropertyLocation.jsx`):** Locality overview, static map preview mockup, and MasterJiEstates 100% owner privacy protection disclosure.
- **Buyer Enquiry Card (`PropertyEnquiryCard.jsx`):** Sticky form with client validation (Name, Email, 10-digit Indian Mobile `+91`, Message, Consent), simulated reference ID (`ENQ-DEMO-XXXX`), and zero local storage of personal data.
- **Site Visit Scheduler (`SiteVisitModal.jsx`):** Modal dialog with past-date blocking (`min` date attribute + validation), preferred time slots, and simulated booking reference (`VISIT-DEMO-XXXX`).
- **Similar Properties (`SimilarProperties.jsx`):** Recommends 3 related properties from matching categories/cities while strictly excluding the current listing.
- **Mobile Sticky Action Bar:** Bottom bar with price and quick "Enquire" and "Visit" conversion buttons on mobile viewports.

### B. Property Catalogue & Discovery Engine (Part 6)
- **Directory Page (`/properties`):** Dedicated public catalogue displaying illustrative demo properties with multi-criteria faceted filtering, deterministic sorting, and client-side pagination.
- **Faceted Filters (`PropertyFilters.jsx` + `PropertyFilterDrawer.jsx`):** Location, Category, Listing Classification (`MasterJi Direct` vs `Brokerage`), Budget (presets + custom inputs), Bedrooms (1 BHK–5+ BHK), Area, and Availability Status.
- **Dual Layout Modes:** Responsive Grid View (3 cols desktop, 2 cols tablet, 1 col mobile) and List View.
- **Sorting Options:** Recommended, Price (Low-to-High / High-to-Low), Area (Largest/Smallest).
- **URL Parameter Synchronization:** Full URL synchronization (`?city=...&category=...&minPrice=...&sort=...&page=...`) using `usePropertyFilters`.

### C. Homepage & Brand Landing Experience (Part 5)
- **Header (`Header.jsx`):** Sticky navigation bar with `MJ` brand emblem, desktop nav links, mobile drawer, Sign In (`/login`), and List Property (`/register`).
- **Hero Section (`HeroSection.jsx`):** Architectural headline *"Find the Right Property. Build Your Future."*, value proposition, dual CTAs, and integrated multi-tab `PropertySearchBar` navigating to `/properties` with query params.
- **Property Categories (`PropertyCategories.jsx`):** 5 core Indian property segments linking directly to filtered views on `/properties`.
- **Featured Listings (`FeaturedProperties.jsx`):** Showcase of 4 featured properties with data integrity tags.
- **Why Choose Us (`WhyChooseUs.jsx`):** 4 genuine pillars (Guided Journey, Owner Privacy Protection, Direct Inventory, Physical Verification).
- **How It Works (`HowItWorks.jsx`):** 3-step structured timeline (Explore, Schedule Site Visit, Transact Securely).
- **Buyer & Seller Unified CTA (`BuyerSellerCTA.jsx`):** Explaining that one account handles both buying and selling.
- **Corporate Footer (`Footer.jsx`):** 5-column navigation, corporate contact details, and RERA regulatory disclaimer.

### D. Authentication Experiences (Part 4)
- **Login (`/login`):** Split-screen layout with email, password show/hide toggle, remember me checkbox, forgot password link, primary Sign In button, and Google auth visual button.
- **Registration (`/register`):** Unified buyer and seller account registration with full name, email, 10-digit Indian phone (`+91`), password strength criteria checklist, confirm password, and terms checkbox.
- **Forgot Password (`/forgot-password`):** Account recovery screen with email validation and simulated single-use 30-minute recovery dispatch state.

---

## 4. Current Project Folder Structure

```
MasterJiEstates/
├── documentation/               # 15 Architectural Blueprints + Milestone Reports
│   ├── PROJECT_OVERVIEW.md
│   ├── BUSINESS_REQUIREMENTS.md
│   ├── FUNCTIONAL_REQUIREMENTS.md
│   ├── NON_FUNCTIONAL_REQUIREMENTS.md
│   ├── USER_ROLES_AND_PERMISSIONS.md
│   ├── WEBSITE_SITEMAP.md
│   ├── BUSINESS_WORKFLOWS.md
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── DATABASE_SCHEMA_PLAN.md
│   ├── API_ARCHITECTURE.md
│   ├── SECURITY_ARCHITECTURE.md
│   ├── UI_UX_DESIGN_GUIDELINES.md
│   ├── FOLDER_STRUCTURE.md
│   ├── DEVELOPMENT_ROADMAP.md
│   ├── OPEN_QUESTIONS_AND_ASSUMPTIONS.md
│   ├── PART_2_SETUP_REPORT.md
│   ├── PART_3_DESIGN_SYSTEM_REPORT.md
│   ├── PART_4_AUTH_UI_REPORT.md
│   ├── PART_5_HOMEPAGE_REPORT.md
│   ├── PART_6_PROPERTY_DIRECTORY_REPORT.md
│   └── PART_7_PROPERTY_DETAILS_REPORT.md # Part 7 verification & testing log
│
├── client/                      # React SPA Frontend (Vite)
│   ├── public/
│   │   └── logo.svg             # Platform emblem
│   ├── src/
│   │   ├── assets/ (.gitkeep)   # Static media assets
│   │   ├── components/
│   │   │   ├── auth/            # Authentication UI components
│   │   │   │   ├── AuthLayout.jsx
│   │   │   │   ├── AuthVisualPanel.jsx
│   │   │   │   ├── PasswordInput.jsx
│   │   │   │   └── GoogleAuthButton.jsx
│   │   │   ├── home/            # Homepage section components
│   │   │   │   ├── BuyerSellerCTA.jsx
│   │   │   │   ├── FeaturedProperties.jsx
│   │   │   │   ├── FinalCTA.jsx
│   │   │   │   ├── HeroSection.jsx
│   │   │   │   ├── HowItWorks.jsx
│   │   │   │   ├── PropertyCard.jsx
│   │   │   │   ├── PropertyCategories.jsx
│   │   │   │   ├── PropertySearchBar.jsx
│   │   │   │   ├── ServicesSection.jsx
│   │   │   │   ├── TrustSection.jsx
│   │   │   │   └── WhyChooseUs.jsx
│   │   │   ├── layout/          # Layout components
│   │   │   │   ├── Header.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── properties/      # Property Directory components (Part 6)
│   │   │   │   ├── ActiveFilterChips.jsx
│   │   │   │   ├── PropertyCard.jsx
│   │   │   │   ├── PropertyFilterDrawer.jsx
│   │   │   │   ├── PropertyFilters.jsx
│   │   │   │   ├── PropertyPagination.jsx
│   │   │   │   ├── PropertyResults.jsx
│   │   │   │   ├── PropertySearchBar.jsx
│   │   │   │   └── PropertySort.jsx
│   │   │   ├── property-details/# Property Details components (Part 7)
│   │   │   │   ├── PropertyAmenities.jsx
│   │   │   │   ├── PropertyBreadcrumbs.jsx
│   │   │   │   ├── PropertyDescription.jsx
│   │   │   │   ├── PropertyEnquiryCard.jsx
│   │   │   │   ├── PropertyGallery.jsx
│   │   │   │   ├── PropertyLocation.jsx
│   │   │   │   ├── PropertyOverview.jsx
│   │   │   │   ├── PropertySpecifications.jsx
│   │   │   │   ├── SimilarProperties.jsx
│   │   │   │   └── SiteVisitModal.jsx
│   │   │   └── ui/              # Reusable UI component library
│   │   │       ├── Button.jsx
│   │   │       ├── Input.jsx
│   │   │       ├── Card.jsx
│   │   │       ├── Badge.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── Loader.jsx
│   │   │       ├── EmptyState.jsx
│   │   │       ├── SectionHeading.jsx
│   │   │       ├── Container.jsx
│   │   │       ├── Divider.jsx
│   │   │       └── index.js
│   │   ├── data/
│   │   │   └── demoProperties.js# 12 illustrative demo listings with multi-image arrays
│   │   ├── hooks/
│   │   │   └── usePropertyFilters.js # Reactive URL search params filter hook
│   │   ├── pages/
│   │   │   ├── auth/            # Authentication pages
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── ForgotPassword.jsx
│   │   │   ├── properties/      # Property pages (Part 6 & 7)
│   │   │   │   ├── PropertyListing.jsx
│   │   │   │   └── PropertyDetails.jsx
│   │   │   ├── Home.jsx         # Master Homepage
│   │   │   └── DesignSystemShowcase.jsx # Interactive design gallery
│   │   ├── layouts/ (.gitkeep)  # Page layout shells
│   │   ├── features/ (.gitkeep) # Feature modules
│   │   ├── services/ (.gitkeep) # API client layer
│   │   ├── context/ (.gitkeep)  # Global React contexts
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx    # Client route tree (/, /properties, /properties/:id, etc.)
│   │   ├── theme/
│   │   │   ├── designTokens.js  # Color, shadow, radius tokens
│   │   │   ├── theme.js         # MUI Theme & Emotion cache configuration
│   │   │   └── animations.js    # GSAP animation presets
│   │   ├── styles/
│   │   │   └── globals.css      # Tailwind directives, CSS variables & utilities
│   │   ├── utils/ (.gitkeep)    # Formatters & utilities
│   │   ├── App.jsx              # App entry with ThemeProvider & BrowserRouter
│   │   └── main.jsx             # React DOM root entry
│   ├── .env.example             # Frontend environment documentation
│   ├── index.html               # HTML5 template with SEO & Open Graph meta
│   ├── package.json             # Frontend dependency manifest
│   ├── postcss.config.js        # PostCSS configuration
│   ├── tailwind.config.js       # Tailwind theme & design tokens
│   └── vite.config.js           # Vite build config with vendor code-splitting & /api proxy
│
├── server/                      # Node.js Express REST API
│   ├── config/
│   │   └── corsOptions.js       # CORS origin validator
│   ├── controllers/ (.gitkeep)  # Future controller handlers
│   ├── middleware/
│   │   ├── errorHandler.js      # Central error handling
│   │   └── notFoundHandler.js   # 404 handler for undefined routes
│   ├── models/ (.gitkeep)       # Future Mongoose schemas
│   ├── routes/
│   │   └── healthRoutes.js      # GET /api/health implementation
│   ├── services/ (.gitkeep)     # Future business services
│   ├── validators/ (.gitkeep)   # Future Joi/Zod validators
│   ├── utils/ (.gitkeep)        # Future backend utilities
│   ├── scripts/ (.gitkeep)      # Future CLI scripts
│   ├── .env.example             # Backend environment documentation
│   ├── app.js                   # Express application setup
│   ├── package.json             # Backend dependency manifest
│   └── server.js                # Server entry point with graceful shutdown
│
├── .env.example                 # Root environment template
├── .gitignore                   # Universal Git exclusion rules
├── package.json                 # Monorepo development scripts
└── README.md                    # Master Project Documentation
```

---

## 5. Prerequisites & Installation

```bash
# Clone the repository and install all dependencies:
npm run install:all
```

---

## 6. How to Run the Project

```bash
# Run both Backend API (:5000) and Frontend SPA (:5173):
npm run dev
```

### Available Client Routes:
- `http://localhost:5173/` — Master Homepage & Brand Landing Experience
- `http://localhost:5173/properties` — Property Catalogue & Faceted Search Directory
- `http://localhost:5173/properties/demo-001` — Full Property Details & Buyer Enquiry Experience
- `http://localhost:5173/dashboard` — Unified User Dashboard Overview (Protected)
- `http://localhost:5173/dashboard/enquiries` — My Inquiries Tracker (Protected)
- `http://localhost:5173/dashboard/site-visits` — Scheduled Site Visits & Cancellation (Protected)
- `http://localhost:5173/dashboard/favourites` — Saved Properties Portfolio (Protected)
- `http://localhost:5173/dashboard/recently-viewed` — Recently Viewed Properties (Protected)
- `http://localhost:5173/dashboard/listings` — My Seller Listings Inventory (Protected)
- `http://localhost:5173/dashboard/listings/new` — Multi-Step Property Submission Wizard (Protected)
- `http://localhost:5173/dashboard/listings/edit/:id` — Property Draft Editor (Protected)
- `http://localhost:5173/dashboard/settings` — Account Profile & Password Settings (Protected)
- `http://localhost:5173/admin` — Back-Office Operational Overview & KPI Dashboard (Admin Protected)
- `http://localhost:5173/admin/business` — Business Operations Overview & Financial KPIs (Admin Protected)
- `http://localhost:5173/admin/business/deals` — Brokerage Deals Pipeline & Lifecycle (Admin Protected)
- `http://localhost:5173/admin/business/deals/:id` — Brokerage Deal Details, Terms & Payment Ledger (Admin Protected)
- `http://localhost:5173/admin/business/commission-ledger` — Global Commission Payment Ledger & Reversals (Admin Protected)
- `http://localhost:5173/admin/business/company-properties` — Company-Owned Property Financials & CapEx (Admin Protected)
- `http://localhost:5173/admin/business/expenses` — General Business Operating Expenses (Admin Protected)
- `http://localhost:5173/admin/business/reports` — Financial Analytics, Pipeline Distribution & CSV Exports (Admin Protected)
- `http://localhost:5173/admin/content` — Content Management, Allied Services & Inquiries Inbox (Admin Protected)
- `http://localhost:5173/admin/moderation` — Property Moderation Queue (Admin Protected)
- `http://localhost:5173/admin/moderation/:id` — Detailed Property Review & Verification Sheet (Admin Protected)
- `http://localhost:5173/admin/properties` — All-Property Directory & Lifecycle Management (Admin Protected)
- `http://localhost:5173/admin/company-inventory` — Company-Owned Proprietary Asset Manager (Admin Protected)
- `http://localhost:5173/admin/users` — User Directory, Role & Account Safety Controls (Admin Protected)
- `http://localhost:5173/admin/enquiries` — Buyer Inquiries CRM & Disposition Inbox (Admin Protected)
- `http://localhost:5173/admin/site-visits` — Physical Site Visits Schedule & Dispatch (Admin Protected)
- `http://localhost:5173/admin/activity-logs` — Append-Only Administrative Audit Trail (Admin Protected)
- `http://localhost:5173/about` — About Us, Company Identity & Real Estate Philosophy
- `http://localhost:5173/services` — Real Estate & Allied Home Services Hub
- `http://localhost:5173/contact` — Interactive Contact Form & Headquarters Desk
- `http://localhost:5173/faq` — Categorized Knowledge Base & FAQ Directory
- `http://localhost:5173/privacy-policy` — Statutory Privacy Policy (DPDP Compliance Awareness)
- `http://localhost:5173/terms-and-conditions` — Terms of Use & Due Diligence Disclaimers
- `http://localhost:5173/disclaimer` — Statutory Real Estate Disclaimers
- `http://localhost:5173/brokerage-policy` — Brokerage Mandate & Fee Policies
- `http://localhost:5173/cookie-policy` — Essential Cookies Policy
- `http://localhost:5173/login` — Split-Screen Login Page
- `http://localhost:5173/register` — Unified Registration Page (Buyer & Seller)
- `http://localhost:5173/forgot-password` — Password Recovery Page
- `http://localhost:5173/design-system` — UI/UX Design System Showcase

---

## 7. 15-Part Phased Development Roadmap

- [x] **Part 1: Project Architecture & Planning** *(Completed)*
- [x] **Part 2: Project Setup & Workspace Scaffolding** *(Completed)*
- [x] **Part 3: Global UI/UX Design System & Styling Foundations** *(Completed)*
- [x] **Part 4: Login & Registration (Split-Screen UI)** *(Completed)*
- [x] **Part 5: Homepage & Brand Landing Experience** *(Completed)*
- [x] **Part 6: Property Catalogue & Discovery Engine** *(Completed)*
- [x] **Part 7: Property Details View & Lead Enquiry Modals** *(Completed)*
- [x] **Part 8: Backend REST API & Database Foundation** *(Completed)*
- [x] **Part 9: Secure Authentication, Session & Authorization Engine** *(Completed)*
- [x] **Part 10: Unified User Dashboard (Buyer & Seller Portal)** *(Completed)*
- [x] **Part 11: Multi-Step Property Submission System + Cloudinary Integration** *(Completed)*
- [x] **Part 12: Administrative Back-Office Portal (Moderation & CMS)** *(Completed)*
- [x] **Part 13: Business Operations & Financial Ledgers** *(Completed)*
- [x] **Part 14: Additional Services, Company Pages & Legal Disclaimers** *(Completed)*
- [x] **Part 15: End-to-End Testing, Optimization & Production Deployment** *(Completed)*

---

## 8. Current Development Status

- **Current Phase:** **Part 15 Completed — 15 of 15 Milestones Achieved (ROADMAP COMPLETE).**
- **Readiness Classification:** **State B: Deployment Ready — Manual Configuration Required.**
- **Application Status:** Full-stack enterprise platform is completely implemented, hardened, and optimized. Frontend bundle optimized from 644 kB to 74 kB with `React.lazy()` dynamic chunking, branded 404 page, static `robots.txt`, and `sitemap.xml`. Backend API features fail-safe production database guards, signed Cloudinary media integration, CSRF double-submit protection, RBAC/ABAC access controls, OWASP CSV formula injection defenses, and telemetry health probes (`/api/health`, `/api/health/ready`). Operational documentation provided in `documentation/PRODUCTION_RUNBOOK.md` and `documentation/PART_15_FINAL_TESTING_DEPLOYMENT_REPORT.md`.
- **Verification Gates Passed:**
  - Part 9 Auth & Security: **38 / 38 passed**
  - Part 10 Unified User Dashboard: **46 / 46 passed**
  - Part 11 Property Submission & Cloudinary: **46 / 46 passed**
  - Part 12 Admin Back-Office Portal: **76 / 76 passed**
  - Part 13 Business Operations & Financials: **110 / 110 passed**
  - Part 14 Company Pages & Legal Policies: **63 / 63 passed**
  - Part 15 Comprehensive E2E Production Suite: **70 / 70 passed**
  - **Master Test Suite:** **449 / 449 total automated tests passed (100% pass rate)**
  - **Client Production Build:** **482 modules transformed, 0 errors, built in 6.36s**
