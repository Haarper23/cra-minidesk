import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchCustomers } from '../api/customerApi';
import { customerKeys } from '../api/customerKeys';
import { CustomerListQueryParams, CustomerPage } from '../types/customerTypes';
import { ApiError } from '../../../lib/api/apiError';

export function useCustomers(params: CustomerListQueryParams = {}) {
  return useQuery<CustomerPage, ApiError>({
    queryKey: customerKeys.list(params),
    queryFn: ({ signal }) => fetchCustomers(params, signal),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 15, // 15 seconds
  });
}
