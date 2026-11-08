import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '../ui/SectionHeading.jsx';
import Button from '../ui/Button.jsx';
import PropertyCard from './PropertyCard.jsx';
import { demoProperties } from '../../data/demoProperties.js';
import { fetchProperties } from '../../services/api.js';

export default function FeaturedProperties() {
  const [properties, setProperties] = useState(demoProperties.slice(0, 4));

  useEffect(() => {
    let isMounted = true;
    async function loadFeatured() {
      try {
        const res = await fetchProperties({ limit: 4, sort: 'recommended' });
        if (isMounted && res && Array.isArray(res.properties) && res.properties.length > 0) {
          setProperties(res.properties.slice(0, 4));
        }
      } catch {
        // Keep demo properties as fallback
      }
    }
    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="featured-properties" className="py-16 sm:py-24 bg-white border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Curated Opportunities"
          title="Discover Featured Properties"
          subtitle="Explore selected properties showcasing MasterJi Direct acquisitions and verified owner mandates."
          action={
            <Link to="/properties">
              <Button variant="outline" size="sm">
                View All Properties &rarr;
              </Button>
            </Link>
          }
        />

        {/* Property Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {properties.map((prop) => (
            <PropertyCard
              key={prop.id || prop._id}
              property={prop}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

