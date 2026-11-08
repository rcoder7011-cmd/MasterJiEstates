/**
 * Validate site visit booking submission payload.
 *
 * @param {object} body
 * @returns {{ isValid: boolean, errors: Array<{ field: string, message: string }> }}
 */
export function validateSiteVisitInput(body = {}) {
  const errors = [];

  const { name, email, phone, propertyId, preferredDate, preferredTimeSlot, notes } = body;

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
      message: 'Please provide a valid 10-digit Indian mobile number.',
    });
  }

  if (!preferredDate) {
    errors.push({ field: 'preferredDate', message: 'Preferred visit date is required.' });
  } else {
    const selectedDate = new Date(preferredDate);
    if (isNaN(selectedDate.getTime())) {
      errors.push({ field: 'preferredDate', message: 'Please provide a valid calendar date.' });
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.push({ field: 'preferredDate', message: 'Preferred visit date cannot be in the past.' });
      }
    }
  }

  if (!preferredTimeSlot || typeof preferredTimeSlot !== 'string' || !preferredTimeSlot.trim()) {
    errors.push({ field: 'preferredTimeSlot', message: 'Please choose a preferred time slot.' });
  }

  if (notes && typeof notes === 'string' && notes.length > 500) {
    errors.push({ field: 'notes', message: 'Notes cannot exceed 500 characters.' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

