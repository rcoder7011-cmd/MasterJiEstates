# MasterJi Estates Mobile & Backend — Final Authentication, OTP, Password & Contact Setup Report

> **Project**: MasterJi Estates React Native Expo Mobile App (`mobile/`) & Express REST API (`server/`)  
> **Target Production API**: `https://api.masterjiestates.in/api`  
> **Report Timestamp**: 2026-11-11  
> **Overall Status**: **VERIFIED & READY (100% Pass across all 20 Scenarios + 12 Regression Suites)**

---

## 1. Executive Summary & Status Dashboard

| Component / Requirement | Status | Summary |
| :--- | :--- | :--- |
| **A. Signup Flow (Mobile & Email + Password + OTP)** | **IMPLEMENTED & VERIFIED** | Account is created strictly *after* successful OTP verification. Password strength and duplicate checks enforced before dispatch. |
| **B. Login Flow (Password Only, NO OTP)** | **IMPLEMENTED & VERIFIED** | Direct authentication using Mobile + Password OR Email + Password. Never sends or requires OTP. Generic 401 error. |
| **C. Password System & Strength Validation** | **IMPLEMENTED & VERIFIED** | 8–64 chars, $\ge 1$ uppercase, $\ge 1$ lowercase, $\ge 1$ number, $\ge 1$ special symbol. Bcrypt (12 rounds) salted hashing. Show/hide toggle. |
| **D. Forgot Password Recovery** | **IMPLEMENTED & VERIFIED** | Single-use 6-digit OTP verification bound to registered contact. Secure tokenVersion invalidation across sessions. |
| **E. MSG91 SMS Gateway Integration** | **IMPLEMENTED / CONFIGURATION REQUIRED** | Native MSG91 Send OTP API integrated on server. Dev simulation active while MSG91 KYC & DLT template verification is pending. |
| **F. Resend Email Gateway Integration** | **IMPLEMENTED / CONFIGURATION REQUIRED** | Resend REST API integrated with MasterJi Estates branded HTML emails. Dev simulation active when `RESEND_API_KEY` is not set. |
| **G. Development vs Production OTP Security** | **IMPLEMENTED & VERIFIED** | In dev: clearly labelled test OTP logging. In production: strict rejection (503) if provider credentials missing; zero hardcoded bypasses. |
| **H. Centralized Official Contact Numbers** | **IMPLEMENTED & VERIFIED** | Call: `+91 9990316186` (`tel:+919990316186`). WhatsApp: `+91 7011202089` (`https://wa.me/917011202089`). Centralized in `contact.ts`. |
| **I. Test Suites & Bundler Verification** | **VERIFIED** | 20 / 20 Scenarios passed (100%). Regression Suites 1–12 passed (100%). TypeScript 0 errors. ESLint 0 warnings. Hermes Android/iOS export clean. |

---

## 2. Authentication Flow Breakdown

### A. Signup Flow — OTP + Password Required
- **Two Signup Paths**:
  1. Continue with Mobile Number
  2. Continue with Email / Gmail
- **Flow Details**:
  - The customer enters **Full Name** ($\ge 2$ characters), **Contact Identifier** (10-digit Indian Mobile `[6-9]\d{9}` or RFC-compliant Email), **Password**, and **Confirm Password**.
  - **Duplicate Check**: The server normalizes the contact and inspects existing database records. If already registered, it returns `HTTP 409 Conflict` before dispatching any OTP.
  - **OTP Dispatch**: A 6-digit cryptographically secure OTP (`crypto.randomInt(100000, 999999)`) is generated, hashed via SHA-256, and sent **strictly to the selected contact method**. Mobile receives SMS only; Email receives Email only.
  - **Verification**: The customer enters the 6-digit code.
  - **Account Creation**: The backend validates the OTP hash (constant-time comparison, max 5 attempts, 5-minute expiry). Only upon success is the password hashed via `bcrypt` (12 rounds) and the `User` document created with `role: 'user'` and verified flags.

### B. Login Flow — Password Only, NO OTP
- **Two Login Paths**:
  1. Mobile Number + Password
  2. Email / Gmail + Password
- **Strict Rules Applied**:
  - **NO OTP**: Normal login never triggers OTP dispatch and never requires OTP input.
  - **No Auto-Registration**: Only existing, verified user accounts can log in. Unknown identifiers are rejected.
  - **Generic Error Responses**: Rejection returns `"Invalid mobile number/email or password."` to prevent user account enumeration.
  - **Session Issuance**: Generates standard multi-audience JWT signed with `JWT_SECRET`, returned to mobile for Bearer storage in Expo `SecureStore`, alongside HTTP-only session cookies.

### C. Password System & Recovery
- **Strength Policy**:
  - Minimum 8 characters, maximum 64 characters.
  - At least 1 uppercase letter (`[A-Z]`).
  - At least 1 lowercase letter (`[a-z]`).
  - At least 1 numeric digit (`[0-9]`).
  - At least 1 special character (`[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]`).
- **Client UX**: Real-time visual criteria checklist + show/hide visibility toggle on both Password and Confirm Password fields.
- **Forgot Password**: Screen at `mobile/app/auth/forgot-password.tsx`. Sends recovery OTP to registered mobile or email. Upon verification, updates password and increments `tokenVersion`, instantly invalidating any compromised active sessions.

---

## 3. SMS & Email Provider Integrations

### SMS Gateway: MSG91
- **Current Status**: Account registered; business document KYC and DLT template registration are pending approval.
- **Implementation**: Dedicated backend service `server/services/smsService.js` utilizing MSG91 Send OTP API (`https://control.msg91.com/api/v5/otp`).
- **Configuration Keys**:
  - `MSG91_AUTH_KEY`: MSG91 API authentication key.
  - `MSG91_TEMPLATE_ID`: DLT-registered transactional template ID.
  - `MSG91_SENDER_ID`: 6-character registered sender header (e.g. `MJESTT`).
  - `MSG91_OTP_EXPIRY_MINUTES`: Expiry duration (5 minutes).
- **Environment Handling**:
  - **Development**: When credentials are missing, logs `[MJ Estates MSG91] [DEV MODE - KYC Pending] Dev OTP for <phone>: <otp>` and informs the mobile client of development simulation mode.
  - **Production**: Strictly throws `HTTP 503 Service Unavailable`:  
    `"SMS gateway is pending MSG91 KYC verification and credential configuration. Real SMS delivery requires MSG91 KYC approval and valid credentials."`

### Email Gateway: Resend (Free Plan)
- **Current Status**: Backend REST integration complete. Free API key and sender email configuration required.
- **Implementation**: Dedicated backend service `server/services/emailService.js` calling Resend API (`https://api.resend.com/emails`).
- **Branded Email Template**: High-contrast, responsive HTML template featuring MasterJi Estates Navy (`#0F172A`) and Brand Gold (`#D4AF37`) palette, 6-digit bold letterspaced OTP, 5-minute expiry notice, and anti-phishing security advisory.
- **Configuration Keys**:
  - `RESEND_API_KEY`: API key from [resend.com](https://resend.com).
  - `RESEND_FROM_EMAIL`: Sender address (default: `MasterJi Estates <onboarding@resend.dev>` or custom verified domain).
- **Environment Handling**:
  - **Development**: When `RESEND_API_KEY` is not set, logs `[MJ Estates Resend] [DEV MODE] Dev OTP for <email>: <otp>`.
  - **Production**: Rejects with `HTTP 503` explaining the missing configuration.

---

## 4. Centralized Official Business Contact Numbers

All business contact details have been centralized in `mobile/src/constants/contact.ts` and re-exported through `mobile/src/services/contactService.ts`.

| Channel | Official Number / Detail | Normalized / Raw Value | Purpose |
| :--- | :--- | :--- | :--- |
| **CALL** | `+91 9990316186` | `tel:+919990316186` | Direct phone consultations and inquiries |
| **WHATSAPP** | `+91 7011202089` | `917011202089` | Contextual WhatsApp inquiries via `https://wa.me/917011202089` |
| **EMAIL** | `contact@masterjiestates.in` | `mailto:contact@masterjiestates.in` | Official written customer support |
| **OFFICE** | `Sector 66, Gurugram, Haryana` | NCR Service Region | Head office location display |

### Verified Codebase Updates:
- `mobile/src/constants/contact.ts`: Central source of truth for `OFFICIAL_CONTACT` and `buildWhatsAppUrl`.
- `mobile/src/services/contactService.ts`: Uses `OFFICIAL_CONTACT` and provides native `callSupport()` and `openWhatsAppSupport()`.
- `mobile/src/components/property-details/PropertyContactBar.tsx`: 1-tap call dials `+91 9990316186`; WhatsApp opens `https://wa.me/917011202089?text=...`.
- `mobile/src/constants/propertyCategories.ts`: Updated `CONTACT_CONFIG` to reference official numbers.
- `mobile/src/components/home/QuickContact.tsx`: Call dials `+91 9990316186`; WhatsApp chats with `917011202089`.
- `mobile/app/property/sell.tsx`: Advisory Call dials `+91 9990316186`; WhatsApp chats with `917011202089`.
- `mobile/app/(tabs)/profile.tsx`: Contact modal verified for `+91 9990316186` and `+91 7011202089`.
- `mobile/app/profile/about.tsx`: Support channels verified for `+91 9990316186` and `+91 7011202089`.

---

## 5. Summary of Files Changed

```
MasterJiEstates/
├── mobile/
│   ├── app/
│   │   ├── _layout.tsx                     # Registered auth/forgot-password in Stack navigator
│   │   ├── auth/
│   │   │   ├── login.tsx                   # Password-only login + OTP+Password signup with strength meter
│   │   │   ├── verify-otp.tsx              # 60s cooldown, password forwarding for delayed user creation
│   │   │   ├── verify-email-otp.tsx        # 60s cooldown, password forwarding for delayed user creation
│   │   │   └── forgot-password.tsx         # Account recovery flow via verified phone or email
│   │   └── property/
│   │       └── sell.tsx                    # Updated to centralized contact (+91 9990316186 / 7011202089)
│   └── src/
│       ├── components/
│       │   └── property-details/
│       │       └── PropertyContactBar.tsx  # Updated 1-tap call (+91 9990316186) and WhatsApp (917011202089)
│       ├── constants/
│       │   ├── contact.ts                  # Centralized business contacts & buildWhatsAppUrl helper
│       │   └── propertyCategories.ts       # Synchronized with centralized contacts
│       ├── context/
│       │   └── AuthContext.tsx             # Added login (password-only), requestPasswordReset, resetPassword
│       ├── services/
│       │   ├── authService.ts              # Implemented loginWithPassword, requestPasswordReset, resetPassword
│       │   └── contactService.ts           # Re-exports official constants from contact.ts
│       ├── types/
│       │   └── auth.ts                     # Added LoginCredentials, ResetPasswordPayload, ForgotPasswordPayload
│       └── utils/
│           └── validation.ts               # Added validatePassword, validateConfirmPassword, PasswordValidationResult
└── server/
    ├── .env.example                        # Documented MSG91 and Resend environment variables
    ├── controllers/
    │   └── authController.js               # Updated login, forgotPassword, resetPassword, sendOtp, verifyOtp
    ├── models/
    │   ├── OtpToken.js                     # Added purpose (signup, forgot_password, any)
    │   └── User.js                         # Enforced unique sparse index on phone
    ├── scripts/
    │   └── verifyFinalAuthAndContacts.js   # 20-scenario automated verification test suite
    ├── services/
    │   ├── authService.js                  # Password-only login, OTP signup, recovery, bcrypt hashing
    │   ├── emailService.js                 # Resend Free Plan REST integration & branded HTML template
    │   └── smsService.js                   # MSG91 Send OTP integration with KYC handling
    └── validators/
        └── authValidator.js                # Added identifier validation (phone or email) for login & recovery
```

---

## 6. Comprehensive Verification Test Suite Results

### A. Part 5 — 20 Test Scenarios (`verifyFinalAuthAndContacts.js`)

```
========================================================================
 MJ ESTATES — FINAL AUTHENTICATION, OTP & CONTACT VERIFICATION AUDIT
========================================================================

--- TEST 1: SIGNUP WITH MOBILE + PASSWORD + SMS OTP ---
  ✓ [PASS] Signup sends OTP to mobile and creates user only after OTP verify

--- TEST 2: SIGNUP WITH EMAIL + PASSWORD + EMAIL OTP ---
  ✓ [PASS] Signup sends OTP to email and creates user only after OTP verify

--- TEST 3: ACCOUNT CREATION ONLY AFTER SUCCESSFUL OTP ---
  ✓ [PASS] Unverified OTP fails and does not create session

--- TEST 4: DUPLICATE MOBILE SIGNUP PREVENTION ---
  ✓ [PASS] Duplicate mobile signup is rejected with 409

--- TEST 5: DUPLICATE EMAIL SIGNUP PREVENTION ---
  ✓ [PASS] Duplicate email signup is rejected with 409

--- TEST 6: MOBILE LOGIN WITH CORRECT PASSWORD ---
  ✓ [PASS] Mobile number + correct password logs in user

--- TEST 7: EMAIL LOGIN WITH CORRECT PASSWORD ---
  ✓ [PASS] Email + correct password logs in user

--- TEST 8: WRONG PASSWORD REJECTION ---
  ✓ [PASS] Wrong password is rejected with 401

--- TEST 9: CONFIRM PASSWORD MISMATCH ---
  ✓ [PASS] Password and Confirm Password mismatch is caught

--- TEST 10: PASSWORD STRENGTH VALIDATION ---
  ✓ [PASS] Password strength enforcement checks all criteria

--- TEST 11: LOGIN DOES NOT SEND OTP ---
  ✓ [PASS] Login executes without OTP generation

--- TEST 12: LOGIN DOES NOT CREATE NEW ACCOUNTS ---
  ✓ [PASS] Login fails for unregistered accounts and does not create them

--- TEST 13: OTP EXPIRY ---
  ✓ [PASS] Expired OTP is rejected with 400

--- TEST 14: OTP RESEND COOLDOWN ---
  ✓ [PASS] Resend OTP within 60s cooldown is rejected with 429

--- TEST 15: MAXIMUM VERIFICATION ATTEMPTS ---
  ✓ [PASS] Maximum 5 attempts exceeded is rejected with 429

--- TEST 16: FORGOT PASSWORD USING REGISTERED VERIFIED CONTACT ---
  ✓ [PASS] Forgot password flow dispatches recovery and resets password

--- TEST 17: DEVELOPMENT OTP CANNOT WORK IN PRODUCTION ---
  ✓ [PASS] Missing provider credentials in production throws 503 instead of dev simulation

--- TEST 18: MISSING MSG91 CREDENTIALS HANDLING ---
  ✓ [PASS] Missing MSG91 credentials in dev logs warning and flags simulation

--- TEST 19: MISSING RESEND CREDENTIALS HANDLING ---
  ✓ [PASS] Missing Resend API key in dev logs warning and flags simulation

--- TEST 20: CALL AND WHATSAPP BUTTONS OPEN CORRECT NUMBERS ---
  ✓ [PASS] Call button dials +91 9990316186 and WhatsApp opens 917011202089

========================================================================
 RESULTS: 20 PASSED, 0 FAILED (100%)
========================================================================
```

### B. Full Regression Suites (Parts 1–12)

| Suite | Focus Area | Result |
| :--- | :--- | :--- |
| **Part 1** | Foundation & Project Setup | **PASSED** |
| **Part 2** | Design Tokens & Reusable UI Components | **PASSED** |
| **Part 3** | Navigation & Expo Router Group Structure | **PASSED** |
| **Part 4** | Home Screen & Category Architecture | **PASSED** |
| **Part 5** | Property Search, Filtering & Explore | **PASSED** |
| **Part 6** | Property Details & Media Viewer | **PASSED** |
| **Part 7** | Phone & Email OTP Authentication | **PASSED** |
| **Part 8** | User Profile, Translations & Saved Properties | **PASSED** |
| **Part 9** | Admin Dashboard & Property Management | **PASSED** |
| **Part 10** | Cloudinary Media Upload & Validation | **PASSED** |
| **Part 11** | Backend Integration & Security Hardening | **PASSED** |
| **Part 12** | Android Build & Release Readiness | **PASSED** |

### C. Static Analysis & Build Status

- **TypeScript (`tsc --noEmit`)**: **0 errors**.
- **ESLint (`eslint .`)**: **0 warnings, 0 errors**.
- **Multi-Platform Expo Bundling (`npx expo export`)**:
  - Web: 29 bundles cleanly generated.
  - Android: `entry-b7377392788a8c7583ce01c9f4925a0a.hbc` (Hermes bytecode 5.6 MB).
  - iOS: `entry-7046d3d95206672b4a7bfede1363e486.hbc` (Hermes bytecode 5.6 MB).

---

## 7. Remaining Configuration Requirements (External Credentials)

The system is fully developed, tested, and ready. Real-world SMS and email delivery requires adding production credentials to `server/.env` or hosting provider environment variables (e.g. Render dashboard):

1. **MSG91 (SMS OTP)**:
   - Complete KYC and business document verification on the [MSG91 Dashboard](https://msg91.com).
   - Register the SMS OTP DLT template and sender ID (`MJESTT`).
   - Set in `server/.env`:
     ```env
     MSG91_AUTH_KEY=<your_msg91_auth_key>
     MSG91_TEMPLATE_ID=<your_approved_template_id>
     MSG91_SENDER_ID=MJESTT
     MSG91_OTP_EXPIRY_MINUTES=5
     ```
2. **Resend (Email OTP)**:
   - Create a free account at [resend.com](https://resend.com) and generate an API key.
   - For custom sender domain (e.g. `auth@masterjiestates.in`), configure DKIM & SPF records in DNS.
   - Set in `server/.env`:
     ```env
     RESEND_API_KEY=re_your_api_key_here
     RESEND_FROM_EMAIL=MasterJi Estates <onboarding@resend.dev> # or your verified domain
     ```

