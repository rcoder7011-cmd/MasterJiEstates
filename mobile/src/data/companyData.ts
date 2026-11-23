/**
 * Company Information — mobile/src/data/companyData.ts
 *
 * Official corporate profile, mission, vision, core values, and contact credentials.
 */

export interface CompanyCoreValue {
  id: string;
  iconName: 'Shield' | 'CheckCircle' | 'Heart' | 'Compass' | 'Building';
  title: string;
  description: string;
}

export const COMPANY_INFO = {
  name: 'MJ Estates',
  legalName: 'MasterJi Estates Private Limited',
  tagline: 'Heritage, Integrity & Verified Real Estate',
  description:
    'MJ Estates is a trusted real-estate advisory firm based in Delhi NCR, dedicated to providing transparent property consulting, verified documentation, direct owner negotiations, and professional site inspections.',
  vision:
    'To be North India’s most dependable and customer-centric real-estate consultancy, recognized for ethical standards, uncompromising verification, and long-term client relationships.',
  mission:
    'To empower property buyers, sellers, and tenants with truthful market intelligence, legally vetted titles, and personalized advisory throughout their property journey.',
  officialContact: {
    phone: '+91 9990316186',
    whatsapp: '+91 7011202089',
    email: 'masterjiestates@gmail.com',
    website: 'https://www.masterjiestates.in',
    coverage: 'Noida, Greater Noida, Gurugram, Delhi, Ghaziabad & Yamuna Expressway',
  },
  coreValues: [
    {
      id: 'verification',
      iconName: 'Shield' as const,
      title: '100% Document Verification',
      description:
        'Every listed property undergoes physical survey and legal due diligence before customer presentation.',
    },
    {
      id: 'transparency',
      iconName: 'CheckCircle' as const,
      title: 'Direct & Transparent Deals',
      description:
        'Zero concealed charges, realistic market evaluations, and direct negotiations with genuine owners.',
    },
    {
      id: 'client_first',
      iconName: 'Heart' as const,
      title: 'Client-Centric Advisory',
      description:
        'Objective advice tailored to your budget and long-term goals, never pushy sales tactics.',
    },
    {
      id: 'escort',
      iconName: 'Compass' as const,
      title: 'Guided Site Inspections',
      description:
        'Experienced property consultants accompany every visit to provide on-ground neighborhood clarity.',
    },
  ] as CompanyCoreValue[],
};
