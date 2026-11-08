import { demoProperties, getPropertyById as getDemoPropertyById } from '../data/demoProperties.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

let cachedCsrfToken = null;

/**
 * Fetch or retrieve cached CSRF token.
 */
export async function getCsrfToken() {
  if (cachedCsrfToken) return cachedCsrfToken;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/csrf`, {
      method: 'GET',
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      cachedCsrfToken = data.data?.csrfToken || null;
      return cachedCsrfToken;
    }
  } catch (err) {
    console.warn('[MasterJiEstates API] Could not fetch CSRF token:', err.message);
  }
  return null;
}

/**
 * Utility to make HTTP requests with credentials, CSRF attachment, and error handling.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Attach CSRF token on mutating requests
  const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (mutatingMethods.includes(method) && !headers['x-csrf-token'] && !endpoint.includes('/auth/csrf')) {
    const token = await getCsrfToken();
    if (token) {
      headers['x-csrf-token'] = token;
    }
  }

  const config = {
    credentials: 'include', // Transmit HTTP-only session cookies
    ...options,
    headers,
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || `HTTP error ${response.status}`);
    error.statusCode = response.status;
    error.errors = data?.errors || null;
    throw error;
  }

  return data;
}

// =============================================================================
// AUTHENTICATION API SERVICES
// =============================================================================

/**
 * Register a new unified user account.
 */
export async function registerUser({ fullName, email, phone, password }) {
  const result = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, phone, password }),
  });
  return result.data;
}

/**
 * Log into user account and establish session cookie.
 */
export async function loginUser({ email, password, rememberMe = false }) {
  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, rememberMe }),
  });
  return result.data;
}

/**
 * Terminate user session and clear authentication cookies.
 */
export async function logoutUser() {
  await request('/auth/logout', { method: 'POST' });
  cachedCsrfToken = null;
  return true;
}

/**
 * Fetch current authenticated user profile.
 */
export async function fetchCurrentUser() {
  try {
    const result = await request('/auth/me', { method: 'GET' });
    return result.data;
  } catch (err) {
    if (err.statusCode === 401) {
      return null;
    }
    throw err;
  }
}

/**
 * Change authenticated user's password.
 */
export async function changeUserPassword({ currentPassword, newPassword }) {
  const result = await request('/auth/change-password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return result;
}

/**
 * Request password reset instructions.
 */
export async function requestPasswordReset(email) {
  const result = await request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return result;
}

/**
 * Reset password using token.
 */
export async function resetPasswordWithToken({ token, newPassword }) {
  const result = await request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
  return result;
}

// =============================================================================
// PROPERTY & LEAD APIS
// =============================================================================

/**
 * Fetch filtered, sorted, and paginated properties from the backend API.
 * Falls back to client-side demo dataset if the backend is unreachable.
 */
export async function fetchProperties(params = {}) {
  try {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'all') {
        searchParams.append(key, val);
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/properties${queryString ? `?${queryString}` : ''}`;
    const result = await request(endpoint, { method: 'GET' });

    return {
      properties: result.data || [],
      meta: result.meta || {
        total: result.data?.length || 0,
        source: 'api',
        isDatabaseConnected: result.meta?.isDatabaseConnected ?? true,
      },
      isFallback: false,
    };
  } catch (err) {
    console.warn('[MasterJiEstates API] Backend properties endpoint unavailable. Serving client demo dataset.', err.message);

    // Fallback gracefully to demo properties in memory
    return {
      properties: demoProperties,
      meta: {
        total: demoProperties.length,
        source: 'client_fallback',
        isDatabaseConnected: false,
      },
      isFallback: true,
      error: err.message,
    };
  }
}

/**
 * Fetch a single property by its ID (MongoDB ObjectId or demoId).
 */
export async function fetchPropertyById(id) {
  if (!id) return null;

  try {
    const result = await request(`/properties/${encodeURIComponent(id)}`, { method: 'GET' });
    if (result.data) {
      return {
        property: result.data,
        isFallback: false,
      };
    }
  } catch (err) {
    console.warn(`[MasterJiEstates API] Backend property fetch failed for "${id}". Falling back to client demo dataset.`, err.message);
  }

  // Fallback to local demo dataset
  const fallback = getDemoPropertyById(id) || demoProperties.find((p) => p.slug === id);
  return {
    property: fallback || null,
    isFallback: true,
  };
}

/**
 * Fetch a single property by its SEO slug.
 */
export async function fetchPropertyBySlug(slug) {
  if (!slug) return null;

  try {
    const result = await request(`/properties/slug/${encodeURIComponent(slug)}`, { method: 'GET' });
    if (result.data) {
      return {
        property: result.data,
        isFallback: false,
      };
    }
  } catch (err) {
    console.warn(`[MasterJiEstates API] Backend slug fetch failed for "${slug}". Falling back to client demo dataset.`, err.message);
  }

  const fallback = demoProperties.find((p) => p.slug.toLowerCase() === slug.toLowerCase());
  return {
    property: fallback || null,
    isFallback: true,
  };
}

/**
 * Submit customer enquiry to the backend API.
 */
export async function submitEnquiry(enquiryData) {
  try {
    const result = await request('/enquiries', {
      method: 'POST',
      body: JSON.stringify(enquiryData),
    });

    return {
      success: true,
      data: result.data,
      message: result.message,
      isFallback: false,
    };
  } catch (err) {
    if (!err.statusCode || err.statusCode >= 500) {
      console.warn('[MasterJiEstates API] Backend enquiry submission offline. Generating local demo reference.', err.message);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      return {
        success: true,
        data: {
          referenceCode: `ENQ-LOCAL-${randomSuffix}`,
          propertyId: enquiryData.propertyId,
          name: enquiryData.name,
          status: 'new',
        },
        message: 'Your enquiry has been registered in local test mode.',
        isFallback: true,
      };
    }
    throw err;
  }
}

/**
 * Submit site visit booking to the backend API.
 */
export async function scheduleSiteVisit(visitData) {
  try {
    const result = await request('/site-visits', {
      method: 'POST',
      body: JSON.stringify(visitData),
    });

    return {
      success: true,
      data: result.data,
      message: result.message,
      isFallback: false,
    };
  } catch (err) {
    if (!err.statusCode || err.statusCode >= 500) {
      console.warn('[MasterJiEstates API] Backend site visit submission offline. Generating local demo reference.', err.message);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      return {
        success: true,
        data: {
          bookingReference: `VISIT-LOCAL-${randomSuffix}`,
          propertyId: visitData.propertyId,
          name: visitData.name,
          preferredDate: visitData.preferredDate,
          status: 'requested',
        },
        message: 'Your site visit has been scheduled in local test mode.',
        isFallback: true,
      };
    }
    throw err;
  }
}

/**
 * Check API health and readiness status.
 */
export async function checkApiHealth() {
  try {
    const health = await request('/health', { method: 'GET' });
    let ready = null;
    try {
      ready = await request('/health/ready', { method: 'GET' });
    } catch {
      ready = { success: false, database: { status: 'disconnected' } };
    }
    return {
      isOnline: true,
      health,
      ready,
    };
  } catch {
    return {
      isOnline: false,
      health: null,
      ready: null,
    };
  }
}

// =============================================================================
// USER DASHBOARD API SERVICES (Part 10)
// =============================================================================

/**
 * Fetch unified dashboard overview metrics and recent activity feed.
 */
export async function fetchDashboardOverview() {
  const result = await request('/dashboard/overview', { method: 'GET' });
  return result.data;
}

/**
 * Fetch authenticated user's submitted property enquiries.
 */
export async function fetchUserEnquiries(status = 'all') {
  const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
  const result = await request(`/dashboard/enquiries${query}`, { method: 'GET' });
  return result.data || [];
}

/**
 * Fetch authenticated user's scheduled site visits.
 */
export async function fetchUserSiteVisits(status = 'all') {
  const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
  const result = await request(`/dashboard/site-visits${query}`, { method: 'GET' });
  return result.data || [];
}

/**
 * Cancel a scheduled site visit belonging to the authenticated user.
 */
export async function cancelSiteVisit(visitId) {
  const result = await request(`/dashboard/site-visits/${encodeURIComponent(visitId)}/cancel`, {
    method: 'PATCH',
  });
  return result.data;
}

/**
 * Fetch authenticated user's saved/favourite properties.
 */
export async function fetchUserFavourites() {
  const result = await request('/dashboard/favourites', { method: 'GET' });
  return result.data || [];
}

/**
 * Add a property to authenticated user's favourites.
 */
export async function addFavouriteProperty(propertyId) {
  const result = await request(`/dashboard/favourites/${encodeURIComponent(propertyId)}`, {
    method: 'POST',
  });
  return result.data;
}

/**
 * Remove a property from authenticated user's favourites.
 */
export async function removeFavouriteProperty(propertyId) {
  const result = await request(`/dashboard/favourites/${encodeURIComponent(propertyId)}`, {
    method: 'DELETE',
  });
  return result.data;
}

/**
 * Fetch authenticated user's recently viewed properties.
 */
export async function fetchRecentlyViewed() {
  const result = await request('/dashboard/recently-viewed', { method: 'GET' });
  return result.data || [];
}

/**
 * Record a property view for the authenticated user.
 */
export async function recordRecentlyViewed(propertyId) {
  try {
    const result = await request(`/dashboard/recently-viewed/${encodeURIComponent(propertyId)}`, {
      method: 'POST',
    });
    return result.data;
  } catch {
    // Non-blocking for analytics / view tracking
    return null;
  }
}

/**
 * Fetch seller properties submitted by the authenticated user.
 */
export async function fetchUserListings() {
  const result = await request('/dashboard/listings', { method: 'GET' });
  return result.data || [];
}

/**
 * Update authenticated user's profile details (fullName, phone).
 */
export async function updateUserProfile({ fullName, phone }) {
  const result = await request('/dashboard/profile', {
    method: 'PATCH',
    body: JSON.stringify({ fullName, phone }),
  });
  return result.data;
}

// =============================================================================
// PROPERTY SUBMISSION & CLOUDINARY APIS (Part 11)
// =============================================================================

/**
 * Fetch signed Cloudinary upload authorization credentials from backend.
 */
export async function fetchUploadSignature() {
  const result = await request('/dashboard/listings/upload-signature', {
    method: 'POST',
  });
  return result.data;
}

/**
 * Create a new property draft.
 */
export async function createPropertyDraft(draftData = {}) {
  const result = await request('/dashboard/listings/draft', {
    method: 'POST',
    body: JSON.stringify(draftData),
  });
  return result.data;
}

/**
 * Update an existing property draft owned by authenticated user.
 */
export async function updatePropertyDraft(draftId, updateData) {
  const result = await request(`/dashboard/listings/draft/${encodeURIComponent(draftId)}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  });
  return result.data;
}

/**
 * Fetch a single owned property listing or draft.
 */
export async function fetchOwnedListingById(listingId) {
  const result = await request(`/dashboard/listings/${encodeURIComponent(listingId)}`, {
    method: 'GET',
  });
  return result.data;
}

/**
 * Submit property draft for admin verification and review.
 */
export async function submitListingForReview(listingId, payload = {}) {
  const result = await request(`/dashboard/listings/${encodeURIComponent(listingId)}/submit`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result;
}

/**
 * Withdraw an owned listing from the directory.
 */
export async function withdrawListing(listingId) {
  const result = await request(`/dashboard/listings/${encodeURIComponent(listingId)}/withdraw`, {
    method: 'PATCH',
  });
  return result.data;
}

/**
 * Direct client-side signed upload to Cloudinary.
 * Uses authorization params generated securely by the backend.
 */
export async function uploadImageToCloudinary({ file, signatureData, onProgress }) {
  const { signature, timestamp, apiKey, cloudName, folder } = signatureData;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', folder);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      let json = null;
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        json = null;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          publicId: json.public_id,
          url: json.url,
          secureUrl: json.secure_url,
          width: json.width,
          height: json.height,
          format: json.format,
          bytes: json.bytes,
        });
      } else {
        const errorMsg =
          json?.error?.message || `Cloudinary upload failed with status code ${xhr.status}`;
        reject(new Error(errorMsg));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network connectivity error during image upload to Cloudinary.'));
    };

    xhr.send(formData);
  });
}

// =============================================================================
// ADMINISTRATIVE BACK-OFFICE APIS (Part 12)
// =============================================================================

function toQueryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });
  const str = query.toString();
  return str ? `?${str}` : '';
}

/**
 * Fetch Admin Overview metrics and recent activity.
 */
export async function fetchAdminOverview() {
  const result = await request('/admin/overview', { method: 'GET' });
  return result.data;
}

/**
 * Fetch Property Moderation Queue (pending review listings).
 */
export async function fetchModerationQueue(params = {}) {
  const qs = toQueryString(params);
  const result = await request(`/admin/moderation${qs}`, { method: 'GET' });
  return result.data;
}

/**
 * Fetch single property for moderation review with seller PII.
 */
export async function fetchModerationProperty(id) {
  const result = await request(`/admin/moderation/${encodeURIComponent(id)}`, { method: 'GET' });
  return result.data;
}

/**
 * Approve a pending property listing.
 */
export async function approveProperty(id, payload = {}) {
  const result = await request(`/admin/moderation/${encodeURIComponent(id)}/approve`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result.data;
}

/**
 * Reject a pending property listing with mandatory reason.
 */
export async function rejectProperty(id, { reason, internalNotes = '' }) {
  const result = await request(`/admin/moderation/${encodeURIComponent(id)}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason, internalNotes }),
  });
  return result.data;
}

/**
 * Request corrections/changes for a pending listing from seller.
 */
export async function requestPropertyChanges(id, { remarks, internalNotes = '' }) {
  const result = await request(`/admin/moderation/${encodeURIComponent(id)}/request-changes`, {
    method: 'POST',
    body: JSON.stringify({ remarks, internalNotes }),
  });
  return result.data;
}

/**
 * Fetch All Admin Properties (with filtering, pagination, status).
 */
export async function fetchAdminProperties(params = {}) {
  const qs = toQueryString(params);
  const result = await request(`/admin/properties${qs}`, { method: 'GET' });
  return result.data;
}

/**
 * Fetch single Admin Property by ID (including internal notes/costs).
 */
export async function fetchAdminPropertyById(id) {
  const result = await request(`/admin/properties/${encodeURIComponent(id)}`, { method: 'GET' });
  return result.data;
}

/**
 * Update property availability status (available, under_negotiation, sold, withdrawn).
 */
export async function updateAdminPropertyStatus(id, { status, reason = '' }) {
  const result = await request(`/admin/properties/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  });
  return result.data;
}

/**
 * Create a new Company-Owned Property Record (Admin Only).
 */
export async function createCompanyProperty(payload) {
  const result = await request('/admin/properties/company', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result.data;
}

/**
 * Update an existing Company-Owned Property Record (Admin Only).
 */
export async function updateCompanyProperty(id, payload) {
  const result = await request(`/admin/properties/company/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return result.data;
}

/**
 * Fetch User Directory for admin inspection.
 */
export async function fetchAdminUsers(params = {}) {
  const qs = toQueryString(params);
  const result = await request(`/admin/users${qs}`, { method: 'GET' });
  return result.data;
}

/**
 * Update user account status (active / suspended).
 */
export async function updateAdminUserStatus(userId, { status, reason = '' }) {
  const result = await request(`/admin/users/${encodeURIComponent(userId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  });
  return result.data;
}

/**
 * Fetch all customer enquiries across platform.
 */
export async function fetchAdminEnquiries(params = {}) {
  const qs = toQueryString(params);
  const result = await request(`/admin/enquiries${qs}`, { method: 'GET' });
  return result.data;
}

/**
 * Update enquiry disposition status & internal operational notes.
 */
export async function updateAdminEnquiry(id, { status, internalNotes = '' }) {
  const result = await request(`/admin/enquiries/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, internalNotes }),
  });
  return result.data;
}

/**
 * Fetch all site visit bookings across platform.
 */
export async function fetchAdminSiteVisits(params = {}) {
  const qs = toQueryString(params);
  const result = await request(`/admin/site-visits${qs}`, { method: 'GET' });
  return result.data;
}

/**
 * Update site visit schedule, confirmation status, or cancellation.
 */
export async function updateAdminSiteVisit(id, payload = {}) {
  const result = await request(`/admin/site-visits/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return result.data;
}

/**
 * Fetch append-only administrative audit activity logs.
 */
export async function fetchAdminActivityLogs(params = {}) {
  const qs = toQueryString(params);
  const result = await request(`/admin/activity-logs${qs}`, { method: 'GET' });
  return result.data;
}

// =============================================================================
// BUSINESS OPERATIONS & FINANCIAL MANAGEMENT APIS (Part 13)
// =============================================================================

/**
 * Fetch Business Operations KPI Overview
 */
export async function fetchBusinessOverview(params = {}) {
  const qs = toQueryString(params);
  const result = await request(`/admin/business/overview${qs}`, { method: 'GET' });
  return result.data;
}

/**
 * Fetch Brokerage Deals with pagination and filters
 */
export async function fetchBrokerageDeals(params = {}) {
  const qs = toQueryString(params);
  const result = await request(`/admin/business/deals${qs}`, { method: 'GET' });
  return result.data;
}

/**
 * Create a new Brokerage Deal
 */
export async function createBrokerageDeal(payload) {
  const result = await request('/admin/business/deals', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result.data;
}

/**
 * Fetch a single Brokerage Deal by reference or ID
 */
export async function fetchBrokerageDealById(id) {
  const result = await request(`/admin/business/deals/${encodeURIComponent(id)}`, {
    method: 'GET',
  });
  return result.data;
}

/**
 * Update a Brokerage Deal
 */
export async function updateBrokerageDeal(id, payload) {
  const result = await request(`/admin/business/deals/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return result.data;
}

/**
 * Update Commission Agreement Terms
 */
export async function updateCommissionAgreement(id, payload) {
  const result = await request(`/admin/business/deals/${encodeURIComponent(id)}/commission`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return result.data;
}

/**
 * Fetch payment entries for a specific deal
 */
export async function fetchDealPayments(id) {
  const result = await request(`/admin/business/deals/${encodeURIComponent(id)}/payments`, {
    method: 'GET',
  });
  return result.data;
}

/**
 * Record a commission payment for a deal
 */
export async function recordCommissionPayment(id, payload) {
  const result = await request(`/admin/business/deals/${encodeURIComponent(id)}/payments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result.data;
}

/**
 * Reverse a commission payment
 */
export async function reverseCommissionPayment(paymentId, { reason }) {
  const result = await request(`/admin/business/payments/${encodeURIComponent(paymentId)}/reverse`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
  return result.data;
}

/**
 * Fetch global commission payment ledger
 */
export async function fetchCommissionLedger(params = {}) {
  const qs = toQueryString(params);
  const result = await request(`/admin/business/commission-ledger${qs}`, { method: 'GET' });
  return result.data;
}

/**
 * Fetch company-owned properties financials (acquisition cost, expenses, sales, ROI)
 */
export async function fetchCompanyPropertiesFinancials() {
  const result = await request('/admin/business/company-properties', { method: 'GET' });
  return result.data;
}

/**
 * Fetch expenses for a company-owned property
 */
export async function fetchPropertyExpenses(propertyId) {
  const result = await request(
    `/admin/business/company-properties/${encodeURIComponent(propertyId)}/expenses`,
    { method: 'GET' }
  );
  return result.data;
}

/**
 * Record an expense for a company-owned property
 */
export async function recordPropertyExpense(propertyId, payload) {
  const result = await request(
    `/admin/business/company-properties/${encodeURIComponent(propertyId)}/expenses`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return result.data;
}

/**
 * Reverse a company property expense
 */
export async function reversePropertyExpense(propertyId, expenseId, { reason }) {
  const result = await request(
    `/admin/business/company-properties/${encodeURIComponent(propertyId)}/expenses/${encodeURIComponent(
      expenseId
    )}/reverse`,
    {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }
  );
  return result.data;
}

/**
 * Fetch company property sale details
 */
export async function fetchCompanyPropertySale(propertyId) {
  const result = await request(
    `/admin/business/company-properties/${encodeURIComponent(propertyId)}/sale`,
    { method: 'GET' }
  );
  return result.data;
}

/**
 * Record the sale of a company-owned property
 */
export async function recordCompanyPropertySale(propertyId, payload) {
  const result = await request(
    `/admin/business/company-properties/${encodeURIComponent(propertyId)}/sale`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return result.data;
}

/**
 * Fetch general business expenses
 */
export async function fetchBusinessExpenses(params = {}) {
  const qs = toQueryString(params);
  const result = await request(`/admin/business/expenses${qs}`, { method: 'GET' });
  return result.data;
}

/**
 * Record a general business expense
 */
export async function recordBusinessExpense(payload) {
  const result = await request('/admin/business/expenses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result.data;
}

/**
 * Reverse a general business expense
 */
export async function reverseBusinessExpense(id, { reason }) {
  const result = await request(`/admin/business/expenses/${encodeURIComponent(id)}/reverse`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
  return result.data;
}

/**
 * Fetch aggregated financial reports summary
 */
export async function fetchFinancialReports(params = {}) {
  const qs = toQueryString(params);
  const result = await request(`/admin/business/reports/summary${qs}`, { method: 'GET' });
  return result.data;
}

/**
 * Securely download authorized CSV reports
 */
export async function downloadReportCsv(reportType, params = {}) {
  const qs = toQueryString(params);
  const url = `${API_BASE_URL}/admin/business/reports/export/${encodeURIComponent(reportType)}${qs}`;
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || `Failed to download CSV: HTTP ${response.status}`);
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `masterji_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

// =================================================================
// Part 14: Company Pages, Additional Services & Content Management
// =================================================================

/**
 * Fetch public company profile content
 */
export async function getCompanyContent() {
  const result = await request('/content/company', { method: 'GET' });
  return result.data;
}

/**
 * Fetch real estate and allied services
 */
export async function getServicesContent(category = '') {
  const qs = category ? `?category=${encodeURIComponent(category)}` : '';
  const result = await request(`/content/services${qs}`, { method: 'GET' });
  return result.data;
}

/**
 * Fetch categorized FAQs
 */
export async function getFaqsContent(params = {}) {
  const qs = toQueryString(params);
  const result = await request(`/content/faqs${qs}`, { method: 'GET' });
  return result.data;
}

/**
 * Fetch public legal draft content
 */
export async function getLegalContent(pageType) {
  const result = await request(`/content/legal/${encodeURIComponent(pageType)}`, { method: 'GET' });
  return result.data;
}

/**
 * Submit public contact message
 */
export async function submitContactMessage(contactData) {
  const result = await request('/content/contact', {
    method: 'POST',
    body: JSON.stringify(contactData),
  });
  return result.data;
}

/**
 * Admin: Fetch all editable content sections
 */
export async function adminGetContent() {
  const result = await request('/admin/content', { method: 'GET' });
  return result.data;
}

/**
 * Admin: Update a specific content section
 */
export async function adminUpdateContent(section, sectionData) {
  const result = await request(`/admin/content/${encodeURIComponent(section)}`, {
    method: 'PUT',
    body: JSON.stringify(sectionData),
  });
  return result.data;
}

/**
 * Admin: Fetch submitted contact messages
 */
export async function adminGetContactMessages(params = {}) {
  const qs = toQueryString(params);
  const result = await request(`/admin/content/messages${qs}`, { method: 'GET' });
  return result.data;
}

/**
 * Admin: Update contact message status / notes
 */
export async function adminUpdateContactMessage(id, updateData) {
  const result = await request(`/admin/content/messages/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  });
  return result.data;
}


