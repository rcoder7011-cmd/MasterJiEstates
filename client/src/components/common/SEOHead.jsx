import React, { useEffect } from 'react';

const DOMAIN = 'https://masterjiestates.in';

/**
 * Reusable SEO Manager: Dynamically manages document title, meta description,
 * canonical link tag, robots directives, and Open Graph tags.
 */
export default function SEOHead({
  title,
  description = 'MasterJiEstates — From Finding Your Property to Building Your Dream. Premium verified real-estate advisory, brokerage transactions, and legally scrutinized direct company properties in India.',
  canonicalPath = '',
  noIndex = false,
  ogType = 'website',
}) {
  useEffect(() => {
    // 1. Page Title
    const fullTitle = title ? `${title} | MasterJiEstates` : 'MasterJiEstates — Real Estate Advisory & Property Discovery';
    document.title = fullTitle;

    // Helper to create or update meta tag
    const setMetaTag = (attrName, attrValue, content) => {
      let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 2. Meta Description
    setMetaTag('name', 'description', description);

    // 3. Robots
    const robotsContent = noIndex ? 'noindex, nofollow' : 'index, follow';
    setMetaTag('name', 'robots', robotsContent);

    // 4. Canonical Link
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const canonicalUrl = `${DOMAIN}${cleanPath === '/' ? '' : cleanPath}`;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);

    // 5. Open Graph Meta Tags
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'MasterJiEstates');
  }, [title, description, canonicalPath, noIndex, ogType]);

  return null; // Head-only component
}

