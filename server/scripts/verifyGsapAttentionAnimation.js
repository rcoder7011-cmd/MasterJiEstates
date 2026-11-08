import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

console.log('========================================================================');
console.log(' MASTERJIESTATES: GSAP ATTENTION ANIMATION & CTA VISUAL PRIORITY AUDIT');
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

// Section 1: Main CTA Visual Priority & Text
assert(heroSource.includes('List your property'), 'Target button preserves exact text "List your property"');
assert(heroSource.includes("color: '#142B4F'"), 'Button text explicitly styled with Dark Navy (#142B4F)');
assert(heroSource.includes('bg-brand-gold'), 'Button maintains MasterJi golden brand background');
assert(heroSource.includes('overflow-hidden'), 'Button contains overflow-hidden for bounded shine glint');
assert(heroSource.includes('hover:scale-[1.02]'), 'Subtle smooth hover scale (1.02) without aggressive bouncing');

// Section 2: GSAP Attention Sequence Implementation
assert(heroSource.includes('const tl = gsap.timeline();'), 'Initial entrance uses smooth GSAP timeline');
assert(heroSource.includes("tl.fromTo(\n        '.hero-list-cta-pointer'"), 'GSAP animates directional pointer towards "List your property" CTA on load');
assert(heroSource.includes("gsap.to('.hero-list-cta-pointer-arrow'"), 'GSAP animates gentle periodic downward arrow pointer guidance');
assert(heroSource.includes("gsap.to('.hero-list-cta-glow'"), 'GSAP animates soft golden outer ambient glow breathing');
assert(heroSource.includes("gsap.fromTo(\n        '.hero-list-cta-shine'"), 'GSAP animates premium golden shine sweep across the button');
assert(heroSource.includes('repeatDelay: 6'), 'Golden shine sweep is occasional (repeatDelay: 6s) rather than continuous/distracting');

// Section 3: Clean up and Accessibility
assert(heroSource.includes('return () => ctx.revert();'), 'GSAP context cleanly reverted on component unmount');
assert(heroSource.includes("window.matchMedia('(prefers-reduced-motion: reduce)').matches"), 'Respects prefers-reduced-motion to protect users who prefer reduced motion');

// Section 4: Directional Indicator & Elements
assert(heroSource.includes('hero-list-cta-pointer'), 'Directional pointer element exists with hero-list-cta-pointer class');
assert(heroSource.includes('hero-list-cta-glow'), 'Soft ambient golden glow halo element exists with hero-list-cta-glow class');
assert(heroSource.includes('hero-list-cta-shine'), 'Golden shine element exists with hero-list-cta-shine class');
assert(heroSource.includes('M19 14l-7 7m0 0l-7-7m7 7V3'), 'Arrow points directly downwards towards List your property CTA');

// Section 5: Preservation of Navigation & Explore Properties
assert(heroSource.includes('/dashboard/listings/new'), 'Authenticated path preserves navigation to /dashboard/listings/new');
assert(heroSource.includes("to=\"/login\" state={{ from: { pathname: '/dashboard/listings/new' } }}"), 'Unauthenticated path preserves redirect state to /dashboard/listings/new');
assert(heroSource.includes('<span>Explore Properties</span>'), 'Explore Properties button remains preserved with its search icon');

console.log('\n========================================================================');
console.log(` RESULTS: ${passCount} / ${passCount + failCount} ASSERTIONS PASSED (${Math.round((passCount / (passCount + failCount)) * 100)}%)`);
console.log('========================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
