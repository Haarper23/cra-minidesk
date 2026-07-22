import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCustomer } from '../api/customerApi';
import { customerKeys } from '../api/customerKeys';
import { ApiError } from '../../../lib/api/apiError';

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id) => deleteCustomer(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      queryClient.removeQueries({ queryKey: customerKeys.detail(id) });
    },
  });
}
