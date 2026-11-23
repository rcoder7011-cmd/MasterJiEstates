/**
 * Centralized Property Categories, Types & Contact Configuration
 */

import { IconName } from '../components/ui/AppIcon';
import { OFFICIAL_CONTACT, buildWhatsAppUrl } from './contact';

export interface TransactionCategory {
  id: 'buy' | 'rent' | 'sell' | 'list';
  title: string;
  subtitle: string;
  icon: IconName;
  filterParam?: string;
  badge?: string;
}

export interface PropertyTypeItem {
  id: 'residential' | 'commercial' | 'plot';
  title: string;
  subtitle: string;
  icon: IconName;
  typeParam: string;
}

export interface PropertyPreviewItem {
  id: string;
  title: string;
  type: string;
  category: 'Residential' | 'Commercial' | 'Plot';
  location: string;
  price: number;
  bhk?: string;
  area: string;
  isSampleData: true; // Explicitly identified as sample/demo data
}

export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  {
    id: 'buy',
    title: 'Buy',
    subtitle: 'Verified Homes',
    icon: 'Tag',
    filterParam: 'buy',
    badge: 'Buy',
  },
  {
    id: 'rent',
    title: 'Rent',
    subtitle: 'Lease & Rentals',
    icon: 'Key',
    filterParam: 'rent',
    badge: 'Rent',
  },
  {
    id: 'sell',
    title: 'Sell',
    subtitle: 'Free Valuation',
    icon: 'TrendingUp',
    filterParam: 'sell',
    badge: 'Advisory',
  },
  {
    id: 'list',
    title: 'List Property',
    subtitle: 'Direct Owner Post',
    icon: 'PlusCircle',
    filterParam: 'list',
    badge: 'Seller Portal',
  },
];

export const PROPERTY_TYPES: PropertyTypeItem[] = [
  {
    id: 'residential',
    title: 'Residential',
    subtitle: 'Apartments & Villas',
    icon: 'Home',
    typeParam: 'residential',
  },
  {
    id: 'commercial',
    title: 'Commercial',
    subtitle: 'Shops & Offices',
    icon: 'Briefcase',
    typeParam: 'commercial',
  },
  {
    id: 'plot',
    title: 'Land / Plot',
    subtitle: 'Freehold Plots',
    icon: 'Compass',
    typeParam: 'plot',
  },
];

/**
 * SAMPLE / DEMO DATA (Labeled explicitly for Part 4 UI preview)
 * Real backend property listings will be connected in subsequent phases.
 */
export const PREVIEW_FEATURED_PROPERTIES: PropertyPreviewItem[] = [
  {
    id: 'prop-101',
    title: 'Ace Starlit Premium Residences',
    type: 'Luxury Apartment',
    category: 'Residential',
    location: 'Sector 152, Expressway, Noida',
    price: 18500000,
    bhk: '3 & 4 BHK',
    area: '1,775 sq.ft',
    isSampleData: true,
  },
  {
    id: 'prop-102',
    title: 'ATS Knightsbridge Signature Tower',
    type: 'Ultra Luxury Suite',
    category: 'Residential',
    location: 'Sector 124, Noida',
    price: 27500000,
    bhk: '4 BHK',
    area: '2,450 sq.ft',
    isSampleData: true,
  },
  {
    id: 'prop-103',
    title: 'Gulshan Dynasty Exclusive',
    type: 'Boutique Residence',
    category: 'Residential',
    location: 'Sector 144, Noida',
    price: 39000000,
    bhk: '4 BHK Luxe',
    area: '3,100 sq.ft',
    isSampleData: true,
  },
];

export const PREVIEW_LATEST_PROPERTIES: PropertyPreviewItem[] = [
  {
    id: 'prop-201',
    title: 'Bhutani Cyberthum High-Street Retail',
    type: 'Commercial Retail',
    category: 'Commercial',
    location: 'Sector 140A, Noida',
    price: 6500000,
    bhk: 'Retail Shop',
    area: '480 sq.ft',
    isSampleData: true,
  },
  {
    id: 'prop-202',
    title: 'Express Astra Greens Residency',
    type: 'Premium Apartment',
    category: 'Residential',
    location: 'Sector 1, Greater Noida West',
    price: 11500000,
    bhk: '3 BHK',
    area: '1,450 sq.ft',
    isSampleData: true,
  },
];

export const CONTACT_CONFIG = {
  phone: '+91 9990316186',
  phoneTel: 'tel:+919990316186',
  phoneDisplay: '+91 9990316186',
  whatsappDisplay: '+91 7011202089',
  whatsappNumber: '917011202089',
  whatsappMessage: OFFICIAL_CONTACT.DEFAULT_WHATSAPP_MESSAGE,
  whatsappUrl: buildWhatsAppUrl(OFFICIAL_CONTACT.DEFAULT_WHATSAPP_MESSAGE), // https://wa.me/917011202089
  officeLocation: OFFICIAL_CONTACT.ADDRESS_DISPLAY,
  serviceAreas: ['Gurugram', 'Delhi', 'Noida', 'Greater Noida', 'Ghaziabad', 'Faridabad'],
} as const;

