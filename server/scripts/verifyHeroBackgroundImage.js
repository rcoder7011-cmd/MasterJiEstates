import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

console.log('========================================================================');
console.log(' MASTERJIESTATES: HERO SECTION BACKGROUND IMAGE VERIFICATION AUDIT');
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

// 1. Root Source Image Verification
const rootImagePath = path.join(rootDir, 'Hero_section_background.png');
assert(fs.existsSync(rootImagePath), 'Source Hero_section_background.png exists in project root');
const rootStat = fs.statSync(rootImagePath);
assert(rootStat.size > 0, `Source image size is valid (${rootStat.size} bytes)`);

// 2. Public Asset Verification
const publicImagePath = path.join(rootDir, 'client/public/images/Hero_section_background.png');
assert(fs.existsSync(publicImagePath), 'Copied image exists at client/public/images/Hero_section_background.png');
const publicStat = fs.statSync(publicImagePath);
assert(publicStat.size === rootStat.size, 'client/public/images/Hero_section_background.png is bit-for-bit identical to source');

// 3. Production Dist Verification
const distImagePath = path.join(rootDir, 'client/dist/images/Hero_section_background.png');
assert(fs.existsSync(distImagePath), 'Production bundle client/dist/images/Hero_section_background.png exists');
const distStat = fs.statSync(distImagePath);
assert(distStat.size === rootStat.size, 'client/dist/images/Hero_section_background.png matches original asset size');

// 4. HeroSection.jsx Code & Overlay Removal Audit
const heroPath = path.join(rootDir, 'client/src/components/home/HeroSection.jsx');
assert(fs.existsSync(heroPath), 'HeroSection.jsx exists');
const heroSource = fs.readFileSync(heroPath, 'utf8');

assert(!heroSource.includes('images.unsplash.com'), 'HeroSection.jsx contains zero references to Unsplash image URL');
assert(heroSource.includes("backgroundImage: `url('/images/Hero_section_background.png')`"), 'HeroSection.jsx references local public asset /images/Hero_section_background.png');
assert(heroSource.includes('bg-cover bg-center'), 'HeroSection.jsx retains responsive bg-cover bg-center styling');
assert(!heroSource.includes('mix-blend-luminosity'), 'HeroSection.jsx completely removed mix-blend-luminosity filter');
assert(!heroSource.includes('opacity-30'), 'HeroSection.jsx completely removed opacity-30 dimming');
assert(!heroSource.includes('from-brand-navy-dark'), 'HeroSection.jsx completely removed navy-blue gradient overlay');
assert(!heroSource.includes('className="relative bg-brand-navy-dark'), 'HeroSection.jsx completely removed bg-brand-navy-dark section background');

console.log('\n========================================================================');
console.log(` RESULTS: ${passCount} / ${passCount + failCount} ASSERTIONS PASSED (${Math.round((passCount / (passCount + failCount)) * 100)}%)`);
console.log('========================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
