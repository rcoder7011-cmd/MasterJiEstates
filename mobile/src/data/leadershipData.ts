/**
 * Leadership Data — mobile/src/data/leadershipData.ts
 *
 * Official verified leadership information for MJ Estates.
 * Maintained in a centralized, easily editable structure.
 *
 * NOTE: Original photographs will be added in a future update.
 * Clearly marked image placeholders are provided; do NOT use AI or stock images.
 */

export interface LeaderProfile {
  id: 'founder' | 'ceo';
  name: string;
  designation: string;
  roleTitle: string;
  imagePlaceholderText: string;
  photoUri: string | null; // Set to null until official photograph is added
  shortIntro: string;
  responsibilities: string[];
  visionQuote: string;
}

export const FOUNDER_PROFILE: LeaderProfile = {
  id: 'founder',
  name: 'Riyaz Saifi',
  designation: 'Founder, MJ Estates',
  roleTitle: 'Founder',
  imagePlaceholderText: '[ADD FOUNDER IMAGE LATER]',
  photoUri: null, // Replace null with official photo require or URI when ready
  shortIntro:
    'Riyaz Saifi founded MJ Estates with the foundational goal of bringing uncompromised transparency, verified paperwork, and fair consultation to the Delhi NCR real-estate landscape.',
  responsibilities: [
    'Strategic vision & long-term brand development',
    'Expansion across high-growth NCR corridors',
    'Legal due diligence standards & buyer protection',
    'Strategic investor and developer alliances',
  ],
  visionQuote:
    'Our vision is to build a real-estate ecosystem where every buyer and seller transacts with absolute trust, verified documents, and zero uncertainty.',
};

export const CEO_PROFILE: LeaderProfile = {
  id: 'ceo',
  name: 'Mr Shokin (Master Ji)',
  designation: 'CEO, MJ Estates',
  roleTitle: 'Chief Executive Officer',
  imagePlaceholderText: '[ADD CEO IMAGE LATER]',
  photoUri: null, // Replace null with official photo require or URI when ready
  shortIntro:
    'Mr Shokin (Master Ji) leads executive operations, client advisory, and field inspections at MJ Estates, bringing deep grassroots market knowledge and hands-on guidance to every deal.',
  responsibilities: [
    'Daily operational leadership & team execution',
    'Ground-level property evaluation & fair price advisory',
    'Personalized client consultations and site visit oversight',
    'End-to-end registry and handover coordination',
  ],
  visionQuote:
    'Real estate is not just about buildings; it is about families finding their sanctuary and investors achieving reliable growth with complete peace of mind.',
};

export const LEADERSHIP_PROFILES: LeaderProfile[] = [FOUNDER_PROFILE, CEO_PROFILE];
