import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button.jsx';

export default function PropertySearchBar({ className = '' }) {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [budget, setBudget] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    // Listing classification tab
    if (activeTab !== 'all') {
      params.set('listingType', activeTab);
    }

    // Location mapping
    if (location) {
      if (location.includes('Gurugram')) params.set('city', 'Gurugram');
      else if (location.includes('Noida')) params.set('city', 'Noida');
      else if (location.includes('Delhi')) params.set('city', 'Delhi');
      else if (location.includes('Faridabad')) params.set('city', 'Faridabad');
      else if (location.includes('Bengaluru')) params.set('city', 'Bengaluru');
    }

    // Property category mapping
    if (propertyType) {
      const typeMap = {
        'Independent Houses': 'independent_house',
        'Apartments & Flats': 'apartment',
        'Villas': 'villa',
        'Residential Plots': 'residential_plot',
        'Commercial Properties': 'commercial_property',
      };
      if (typeMap[propertyType]) {
        params.set('category', typeMap[propertyType]);
      }
    }

    // Budget range mapping
    if (budget) {
      if (budget === 'Under ₹50 Lakhs') {
        params.set('maxPrice', '5000000');
      } else if (budget === '₹50 Lakhs - ₹1.0 Crore') {
        params.set('minPrice', '5000000');
        params.set('maxPrice', '10000000');
      } else if (budget === '₹1.0 Crore - ₹2.5 Crores') {
        params.set('minPrice', '10000000');
        params.set('maxPrice', '25000000');
      } else if (budget === '₹2.5 Crores - ₹5.0 Crores') {
        params.set('minPrice', '25000000');
        params.set('maxPrice', '50000000');
      } else if (budget === 'Above ₹5.0 Crores') {
        params.set('minPrice', '50000000');
      }
    }

    const queryString = params.toString();
    navigate(queryString ? `/properties?${queryString}` : '/properties');
  };

  return (
    <div className={`w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-modal p-4 sm:p-6 border border-slate-200/90 text-slate-900 ${className}`}>
      {/* Listing Mode Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-brand-navy text-white shadow-xs'
              : 'text-slate-600 hover:text-brand-navy hover:bg-slate-100'
          }`}
        >
          All Listings
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('company_owned')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'company_owned'
              ? 'bg-[#0F2444] text-[#F4E8C1] shadow-xs'
              : 'text-slate-600 hover:text-brand-navy hover:bg-slate-100'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
          MasterJi Direct (0% Brokerage)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('brokerage')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'brokerage'
              ? 'bg-slate-800 text-amber-200 shadow-xs'
              : 'text-slate-600 hover:text-brand-navy hover:bg-slate-100'
          }`}
        >
          Verified Brokerage
        </button>
      </div>

      {/* Inputs Grid */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
        {/* Location Field */}
        <div>
          <label htmlFor="search-location" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Location
          </label>
          <select
            id="search-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-navy cursor-pointer"
          >
            <option value="">All Locations</option>
            <option value="Gurugram (Golf Course / Ext Rd)">Gurugram (Golf Course / Ext Rd)</option>
            <option value="Noida & Greater Noida">Noida & Greater Noida</option>
            <option value="South & Central Delhi">South & Central Delhi</option>
            <option value="Faridabad">Faridabad</option>
            <option value="Bengaluru">Bengaluru</option>
          </select>
        </div>

        {/* Property Type Field */}
        <div>
          <label htmlFor="search-property-type" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Property Type
          </label>
          <select
            id="search-property-type"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-navy cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="Independent Houses">Independent Houses</option>
            <option value="Apartments & Flats">Apartments & Flats</option>
            <option value="Villas">Villas</option>
            <option value="Residential Plots">Residential Plots</option>
            <option value="Commercial Properties">Commercial Properties</option>
          </select>
        </div>

        {/* Budget Field */}
        <div>
          <label htmlFor="search-budget" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Budget Range
          </label>
          <select
            id="search-budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-navy cursor-pointer"
          >
            <option value="">Any Budget</option>
            <option value="Under ₹50 Lakhs">Under ₹50 Lakhs</option>
            <option value="₹50 Lakhs - ₹1.0 Crore">₹50 Lakhs - ₹1.0 Crore</option>
            <option value="₹1.0 Crore - ₹2.5 Crores">₹1.0 Crore - ₹2.5 Crores</option>
            <option value="₹2.5 Crores - ₹5.0 Crores">₹2.5 Crores - ₹5.0 Crores</option>
            <option value="Above ₹5.0 Crores">Above ₹5.0 Crores</option>
          </select>
        </div>

        {/* Submit Action */}
        <div className="flex items-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full h-[38px] text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search Properties</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
