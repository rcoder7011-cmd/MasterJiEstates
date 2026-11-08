import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

console.log('========================================================================');
console.log(' MASTERJIESTATES: FOOTER SERVICE LOCATIONS AUDIT');
console.log('========================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failCount++;
  }
}

// 1. Check companyConfig.js
const configPath = path.join(rootDir, 'client/src/config/companyConfig.js');
assert(fs.existsSync(configPath), 'client/src/config/companyConfig.js exists');
const configSource = fs.readFileSync(configPath, 'utf8');

const expectedLocations = ['Delhi', 'Uttar Pradesh', 'Ghaziabad', 'Noida', 'Gurugram', 'Indirapuram'];
for (const loc of expectedLocations) {
  assert(configSource.includes(`'${loc}'`) || configSource.includes(`"${loc}"`), `companyConfig.js includes '${loc}' in service areas`);
}

// 2. Check office location is not modified to Indirapuram
assert(configSource.includes("officeLocation: 'Noida Sector 62A'"), 'Office location remains verified Noida Sector 62A (no unverified office claim)');

// 3. Check Footer.jsx maps companyConfig serviceAreas
const footerPath = path.join(rootDir, 'client/src/components/layout/Footer.jsx');
assert(fs.existsSync(footerPath), 'Footer.jsx exists');
const footerSource = fs.readFileSync(footerPath, 'utf8');

assert(footerSource.includes('Service Locations'), 'Footer.jsx has Service Locations heading');
assert(footerSource.includes('COMPANY_CONFIG.serviceAreas.map'), 'Footer.jsx dynamically maps COMPANY_CONFIG.serviceAreas');
assert(footerSource.includes('px-2 py-0.5 rounded-md bg-white/10 text-slate-200 font-medium border border-white/10'), 'Footer service location pills retain consistent typography, borders, and colors');

// 4. Check server contentService.js for backend source-of-truth alignment
const serverContentPath = path.join(rootDir, 'server/services/contentService.js');
assert(fs.existsSync(serverContentPath), 'server/services/contentService.js exists');
const serverContentSource = fs.readFileSync(serverContentPath, 'utf8');
assert(serverContentSource.includes("'Indirapuram'") || serverContentSource.includes('"Indirapuram"'), 'server/services/contentService.js includes Indirapuram');

// 5. Check Production bundle includes Indirapuram
const distAssetsDir = path.join(rootDir, 'client/dist/assets');
assert(fs.existsSync(distAssetsDir), 'Production dist/assets directory exists');
const jsFiles = fs.readdirSync(distAssetsDir).filter(f => f.endsWith('.js'));
let foundIndirapuramInBundle = false;
for (const file of jsFiles) {
  const content = fs.readFileSync(path.join(distAssetsDir, file), 'utf8');
  if (content.includes('Indirapuram')) {
    foundIndirapuramInBundle = true;
    break;
  }
}
assert(foundIndirapuramInBundle, 'Compiled production JavaScript bundle contains "Indirapuram"');

console.log('\n========================================================================');
console.log(` RESULTS: ${passCount} / ${passCount + failCount} ASSERTIONS PASSED (${Math.round((passCount / (passCount + failCount)) * 100)}%)`);
console.log('========================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
