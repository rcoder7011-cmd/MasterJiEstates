import mongoose from 'mongoose';
import { isDatabaseConnected } from '../config/database.js';
import ContactMessage from '../models/ContactMessage.js';
import SiteContent from '../models/SiteContent.js';
import { logAdminActivity } from './adminService.js';

// =================================================================
// In-Memory Fallback Stores for Disconnected Mode
// =================================================================
export const inMemoryContactMessages = new Map();
export const inMemorySiteContent = new Map();

// Helper to generate reference code
function generateContactReference() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CONT-${dateStr}-${randomSuffix}`;
}

// =================================================================
// Default Seed Data
// =================================================================
const DEFAULT_COMPANY_CONTENT = {
  brandName: 'MasterJiEstates',
  tagline: 'From Finding Your Property to Building Your Dream.',
  officialDomain: 'https://masterjiestates.in',
  description:
    'MasterJiEstates is a premier real-estate advisory and transaction coordination platform based in Noida Sector 62A, serving Delhi, Uttar Pradesh, Ghaziabad, Noida, and Gurugram. We connect verified buyers and property owners through transparent, legally scrutinized brokerage deals and offer direct company-owned real-estate opportunities.',
  primaryFocus: [
    'Property Buying Assistance & Discovery',
    'Privacy-Preserving Property Selling & Mandates',
    'Brokerage & Transaction Coordination',
    'MasterJi Direct Legally Scrutinized Company Assets',
    'Title, Municipal Sanction & Registry Guidance',
  ],
  contactInfo: {
    officeAddress: 'Noida Sector 62A, Uttar Pradesh, India',
    city: 'Noida',
    state: 'Uttar Pradesh',
    country: 'India',
    pinCode: '201309',
    phone: '+91 9990316186',
    whatsapp: '+91 7011202089',
    email: 'masterjiestates@gmail.com',
    supportEmail: 'masterjiestates@gmail.com',
    grievanceEmail: 'masterjiestates@gmail.com',
    serviceAreas: ['Delhi', 'Uttar Pradesh', 'Ghaziabad', 'Noida', 'Gurugram', 'Indirapuram'],
    operatingHours: 'Monday – Saturday: 9:30 AM – 7:00 PM IST (Sundays by appointment for site visits)',
    note: 'Office visits are welcomed by prior appointment for tailored advisory.',
  },
  udyamRegistration: {
    status: 'Registered',
    displayText: 'Udyam Registered Enterprise',
    verificationPortalUrl: 'https://udyamregistration.gov.in/UdyamRegistration.aspx',
  },
  socialLinks: {
    linkedin: 'https://linkedin.com/company/masterjiestates',
    twitter: 'https://twitter.com/masterjiestates',
    instagram: 'https://instagram.com/masterjiestates',
  },
};

const DEFAULT_SERVICES_CONTENT = [
  // Primary Real Estate Services
  {
    id: 'buying-assistance',
    title: 'Property Buying Assistance',
    category: 'real_estate',
    deliveryType: 'direct',
    isPrimary: true,
    isActive: true,
    displayOrder: 1,
    tagline: 'Unbiased Representation from Discovery to Deed Execution',
    shortDesc:
      'End-to-end guidance from discovery and title scrutiny to escorted site visits, price negotiation representation, and deed execution.',
    features: [
      'Zero duplicate or bait listings with verified property status',
      'Preliminary title deed & encumbrance check guidance',
      'Escorted, scheduled on-ground site visits with property specialists',
      'Direct, fair price negotiation representation',
      'Sub-Registrar office coordination and stamp duty advisory',
    ],
    deliveryNote: 'Directly provided by MasterJiEstates dedicated real estate advisory team.',
    ctaText: 'Browse Available Properties',
    ctaLink: '/properties',
  },
  {
    id: 'selling-mandates',
    title: 'Property Selling & Mandates',
    category: 'real_estate',
    deliveryType: 'direct',
    isPrimary: true,
    isActive: true,
    displayOrder: 2,
    tagline: 'Owner Privacy Protection with Targeted High-Net-Worth Reach',
    shortDesc:
      'Dedicated seller representation that shields owner phone numbers from scrapers while connecting pre-qualified buyers and coordinating legal sale deeds.',
    features: [
      'Strict owner contact masking from open classified scrapers',
      'Pre-qualified, verified buyer matching to prevent casual visitors',
      'High-quality presentation & Cloudinary-hosted photo staging',
      'Individually agreed brokerage mandate terms with zero hidden fees',
      'Complete closing & handover documentation support',
    ],
    deliveryNote: 'Directly provided by MasterJiEstates brokerage division.',
    ctaText: 'List Your Property',
    ctaLink: '/register',
  },
  {
    id: 'direct-assets',
    title: 'MasterJi Direct Company Assets',
    category: 'real_estate',
    deliveryType: 'direct',
    isPrimary: true,
    isActive: true,
    displayOrder: 3,
    tagline: 'Institutional Quality, Zero Buyer Brokerage',
    shortDesc:
      'Company-owned residential and commercial inventory acquired with clear, unencumbered titles and offered for direct purchase.',
    features: [
      '100% legally scrutinized title deeds with clean encumbrance certificates',
      'Zero buyer brokerage fee on all MasterJi Direct assets',
      'Immediate registry and physical possession readiness',
      'Complete documentation history provided upfront',
      'Pre-approved for bank financing by leading lenders',
    ],
    deliveryNote: 'Directly owned and sold by MasterJiEstates corporate inventory.',
    ctaText: 'Explore Direct Assets',
    ctaLink: '/properties?type=company_owned',
  },
  {
    id: 'legal-registry-coordination',
    title: 'Registry & Advisory Coordination',
    category: 'real_estate',
    deliveryType: 'direct',
    isPrimary: true,
    isActive: true,
    displayOrder: 4,
    tagline: 'Flawless Conveyance & Sub-Registrar Liaison',
    shortDesc:
      'Guidance through the paperwork of sub-registrar deed execution, municipal transfer (mutation), and encumbrance checks.',
    features: [
      'Sub-Registrar office slot booking & appointment liaison',
      'Accurate stamp duty calculation based on current collector rates',
      'Drafting of customized Agreements to Sell and Conveyance Deeds',
      'Encumbrance Certificate (Form 15/16) verification guidance',
      'Tax deduction at source (TDS under Section 194-IA) workflow support',
    ],
    deliveryNote: 'Directly provided by MasterJiEstates legal liaison desk.',
    ctaText: 'Inquire Registry Support',
    ctaLink: '/contact?subject=Registry%20Coordination',
  },

  // Secondary Allied Services
  {
    id: 'home-loans',
    title: 'Home Loans Assistance',
    category: 'allied',
    deliveryType: 'verified_partner',
    isPrimary: false,
    isActive: true,
    displayOrder: 5,
    tagline: 'Competitive Rates via Certified Banking Partners',
    shortDesc:
      'Assistance with comparing competitive home loan interest rates, evaluating eligibility, and liaising with leading public and private banks.',
    features: [
      'Partner network spanning leading public & private commercial banks',
      'Comparative evaluation of floating vs. fixed interest options',
      'Fast-track documentation collation and pre-sanction evaluation',
      'Doorstep document collection by authorized bank relationship managers',
      'Zero advisory surcharge payable to MasterJiEstates',
    ],
    deliveryNote:
      'Delivered through certified banking & financial institution partners. Final credit approval is at the discretion of the lending bank.',
    ctaText: 'Inquire Home Loan',
    ctaLink: '/contact?subject=Home%20Loans',
  },
  {
    id: 'interior-design',
    title: 'Interior Design & Turnkey Fit-Outs',
    category: 'allied',
    deliveryType: 'verified_partner',
    isPrimary: false,
    isActive: true,
    displayOrder: 6,
    tagline: 'Functional Elegance Crafted by Vetted Interior Studios',
    shortDesc:
      'Turnkey residential and commercial interior solutions from concept layouts and 3D visualization to on-site execution.',
    features: [
      'Tailored space planning, mood boards, and 3D visual walkthroughs',
      'Curated material selection (Italian marble, veneers, modular hardware)',
      'Vetted, licensed interior contractor and designer partners',
      'Transparent milestone-based cost estimations with zero hidden extras',
      'Comprehensive quality audit prior to key handover',
    ],
    deliveryNote:
      'Delivered via certified interior design studios in our partner network. Consultations coordinated upon request.',
    ctaText: 'Request Interior Consultation',
    ctaLink: '/contact?subject=Interior%20Design',
  },
  {
    id: 'architecture-planning',
    title: 'Architecture & Structural Planning',
    category: 'allied',
    deliveryType: 'verified_partner',
    isPrimary: false,
    isActive: true,
    displayOrder: 7,
    tagline: 'Architectural Excellence Grounded in Municipal Compliance',
    shortDesc:
      'Expert architectural designs, structural drawings, and municipal sanction advisory for plots, villas, and independent builder floors.',
    features: [
      'Custom floor plans, elevations, and 3D exterior visualization',
      'Structural engineering drawings and seismic safety calculations',
      'Municipal building bye-law compliance & FAR optimization guidance',
      'Sustainable building & traditional vastu consultation options',
      'Detailed Bill of Quantities (BOQ) preparation for contractor bidding',
    ],
    deliveryNote:
      'Delivered through licensed architecture firms and structural consultants in our verified professional network.',
    ctaText: 'Request Architectural Review',
    ctaLink: '/contact?subject=Architecture',
  },
  {
    id: 'carpentry-woodwork',
    title: 'Carpentry & Bespoke Woodwork',
    category: 'allied',
    deliveryType: 'coming_soon',
    isPrimary: false,
    isActive: true,
    displayOrder: 8,
    tagline: 'Artisanal Joinery & Modular Storage Systems',
    shortDesc:
      'Modular kitchen cabinetry, custom wardrobes, and high-finish architectural woodwork for newly purchased homes.',
    features: [
      'Modular kitchen design with German/Austrian soft-close hardware',
      'Floor-to-ceiling wardrobes and concealed dressing units',
      'Hardwood wall paneling, solid doors, and bespoke vanity counters',
      'Precision on-site installation by master craftsmen',
    ],
    deliveryNote:
      'Service pipeline currently under vendor onboarding. Available on select Gurugram residential projects by prior request.',
    ctaText: 'Join Service Waitlist',
    ctaLink: '/contact?subject=Carpentry',
  },
  {
    id: 'furniture-solutions',
    title: 'Furniture & Staging Solutions',
    category: 'allied',
    deliveryType: 'coming_soon',
    isPrimary: false,
    isActive: true,
    displayOrder: 9,
    tagline: 'Curated Living Packages for Discerning Homeowners',
    shortDesc:
      'Curated furniture packages for luxury apartments, villas, and rental investment properties seeking turnkey readiness.',
    features: [
      'Harmonized living, dining, and master bedroom complete collections',
      'Executive work-from-home ergonomic furniture packages',
      'Property staging solutions for sellers seeking premium market closure',
      'Direct manufacturer logistics with white-glove assembly',
    ],
    deliveryNote:
      'Catalog currently in preparation. Contact our desk for custom enterprise and high-volume residential requirements.',
    ctaText: 'Inquire Furniture Solutions',
    ctaLink: '/contact?subject=Furniture',
  },
  {
    id: 'software-digital-solutions',
    title: 'Software & Digital Solutions',
    category: 'allied',
    deliveryType: 'direct',
    isPrimary: false,
    isActive: true,
    displayOrder: 10,
    tagline: 'PropTech Tools for Real Estate Portfolios & Agencies',
    shortDesc:
      'Digital asset management, customized property portfolio tracking, and real-estate workflow tools for high-net-worth investors and partner agencies.',
    features: [
      'Customized digital portfolio dashboard for multi-property owners',
      'Secure tenant & lease agreement digital document vault',
      'Automated property tax & maintenance reminder alerts',
      'Technical integration and custom real-estate advisory tools',
    ],
    deliveryNote:
      'Engineered in-house by MasterJiEstates digital technology division for partner agencies and institutional investors.',
    ctaText: 'Discuss Digital Solutions',
    ctaLink: '/contact?subject=Digital%20Solutions',
  },
];

const DEFAULT_FAQS_CONTENT = [
  // 1. Property Browsing
  {
    id: 'faq-01',
    category: 'browsing',
    categoryLabel: 'Property Browsing',
    question: 'How does MasterJiEstates ensure listings on the portal are authentic?',
    answer:
      'Unlike open classified portals where anyone can post unverified listings, MasterJiEstates operates a strict moderation gateway. External seller listings must complete a 6-step verification submission, pass title document and photo checks by our team, and obtain administrative approval before appearing publicly.',
  },
  {
    id: 'faq-02',
    category: 'browsing',
    categoryLabel: 'Property Browsing',
    question: 'What does the "MasterJi Direct" badge mean on a property card?',
    answer:
      'A "MasterJi Direct" badge designates a company-owned property that MasterJiEstates has acquired directly (often through distress sales or bank liquidations) with clean, unencumbered titles. Buyers purchase directly from our corporate inventory with zero brokerage fees.',
  },

  // 2. Property Enquiries
  {
    id: 'faq-03',
    category: 'enquiries',
    categoryLabel: 'Property Enquiries',
    question: 'What happens after I submit an enquiry on a property?',
    answer:
      'When you submit an enquiry, our system assigns a unique reference code (e.g., ENQ-20261107-XXXX) and logs it in your user dashboard under "My Enquiries". A dedicated property advisor reviews your requirements, checks the property\'s current status, and contacts you by phone or email to assist further.',
  },
  {
    id: 'faq-04',
    category: 'enquiries',
    categoryLabel: 'Property Enquiries',
    question: 'Will my phone number be shared publicly or sold to third-party telemarketers?',
    answer:
      'No. MasterJiEstates strictly protects user privacy. Your contact details are stored securely and accessed solely by authorized MasterJiEstates advisors assigned to coordinate your enquiry. We never sell contact data or publish personal numbers on the internet.',
  },

  // 3. Buying & Selling
  {
    id: 'faq-05',
    category: 'buying_selling',
    categoryLabel: 'Buying & Selling',
    question: 'What steps are involved in purchasing a property through MasterJiEstates?',
    answer:
      'The process begins with property discovery and scheduling an escorted site inspection. Once you identify a property, our advisory desk assists with price negotiation, title document review, drafting the Agreement to Sell, booking the Sub-Registrar appointment, and coordinating deed execution and possession.',
  },
  {
    id: 'faq-06',
    category: 'buying_selling',
    categoryLabel: 'Buying & Selling',
    question: 'Does MasterJiEstates assist with property registration at the Sub-Registrar office?',
    answer:
      'Yes. Our documentation and legal liaison desk assists with circle rate calculations, stamp duty e-challan generation, conveyance deed drafting, and accompanies the buyer and seller to the Sub-Registrar office for biometric registration.',
  },

  // 4. Seller Listing Submission
  {
    id: 'faq-07',
    category: 'submissions',
    categoryLabel: 'Seller Listing Submission',
    question: 'Can any property owner list their property on MasterJiEstates?',
    answer:
      'Yes. Any verified property owner with legal title can submit a listing through our guided 6-step submission wizard in the User Dashboard. You will provide property specifications, location landmarks, asking price, and upload clear photographs.',
  },
  {
    id: 'faq-08',
    category: 'submissions',
    categoryLabel: 'Seller Listing Submission',
    question: 'Why is my newly submitted property not immediately visible on the public website?',
    answer:
      'All newly submitted listings enter the "Pending Review" queue. Our curation desk reviews the property details, checks against duplicate entries, confirms owner identity, and inspects photo assets to ensure platform quality before approving publication.',
  },

  // 5. Moderation & Approvals
  {
    id: 'faq-09',
    category: 'moderation',
    categoryLabel: 'Moderation & Verification',
    question: 'What happens if changes are requested on my property listing during moderation?',
    answer:
      'If our curation team finds missing specifications or unclear photos, your listing will transition to "Changes Requested" status with specific feedback remarks from the administrator. The listing is unlocked for editing in your dashboard, allowing you to revise and resubmit for review.',
  },

  // 6. Site Visits
  {
    id: 'faq-10',
    category: 'site_visits',
    categoryLabel: 'Site Visits',
    question: 'How do I schedule an in-person site visit for a property?',
    answer:
      'On any active property details page, click "Schedule Site Visit". Select your preferred date and time slot (e.g., Morning 10 AM – 1 PM or Afternoon 2 PM – 5 PM). You will receive a visit reference code (e.g., VISIT-20261107-XXXX) tracked inside your user dashboard.',
  },
  {
    id: 'faq-11',
    category: 'site_visits',
    categoryLabel: 'Site Visits',
    question: 'Can I reschedule or cancel a booked site visit?',
    answer:
      'Yes. You can cancel or request rescheduling of an upcoming site visit directly from the "Site Visits" tab in your User Dashboard at any time prior to the scheduled inspection.',
  },

  // 7. Brokerage & Commissions
  {
    id: 'faq-12',
    category: 'brokerage',
    categoryLabel: 'Brokerage & Commissions',
    question: 'How are brokerage fees calculated for property transactions?',
    answer:
      'Brokerage fees are governed by individually executed, written representation agreements signed between MasterJiEstates and the client. Terms may be structured as a percentage of the registered sale deed value or as an agreed fixed fee. MasterJiEstates does not impose an arbitrary universal rate.',
  },
  {
    id: 'faq-13',
    category: 'brokerage',
    categoryLabel: 'Brokerage & Commissions',
    question: 'Is brokerage payable on "MasterJi Direct" company-owned properties?',
    answer:
      'No. Buyers do not pay any brokerage commission when purchasing properties labeled "MasterJi Direct", because they are purchasing directly from our company inventory.',
  },

  // 8. Allied Services
  {
    id: 'faq-14',
    category: 'allied_services',
    categoryLabel: 'Allied Home Services',
    question: 'Does MasterJiEstates directly provide home loans or interior design?',
    answer:
      'MasterJiEstates is primarily a real-estate brokerage and asset management firm. Allied services such as Home Loans, Architecture, and Turnkey Interiors are delivered through our curated network of certified third-party banking institutions and professional design studios.',
  },
  {
    id: 'faq-15',
    category: 'allied_services',
    categoryLabel: 'Allied Home Services',
    question: 'Are quotes for allied services guaranteed by MasterJiEstates?',
    answer:
      'No. Estimates for home loans, architecture, or interior works depend on site-specific requirements, credit appraisals, and partner evaluations. Partner agreements and warranties apply directly between you and the respective service provider.',
  },

  // 9. Account & Privacy
  {
    id: 'faq-16',
    category: 'privacy',
    categoryLabel: 'Account & Privacy',
    question: 'Do I need separate accounts to buy and sell properties?',
    answer:
      'No. MasterJiEstates features a unified account architecture. A single registration allows you to save favourite properties, submit buyer enquiries, book site visits, and submit property listings as a seller.',
  },
  {
    id: 'faq-17',
    category: 'privacy',
    categoryLabel: 'Account & Privacy',
    question: 'How is user authentication secured on the platform?',
    answer:
      'Sessions are protected using cryptographically signed JSON Web Tokens (JWT) stored exclusively in secure, HTTP-only cookies that cannot be accessed by browser scripts. Double-submit CSRF tokens and rate limiting are enforced across all authenticated and form endpoints.',
  },
];

const DEFAULT_LEGAL_CONTENT = {
  privacy_policy: {
    title: 'Privacy Policy',
    lastUpdated: 'November 2026',
    sections: [
      {
        heading: '1. Introduction & Scope',
        content:
          'MasterJiEstates ("we", "our", or "the Company") values the privacy of every individual who visits our official website (https://masterjiestates.in) and utilizes our real estate advisory, property discovery, and transaction coordination services. This Privacy Policy outlines our practices regarding the collection, processing, storage, and safeguarding of personal data in compliance with applicable Indian information technology and digital personal data protection laws (including the Digital Personal Data Protection Act, 2023).',
      },
      {
        heading: '2. Information We Collect',
        content:
          'We collect personal information that you voluntarily provide when registering an account, submitting a property enquiry, scheduling a site visit, listing a property for sale, or submitting a message via our contact form. This information includes your full name, email address, 10-digit mobile number, property preferences, and property ownership documentation provided for listing verification.',
      },
      {
        heading: '3. Purpose of Processing',
        content:
          'Your personal information is used exclusively to: (a) authenticate and maintain your unified account; (b) facilitate communication between property advisors, buyers, and sellers; (c) coordinate physical site inspections; (d) verify property listings prior to publication; (e) comply with statutory real-estate advisory and taxation requirements; and (f) protect against fraud and unauthorized platform access.',
      },
      {
        heading: '4. Non-Disclosure & Contact Masking Guarantee',
        content:
          'MasterJiEstates maintains a strict non-disclosure policy. We do not sell, rent, or trade your personal information to third-party telemarketers or marketing agencies. External seller phone numbers and private addresses are strictly masked from public catalog view to shield property owners from open web scrapers and unsolicited commercial calls.',
      },
      {
        heading: '5. Cookies & Tracking Technologies',
        content:
          'We deploy only necessary, secure, HTTP-only cookies required for session authentication (mj_auth_token) and double-submit cross-site request forgery prevention (mj_csrf_token). We do not deploy invasive third-party cross-site advertising trackers or behavioural surveillance pixels.',
      },
      {
        heading: '6. Data Retention & Grievance Redressal',
        content:
          'Personal data is retained only for as long as necessary to fulfill transaction coordination and statutory compliance obligations. If you have questions regarding your data or wish to exercise your rights of correction or erasure, please contact our Grievance Officer at masterjiestates@gmail.com or write to our registered office in Noida Sector 62A, Uttar Pradesh, India.',
      },
    ],
  },
  terms_and_conditions: {
    title: 'Terms & Conditions',
    lastUpdated: 'November 2026',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        content:
          'By accessing or using the MasterJiEstates platform (https://masterjiestates.in), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must refrain from using the website and its associated advisory services.',
      },
      {
        heading: '2. Nature of Platform & Role of MasterJiEstates',
        content:
          'MasterJiEstates operates as a digital real-estate advisory, discovery, and transaction coordination intermediary. Except for properties explicitly marked with the "MasterJi Direct" badge (which are company-owned inventory), MasterJiEstates does not claim legal title or ownership of listings submitted by third-party sellers. Our role is strictly that of a facilitator connecting prospective buyers with sellers and assisting in negotiation and conveyance coordination.',
      },
      {
        heading: '3. Informational Nature of Listings & Buyer Due Diligence',
        content:
          'Property listings, photographs, square footages, specifications, floor plans, and asking prices published on the platform are provided for informational and preliminary guidance purposes only. While MasterJiEstates conducts preliminary curation and document screening, publication does NOT constitute a warranty of absolute title, municipal approval, building sanction, absence of encumbrance, or structural integrity. Prospective buyers are strongly advised to engage an independent legal advocate to conduct title searches and physical on-ground due diligence prior to executing financial commitments.',
      },
      {
        heading: '4. User Obligations & Conduct',
        content:
          'Users agree to provide accurate, truthful information during registration, property submission, and enquiry generation. Submitting fabricated ownership documents, misleading pricing, abusive messages, or attempting to reverse-engineer platform security boundaries will result in immediate account suspension and potential legal referral under applicable Indian law.',
      },
      {
        heading: '5. Limitation of Liability',
        content:
          'To the fullest extent permissible by Indian law, MasterJiEstates, its directors, advisors, and affiliates shall not be liable for any indirect, incidental, or consequential damages resulting from transaction disputes between independent buyers and sellers, market price fluctuations, delayed municipal approvals, or third-party service delivery.',
      },
    ],
  },
  disclaimer: {
    title: 'Real Estate & Statutory Disclaimer',
    lastUpdated: 'November 2026',
    sections: [
      {
        heading: '1. General Real Estate Notice',
        content:
          'The information provided on https://masterjiestates.in is intended solely for general guidance and informational reference concerning real estate properties in the National Capital Region (NCR) and across India. Nothing on this website constitutes formal legal advice, tax consultation, or a binding contractual offer.',
      },
      {
        heading: '2. Title, Ownership & Possession Disclaimer',
        content:
          'MasterJiEstates makes reasonable efforts to verify owner identities and preliminary document copies for submitted listings. However, publication of a property on this website does NOT warrant or guarantee that the property is free of legal encumbrances, litigation, mortgage hypothecation, municipal sealings, or unapproved structural additions. Absolute verification of title chain, revenue records (Jamabandi/Mutation), and physical vacant possession must be verified independently by the buyer or their legal counsel.',
      },
      {
        heading: '3. Area Measurements & Visual Media',
        content:
          'All measurements, carpet areas, super built-up areas, plot dimensions, and boundary depictions are approximate and sourced from owner disclosures or architectural estimates. Actual carpet area should be verified as defined under relevant Real Estate (Regulation and Development) Act (RERA) rules and physical measurement.',
      },
      {
        heading: '4. No Guarantee of Capital Appreciation or Loan Sanction',
        content:
          'MasterJiEstates does not make any representations, guarantees, or forecasts regarding the future capital appreciation, rental yield, or resale liquidity of any property. Eligibility for bank home loans is subject strictly to individual credit appraisal by authorized lending institutions.',
      },
    ],
  },
  brokerage_policy: {
    title: 'Brokerage & Mandate Policy',
    lastUpdated: 'November 2026',
    sections: [
      {
        heading: '1. Representation on Written Agreement Basis',
        content:
          'MasterJiEstates conducts brokerage operations strictly on the basis of individualized, written representation agreements executed between the client (buyer or seller) and the Company. MasterJiEstates does not mandate an arbitrary or universal fixed commission percentage across all properties. Commission terms, percentage rates, or fixed fees are mutually agreed upon prior to active transaction facilitation.',
      },
      {
        heading: '2. Zero Commission on "MasterJi Direct" Inventory',
        content:
          'No brokerage fee or facilitation commission of any kind is charged to the buyer when purchasing a property designated with the "MasterJi Direct" badge. These assets are sold directly from our corporate inventory.',
      },
      {
        heading: '3. Payment Milestones & Accounting Ledger',
        content:
          'Unless specified otherwise in the written mandate agreement, brokerage commissions are typically payable in agreed tranches: (a) Advance tranche upon execution of the formal Agreement to Sell, and (b) Final tranche upon registration of the Conveyance Deed at the Sub-Registrar office. All payments must be remitted via verifiable banking channels (RTGS/NEFT/Cheque/UPI) with official electronic receipts issued.',
      },
      {
        heading: '4. Reversal & Refund Guidelines',
        content:
          'In the event that an executed transaction is cancelled or fails to consummate through no fault or breach of the client, payment adjustments or reversals shall be governed strictly by the dispute and cancellation clauses of the signed representation mandate.',
      },
    ],
  },
  cookie_policy: {
    title: 'Cookie & Tracking Policy',
    lastUpdated: 'November 2026',
    sections: [
      {
        heading: '1. What Are Cookies?',
        content:
          'Cookies are small text files placed on your device by your web browser when you visit a website. They enable websites to remember user authentication states and protect against cross-site attacks.',
      },
      {
        heading: '2. Cookies Used by MasterJiEstates',
        content:
          'MasterJiEstates utilizes strictly essential cookies required for the operational security and session integrity of the platform: (a) "mj_auth_token": A secure, HTTP-only cookie storing your cryptographically signed session token; and (b) "mj_csrf_token": A security token used in accordance with the double-submit cookie pattern to protect mutating requests against Cross-Site Request Forgery (CSRF).',
      },
      {
        heading: '3. No Third-Party Tracking Cookies',
        content:
          'We do not employ third-party advertising cookies, social media tracking pixels, or cross-site user profiling technologies. Your browsing history is not monitored across external websites.',
      },
      {
        heading: '4. Managing Your Cookies',
        content:
          'You may configure your browser to block or alert you about cookies. However, please note that blocking the essential "mj_auth_token" and "mj_csrf_token" cookies will prevent authentication and administrative dashboard access.',
      },
    ],
  },
};

// =================================================================
// Pre-Seed Memory Store
// =================================================================
export function initializeDefaultContent() {
  if (inMemorySiteContent.size === 0) {
    inMemorySiteContent.set('company', JSON.parse(JSON.stringify(DEFAULT_COMPANY_CONTENT)));
    inMemorySiteContent.set('services', JSON.parse(JSON.stringify(DEFAULT_SERVICES_CONTENT)));
    inMemorySiteContent.set('faqs', JSON.parse(JSON.stringify(DEFAULT_FAQS_CONTENT)));
    inMemorySiteContent.set('legal', JSON.parse(JSON.stringify(DEFAULT_LEGAL_CONTENT)));
  }
}

// Auto-seed on load
initializeDefaultContent();

// =================================================================
// 1. Contact Form Service
// =================================================================
export async function submitContactMessage(contactData, clientIp = '') {
  const { name, email, phone, subject, message } = contactData;

  // Validation
  if (!name || name.trim().length < 2 || name.trim().length > 100) {
    const error = new Error('Full name is required and must be between 2 and 100 characters.');
    error.statusCode = 400;
    throw error;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    const error = new Error('A valid email address is required.');
    error.statusCode = 400;
    throw error;
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  const cleanPhone = (phone || '').replace(/\D/g, '');
  if (!phoneRegex.test(cleanPhone)) {
    const error = new Error('Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
    error.statusCode = 400;
    throw error;
  }

  if (!subject || subject.trim().length < 3 || subject.trim().length > 150) {
    const error = new Error('Subject is required and must be between 3 and 150 characters.');
    error.statusCode = 400;
    throw error;
  }

  if (!message || message.trim().length < 10 || message.trim().length > 2000) {
    const error = new Error('Message is required and must be between 10 and 2000 characters.');
    error.statusCode = 400;
    throw error;
  }

  const referenceCode = generateContactReference();

  const newContactRecord = {
    referenceCode,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: cleanPhone,
    subject: subject.trim(),
    message: message.trim(),
    status: 'new',
    ipAddress: clientIp || '',
    adminNotes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let savedRecord = null;

  if (isDatabaseConnected()) {
    try {
      const doc = await ContactMessage.create(newContactRecord);
      savedRecord = doc.toObject();
    } catch (err) {
      console.error('[ContentService] Error saving ContactMessage to MongoDB:', err.message);
    }
  }

  if (!savedRecord) {
    const memoryId = `cont_${Date.now()}`;
    savedRecord = {
      id: memoryId,
      _id: memoryId,
      ...newContactRecord,
      createdAt: newContactRecord.createdAt.toISOString(),
      updatedAt: newContactRecord.updatedAt.toISOString(),
    };
    inMemoryContactMessages.set(memoryId, savedRecord);
  }

  console.log(
    `[MasterJiEstates Contact] Message logged: Ref=${referenceCode}, Contact=${savedRecord.name} (${savedRecord.phone}), Subject="${savedRecord.subject}"`
  );

  return {
    referenceCode: savedRecord.referenceCode,
    name: savedRecord.name,
    email: savedRecord.email,
    phone: savedRecord.phone,
    subject: savedRecord.subject,
    status: savedRecord.status,
    createdAt: savedRecord.createdAt,
    message: 'Your inquiry has been received. A MasterJiEstates advisor will reach out shortly.',
  };
}

export async function getContactMessages({ page = 1, limit = 20, status = '', search = '' } = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (p - 1) * l;

  if (isDatabaseConnected()) {
    try {
      const query = {};
      if (status) query.status = status;
      if (search && search.trim()) {
        const s = search.trim();
        query.$or = [
          { referenceCode: new RegExp(s, 'i') },
          { name: new RegExp(s, 'i') },
          { email: new RegExp(s, 'i') },
          { phone: new RegExp(s, 'i') },
          { subject: new RegExp(s, 'i') },
        ];
      }

      const [total, docs] = await Promise.all([
        ContactMessage.countDocuments(query),
        ContactMessage.find(query).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
      ]);

      return {
        items: docs.map((doc) => ({
          id: doc._id?.toString(),
          _id: doc._id?.toString(),
          referenceCode: doc.referenceCode,
          name: doc.name,
          email: doc.email,
          phone: doc.phone,
          subject: doc.subject,
          message: doc.message,
          status: doc.status,
          adminNotes: doc.adminNotes,
          respondedBy: doc.respondedBy,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        })),
        pagination: {
          page: p,
          limit: l,
          total,
          totalPages: Math.ceil(total / l) || 1,
        },
      };
    } catch (err) {
      console.error('[ContentService] Error fetching MongoDB contact messages:', err.message);
    }
  }

  // Memory fallback
  let list = Array.from(inMemoryContactMessages.values());
  if (status) {
    list = list.filter((m) => m.status === status);
  }
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    list = list.filter(
      (m) =>
        m.referenceCode?.toLowerCase().includes(s) ||
        m.name?.toLowerCase().includes(s) ||
        m.email?.toLowerCase().includes(s) ||
        m.phone?.includes(s) ||
        m.subject?.toLowerCase().includes(s)
    );
  }

  list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const total = list.length;
  const paginated = list.slice(skip, skip + l);

  return {
    items: paginated,
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
}

export async function updateContactMessageStatus(adminUser, messageId, { status, adminNotes = '' }) {
  const VALID_STATUSES = ['new', 'in_progress', 'responded', 'archived'];
  if (status && !VALID_STATUSES.includes(status)) {
    const error = new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  let message = null;

  if (isDatabaseConnected()) {
    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(messageId);
      const filter = isObjectId ? { _id: messageId } : { referenceCode: messageId };
      const doc = await ContactMessage.findOne(filter);
      if (doc) {
        if (status) doc.status = status;
        if (adminNotes !== undefined) doc.adminNotes = adminNotes.trim();
        if (status === 'responded') {
          doc.respondedBy = {
            adminId: adminUser.id,
            adminName: adminUser.fullName || 'Admin',
            respondedAt: new Date(),
          };
        }
        await doc.save();
        message = doc.toObject();
      }
    } catch (err) {
      console.error('[ContentService] Error updating MongoDB contact message:', err.message);
    }
  }

  if (!message) {
    message = inMemoryContactMessages.get(messageId);
    if (!message) {
      for (const item of inMemoryContactMessages.values()) {
        if (item.referenceCode === messageId || item._id === messageId) {
          message = item;
          break;
        }
      }
    }

    if (!message) {
      const error = new Error('Contact message not found.');
      error.statusCode = 404;
      throw error;
    }

    if (status) message.status = status;
    if (adminNotes !== undefined) message.adminNotes = adminNotes.trim();
    if (status === 'responded') {
      message.respondedBy = {
        adminId: adminUser.id,
        adminName: adminUser.fullName || 'Admin',
        respondedAt: new Date().toISOString(),
      };
    }
    message.updatedAt = new Date().toISOString();
    inMemoryContactMessages.set(message.id || message._id, message);
  }

  return message;
}

// =================================================================
// 2. Public Content Retrieval Services
// =================================================================
export async function getCompanyContent() {
  if (isDatabaseConnected()) {
    try {
      const doc = await SiteContent.findOne({ section: 'company' }).lean();
      if (doc && doc.data) return doc.data;
    } catch (err) {
      // fallback
    }
  }
  return inMemorySiteContent.get('company') || DEFAULT_COMPANY_CONTENT;
}

export async function getServicesContent({ category = '', onlyActive = true } = {}) {
  let list = null;
  if (isDatabaseConnected()) {
    try {
      const doc = await SiteContent.findOne({ section: 'services' }).lean();
      if (doc && Array.isArray(doc.data)) list = doc.data;
    } catch (err) {
      // fallback
    }
  }

  if (!list) {
    list = inMemorySiteContent.get('services') || DEFAULT_SERVICES_CONTENT;
  }

  if (onlyActive) {
    list = list.filter((s) => s.isActive !== false);
  }

  if (category) {
    list = list.filter((s) => s.category === category);
  }

  return list;
}

export async function getFaqsContent({ category = '', search = '' } = {}) {
  let list = null;
  if (isDatabaseConnected()) {
    try {
      const doc = await SiteContent.findOne({ section: 'faqs' }).lean();
      if (doc && Array.isArray(doc.data)) list = doc.data;
    } catch (err) {
      // fallback
    }
  }

  if (!list) {
    list = inMemorySiteContent.get('faqs') || DEFAULT_FAQS_CONTENT;
  }

  if (category && category !== 'all') {
    list = list.filter((f) => f.category === category);
  }

  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    list = list.filter(
      (f) => f.question?.toLowerCase().includes(s) || f.answer?.toLowerCase().includes(s)
    );
  }

  return list;
}

export async function getLegalContent(pageType) {
  const VALID_PAGES = [
    'privacy_policy',
    'terms_and_conditions',
    'disclaimer',
    'brokerage_policy',
    'cookie_policy',
  ];

  const normalized = (pageType || '').toLowerCase().replace(/-/g, '_');
  if (!VALID_PAGES.includes(normalized)) {
    const error = new Error(
      `Invalid legal page type: "${pageType}". Allowed: ${VALID_PAGES.join(', ')}`
    );
    error.statusCode = 404;
    throw error;
  }

  let legalData = null;
  if (isDatabaseConnected()) {
    try {
      const doc = await SiteContent.findOne({ section: 'legal' }).lean();
      if (doc && doc.data && doc.data[normalized]) {
        legalData = doc.data[normalized];
      }
    } catch (err) {
      // fallback
    }
  }

  if (!legalData) {
    const memLegal = inMemorySiteContent.get('legal') || DEFAULT_LEGAL_CONTENT;
    legalData = memLegal[normalized];
  }

  if (!legalData) {
    const error = new Error(`Legal draft for "${pageType}" is currently unavailable.`);
    error.statusCode = 404;
    throw error;
  }

  return {
    pageType: normalized,
    ...legalData,
    legalNotice:
      'Draft informational content only. This document must be reviewed and customized by an Indian legal practitioner prior to production launch.',
  };
}

// =================================================================
// 3. Admin Content Management Services
// =================================================================
export async function getAllAdminContent() {
  const [company, services, faqs, legal] = await Promise.all([
    getCompanyContent(),
    getServicesContent({ onlyActive: false }),
    getFaqsContent({}),
    Promise.resolve(inMemorySiteContent.get('legal') || DEFAULT_LEGAL_CONTENT),
  ]);

  return {
    company,
    services,
    faqs,
    legal,
  };
}

export async function updateContentSection(adminUser, section, sectionData) {
  const VALID_SECTIONS = ['company', 'services', 'faqs', 'legal'];
  if (!VALID_SECTIONS.includes(section)) {
    const error = new Error(`Invalid content section: "${section}". Allowed: ${VALID_SECTIONS.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  if (!sectionData) {
    const error = new Error('Section data payload is required.');
    error.statusCode = 400;
    throw error;
  }

  // Update in MongoDB
  if (isDatabaseConnected()) {
    try {
      await SiteContent.findOneAndUpdate(
        { section },
        {
          $set: {
            data: sectionData,
            lastUpdatedBy: {
              adminId: adminUser.id,
              adminName: adminUser.fullName || 'Admin',
              updatedAt: new Date(),
            },
          },
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`[ContentService] Error updating MongoDB content for ${section}:`, err.message);
    }
  }

  // Update memory
  inMemorySiteContent.set(section, sectionData);

  // Log admin activity
  await logAdminActivity(adminUser, {
    action: 'content_updated',
    targetType: 'site_content',
    targetId: section,
    targetTitle: `Content Section: ${section}`,
    reason: `Administrative content update for ${section}`,
  });

  return {
    section,
    data: sectionData,
    updatedAt: new Date().toISOString(),
  };
}
