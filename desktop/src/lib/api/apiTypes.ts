/**
 * Standard backend response contract wrapper.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export type SortDirection = 'asc' | 'desc';

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}
