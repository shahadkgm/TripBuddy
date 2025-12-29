// import type { ITrip } from "./ITripdetails";

  
  
export interface PaginationProps {
  currentPage: number;
  totalPages: number; // Changed from total to totalPages
  onPageChange: (page: number) => void;
}

// interface PaginationProps {
//   currentPage: number;
//   totalPages: number;
//   onPageChange: (page: number) => void;
// }