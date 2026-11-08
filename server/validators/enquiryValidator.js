/**
 * Validate customer enquiry submission payload.
 *
 * @param {object} body
 * @returns {{ isValid: boolean, errors: Array<{ field: string, message: string }> }}
 */
export function validateEnquiryInput(body = {}) {
  const errors = [];

  const { name, email, phone, message, propertyId } = body;

  if (!propertyId || typeof propertyId !== 'string' || !propertyId.trim()) {
    errors.push({ field: 'propertyId', message: 'A valid property identifier is required.' });
  }

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Full name is required (minimum 2 characters).' });
  } else if (name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Full name cannot exceed 100 characters.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address.' });
  }

  const cleanPhone = typeof phone === 'string' ? phone.replace(/[\s-]/g, '') : '';
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
    errors.push({
      field: 'phone',
      message: 'Please provide a valid 10-digit Indian mobile number (e.g., 9876543210).',
    });
  }

  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    errors.push({ field: 'message', message: 'Enquiry message is required (minimum 10 characters).' });
  } else if (message.trim().length > 1000) {
    errors.push({ field: 'message', message: 'Enquiry message cannot exceed 1000 characters.' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

