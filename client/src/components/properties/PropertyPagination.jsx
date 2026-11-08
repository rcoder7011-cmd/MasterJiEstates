import React from 'react';
import Button from '../ui/Button.jsx';

export default function PropertyPagination({
  currentPage,
  totalPages,
  totalResults,
  itemsPerPage,
  onPageChange,
}) {
  if (totalResults <= itemsPerPage) {
    return null;
  }

  const startRange = (currentPage - 1) * itemsPerPage + 1;
  const endRange = Math.min(currentPage * itemsPerPage, totalResults);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const handlePageClick = (page) => {
    onPageChange(page);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 pb-4 border-t border-slate-200 mt-8">
      {/* Result Range Summary */}
      <div className="text-xs text-slate-500 font-medium">
        Showing <span className="font-bold text-brand-navy">{startRange}</span> to{' '}
        <span className="font-bold text-brand-navy">{endRange}</span> of{' '}
        <span className="font-bold text-brand-navy">{totalResults}</span> properties
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5 select-none">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => handlePageClick(currentPage - 1)}
          className="px-2.5 py-1 text-xs font-semibold disabled:opacity-40"
          aria-label="Previous Page"
        >
          &larr; Prev
        </Button>

        {/* Page Number Buttons */}
        {pages.map((pageNum) => {
          const isActive = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => handlePageClick(pageNum)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center ${
                isActive
                  ? 'bg-brand-navy text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
              aria-label={`Page ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => handlePageClick(currentPage + 1)}
          className="px-2.5 py-1 text-xs font-semibold disabled:opacity-40"
          aria-label="Next Page"
        >
          Next &rarr;
        </Button>
      </div>
    </div>
  );
}

