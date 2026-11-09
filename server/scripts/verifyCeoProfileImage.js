import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('\n=== MASTERJIESTATES CEO PROFILE IMAGE VERIFICATION ===\n');

// 1. Root Source Image Preservation
const rootCeoPath = path.join(projectRoot, 'CEO img.jpeg');
assert(fs.existsSync(rootCeoPath), 'CEO img.jpeg exists in project root');
if (fs.existsSync(rootCeoPath)) {
  const rootStat = fs.statSync(rootCeoPath);
  assert(rootStat.size === 71304, `Root CEO img.jpeg is original size (71,304 bytes, got ${rootStat.size})`);
}

// 2. Client Public Images Asset
const publicCeoPath = path.join(projectRoot, 'client/public/images/CEO img.jpeg');
assert(fs.existsSync(publicCeoPath), 'client/public/images/CEO img.jpeg exists');
if (fs.existsSync(publicCeoPath)) {
  const publicStat = fs.statSync(publicCeoPath);
  assert(publicStat.size === 71304, 'client/public/images/CEO img.jpeg matches source file size');
}

const publicCeoAlias = path.join(projectRoot, 'client/public/images/ceo.jpeg');
assert(fs.existsSync(publicCeoAlias), 'client/public/images/ceo.jpeg fallback alias exists');

// 3. Client Dist Images (Production Build Output)
const distCeoPath = path.join(projectRoot, 'client/dist/images/CEO img.jpeg');
assert(fs.existsSync(distCeoPath), 'client/dist/images/CEO img.jpeg exists in production build');

const distCeoAlias = path.join(projectRoot, 'client/dist/images/ceo.jpeg');
assert(fs.existsSync(distCeoAlias), 'client/dist/images/ceo.jpeg exists in production build');

// 4. AboutUs.jsx Verification
const aboutUsPath = path.join(projectRoot, 'client/src/pages/company/AboutUs.jsx');
assert(fs.existsSync(aboutUsPath), 'client/src/pages/company/AboutUs.jsx exists');

if (fs.existsSync(aboutUsPath)) {
  const content = fs.readFileSync(aboutUsPath, 'utf8');

  // Must reference CEO img.jpeg
  assert(
    content.includes('/images/CEO%20img.jpeg') || content.includes('/images/CEO img.jpeg'),
    'AboutUs.jsx references the CEO image in /images/'
  );

  // Must use object-cover and object-top
  assert(content.includes('object-cover'), 'Image uses object-cover');
  assert(content.includes('object-top'), 'Image uses object-top for optimal face alignment');

  // Must NOT contain MS initials placeholder
  assert(!content.includes('>MS<') && !content.includes('> MS <'), 'AboutUs.jsx does NOT use "MS" initials placeholder avatar');

  // Must preserve Mr Shokin and details
  assert(content.includes('Mr Shokin'), 'Preserves leadership name "Mr Shokin"');
  assert(content.includes('Founder &amp; Property Consultant'), 'Preserves designation "Founder & Property Consultant"');
  assert(content.includes('COMPANY_CONFIG.phoneDisplay'), 'Preserves direct call button with phone number');
  assert(content.includes('WhatsAppButton'), 'Preserves WhatsApp consultation button');

  // Verify Reception Lobby photograph is still intact
  assert(
    content.includes('Master Ji Estates Reception Lobby.png') || content.includes('Master_Ji_Estates_Reception_Lobby.png'),
    'Reception Lobby photograph remains intact on About Us page'
  );
}

console.log(`\nResults: ${passedTests}/${totalTests} tests passed (${failedTests} failed)\n`);

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL CEO PROFILE IMAGE VERIFICATION TESTS PASSED!\n');
}

