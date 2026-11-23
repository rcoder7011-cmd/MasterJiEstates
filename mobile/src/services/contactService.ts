/**
 * Official Contact & Support Service — src/services/contactService.ts
 * Manages official customer support channels with native deep-linking and fallback handlers.
 */

import { Linking, Alert } from 'react-native';
import { buildWhatsAppUrl } from '../constants/contact';

export const OFFICIAL_CONTACT = {
  PHONE: '+91 9990316186',
  PHONE_RAW: '+919990316186',
  CALL_DISPLAY: '+91 9990316186',
  CALL_TEL: 'tel:+919990316186',
  CALL_RAW: '+919990316186',
  CALL_DIGITS: '9990316186',

  WHATSAPP: '+91 7011202089',
  WHATSAPP_DISPLAY: '+91 7011202089',
  WHATSAPP_RAW: '917011202089',
  WHATSAPP_BASE_URL: 'https://wa.me/917011202089',

  EMAIL: 'masterjiestates@gmail.com',
  WEBSITE: 'https://www.masterjiestates.in',
  HOURS: 'Mon – Sat: 9:00 AM – 8:00 PM IST',
} as const;

/**
 * Dedicated Contact Credentials for Extra Services
 * Covers: Interior Design, Software, Web, AI/ML, Architecture, Carpentry, Home Buying & Selling
 */
export const EXTRA_SERVICES_CONTACT = {
  PHONE: '+91 7011202089',
  PHONE_RAW: '+917011202089',
  CALL_DISPLAY: '+91 7011202089',
  CALL_TEL: 'tel:+917011202089',
  WHATSAPP: '+91 7011202089',
  WHATSAPP_RAW: '917011202089',
  WHATSAPP_BASE_URL: 'https://wa.me/917011202089',
  NOTICE_MESSAGE:
    'For Interior Design, Software Development, Website Development, AI/ML Solutions, Architecture, Carpentry, Home Buying & Selling and other Extra Services, contact MasterJiEstates.',
} as const;

export { buildWhatsAppUrl };

/**
 * Direct phone call for Extra Services & About Us
 */
export async function callExtraServices(): Promise<void> {
  const url = EXTRA_SERVICES_CONTACT.CALL_TEL;
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Phone Call', `Please dial our official number: ${EXTRA_SERVICES_CONTACT.PHONE}`);
    }
  } catch {
    Alert.alert('Phone Call', `Please dial our official number: ${EXTRA_SERVICES_CONTACT.PHONE}`);
  }
}

/**
 * Open WhatsApp with pre-filled greeting for Extra Services
 */
export async function openWhatsAppExtraServices(serviceName?: string): Promise<void> {
  const message = serviceName
    ? `Hello MJ Estates, I am reaching out from the mobile app regarding your ${serviceName} service. Please share details and consultation availability.`
    : 'Hello MJ Estates, I am reaching out from the mobile app regarding your Extra Services (Interior Design, Software Development, Website Development, AI/ML Solutions, Architecture, Carpentry, or Home Buying & Selling Assistance). Please provide more details.';

  const text = encodeURIComponent(message);
  const url = `https://wa.me/${EXTRA_SERVICES_CONTACT.WHATSAPP_RAW}?text=${text}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'WhatsApp Contact',
        `WhatsApp is not installed on this device. Please message us at ${EXTRA_SERVICES_CONTACT.WHATSAPP}`
      );
    }
  } catch {
    Alert.alert(
      'WhatsApp Contact',
      `Could not open WhatsApp. Please reach us at ${EXTRA_SERVICES_CONTACT.WHATSAPP}`
    );
  }
}

/**
 * Open the native phone dialer with official support number
 */
export async function callSupport(): Promise<void> {
  const url = `tel:${OFFICIAL_CONTACT.PHONE_RAW}`;
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Phone Call', `Please dial our official number: ${OFFICIAL_CONTACT.PHONE}`);
    }
  } catch {
    Alert.alert('Phone Call', `Please dial our official number: ${OFFICIAL_CONTACT.PHONE}`);
  }
}

/**
 * Open WhatsApp with official support chat and pre-populated support greeting
 */
export async function openWhatsAppSupport(customMessage?: string): Promise<void> {
  const text = encodeURIComponent(
    customMessage ||
      'Hello MJ Estates Support Team, I am reaching out from the MJ Estates mobile app regarding property consultation.'
  );
  const url = `https://wa.me/${OFFICIAL_CONTACT.WHATSAPP_RAW}?text=${text}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'WhatsApp Support',
        `WhatsApp is not installed on this device. Please message us at ${OFFICIAL_CONTACT.WHATSAPP}`
      );
    }
  } catch {
    Alert.alert(
      'WhatsApp Support',
      `Could not open WhatsApp. Please reach us at ${OFFICIAL_CONTACT.WHATSAPP}`
    );
  }
}

/**
 * Open native email client with official support address
 */
export async function sendSupportEmail(subject?: string, body?: string): Promise<void> {
  const encSubject = encodeURIComponent(subject || 'MJ Estates Support Enquiry');
  const encBody = encodeURIComponent(
    body || 'Hello MJ Estates Support,\n\nI would like to enquire about...'
  );
  const url = `mailto:${OFFICIAL_CONTACT.EMAIL}?subject=${encSubject}&body=${encBody}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Email Support', `Please email us directly at: ${OFFICIAL_CONTACT.EMAIL}`);
    }
  } catch {
    Alert.alert('Email Support', `Please email us directly at: ${OFFICIAL_CONTACT.EMAIL}`);
  }
}

/**
 * Open official MJ Estates website in external browser
 */
export async function openOfficialWebsite(): Promise<void> {
  const url = OFFICIAL_CONTACT.WEBSITE;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Website', `Please visit our website at: ${OFFICIAL_CONTACT.WEBSITE}`);
  }
}

