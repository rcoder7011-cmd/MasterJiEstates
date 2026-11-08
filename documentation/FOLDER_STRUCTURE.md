# MasterJiEstates — Project Directory & Codebase Architecture

---

## 1. High-Level Repository Architecture

MasterJiEstates adopts a clean, decoupled monorepo layout separating documentation, frontend client application, and backend API services.

```
MasterJiEstates/
├── documentation/               # Complete Architectural Blueprints (15 documents)
├── client/                      # React SPA Frontend Application
├── server/                      # Node.js + Express REST API Backend
├── .gitignore                   # Universal Git ignore rules
└── README.md                    # Project Introduction & Engineering Index
```

> **Planning Note:** In accordance with the Part 1 mandate, the application directories (`client/` and `server/`) represent the **prescribed architecture** and are initialized during **Part 2 (Project Setup)**.

---

## 2. Detailed Frontend Architecture (`client/`)

```
client/
├── public/                      # Static uncompiled assets
│   ├── favicon.ico              # Platform favicon
│   ├── logo.svg                 # MasterJiEstates vector emblem
│   ├── robots.txt               # Crawler directives
│   └── sitemap.xml              # Dynamic or pre-rendered XML sitemap
│
├── src/
│   ├── assets/                  # Bundled static media (vector icons, fallback graphics)
│   │   ├── images/              # Brand hero graphics, watermark templates
│   │   └── icons/               # SVG icon sprites
│   │
│   ├── components/              # Shared reusable UI primitives
│   │   ├── common/              # Buttons, inputs, modal dialogs, loading skeletons
│   │   ├── layout/              # Header, footer, breadcrumbs, sidebar containers
│   │   ├── feedback/            # Toasts, alerts, confirmation dialogs
│   │   └── data-display/        # Badges, metric cards, price tags, table wrappers
│   │
│   ├── layouts/                 # Page layout shells
│   │   ├── MainLayout.jsx       # Public navigation & footer shell
│   │   ├── AuthLayout.jsx       # Split-screen authentication shell
│   │   ├── DashboardLayout.jsx  # Neumorphic user dashboard shell
│   │   └── AdminLayout.jsx      # High-density administrative operations shell
│   │
│   ├── pages/                   # Top-level view components (Page routes)
│   │   ├── public/              # Home, Properties, PropertyDetail, About, Services, Contact, Legal
│   │   ├── auth/                # Login, Register, ForgotPassword, ResetPassword
│   │   ├── dashboard/           # User Overview, Favourites, MyEnquiries, SiteVisits, MyProperties, AddProperty
│   │   └── admin/               # Admin Overview, ApprovalsQueue, AllProperties, LeadsCRM, DealsLedger, CapExTracker
│   │
│   ├── features/                # Domain-specific feature modules
│   │   ├── properties/          # Filter drawer, property cards, photo gallery, specs tables
│   │   ├── enquiries/           # Enquiry modal, lead status pills, agent response cards
│   │   ├── siteVisits/          # Date/time slot selector, visit status tracker
│   │   └── adminOperations/     # Moderation review drawer, CapEx entry modal, commission calculator
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.js           # Access to AuthContext and session state
│   │   ├── useProperties.js     # Property fetching, caching, and filter syncing
│   │   ├── useDebounce.js       # Search input debouncing
│   │   └── useMediaQuery.js     # Responsive screen breakpoint queries
│   │
│   ├── services/                # API client HTTP abstraction (Axios instances)
│   │   ├── api.js               # Central axios instance with credentials & interceptors
│   │   ├── authService.js       # Login, register, logout, profile calls
│   │   ├── propertyService.js   # Public and private property endpoints
│   │   ├── enquiryService.js    # Enquiry submissions and lead status updates
│   │   └── adminService.js      # Moderation, deals, commissions, and CapEx calls
│   │
│   ├── context/                 # React Context global state providers
│   │   ├── AuthContext.jsx      # Current user identity, login/logout handlers
│   │   ├── FilterContext.jsx    # Catalogue search parameters and active filters
│   │   └── UIContext.jsx        # Toast notifications, modal states, mobile sidebar toggle
│   │
│   ├── routes/                  # Route configuration & route guards
│   │   ├── AppRoutes.jsx        # Complete React Router v6 route tree
│   │   ├── ProtectedRoute.jsx   # Auth guard for registered users
│   │   └── AdminRoute.jsx       # Role guard enforcing `role === 'admin'`
│   │
│   ├── theme/                   # Theme configuration & design system tokens
│   │   ├── muiTheme.js          # Material UI palette, typography, and component overrides
│   │   └── animations.js        # GSAP timeline presets and scroll trigger setups
│   │
│   ├── styles/                  # Global CSS styles
│   │   ├── globals.css          # Tailwind base, components, and utilities
│   │   └── neumorphism.css      # Custom Neumorphic shadow classes and Liquid Glass rules
│   │
│   ├── utils/                   # Helper utility functions
│   │   ├── currencyFormatter.js # INR currency formatting (Lakhs & Crores: ₹1.25 Cr)
│   │   ├── dateFormatter.js     # Indian standard date and relative time formats
│   │   └── slugify.js           # Title-to-slug transformation helper
│   │
│   ├── App.jsx                  # Root application component
│   └── main.jsx                 # Client entry point
│
├── package.json                 # Frontend dependencies (React, Tailwind, MUI, GSAP, Axios)
├── tailwind.config.js           # Tailwind theme extension & color tokens
├── postcss.config.js            # PostCSS configuration
└── vite.config.js               # Vite build configuration & path aliases
```

---

## 3. Detailed Backend Architecture (`server/`)

```
server/
├── config/                      # Environment & infrastructure configuration
│   ├── db.js                    # MongoDB Atlas Mongoose connection & pool settings
│   ├── cloudinary.js            # Cloudinary API credentials & upload presets
│   └── corsOptions.js           # Allowed origin list and credential options
│
├── controllers/                 # Request/Response orchestration controllers
│   ├── authController.js        # Register, login, logout, password reset
│   ├── userController.js        # Profile management and user preferences
│   ├── propertyController.js    # Public catalogue, filters, slug lookup
│   ├── userPropertyController.js# Seller submission, updates, withdrawal
│   ├── enquiryController.js     # Public enquiries and lead management
│   ├── siteVisitController.js   # Site visit requests and dispatch logs
│   ├── favouriteController.js   # Favourites bookmarking toggle
│   ├── notificationController.js# System alert dispatch and reads
│   ├── adminPropertyController.js# Approvals queue, approve, reject, feature
│   ├── adminUserController.js   # User directory and suspensions
│   ├── dealController.js        # Closed deals and commission ledger
│   ├── portfolioController.js   # Company-owned asset purchases, CapEx, profits
│   ├── analyticsController.js   # Executive charts and business KPIs
│   └── contentController.js     # CMS settings, banners, partner services
│
├── models/                      # Mongoose data models & schemas
│   ├── User.js                  # User schema with bcrypt hooks and role enums
│   ├── Property.js              # Property schema with category specs and compound indexes
│   ├── Enquiry.js               # Inbound lead schema and notes array
│   ├── Favourite.js             # User favorite reference schema
│   ├── SiteVisit.js             # Site visit schedule and feedback schema
│   ├── Notification.js          # In-app alerts schema
│   ├── Deal.js                  # Final transaction closing records
│   ├── Commission.js            # Brokerage commission ledger schema
│   ├── Purchase.js              # Confidential company purchase cost schema
│   ├── Expense.js               # CapEx itemized records schema
│   ├── PropertyDocument.js      # Legal document scans and verification state
│   ├── AuditLog.js              # Administrative audit trail schema
│   └── WebsiteSetting.js        # CMS singleton schema
│
├── routes/                      # Modular Express route routers
│   ├── authRoutes.js            # /api/v1/auth
│   ├── userRoutes.js            # /api/v1/users
│   ├── propertyRoutes.js        # /api/v1/properties
│   ├── userPropertyRoutes.js    # /api/v1/user/properties
│   ├── enquiryRoutes.js         # /api/v1/enquiries
│   ├── siteVisitRoutes.js       # /api/v1/site-visits
│   ├── favouriteRoutes.js       # /api/v1/favourites
│   ├── notificationRoutes.js    # /api/v1/notifications
│   ├── adminRoutes.js           # Aggregated /api/v1/admin/* routes
│   └── contentRoutes.js         # /api/v1/content
│
├── middleware/                  # Custom Express middleware
│   ├── authenticate.js          # JWT verification from HttpOnly cookie
│   ├── authorize.js             # RBAC role enforcement (`authorize('admin')`)
│   ├── verifyOwnership.js       # ABAC object ownership validator (Anti-IDOR)
│   ├── validate.js              # Joi/Zod payload validation middleware
│   ├── rateLimiter.js           # Multi-tiered express-rate-limit instances
│   ├── sanitize.js              # Anti-XSS and Mongo sanitization
│   └── errorHandler.js          # Centralized error handling middleware
│
├── services/                    # Reusable business logic & third-party integrations
│   ├── tokenService.js          # JWT signing, cookie attachment, token hashing
│   ├── emailService.js          # Transactional email delivery (templates & gateway)
│   ├── mediaService.js          # Cloudinary signature generation & deletion
│   ├── auditService.js          # Structured audit log recorder
│   └── calculationService.js    # Brokerage commission and net ROI calculations
│
├── validators/                  # Request payload validation schemas (Joi / Zod)
│   ├── authValidator.js         # Registration, login, password schemas
│   ├── propertyValidator.js     # Category-specific property validation schemas
│   └── enquiryValidator.js      # Lead submission and site visit schemas
│
├── utils/                       # Shared utility functions
│   ├── apiResponse.js           # Standard success/error response helpers
│   ├── apiError.js              # Custom operational error class
│   └── slugGenerator.js         # Unique SEO slug generator
│
├── scripts/                     # Operational CLI scripts
│   └── seedAdmin.js             # Secure CLI tool for initial admin bootstrapping
│
├── server.js                    # Express application setup & middleware assembly
├── index.js                     # HTTP server startup & graceful shutdown lifecycle
└── package.json                 # Backend dependencies (Express, Mongoose, bcrypt, etc.)
```

---

## 4. Architectural Rationale for Directory Decisions

1. **Clear Separation of Public vs Administrative Surfaces:** Grouping admin controllers and routes into distinct modules (`adminPropertyController.js`, `dealController.js`) ensures zero accidental exposure of private financial fields to public property queries.
2. **Feature Modularity on Frontend:** The `features/` directory isolates complex business logic (such as multi-step property submission or moderation drawers) from generic presentation components (`components/common`), keeping components small, testable, and reusable.
3. **Dedicated `scripts/` Directory:** Housing `seedAdmin.js` separately from the application runtime guarantees that privileged administrative bootstrapping cannot be triggered via incoming HTTP requests.

