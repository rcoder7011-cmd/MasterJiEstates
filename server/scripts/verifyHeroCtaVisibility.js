import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

console.log('========================================================================');
console.log(' MASTERJIESTATES: HERO "LIST YOUR PROPERTY" CTA VISIBILITY AUDIT');
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

// 1. Inspect HeroSection.jsx
const heroPath = path.join(rootDir, 'client/src/components/home/HeroSection.jsx');
assert(fs.existsSync(heroPath), 'HeroSection.jsx exists');

const heroSource = fs.readFileSync(heroPath, 'utf8');

// 2. Verify "List your property" button presence & casing
assert(heroSource.includes('List your property'), 'Hero section contains "List your property" button text');

// 3. Verify no invisible or conflicting classes
assert(!heroSource.includes('text-white hover:bg-white/10 hover:border-white px-6>\n                List your property'), 'Removed conflicting text-white / hover:bg-white/10 on List your property');
assert(!heroSource.includes('text-white\n                List your property'), 'No conflicting text-white directly preceding List your property');

// 4. Verify explicit text color & styling
assert(heroSource.includes("color: '#142B4F'"), 'Default text color explicitly set to Dark Navy (#142B4F)');
assert(heroSource.includes('text-[#142B4F]'), 'Tailwind class text-[#142B4F] applied');
assert(heroSource.includes('bg-brand-gold'), 'Background set to brand gold color (bg-brand-gold)');
assert(heroSource.includes('hover:bg-[#B38E46]'), 'Hover state sets slightly darker gold background (hover:bg-[#B38E46])');
assert(heroSource.includes('font-semibold'), 'Font weight set to 600 (font-semibold)');
assert(heroSource.includes('border border-[#B38E46]/40'), 'Subtle golden border applied');

// 5. Verify routing preservation
assert(heroSource.includes('/dashboard/listings/new'), 'Authenticated path preserves navigation to /dashboard/listings/new');
assert(heroSource.includes("to=\"/login\" state={{ from: { pathname: '/dashboard/listings/new' } }}"), 'Unauthenticated path preserves redirect state to /dashboard/listings/new');

// 6. Verify "Explore Properties" CTA preserves text and has icon
assert(heroSource.includes('<span>Explore Properties</span>'), 'Explore Properties button preserves exact text');

// 7. Verify compiled CSS bundle contains dark navy utility
const distCssDir = path.join(rootDir, 'client/dist/assets');
const cssFiles = fs.readdirSync(distCssDir).filter(f => f.endsWith('.css'));
assert(cssFiles.length > 0, 'Production CSS bundle exists');
const mainCss = fs.readFileSync(path.join(distCssDir, cssFiles[0]), 'utf8');
assert(mainCss.includes('#142b4f') || mainCss.includes('#142B4F'), 'Compiled CSS bundle includes #142B4F color declaration');

console.log('\n========================================================================');
console.log(` RESULTS: ${passCount} / ${passCount + failCount} ASSERTIONS PASSED (${Math.round((passCount / (passCount + failCount)) * 100)}%)`);
console.log('========================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
