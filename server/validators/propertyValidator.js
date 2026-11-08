/**
 * Sanitize and validate query parameters for property catalog browsing.
 *
 * @param {object} query
 * @returns {object} Clean query filters and pagination params
 */
export function sanitizePropertyQuery(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 12));

  const clean = {
    page,
    limit,
    city: query.city && query.city !== 'all' ? query.city.trim() : null,
    locality: query.locality ? query.locality.trim() : null,
    category: query.category && query.category !== 'all' ? query.category.trim() : null,
    listingType: query.listingType && query.listingType !== 'all' ? query.listingType.trim() : null,
    status: query.status && query.status !== 'all' ? query.status.trim() : null,
    search: query.search ? query.search.trim() : null,
    sort: query.sort ? query.sort.trim() : 'recommended',
    minPrice: query.minPrice ? Number(query.minPrice) : null,
    maxPrice: query.maxPrice ? Number(query.maxPrice) : null,
    minArea: query.minArea ? Number(query.minArea) : null,
    maxArea: query.maxArea ? Number(query.maxArea) : null,
    bedrooms: query.bedrooms && query.bedrooms !== 'all' ? query.bedrooms.trim() : null,
    featured: query.featured === 'true' ? true : null,
  };

  // Remove invalid numbers
  if (clean.minPrice !== null && (isNaN(clean.minPrice) || clean.minPrice < 0)) clean.minPrice = null;
  if (clean.maxPrice !== null && (isNaN(clean.maxPrice) || clean.maxPrice < 0)) clean.maxPrice = null;
  if (clean.minArea !== null && (isNaN(clean.minArea) || clean.minArea < 0)) clean.minArea = null;
  if (clean.maxArea !== null && (isNaN(clean.maxArea) || clean.maxArea < 0)) clean.maxArea = null;

  return clean;
}

