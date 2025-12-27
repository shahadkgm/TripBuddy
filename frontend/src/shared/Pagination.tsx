// src/shared/components/Pagination.tsx
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-12">
      <button 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-slate-50 transition"
      >
        Previous
      </button>
      <span className="text-slate-600 font-medium">
        Page {currentPage} of {totalPages}
      </span>
      <button 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-slate-50 transition"
      >
        Next
      </button>
    </div>
  );
};