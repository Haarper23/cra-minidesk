import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRepairOrderStatus } from '../api/repairOrderApi';
import { repairOrderKeys } from '../api/repairOrderKeys';
import { dashboardKeys } from '../../dashboard/api/dashboardKeys';
import { UpdateRepairOrderStatusInput, RepairOrder } from '../types/repairOrderTypes';
import { ApiError } from '../../../lib/api/apiError';

export function useUpdateRepairOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation<RepairOrder, ApiError, { id: number; data: UpdateRepairOrderStatusInput }>({
    mutationFn: ({ id, data }) => updateRepairOrderStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: repairOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: repairOrderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
