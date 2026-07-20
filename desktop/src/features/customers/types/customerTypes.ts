import { z } from 'zod';
import {
  CustomerResponseSchema,
  CustomerPageResponseSchema,
  CustomerFormInputSchema,
} from '../schemas/customerSchema';

export type Customer = z.infer<typeof CustomerResponseSchema>;
export type CustomerPage = z.infer<typeof CustomerPageResponseSchema>;
export type CustomerFormInput = z.infer<typeof CustomerFormInputSchema>;

export type CustomerSortField = 'id' | 'fullName' | 'email' | 'createdAt' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

export interface CustomerListQueryParams {
  query?: string;
  page?: number;
  size?: number;
  sortBy?: CustomerSortField;
  sortDirection?: SortDirection;
}
