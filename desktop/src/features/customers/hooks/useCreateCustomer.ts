import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCustomer } from '../api/customerApi';
import { customerKeys } from '../api/customerKeys';
import { CustomerFormInput, Customer } from '../types/customerTypes';
import { ApiError } from '../../../lib/api/apiError';

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation<Customer, ApiError, CustomerFormInput>({
    mutationFn: (input) => createCustomer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}
