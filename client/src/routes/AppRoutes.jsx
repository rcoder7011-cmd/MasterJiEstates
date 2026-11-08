import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import PageLoader from '../components/common/PageLoader.jsx';

// Core Layout & Guard Components
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import DashboardLayout from '../components/dashboard/DashboardLayout.jsx';
import AdminRoute from '../components/auth/AdminRoute.jsx';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import FloatingWhatsApp from '../components/common/FloatingWhatsApp.jsx';

// Code-Split Route Pages (React.lazy for performance & Core Web Vitals optimization)
const Home = lazy(() => import('../pages/Home.jsx'));
const PropertyListing = lazy(() => import('../pages/properties/PropertyListing.jsx'));
const PropertyDetails = lazy(() => import('../pages/properties/PropertyDetails.jsx'));
const Login = lazy(() => import('../pages/auth/Login.jsx'));
const Register = lazy(() => import('../pages/auth/Register.jsx'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword.jsx'));
const DesignSystemShowcase = lazy(() => import('../pages/DesignSystemShowcase.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx'));

// Part 10 Unified User Dashboard
const Overview = lazy(() => import('../pages/dashboard/Overview.jsx'));
const MyEnquiries = lazy(() => import('../pages/dashboard/MyEnquiries.jsx'));
const SiteVisits = lazy(() => import('../pages/dashboard/SiteVisits.jsx'));
const SavedProperties = lazy(() => import('../pages/dashboard/SavedProperties.jsx'));
const RecentlyViewed = lazy(() => import('../pages/dashboard/RecentlyViewed.jsx'));
const MyListings = lazy(() => import('../pages/dashboard/MyListings.jsx'));
const SubmitProperty = lazy(() => import('../pages/dashboard/SubmitProperty.jsx'));
const AccountSettings = lazy(() => import('../pages/dashboard/AccountSettings.jsx'));

// Part 12 Administrative Back-Office Portal
const AdminOverview = lazy(() => import('../pages/admin/AdminOverview.jsx'));
const PropertyModeration = lazy(() => import('../pages/admin/PropertyModeration.jsx'));
const PropertyReview = lazy(() => import('../pages/admin/PropertyReview.jsx'));
const PropertyManagement = lazy(() => import('../pages/admin/PropertyManagement.jsx'));
const CompanyInventory = lazy(() => import('../pages/admin/CompanyInventory.jsx'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement.jsx'));
const AdminEnquiries = lazy(() => import('../pages/admin/AdminEnquiries.jsx'));
const AdminSiteVisits = lazy(() => import('../pages/admin/AdminSiteVisits.jsx'));
const AdminActivityLogs = lazy(() => import('../pages/admin/AdminActivityLogs.jsx'));

// Part 13 Business Operations & Financial Management
const BusinessOverview = lazy(() => import('../pages/admin/BusinessOverview.jsx'));
const BrokerageDeals = lazy(() => import('../pages/admin/BrokerageDeals.jsx'));
const DealDetails = lazy(() => import('../pages/admin/DealDetails.jsx'));
const CommissionLedger = lazy(() => import('../pages/admin/CommissionLedger.jsx'));
const CompanyPropertyFinancials = lazy(() => import('../pages/admin/CompanyPropertyFinancials.jsx'));
const BusinessExpenses = lazy(() => import('../pages/admin/BusinessExpenses.jsx'));
const FinancialReports = lazy(() => import('../pages/admin/FinancialReports.jsx'));

// Part 14 Company Pages, Additional Services & Legal Disclaimers
const AboutUs = lazy(() => import('../pages/company/AboutUs.jsx'));
const ServicesPage = lazy(() => import('../pages/company/ServicesPage.jsx'));
const ContactUs = lazy(() => import('../pages/company/ContactUs.jsx'));
const FAQPage = lazy(() => import('../pages/company/FAQPage.jsx'));
const PrivacyPolicy = lazy(() => import('../pages/legal/PrivacyPolicy.jsx'));
const TermsAndConditions = lazy(() => import('../pages/legal/TermsAndConditions.jsx'));
const Disclaimer = lazy(() => import('../pages/legal/Disclaimer.jsx'));
const BrokeragePolicy = lazy(() => import('../pages/legal/BrokeragePolicy.jsx'));
const CookiePolicy = lazy(() => import('../pages/legal/CookiePolicy.jsx'));
const ContentManagement = lazy(() => import('../pages/admin/ContentManagement.jsx'));

export default function AppRoutes() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Part 5 Homepage */}
          <Route path="/" element={<Home />} />

          {/* Part 6 & 7 Property Directory & Details */}
          <Route path="/properties" element={<PropertyListing />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />

          {/* Direct Seller & Listing Shortcuts */}
          <Route path="/add-property" element={<Navigate to="/dashboard/listings/new" replace />} />
          <Route path="/submit-property" element={<Navigate to="/dashboard/listings/new" replace />} />
          <Route path="/properties/new" element={<Navigate to="/dashboard/listings/new" replace />} />
          <Route path="/sell" element={<Navigate to="/dashboard/listings/new" replace />} />

          {/* Part 4 Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Part 10 Unified User Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="enquiries" element={<MyEnquiries />} />
            <Route path="site-visits" element={<SiteVisits />} />
            <Route path="favourites" element={<SavedProperties />} />
            <Route path="recently-viewed" element={<RecentlyViewed />} />
            <Route path="listings" element={<MyListings />} />
            <Route path="listings/new" element={<SubmitProperty />} />
            <Route path="listings/edit/:id" element={<SubmitProperty />} />
            <Route path="settings" element={<AccountSettings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Part 12 Admin Back-Office Portal */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="moderation" element={<PropertyModeration />} />
            <Route path="moderation/:id" element={<PropertyReview />} />
            <Route path="properties" element={<PropertyManagement />} />
            <Route path="company-inventory" element={<CompanyInventory />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="site-visits" element={<AdminSiteVisits />} />
            <Route path="activity-logs" element={<AdminActivityLogs />} />

            {/* Part 13 Business Operations & Financial Management */}
            <Route path="business" element={<BusinessOverview />} />
            <Route path="deals" element={<BrokerageDeals />} />
            <Route path="deals/:id" element={<DealDetails />} />
            <Route path="commission-ledger" element={<CommissionLedger />} />
            <Route path="company-financials" element={<CompanyPropertyFinancials />} />
            <Route path="expenses" element={<BusinessExpenses />} />
            <Route path="financial-reports" element={<FinancialReports />} />

            {/* Part 14 Admin Content & Inquiries Management */}
            <Route path="content" element={<ContentManagement />} />

            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* Part 14 Public Company & Service Pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/faq" element={<FAQPage />} />

          {/* Part 14 Legal Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/terms" element={<Navigate to="/terms-and-conditions" replace />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/brokerage-policy" element={<BrokeragePolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />

          {/* Part 3 Design System UI Showcase */}
          <Route path="/design-system" element={<DesignSystemShowcase />} />

          {/* Part 15 Dedicated Branded 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* Global Floating WhatsApp Widget */}
      <FloatingWhatsApp />
    </>
  );
}
