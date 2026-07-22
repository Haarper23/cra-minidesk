import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRepairOrder } from '../api/repairOrderApi';
import { repairOrderKeys } from '../api/repairOrderKeys';
import { dashboardKeys } from '../../dashboard/api/dashboardKeys';
import { ApiError } from '../../../lib/api/apiError';

export function useDeleteRepairOrder() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id) => deleteRepairOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: repairOrderKeys.all });
      queryClient.removeQueries({ queryKey: repairOrderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
