import { useMemo, useCallback, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { demoProperties } from '../data/demoProperties.js';
import { fetchProperties as apiFetchProperties } from '../services/api.js';

const ITEMS_PER_PAGE = 6;

export function usePropertyFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read current filter state from URL search params
  const currentCity = searchParams.get('city') || 'all';
  const currentLocality = searchParams.get('locality') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || searchParams.get('type') || 'all';
  const currentListingType = searchParams.get('listingType') || 'all';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentMinArea = searchParams.get('minArea') || '';
  const currentMaxArea = searchParams.get('maxArea') || '';
  const currentBedrooms = searchParams.get('bedrooms') || 'all';
  const currentStatus = searchParams.get('status') || 'all';
  const currentSort = searchParams.get('sort') || 'recommended';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentView = searchParams.get('view') || 'grid';

  // API State
  const [apiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [error, setError] = useState(null);

  // Filter properties deterministically based on local dataset (used as baseline and fallback)
  const filteredLocalProperties = useMemo(() => {
    return demoProperties.filter((property) => {
      // City filter
      if (currentCity !== 'all' && currentCity !== 'All Cities') {
        if (property.city.toLowerCase() !== currentCity.toLowerCase()) {
          return false;
        }
      }

      // Locality search
      if (currentLocality.trim()) {
        const term = currentLocality.trim().toLowerCase();
        const matchesLocality = property.locality.toLowerCase().includes(term);
        const matchesAddress = property.addressDisplay?.toLowerCase().includes(term);
        if (!matchesLocality && !matchesAddress) {
          return false;
        }
      }

      // General search query (title, city, locality, tagline)
      if (currentSearch.trim()) {
        const query = currentSearch.trim().toLowerCase();
        const inTitle = property.title.toLowerCase().includes(query);
        const inLocality = property.locality.toLowerCase().includes(query);
        const inCity = property.city.toLowerCase().includes(query);
        const inTagline = property.tagline?.toLowerCase().includes(query) || false;
        if (!inTitle && !inLocality && !inCity && !inTagline) {
          return false;
        }
      }

      // Property category filter
      if (currentCategory !== 'all') {
        if (property.category !== currentCategory) {
          return false;
        }
      }

      // Listing type filter
      if (currentListingType !== 'all') {
        if (property.listingType !== currentListingType) {
          return false;
        }
      }

      // Min price filter
      if (currentMinPrice) {
        const min = Number(currentMinPrice);
        if (!isNaN(min) && property.price < min) {
          return false;
        }
      }

      // Max price filter
      if (currentMaxPrice) {
        const max = Number(currentMaxPrice);
        if (!isNaN(max) && property.price > max) {
          return false;
        }
      }

      // Min area filter
      if (currentMinArea) {
        const minAreaNum = Number(currentMinArea);
        if (!isNaN(minAreaNum) && property.area < minAreaNum) {
          return false;
        }
      }

      // Max area filter
      if (currentMaxArea) {
        const maxAreaNum = Number(currentMaxArea);
        if (!isNaN(maxAreaNum) && property.area > maxAreaNum) {
          return false;
        }
      }

      // Bedrooms filter
      if (currentBedrooms !== 'all') {
        if (property.bedrooms === null || property.bedrooms === undefined) {
          return false;
        }
        if (currentBedrooms === '5+' || currentBedrooms === '5') {
          if (property.bedrooms < 5) return false;
        } else {
          if (property.bedrooms !== Number(currentBedrooms)) return false;
        }
      }

      // Availability status filter
      if (currentStatus !== 'all') {
        if (property.availabilityStatus !== currentStatus) {
          return false;
        }
      }

      return true;
    });
  }, [
    currentCity,
    currentLocality,
    currentSearch,
    currentCategory,
    currentListingType,
    currentMinPrice,
    currentMaxPrice,
    currentMinArea,
    currentMaxArea,
    currentBedrooms,
    currentStatus,
  ]);

  // Sort properties deterministically for local dataset
  const sortedLocalProperties = useMemo(() => {
    const list = [...filteredLocalProperties];

    switch (currentSort) {
      case 'price_asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return list.sort((a, b) => b.price - a.price);
      case 'area_desc':
        return list.sort((a, b) => b.area - a.area);
      case 'area_asc':
        return list.sort((a, b) => a.area - b.area);
      case 'recommended':
      default:
        return list.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return (a.id || '').localeCompare(b.id || '');
        });
    }
  }, [filteredLocalProperties, currentSort]);

  // Local pagination calculation
  const totalLocalResults = sortedLocalProperties.length;
  const totalLocalPages = Math.max(1, Math.ceil(totalLocalResults / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalLocalPages);

  const paginatedLocalProperties = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return sortedLocalProperties.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedLocalProperties, safePage]);

  // Query Backend REST API
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const queryParams = {
      city: currentCity !== 'all' ? currentCity : undefined,
      locality: currentLocality || undefined,
      search: currentSearch || undefined,
      category: currentCategory !== 'all' ? currentCategory : undefined,
      listingType: currentListingType !== 'all' ? currentListingType : undefined,
      minPrice: currentMinPrice || undefined,
      maxPrice: currentMaxPrice || undefined,
      minArea: currentMinArea || undefined,
      maxArea: currentMaxArea || undefined,
      bedrooms: currentBedrooms !== 'all' ? currentBedrooms : undefined,
      status: currentStatus !== 'all' ? currentStatus : undefined,
      sort: currentSort,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };

    apiFetchProperties(queryParams)
      .then((res) => {
        if (!isMounted) return;
        setApiData(res);
        setIsFallback(Boolean(res.isFallback));
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message);
        setIsFallback(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    currentCity,
    currentLocality,
    currentSearch,
    currentCategory,
    currentListingType,
    currentMinPrice,
    currentMaxPrice,
    currentMinArea,
    currentMaxArea,
    currentBedrooms,
    currentStatus,
    currentSort,
    currentPage,
  ]);

  // Resolve active output between API and local fallback
  const properties = apiData && !isFallback ? apiData.properties : paginatedLocalProperties;
  const totalResults = apiData && !isFallback ? (apiData.meta?.total ?? totalLocalResults) : totalLocalResults;
  const totalPages = apiData && !isFallback ? (apiData.meta?.totalPages ?? totalLocalPages) : totalLocalPages;

  // Update URL search parameters
  const updateFilter = useCallback(
    (key, value) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === '' || value === 'all' || value === null || value === undefined) {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
          if (key !== 'page' && key !== 'view') {
            next.delete('page');
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Update multiple filters at once
  const updateMultipleFilters = useCallback(
    (updates) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, value]) => {
            if (value === '' || value === 'all' || value === null || value === undefined) {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          });
          next.delete('page');
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Clear single filter
  const clearFilter = useCallback(
    (key) => {
      updateFilter(key, '');
    },
    [updateFilter]
  );

  // Clear all filters action
  const clearAllFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams();
        const currentViewParam = prev.get('view');
        if (currentViewParam) {
          next.set('view', currentViewParam);
        }
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  // Active filters list for display chips
  const activeFilters = useMemo(() => {
    const chips = [];

    if (currentCity !== 'all' && currentCity !== 'All Cities') {
      chips.push({ key: 'city', label: `City: ${currentCity}` });
    }
    if (currentLocality.trim()) {
      chips.push({ key: 'locality', label: `Locality: "${currentLocality}"` });
    }
    if (currentSearch.trim()) {
      chips.push({ key: 'search', label: `Keyword: "${currentSearch}"` });
    }
    if (currentCategory !== 'all') {
      const catMap = {
        independent_house: 'Independent House',
        apartment: 'Apartment / Flat',
        villa: 'Villa',
        residential_plot: 'Residential Plot',
        commercial_property: 'Commercial Property',
      };
      chips.push({ key: 'category', label: `Category: ${catMap[currentCategory] || currentCategory}` });
    }
    if (currentListingType !== 'all') {
      chips.push({
        key: 'listingType',
        label: currentListingType === 'company_owned' ? 'MasterJi Direct' : 'Brokerage',
      });
    }
    if (currentMinPrice) {
      const minNum = Number(currentMinPrice);
      const minLabel = minNum >= 10000000 ? `₹${minNum / 10000000} Cr` : `₹${minNum / 100000} Lakhs`;
      chips.push({ key: 'minPrice', label: `Min: ${minLabel}` });
    }
    if (currentMaxPrice) {
      const maxNum = Number(currentMaxPrice);
      const maxLabel = maxNum >= 10000000 ? `₹${maxNum / 10000000} Cr` : `₹${maxNum / 100000} Lakhs`;
      chips.push({ key: 'maxPrice', label: `Max: ${maxLabel}` });
    }
    if (currentMinArea) {
      chips.push({ key: 'minArea', label: `Min Area: ${currentMinArea} sq ft` });
    }
    if (currentMaxArea) {
      chips.push({ key: 'maxArea', label: `Max Area: ${currentMaxArea} sq ft` });
    }
    if (currentBedrooms !== 'all') {
      chips.push({ key: 'bedrooms', label: `Bedrooms: ${currentBedrooms} BHK` });
    }
    if (currentStatus !== 'all') {
      chips.push({
        key: 'status',
        label: currentStatus === 'available' ? 'Available' : 'Under Negotiation',
      });
    }

    return chips;
  }, [
    currentCity,
    currentLocality,
    currentSearch,
    currentCategory,
    currentListingType,
    currentMinPrice,
    currentMaxPrice,
    currentMinArea,
    currentMaxArea,
    currentBedrooms,
    currentStatus,
  ]);

  return {
    // Current filter states
    city: currentCity,
    locality: currentLocality,
    search: currentSearch,
    category: currentCategory,
    listingType: currentListingType,
    minPrice: currentMinPrice,
    maxPrice: currentMaxPrice,
    minArea: currentMinArea,
    maxArea: currentMaxArea,
    bedrooms: currentBedrooms,
    status: currentStatus,
    sort: currentSort,
    page: safePage,
    view: currentView,

    // Async / Status states
    isLoading,
    isFallback,
    error,

    // Results & Calculations
    properties,
    totalResults,
    totalPages,
    itemsPerPage: ITEMS_PER_PAGE,
    activeFilters,
    hasActiveFilters: activeFilters.length > 0,

    // Mutation Handlers
    updateFilter,
    updateMultipleFilters,
    clearFilter,
    clearAllFilters,
    setSort: (val) => updateFilter('sort', val),
    setPage: (val) => updateFilter('page', val),
    setView: (val) => updateFilter('view', val),
  };
}
