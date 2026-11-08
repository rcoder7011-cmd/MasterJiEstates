import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar.jsx';
import DashboardHeader from './DashboardHeader.jsx';

export default function DashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col lg:flex-row text-brand-dark selection:bg-brand-gold/30 selection:text-brand-navy">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block lg:w-64 flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <DashboardSidebar />
      </div>

      {/* Mobile Drawer Backdrop and Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 animate-slideInLeft">
            <DashboardSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader onToggleMobile={() => setMobileSidebarOpen(true)} />

        {/* Dashboard Sub-Route Page Content */}
        <main id="dashboard-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

