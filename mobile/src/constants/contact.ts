/**
 * MasterJi Estates — Centralized Official Business Contact Configuration
 *
 * Official business contacts:
 * - CALL: +91 9990316186
 * - WHATSAPP: +91 7011202089
 *
 * International WhatsApp URL format uses '917011202089' (without the '+' sign).
 * Direct dialer URL uses 'tel:+919990316186'.
 */

export const OFFICIAL_CONTACT = {
  // Official Phone Consultation
  CALL_DISPLAY: '+91 9990316186',
  CALL_TEL: 'tel:+919990316186',
  CALL_RAW: '+919990316186',
  CALL_DIGITS: '9990316186',

  // Official WhatsApp Advisory
  WHATSAPP_DISPLAY: '+91 7011202089',
  WHATSAPP_RAW: '917011202089', // Without '+' sign for wa.me URLs
  WHATSAPP_BASE_URL: 'https://wa.me/917011202089',

  // Official Support Email & Address
  EMAIL: 'contact@masterjiestates.in',
  ADDRESS_DISPLAY: 'Sector 66, Gurugram, Haryana 122102',

  // Default contextual messages
  DEFAULT_WHATSAPP_MESSAGE:
    'Hello MasterJi Estates, I would like to consult with an advisor regarding verified properties in Gurugram.',
  SELL_WHATSAPP_MESSAGE:
    'Hello MasterJi Estates, I would like to consult on selling my property.',
  ENQUIRY_WHATSAPP_MESSAGE: (title: string, refId?: string) =>
    `Hello MasterJi Estates, I am interested in "${title}"${refId ? ` (Ref: ${refId})` : ''}. Please share brochure and pricing details.`,
};

/**
 * Generate a complete wa.me URL with prefilled URL-encoded message
 */
export function buildWhatsAppUrl(message?: string): string {
  const text = encodeURIComponent(message || OFFICIAL_CONTACT.DEFAULT_WHATSAPP_MESSAGE);
  return `${OFFICIAL_CONTACT.WHATSAPP_BASE_URL}?text=${text}`;
}

export default OFFICIAL_CONTACT;

