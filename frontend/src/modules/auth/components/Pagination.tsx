// src/shared/components/Pagination.tsx
import type { PaginationProps } from "../interface/IPaginatedTrips";

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  // Hide pagination if there is only one page
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-12 pb-10">
      <button 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-4 py-2 bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 hover:border-indigo-300 transition-all font-medium text-slate-600"
      >
        Previous
      </button>

      <div className="flex items-center px-4 py-2 bg-indigo-50 rounded-lg border border-indigo-100">
        <span className="text-indigo-700 font-bold">
          {currentPage} <span className="text-indigo-300 font-normal mx-1">/</span> {totalPages}
        </span>
      </div>

      <button 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-4 py-2 bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 hover:border-indigo-300 transition-all font-medium text-slate-600"
      >
        Next
      </button>
    </div>
  );
};