import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRepairOrder } from '../api/repairOrderApi';
import { repairOrderKeys } from '../api/repairOrderKeys';
import { dashboardKeys } from '../../dashboard/api/dashboardKeys';
import { UpdateRepairOrderInput, RepairOrder } from '../types/repairOrderTypes';
import { ApiError } from '../../../lib/api/apiError';

export function useUpdateRepairOrder() {
  const queryClient = useQueryClient();

  return useMutation<RepairOrder, ApiError, { id: number; data: UpdateRepairOrderInput }>({
    mutationFn: ({ id, data }) => updateRepairOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: repairOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: repairOrderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
