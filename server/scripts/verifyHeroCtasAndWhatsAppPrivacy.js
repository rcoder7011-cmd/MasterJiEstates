import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

console.log('========================================================================');
console.log(' MASTERJIESTATES: HERO CTA ICONS, LIST PROPERTY & WHATSAPP PRIVACY AUDIT');
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

// Section 1: Button 1 (Explore Properties)
assert(heroSource.includes('<span>Explore Properties</span>'), 'Button 1 preserves exact text "Explore Properties"');
assert(heroSource.includes('w-4 h-4 ml-2 transition-transform duration-200 group-hover:scale-110'), 'Button 1 has Search icon immediately after text with w-4 h-4 ml-2 spacing');
assert(heroSource.includes('m21 21-4.35-4.35'), 'Button 1 contains valid Lucide Search SVG icon path');

// Section 1: Button 2 (List your property)
assert(heroSource.includes('List your property'), 'Button 2 preserves exact text "List your property"');
assert(heroSource.includes('M8 12h8') && heroSource.includes('M12 8v8'), 'Button 2 contains valid Lucide PlusCircle SVG icon path');
assert(heroSource.includes("color: '#142B4F'"), 'Button 2 text and icon color explicitly Dark Navy (#142B4F)');
assert(heroSource.includes('bg-brand-gold'), 'Button 2 maintains golden brand styling');

// Section 2: Visual Attention & Directional Indicator for "List your property"
assert(heroSource.includes('left-1/2 -translate-x-1/2') && (heroSource.includes('-top-6') || heroSource.includes('-top-7')), 'Directional indicator positioned cleanly above button without overlapping text');
assert(heroSource.includes('M19 14l-7 7m0 0l-7-7m7 7V3'), 'Directional downward arrow indicator pointing at List your property button');
assert(heroSource.includes('text-amber-300'), 'Attention indicator uses elegant amber/gold color palette');
assert(heroSource.includes('opacity-75') && heroSource.includes('rounded-lg bg-gradient-to-r'), 'Ambient golden glow halo applied behind List your property button');
assert(heroSource.includes('gap-y-8'), 'CTAs flex container includes vertical wrap gap (gap-y-8) to prevent mobile collisions');

// Section 3: FloatingWhatsApp Widget Privacy
const whatsappPath = path.join(rootDir, 'client/src/components/common/FloatingWhatsApp.jsx');
assert(fs.existsSync(whatsappPath), 'FloatingWhatsApp.jsx exists');
const whatsappSource = fs.readFileSync(whatsappPath, 'utf8');

assert(!whatsappSource.includes('COMPANY_CONFIG.whatsappDisplay'), 'Visible phone number (whatsappDisplay) completely removed from FloatingWhatsApp');
assert(!whatsappSource.includes('Chat on WhatsApp (+91'), 'Visible text "Chat on WhatsApp (+91...)" completely removed');
assert(!whatsappSource.includes('hidden sm:inline-flex items-center gap-2 px-3.5'), 'Old tooltip pill containing visible text removed');
assert(whatsappSource.includes('WhatsAppIcon className="w-7 h-7'), 'Floating WhatsApp retains high-visibility official WhatsApp logo/icon');
assert(whatsappSource.includes('aria-label="Chat with MasterJiEstates on WhatsApp"'), 'Accessible aria-label provided without exposing raw phone number in DOM text');

// Section 4: WhatsApp Functionality Preservation
const configPath = path.join(rootDir, 'client/src/config/companyConfig.js');
assert(fs.existsSync(configPath), 'companyConfig.js exists');
const configSource = fs.readFileSync(configPath, 'utf8');

assert(configSource.includes("whatsappNumber: '+917011202089'") || configSource.includes("whatsappNumber: '+91 7011202089'") || configSource.includes("7011202089"), 'WhatsApp destination phone number +91 7011202089 remains configured internally');
assert(whatsappSource.includes('getWhatsAppUrl(context)'), 'FloatingWhatsApp calls getWhatsAppUrl(context) for route-contextual messaging');
assert(whatsappSource.includes('href={whatsappUrl}'), 'Floating button href points to dynamic WhatsApp URL');
assert(whatsappSource.includes('target="_blank"'), 'WhatsApp link opens in new tab/app');

// Section 5: Responsive Layout Classes
assert(heroSource.includes('flex flex-wrap items-center justify-center gap-4 sm:gap-6 gap-y-8 mt-8 sm:mt-9'), 'Responsive flex-wrap container with calibrated margins and gaps');
assert(whatsappSource.includes('fixed ${bottomClass} right-4 sm:right-6 z-40'), 'WhatsApp maintains responsive bottomClass and fixed right placement');

console.log('\n========================================================================');
console.log(` RESULTS: ${passCount} / ${passCount + failCount} ASSERTIONS PASSED (${Math.round((passCount / (passCount + failCount)) * 100)}%)`);
console.log('========================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
