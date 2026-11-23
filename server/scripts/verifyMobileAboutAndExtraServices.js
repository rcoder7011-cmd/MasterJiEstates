/**
 * Verification Script: Mobile About Us & Extra Services Implementation
 * Tests routes, images, services catalog, contact numbers, and deep links.
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../..');
const mobileDir = path.join(projectRoot, 'mobile');

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓ [PASS] ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${description}: ${err.message}`);
    failed++;
  }
}

console.log('\n========================================================================');
console.log(' MJ ESTATES MOBILE APP — ABOUT US & EXTRA SERVICES VERIFICATION');
console.log('========================================================================\n');

// 1. Image Assets in Mobile
console.log('--- 1. MOBILE IMAGE ASSETS ---');
const servicesOverviewImg = path.join(mobileDir, 'assets/images/services-overview.png');
const receptionLobbyImg = path.join(mobileDir, 'assets/images/reception-lobby.png');
const profileImg = path.join(mobileDir, 'assets/images/profile-img.jpeg');

test('assets/images/services-overview.png exists and is non-empty', () => {
  assert(fs.existsSync(servicesOverviewImg), 'services-overview.png exists');
  assert(fs.statSync(servicesOverviewImg).size > 100000, 'services-overview.png size valid');
});

test('assets/images/reception-lobby.png exists and is non-empty', () => {
  assert(fs.existsSync(receptionLobbyImg), 'reception-lobby.png exists');
  assert(fs.statSync(receptionLobbyImg).size > 100000, 'reception-lobby.png size valid');
});

test('assets/images/profile-img.jpeg exists and is non-empty', () => {
  assert(fs.existsSync(profileImg), 'profile-img.jpeg exists');
  assert(fs.statSync(profileImg).size > 10000, 'profile-img.jpeg size valid');
});

// 2. Navigation & Layout Routes
console.log('\n--- 2. NAVIGATION & ROUTE REGISTRATION ---');
const rootLayoutPath = path.join(mobileDir, 'app/_layout.tsx');
test('app/_layout.tsx registers extra-services route', () => {
  const content = fs.readFileSync(rootLayoutPath, 'utf8');
  assert(content.includes('name="extra-services"'), 'registers extra-services');
});

test('app/_layout.tsx registers profile/services route', () => {
  const content = fs.readFileSync(rootLayoutPath, 'utf8');
  assert(content.includes('name="profile/services"'), 'registers profile/services');
});

test('app/_layout.tsx registers profile/about route', () => {
  const content = fs.readFileSync(rootLayoutPath, 'utf8');
  assert(content.includes('name="profile/about"'), 'registers profile/about');
});

test('app/profile/services.tsx alias file exists and delegates to extra-services', () => {
  const p = path.join(mobileDir, 'app/profile/services.tsx');
  assert(fs.existsSync(p), 'profile/services.tsx exists');
  const content = fs.readFileSync(p, 'utf8');
  assert(content.includes('../extra-services'), 'delegates to extra-services');
});

// 3. Contact Service Configuration
console.log('\n--- 3. CONTACT SERVICE HELPERS ---');
const contactServicePath = path.join(mobileDir, 'src/services/contactService.ts');
test('contactService.ts defines EXTRA_SERVICES_CONTACT with +91 7011202089', () => {
  const content = fs.readFileSync(contactServicePath, 'utf8');
  assert(content.includes('EXTRA_SERVICES_CONTACT'), 'exports EXTRA_SERVICES_CONTACT');
  assert(content.includes('+91 7011202089'), 'contains +91 7011202089');
  assert(content.includes('917011202089'), 'contains 917011202089 raw');
});

test('contactService.ts provides callExtraServices method with tel:+917011202089', () => {
  const content = fs.readFileSync(contactServicePath, 'utf8');
  assert(content.includes('callExtraServices'), 'defines callExtraServices');
  assert(content.includes('Linking.canOpenURL') && content.includes('Linking.openURL'), 'uses Linking');
});

test('contactService.ts provides openWhatsAppExtraServices method', () => {
  const content = fs.readFileSync(contactServicePath, 'utf8');
  assert(content.includes('openWhatsAppExtraServices'), 'defines openWhatsAppExtraServices');
  assert(content.includes('https://wa.me/'), 'builds wa.me URL');
});

// 4. About Us Screen Verification
console.log('\n--- 4. ABOUT US SCREEN ---');
const aboutScreenPath = path.join(mobileDir, 'app/profile/about.tsx');
test('app/profile/about.tsx exists', () => {
  assert(fs.existsSync(aboutScreenPath), 'about.tsx exists');
});

test('about.tsx displays corporate lobby image', () => {
  const content = fs.readFileSync(aboutScreenPath, 'utf8');
  assert(content.includes('reception-lobby.png'), 'renders reception-lobby.png');
});

test('about.tsx displays Services Overview graphic banner', () => {
  const content = fs.readFileSync(aboutScreenPath, 'utf8');
  assert(content.includes('services-overview.png'), 'renders services-overview.png');
});

test('about.tsx contains prominent Extra Services button navigating to /extra-services', () => {
  const content = fs.readFileSync(aboutScreenPath, 'utf8');
  assert(content.includes('/extra-services'), 'links to /extra-services');
  assert(content.includes('Extra Services') || content.includes('Open Extra Services'), 'has button label');
});

test('about.tsx displays mandatory Section 3 notice message', () => {
  const content = fs.readFileSync(aboutScreenPath, 'utf8');
  assert(
    content.includes('NOTICE_MESSAGE') ||
      content.includes('For Extra Services, Interior Design, Software Development, Website Development'),
    'contains exact notice message'
  );
});

test('about.tsx displays +91 7011202089 contact hotline and action buttons', () => {
  const content = fs.readFileSync(aboutScreenPath, 'utf8');
  assert(content.includes('7011202089'), 'contains 7011202089');
  assert(content.includes('callExtraServices'), 'wires callExtraServices');
  assert(content.includes('openWhatsAppExtraServices'), 'wires openWhatsAppExtraServices');
});

test('about.tsx preserves LeadershipSection and CompanyValuesSection', () => {
  const content = fs.readFileSync(aboutScreenPath, 'utf8');
  assert(content.includes('<LeadershipSection />'), 'mounts LeadershipSection');
  assert(content.includes('<CompanyValuesSection />'), 'mounts CompanyValuesSection');
});

// 5. Dedicated Extra Services Screen Verification
console.log('\n--- 5. DEDICATED EXTRA SERVICES SCREEN ---');
const extraServicesPath = path.join(mobileDir, 'app/extra-services.tsx');
test('app/extra-services.tsx exists', () => {
  assert(fs.existsSync(extraServicesPath), 'extra-services.tsx exists');
});

test('extra-services.tsx displays Services Overview graphic header', () => {
  const content = fs.readFileSync(extraServicesPath, 'utf8');
  assert(content.includes('services-overview.png'), 'renders services-overview.png');
});

test('extra-services.tsx displays mandatory Section 3 notice message', () => {
  const content = fs.readFileSync(extraServicesPath, 'utf8');
  assert(
    content.includes('NOTICE_MESSAGE') ||
      content.includes('For Extra Services, Interior Design, Software Development, Website Development'),
    'contains exact notice message'
  );
});

test('extra-services.tsx wires Call Now and WhatsApp with +91 7011202089', () => {
  const content = fs.readFileSync(extraServicesPath, 'utf8');
  assert(content.includes('callExtraServices'), 'wires callExtraServices');
  assert(content.includes('openWhatsAppExtraServices'), 'wires openWhatsAppExtraServices');
  assert(content.includes('7011202089'), 'displays +91 7011202089');
});

const requiredServices = [
  'Interior Design & Interior Work',
  'Software Development Services',
  'Website Design & Development',
  'AI & Machine Learning Development',
  'Architecture & Architectural Design',
  'Carpentry & Furniture Work',
  'Home Buying Assistance',
  'Property Selling Assistance',
  'Real Estate Consultation',
];

requiredServices.forEach((serviceName) => {
  test(`extra-services.tsx includes service: "${serviceName}"`, () => {
    const content = fs.readFileSync(extraServicesPath, 'utf8');
    assert(content.includes(serviceName), `contains ${serviceName}`);
  });
});

// 6. Profile Menu Entry Point
console.log('\n--- 6. PROFILE TAB SHORTCUTS ---');
const profileTabPath = path.join(mobileDir, 'app/(tabs)/profile.tsx');
test('profile.tsx links to /profile/about', () => {
  const content = fs.readFileSync(profileTabPath, 'utf8');
  assert(content.includes('/profile/about'), 'links to /profile/about');
});

test('profile.tsx links to /extra-services', () => {
  const content = fs.readFileSync(profileTabPath, 'utf8');
  assert(content.includes('/extra-services'), 'links to /extra-services');
});

console.log('\n========================================================================');
console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
}
