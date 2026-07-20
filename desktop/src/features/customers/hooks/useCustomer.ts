import { useQuery } from '@tanstack/react-query';
import { fetchCustomerById } from '../api/customerApi';
import { customerKeys } from '../api/customerKeys';
import { Customer } from '../types/customerTypes';
import { ApiError } from '../../../lib/api/apiError';

export function useCustomer(id?: number) {
  return useQuery<Customer, ApiError>({
    queryKey: customerKeys.detail(id ?? 0),
    queryFn: ({ signal }) => fetchCustomerById(id!, signal),
    enabled: typeof id === 'number' && id > 0,
    staleTime: 1000 * 30,
  });
}
