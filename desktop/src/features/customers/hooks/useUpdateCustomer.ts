import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCustomer } from '../api/customerApi';
import { customerKeys } from '../api/customerKeys';
import { CustomerFormInput, Customer } from '../types/customerTypes';
import { ApiError } from '../../../lib/api/apiError';

interface UpdateCustomerArgs {
  id: number;
  input: CustomerFormInput;
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation<Customer, ApiError, UpdateCustomerArgs>({
    mutationFn: ({ id, input }) => updateCustomer(id, input),
    onSuccess: (updatedCustomer) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(updatedCustomer.id) });
    },
  });
}
