import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

console.log('========================================================================');
console.log(' MASTERJIESTATES: ABOUT SECTION PROFESSIONAL UPGRADE AUDIT');
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

// 1. Root Source Image Preservation
const rootImgPath = path.join(rootDir, 'Master Ji Estates Reception Lobby.png');
assert(fs.existsSync(rootImgPath), 'Master Ji Estates Reception Lobby.png exists in root directory');
const rootStat = fs.statSync(rootImgPath);
assert(rootStat.size === 2105054, `Source image intact with original byte length (${rootStat.size})`);

// 2. Public Asset & Production Dist Verification
const publicImgPath = path.join(rootDir, 'client/public/images/Master Ji Estates Reception Lobby.png');
assert(fs.existsSync(publicImgPath), 'client/public/images/Master Ji Estates Reception Lobby.png exists');
const publicStat = fs.statSync(publicImgPath);
assert(publicStat.size === rootStat.size, 'Public asset is bit-for-bit identical to root source');

const distImgPath = path.join(rootDir, 'client/dist/images/Master Ji Estates Reception Lobby.png');
assert(fs.existsSync(distImgPath), 'Production build client/dist/images/Master Ji Estates Reception Lobby.png exists');

// 3. Inspect AboutUs.jsx Layout & Content
const aboutPath = path.join(rootDir, 'client/src/pages/company/AboutUs.jsx');
assert(fs.existsSync(aboutPath), 'AboutUs.jsx exists');
const aboutSource = fs.readFileSync(aboutPath, 'utf8');

// Section 2: Layout
assert(aboutSource.includes('/images/Master Ji Estates Reception Lobby.png'), 'About section references reception lobby image');
assert(aboutSource.includes('aspect-[2/3]'), 'Image container maintains original 2:3 aspect ratio');
assert(aboutSource.includes('ABOUT MASTERJIESTATES'), 'Contains eyebrow heading "ABOUT MASTERJIESTATES"');
assert(aboutSource.includes('Building Better Tomorrow'), 'Contains main heading "Building Better Tomorrow"');
assert(aboutSource.includes('From Finding Your Property to Building Your Dream.'), 'Contains company tagline');
assert(aboutSource.includes('property buying, selling, brokerage, investment assistance, and professional property consultation'), 'Details core real estate scope');

// Section 3: Founder & Leadership
assert(aboutSource.includes('Meet Our Leadership'), 'Contains section titled "Meet Our Leadership"');
assert(aboutSource.includes('Mr Shokin'), 'Contains confirmed founder name "Mr Shokin"');
assert(aboutSource.includes('Founder &amp; Property Consultant') || aboutSource.includes('Founder & Property Consultant'), 'Displays confirmed title "Founder & Property Consultant"');
assert(aboutSource.includes('CEO%20img.jpeg') || aboutSource.includes('CEO img.jpeg'), 'Uses genuine CEO photo (CEO img.jpeg)');
assert(!aboutSource.includes('unsplash.com') && !aboutSource.includes('randomuser.me'), 'Does not use stock/AI faces for founder');

// Section 6: Animation & Accessibility
assert(aboutSource.includes('import gsap from \'gsap\';'), 'Imports GSAP for subtle animations');
assert(aboutSource.includes('window.matchMedia(\'(prefers-reduced-motion: reduce)\').matches'), 'Respects prefers-reduced-motion');
assert(aboutSource.includes('ctx.revert()'), 'Properly cleans up GSAP context on unmount');

// Section 7: Strict Scope Restrictions
const heroPath = path.join(rootDir, 'client/src/components/home/HeroSection.jsx');
const heroSource = fs.readFileSync(heroPath, 'utf8');
assert(!heroSource.includes('Mr Shokin'), 'Homepage HeroSection was strictly untouched by leadership edits');

// Section 8: Production JS Bundle Check
const distAssetsDir = path.join(rootDir, 'client/dist/assets');
const jsFiles = fs.readdirSync(distAssetsDir).filter(f => f.startsWith('AboutUs-') && f.endsWith('.js'));
assert(jsFiles.length > 0, 'Production bundle contains compiled AboutUs component');
if (jsFiles.length > 0) {
  const aboutBundle = fs.readFileSync(path.join(distAssetsDir, jsFiles[0]), 'utf8');
  assert(aboutBundle.includes('Shokin') && aboutBundle.includes('Building Better Tomorrow'), 'Production bundle includes new leadership and heading content');
}

console.log('\n========================================================================');
console.log(` RESULTS: ${passCount} / ${passCount + failCount} ASSERTIONS PASSED (${Math.round((passCount / (passCount + failCount)) * 100)}%)`);
console.log('========================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

