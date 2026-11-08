/**
 * MasterJiEstates — Centralized Official Company Configuration
 *
 * Official verified business details, contact information, branding assets,
 * service areas, Udyam registration credentials, and WhatsApp message generator.
 *
 * All frontend components consume this shared source of truth.
 */

export const COMPANY_CONFIG = {
  name: 'MasterJiEstates',
  legalName: 'MasterJiEstates',
  tagline: 'From Finding Your Property to Building Your Dream.',
  shortDescription:
    "India's premier real estate platform offering verified residential and commercial properties, direct company assets, and transparent brokerage coordination.",
  logoPath: '/logo.png',
  logoAlt: 'MasterJiEstates Official Logo',

  // Official Telephone
  phone: '+91 9990316186',
  phoneDisplay: '+91 99903 16186',
  phoneTel: 'tel:+919990316186',
  phoneRaw: '9990316186',

  // Official WhatsApp (Strictly separate from telephone)
  whatsapp: '+91 7011202089',
  whatsappDisplay: '+91 70112 02089',
  whatsappRaw: '917011202089',

  // Official Email
  email: 'masterjiestates@gmail.com',
  emailMailto: 'mailto:masterjiestates@gmail.com',

  // Office Location & Operating Headquarters
  officeLocation: 'Noida Sector 62A',
  officeAddress: 'Noida Sector 62A, Uttar Pradesh, India',
  operatingHours: 'Monday – Saturday: 9:30 AM – 7:00 PM IST (Sundays by appointment for site visits)',

  // Service Areas
  serviceAreas: ['Delhi', 'Uttar Pradesh', 'Ghaziabad', 'Noida', 'Gurugram'],

  // Official Web Domain
  website: 'https://masterjiestates.in',

  // Statutory Udyam Registration (Government of India)
  udyamRegistrationStatus: 'Registered',
  udyamDisplayText: 'Udyam Registered Enterprise',
  udyamPortalUrl: 'https://udyamregistration.gov.in/UdyamRegistration.aspx',

  // Dedicated Google Maps Location Link (Reserved placeholder — null until provided)
  googleMapsUrl: null,

  // Social Media Profiles (Reserved space for official handles; no invented links)
  socialLinks: {
    linkedin: null,
    twitter: null,
    instagram: null,
    facebook: null,
    youtube: null,
  },
};

/**
 * Generate a contextual WhatsApp click-to-chat URL with a pre-filled, URL-encoded message.
 *
 * @param {string} context - The page or user action context
 * @param {object} [data] - Dynamic data (e.g., property details, service name)
 * @returns {string} Fully formed wa.me URL
 */
export function getWhatsAppUrl(context = 'general', data = {}) {
  const baseWaUrl = `https://wa.me/${COMPANY_CONFIG.whatsappRaw}?text=`;
  let message = '';

  switch (context) {
    case 'navbar':
    case 'header':
      message =
        'Hello MasterJiEstates, I would like to enquire about your real estate services.';
      break;

    case 'home':
      message =
        'Hello MasterJiEstates, I visited your website and would like to know more about your real-estate services and available properties.';
      break;

    case 'properties':
    case 'listing':
      message =
        'Hello MasterJiEstates, I am interested in exploring properties listed on your website. Please share more information about the available options.';
      break;

    case 'property_details': {
      const title = data.title ? data.title.trim() : 'a listed property';
      const locationParts = [data.locality, data.city].filter(Boolean);
      const location = locationParts.length > 0 ? locationParts.join(', ') : data.location || '';
      const price = data.priceFormatted || (data.price ? `₹${data.price}` : '');
      const id = data.id || data.demoId ? ` (Ref: ${data.id || data.demoId})` : '';

      message = `Hello MasterJiEstates, I am interested in the property: ${title}${id}.`;
      if (location) {
        message += ` Location: ${location}.`;
      }
      if (price) {
        message += ` Listed Price: ${price}.`;
      }
      message += ' Please share more details, pricing and availability.';
      break;
    }

    case 'service_buy':
    case 'buying':
      message =
        'Hello MasterJiEstates, I am looking to buy a property. Please help me explore suitable options.';
      break;

    case 'service_sell':
    case 'selling':
      message =
        'Hello MasterJiEstates, I am interested in selling my property. Please guide me through your property selling process.';
      break;

    case 'service_loan':
    case 'loan':
      message =
        'Hello MasterJiEstates, I would like information about home loan assistance and available options.';
      break;

    case 'service_interior':
    case 'interior':
    case 'service_architecture':
    case 'architecture':
      message =
        'Hello MasterJiEstates, I would like to know more about your interior design and architecture services.';
      break;

    case 'services': {
      const serviceName = data.serviceName ? ` regarding ${data.serviceName}` : '';
      message = `Hello MasterJiEstates, I visited your Services page and would like to inquire${serviceName}.`;
      break;
    }

    case 'contact':
      message =
        'Hello MasterJiEstates, I visited your Contact page and would like to connect with your team regarding a query.';
      break;

    case 'about':
      message =
        'Hello MasterJiEstates, I visited your About Us page and would like to know more about your company and services.';
      break;

    case 'custom':
      message = data.message || 'Hello MasterJiEstates, I would like to connect with your advisory team.';
      break;

    case 'general':
    default:
      message =
        'Hello MasterJiEstates, I visited your website and would like to connect with your real estate advisory team.';
      break;
  }

  return `${baseWaUrl}${encodeURIComponent(message)}`;
}

export default COMPANY_CONFIG;

