# MJ Estates — React Native Mobile Application
## MasterJiEstates (Delhi NCR • Noida • Ghaziabad • Gurugram • Indirapuram)

Production-grade real estate mobile application for **MJ Estates** built with **React Native**, **Expo SDK 52**, **Expo Router**, and **TypeScript**. Fully synchronized with the MasterJiEstates Express/MongoDB Atlas backend (`https://api.masterjiestates.in/api`).

---

## 1. Project Overview

The MJ Estates mobile application provides a fast, modern, and accessible experience for home seekers, sellers, and internal brokerage administrators across India:

- **Customer Experience:** Real-time property catalog discovery, multi-criteria filtering (Buy/Rent/Sell, Residential/Commercial/Plot), interactive swipeable galleries, HD video walkthrough playback, shortlisted property favorites, and direct consultation enquiries (Phone, WhatsApp, in-app requests).
- **Authentication:** Passwordless 6-digit OTP verification for Indian mobile numbers (`+91`) and Google/email addresses, backed by SHA-256 OTP hashing and hardware-encrypted session token persistence via `expo-secure-store`.
- **Admin Inventory Management:** Server-authorized role-based portal (`authorizeRoles('admin')`) allowing certified personnel to publish, update, delete, and toggle listing statuses, plus upload up to 15 gallery photos and 1 MP4 video walkthrough (`< 10 MB`) directly to Cloudinary.
- **Multilingual Support:** Instant language switching across **English**, **Hindi (Devanagari)**, and **Hinglish (Conversational)**.

---

## 2. Technology Stack

- **Framework:** [Expo](https://expo.dev/) (SDK 52)
- **Runtime:** [React Native](https://reactnative.dev/) (0.76+) with Hermes JavaScript Engine
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Routing & Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **Security & Storage:** [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) (Hardware-backed keystore)
- **Media Engine:** [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/), [expo-video](https://docs.expo.dev/versions/latest/sdk/video/)
- **Icons:** [lucide-react-native](https://lucide.dev/) + [react-native-svg](https://github.com/software-mansion/react-native-svg)
- **Linter & Type Checker:** ESLint 9 (`eslint-config-expo`) & TypeScript compiler (`tsc --noEmit`)

---

## 3. Directory Architecture

```
mobile/
├── app/                        # Expo Router file-based route hierarchy
│   ├── (tabs)/                 # Customer bottom-tab navigation
│   │   ├── _layout.tsx         # Tab bar configuration & Lucide icons
│   │   ├── index.tsx           # Home Screen (Hero, Categories, Featured, Latest, Contact)
│   │   ├── explore.tsx         # Catalog Discovery, Search & Multi-criteria Filters
│   │   ├── saved.tsx           # Shortlisted Favorites with Backend Sync
│   │   └── profile.tsx         # Customer Profile, Language, Support, and Logout
│   │
│   ├── property/
│   │   └── [id].tsx            # Property Details, Photo Gallery & Video Walkthrough
│   │
│   ├── auth/
│   │   ├── login.tsx           # Passwordless Phone & Email Entry Screen
│   │   ├── verify-otp.tsx      # 6-Digit Phone OTP Verification Screen
│   │   └── verify-email-otp.tsx# 6-Digit Email OTP Verification Screen
│   │
│   ├── profile/
│   │   ├── edit.tsx            # Personal Profile Name & Contact Information
│   │   ├── language.tsx        # Language Selector (English, Hindi, Hinglish)
│   │   ├── enquiries.tsx       # Consultation & Inspection Request History
│   │   ├── preferences.tsx     # Price Drop & WhatsApp Notification Preferences
│   │   └── about.tsx           # Company Information & Official Verification
│   │
│   ├── admin/
│   │   ├── _layout.tsx         # Role Guard (Validates authentic 'admin' role)
│   │   ├── index.tsx           # Admin Overview Dashboard & Inventory Metrics
│   │   ├── properties.tsx      # Admin Inventory Feed with Status Toggles & Deletion
│   │   ├── add-property.tsx    # Intake Form with Image & Video Pickers
│   │   └── edit-property/[id].tsx # Edit Listing Form & Cloudinary Updates
│   │
│   ├── _layout.tsx             # Root Layout with Theme, Status Bar & Providers
│   └── +not-found.tsx          # 404 Route Fallback
│
├── src/                        # Modular application source code
│   ├── components/             # Reusable UI, Home, Property, and Media components
│   ├── config/                 # Centralized appConfig & base URL resolution
│   ├── constants/              # Categories, Filter presets, and Sample properties
│   ├── context/                # Auth, SavedProperties, Language, and Admin contexts
│   ├── hooks/                  # Custom hooks (useAuth, useSavedProperties, etc.)
│   ├── services/               # API Client, Auth, Property, Enquiry, and Media services
│   ├── theme/                  # Design tokens (Colors, Typography, Spacing, Radius)
│   ├── translations/           # English, Hindi, and Hinglish locale dictionaries
│   ├── types/                  # TypeScript interfaces (Property, Media, Auth, etc.)
│   └── utils/                  # Formatting (Indian INR, phone/email validation)
│
├── assets/                     # High-resolution logos, icons, and hero graphics
├── app.json                    # Expo application manifest (com.masterjiestates.app)
├── eas.json                    # EAS Build profiles (preview APK, production AAB)
├── eslint.config.js            # ESLint flat configuration
├── package.json                # Dependencies and project scripts
└── tsconfig.json               # TypeScript strict configuration
```

---

## 4. Environment Configuration

The application uses `EXPO_PUBLIC_API_URL` to connect to the backend:

- **Production API:** `https://api.masterjiestates.in/api`
- **Official Website:** `https://www.masterjiestates.in`

Create a `.env` file inside `mobile/`:

```bash
# mobile/.env
EXPO_PUBLIC_API_URL=https://api.masterjiestates.in/api
```

### Local Development Loopback IP
When developing locally with the Express server running on port 5000:
- **Android Emulator:** `http://10.0.2.2:5000/api` (automatically resolved by `appConfig.ts` in dev mode)
- **iOS Simulator:** `http://127.0.0.1:5000/api`
- **Physical Device:** Replace with your workstation's LAN IP, e.g. `http://192.168.1.50:5000/api`

---

## 5. Development & Testing Commands

From the `mobile/` directory:

```bash
# 1. Install dependencies
npm install

# 2. Run TypeScript check (zero errors allowed)
npm run type-check

# 3. Run ESLint validation
npm run lint

# 4. Start Expo local development server
npm run start

# 5. Launch on Android Emulator
npm run android

# 6. Test production bundle export (Hermes bytecode packaging)
npx expo export
```

### Running Backend & Mobile Regression Test Suites
From the project root:

```bash
# Run complete Part 1 through Part 12 verification suites:
node server/scripts/verifyMobilePart1.js
node server/scripts/verifyMobilePart2.js
node server/scripts/verifyMobilePart3.js
node server/scripts/verifyMobilePart4.js
node server/scripts/verifyMobilePart5.js
node server/scripts/verifyMobilePart6.js
node server/scripts/verifyMobilePart7.js
node server/scripts/verifyMobilePart8.js
node server/scripts/verifyMobilePart9.js
node server/scripts/verifyMobilePart10.js
node server/scripts/verifyMobilePart11.js
node server/scripts/verifyMobilePart12.js
```

---

## 6. How to Test on an Android Device via Expo Go

1. **Install Expo Go:**
   Download **Expo Go** from Google Play Store on your Android phone.
2. **Same Wi-Fi Network:**
   Connect your computer and Android phone to the same Wi-Fi network.
3. **Start the Bundler:**
   ```bash
   cd mobile
   npx expo start
   ```
4. **Scan QR Code:**
   Open the Expo Go app on Android and scan the QR code displayed in your terminal.

---

## 7. Android Release Builds: APK vs. AAB

| Feature | APK (Android Package Kit) | AAB (Android App Bundle) |
|---|---|---|
| **Purpose** | Direct sideload installation & device QA | Official Google Play Store distribution |
| **Target Audience** | Testers, developers, internal stakeholders | End-users downloading from Google Play |
| **Play Store Submission**| Deprecated for new apps by Google | **Mandatory** standard format |
| **Optimization** | Single bundle with all architectures | Play Feature Delivery dynamically generates optimized APKs per device |

---

## 8. Generating Android Builds with EAS Build

### Prerequisites
1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Initialize or link project:
   ```bash
   cd mobile
   eas build:configure
   ```

### Step-by-Step: Generate Installable Android APK (Testing)
To build an APK file that can be sent directly to any Android smartphone via WhatsApp, Google Drive, or USB:

```bash
cd mobile
eas build --platform android --profile preview
```

EAS Build compiles the native binaries in the cloud. Once complete, EAS provides a direct download link (and QR code) for the `.apk` file.

### Step-by-Step: Generate Android AAB (Google Play Store Submission)
To build the optimized App Bundle required for Google Play Console submission:

```bash
cd mobile
eas build --platform android --profile production
```

Once complete, download the `.aab` file from the EAS dashboard and upload it directly to the Google Play Console under **Production** or **Internal Testing**.

---

## 9. How to Install and Test the APK on Your Android Phone

1. **Download the APK:**
   Open the download link provided by EAS Build on your Android phone (or transfer the downloaded `.apk` file to your phone via USB).
2. **Allow Installation from Unknown Sources:**
   When you tap the APK in your Downloads folder, Android will display a security prompt:
   - Tap **Settings**.
   - Enable **Allow from this source** (for Chrome, Files, or your file manager).
   - Press the Back button and tap **Install**.
3. **Open MJ Estates:**
   Tap the app icon featuring the MasterJiEstates navy and gold crest on your home screen.
4. **Test the Core Workflows:**
   - **Catalog:** Browse properties in Home and Explore, toggle Buy / Rent / Sell filters, search by city or sector.
   - **Details:** Inspect specifications, swipe photos, and play the video walkthrough.
   - **Favorites:** Tap the heart icon; verify the property persists under the Saved tab.
   - **Consultation:** Tap Call or WhatsApp to test 1-tap phone dialer and WhatsApp pre-filled inquiry.
   - **Sign In:** Go to Profile -> Log In, enter a 10-digit Indian mobile number, and enter the OTP.
   - **Language:** Go to Profile -> Language Settings, select Hindi (Devanagari) or Hinglish, and observe immediate app-wide UI translation.
   - **Admin Portal:** Log in with an authorized administrative account to access the Admin Dashboard, publish a new property listing with gallery photos and video, and toggle status.

---

## 10. Production Release Checklist

- [x] Application name configured as `MJ Estates`
- [x] Unique package identifier: `com.masterjiestates.app`
- [x] Version `1.0.0`, versionCode `1`
- [x] High-resolution adaptive launcher icons and splash screens configured
- [x] Production API endpoint verified: `https://api.masterjiestates.in/api`
- [x] Zero development mock credentials or OTP bypasses in production builds
- [x] Zero `localhost` or dev URLs bundled in production
- [x] Sensitive user tokens stored in `expo-secure-store`
- [x] No Cloudinary API secrets bundled in the mobile binary
- [x] Strict `< 10 MB` MP4 video upload limit enforced on client and backend
- [x] TypeScript validation clean (`0 errors`)
- [x] ESLint validation clean (`0 errors, 0 warnings`)
- [x] Standalone Hermes Android and iOS bytecode export verified (`5.5 MB`)
- [x] All 12 regression test suites passing 100%

---

## 11. Known Limitations

- **SMS Gateway Delivery:** Live SMS delivery depends on third-party provider credentials (Twilio or MSG91) configured in `server/.env`. If unconfigured, the backend operates in simulated mode, safely returning the verification code in development and logging it to the console.
- **Physical Device Local Network:** When running the mobile app against a local development server on a physical phone, the phone must be on the same Wi-Fi network and `appConfig.ts` should point to your workstation's local IP address instead of `10.0.2.2`.
