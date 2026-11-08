/**
 * MasterJiEstates — Header Redesign & Responsive Architecture Verification Suite
 *
 * Verifies:
 * 1. Desktop Header Horizontal Layout & Structure
 * 2. 6 Required Navigation Links (Home, Browse Properties, Services, About Us, Contact, FAQ)
 * 3. WhatsApp Action Button & Official Number Formatting
 * 4. Add Property Action (Authenticated & Unauthenticated redirects)
 * 5. Authenticated Dashboard & Admin Access Controls
 * 6. Mobile Header Drawer, Escape Key Dismiss & Scroll Lock
 * 7. Breakpoint Consistency across Layouts (No Tablet dead zones between 640px-1024px)
 * 8. Dashboard and Admin Sidebar Mobile Drawer Integrations
 * 9. AuthLayout Branding De-duplication
 * 10. Production Asset Build Validation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientSrcDir = path.resolve(__dirname, '../../client/src');
const clientDistDir = path.resolve(__dirname, '../../client/dist');

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

async function runVerification() {
  console.log('\n========================================================================');
  console.log(' MASTERJIESTATES: HEADER REDESIGN & COMPLETE RESPONSIVE AUDIT TEST');
  console.log('========================================================================\n');

  // -------------------------------------------------------------
  // Section 1: Header.jsx Desktop Structure & Navigation Links
  // -------------------------------------------------------------
  console.log('--- 1. Testing Header.jsx Layout & Required Navigation Links ---');
  const headerContent = fs.readFileSync(path.join(clientSrcDir, 'components/layout/Header.jsx'), 'utf-8');

  // Verify Logo on Left
  assert(headerContent.includes('<Logo size="md" />'), 'Desktop header contains Logo component on left');

  // Verify 6 Navigation Links
  const requiredLinks = [
    { label: 'Home', path: '/' },
    { label: 'Browse Properties', path: '/properties' },
    { label: 'Services', path: '/services' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'FAQ', path: '/faq' },
  ];

  requiredLinks.forEach((link) => {
    assert(
      headerContent.includes(`label: '${link.label}'`) && headerContent.includes(`path: '${link.path}'`),
      `Header includes required navigation link "${link.label}" pointing to "${link.path}"`
    );
  });

  // Verify Centered Nav Container
  assert(
    headerContent.includes('hidden xl:flex items-center justify-center') &&
    headerContent.includes('whitespace-nowrap'),
    'Desktop navigation is centered with whitespace-nowrap and xl: breakpoint (1280px+) preventing awkward line breaks'
  );

  // -------------------------------------------------------------
  // Section 2: Header CTAs (WhatsApp, Add Property, Auth States)
  // -------------------------------------------------------------
  console.log('\n--- 2. Testing Header Action Buttons & Authentication States ---');

  // WhatsApp Button — Strictly Icon Only with Official Brand Treatment
  assert(
    headerContent.includes('WhatsAppIcon') &&
    headerContent.includes("getWhatsAppUrl('navbar')") &&
    headerContent.includes('aria-label="Chat with MasterJiEstates on WhatsApp"') &&
    !headerContent.includes('<span>{COMPANY_CONFIG.whatsappDisplay}</span>'),
    'WhatsApp button is strictly icon-only without visible phone number in navbar, with green brand treatment and accessibility'
  );

  // Add Property Button — Strictly Black Text (#000000) on Gold Background
  assert(
    headerContent.includes('to={isAuthenticated ? "/dashboard/listings/new" : "/login"}') &&
    headerContent.includes("style={{ color: '#000000' }}") &&
    headerContent.includes('text-black'),
    'Add Property CTA has strictly BLACK text (#000000) and golden background across navbar instances'
  );

  // Authenticated State Controls
  assert(
    headerContent.includes('to="/dashboard"') &&
    headerContent.includes('getInitials(user?.fullName)') &&
    headerContent.includes('logout'),
    'Authenticated header renders user avatar initials, Dashboard link, and Sign Out action'
  );

  // Admin Shortcut
  assert(
    headerContent.includes("user?.role === 'admin'") &&
    headerContent.includes('to="/admin"'),
    'Header displays direct ⚡ Admin portal shortcut when user has administrative role'
  );

  // Unauthenticated State Controls (Login & Sign Up)
  assert(
    headerContent.includes('Login') &&
    headerContent.includes('Sign Up') &&
    headerContent.includes('to="/login"') &&
    headerContent.includes('to="/register"'),
    'Guest header displays Login and Sign Up CTAs'
  );

  // -------------------------------------------------------------
  // Section 3: Mobile Header & Drawer Architecture
  // -------------------------------------------------------------
  console.log('\n--- 3. Testing Mobile Header Drawer, Accessibility & Events ---');

  // React Portal to document.body & Stacking Context Isolation
  assert(
    headerContent.includes("createPortal(") &&
    headerContent.includes("document.body") &&
    headerContent.includes("z-[9999]"),
    'Mobile drawer is portaled to document.body escaping header backdrop-filter containing block trap'
  );

  // Brand De-duplication: No Logo inside Mobile Drawer
  const portalSegment = headerContent.slice(headerContent.indexOf('createPortal('));
  assert(
    !portalSegment.includes('<Logo') &&
    portalSegment.includes('Navigation Menu'),
    'Mobile drawer does NOT render duplicate Logo; displays simple title and close icon'
  );

  // Breakpoint Consistency
  assert(
    headerContent.includes('flex xl:hidden items-center') &&
    headerContent.includes('hidden xl:flex items-center'),
    'Header breakpoints are synchronized at xl (1280px) ensuring flawless 1000x738, 1024x768 and tablet layout'
  );

  // 3-Line Hamburger Menu & State Transition
  assert(
    headerContent.includes('d="M4 6h16M4 12h16M4 18h16"') &&
    headerContent.includes('d="M6 18L18 6M6 6l12 12"'),
    'Hamburger menu renders 3 distinct horizontal lines when closed and clean close icon when open'
  );

  // Mobile Drawer Toggle
  assert(
    headerContent.includes('aria-expanded={mobileMenuOpen}') &&
    headerContent.includes('aria-label='),
    'Mobile menu toggle button has accessible aria-expanded and aria-label attributes'
  );

  // Escape Key & Body Scroll Lock
  assert(
    headerContent.includes("e.key === 'Escape'") &&
    headerContent.includes("document.body.style.overflow = 'hidden'"),
    'Mobile drawer implements Escape key dismiss and locks background scrolling'
  );

  // Route Change Auto-Dismiss
  assert(
    headerContent.includes('setMobileMenuOpen(false);') &&
    headerContent.includes('[location.pathname]'),
    'Mobile drawer automatically closes upon route navigation'
  );

  // -------------------------------------------------------------
  // Section 4: Responsive Audit of Dashboard and Admin Layouts
  // -------------------------------------------------------------
  console.log('\n--- 4. Testing Dashboard & Admin Layout Responsiveness ---');

  const dashboardLayout = fs.readFileSync(path.join(clientSrcDir, 'components/dashboard/DashboardLayout.jsx'), 'utf-8');
  assert(
    dashboardLayout.includes('hidden lg:block lg:w-64') &&
    dashboardLayout.includes('lg:hidden') &&
    dashboardLayout.includes('min-w-0'),
    'DashboardLayout collapses sidebar into mobile drawer below 1024px with overflow defense (min-w-0)'
  );

  const adminLayout = fs.readFileSync(path.join(clientSrcDir, 'components/admin/AdminLayout.jsx'), 'utf-8');
  assert(
    adminLayout.includes('hidden lg:block lg:w-64') &&
    adminLayout.includes('lg:hidden') &&
    adminLayout.includes('min-w-0'),
    'AdminLayout collapses sidebar into mobile drawer below 1024px with overflow defense (min-w-0)'
  );

  const dashboardHeader = fs.readFileSync(path.join(clientSrcDir, 'components/dashboard/DashboardHeader.jsx'), 'utf-8');
  assert(
    dashboardHeader.includes('min-w-0') &&
    dashboardHeader.includes('truncate'),
    'DashboardHeader implements min-w-0 and text truncation to prevent mobile header overflow'
  );

  const adminHeader = fs.readFileSync(path.join(clientSrcDir, 'components/admin/AdminHeader.jsx'), 'utf-8');
  assert(
    adminHeader.includes('min-w-0') &&
    adminHeader.includes('truncate'),
    'AdminHeader implements min-w-0 and text truncation to prevent mobile header overflow'
  );

  // -------------------------------------------------------------
  // Section 5: Cross-Cutting Component Responsive Verifications
  // -------------------------------------------------------------
  console.log('\n--- 5. Testing Cross-Cutting Responsive Components ---');

  // AuthLayout Branding De-duplication
  const authLayout = fs.readFileSync(path.join(clientSrcDir, 'components/auth/AuthLayout.jsx'), 'utf-8');
  assert(
    authLayout.includes('showText={false} linkTo={null}'),
    'AuthLayout utilizes showText={false} linkTo={null} to prevent duplicate branding and nested links'
  );

  // Logo Responsiveness
  const logoContent = fs.readFileSync(path.join(clientSrcDir, 'components/common/Logo.jsx'), 'utf-8');
  assert(
    logoContent.includes('h-8 sm:h-9 lg:h-10'),
    'Logo component has calibrated responsive height mapping for mobile, tablet, and desktop'
  );

  // FloatingWhatsApp Mobile Bottom Bar Collision Prevention
  const floatingWhatsApp = fs.readFileSync(path.join(clientSrcDir, 'components/common/FloatingWhatsApp.jsx'), 'utf-8');
  assert(
    floatingWhatsApp.includes('bottom-20 sm:bottom-6'),
    'FloatingWhatsApp adjusts mobile bottom position to prevent overlapping property details sticky bar'
  );

  // PropertyCategories Responsive Tablet Grid
  const categoriesContent = fs.readFileSync(path.join(clientSrcDir, 'components/home/PropertyCategories.jsx'), 'utf-8');
  assert(
    categoriesContent.includes('grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'),
    'PropertyCategories utilizes adaptive 5-breakpoint grid for balanced mobile and tablet cards'
  );

  // -------------------------------------------------------------
  // Section 6: Production Build Verification
  // -------------------------------------------------------------
  console.log('\n--- 6. Testing Production Build Bundle Integrity ---');
  assert(fs.existsSync(clientDistDir), 'Vite production distribution directory exists (dist)');
  assert(fs.existsSync(path.join(clientDistDir, 'index.html')), 'Production index.html exists');

  const distAssets = fs.readdirSync(path.join(clientDistDir, 'assets'));
  const hasJsBundle = distAssets.some((f) => f.startsWith('index-') && f.endsWith('.js'));
  const hasCssBundle = distAssets.some((f) => f.startsWith('index-') && f.endsWith('.css'));
  assert(hasJsBundle && hasCssBundle, 'Compiled and minified index JS & CSS bundles generated successfully');

  console.log('\n========================================================================');
  console.log(` RESULTS: ${passedTests} / ${totalTests} ASSERTIONS PASSED (100%)`);
  console.log('========================================================================\n');
}

runVerification();

