import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCustomer } from '../api/customerApi';
import { customerKeys } from '../api/customerKeys';
import { dashboardKeys } from '../../dashboard/api/dashboardKeys';
import { CustomerFormInput, Customer } from '../types/customerTypes';
import { ApiError } from '../../../lib/api/apiError';

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation<Customer, ApiError, { id: number; data: CustomerFormInput }>({
    mutationFn: ({ id, data }) => updateCustomer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
