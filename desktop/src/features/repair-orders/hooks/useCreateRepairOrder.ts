import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRepairOrder } from '../api/repairOrderApi';
import { repairOrderKeys } from '../api/repairOrderKeys';
import { dashboardKeys } from '../../dashboard/api/dashboardKeys';
import { CreateRepairOrderInput, RepairOrder } from '../types/repairOrderTypes';
import { ApiError } from '../../../lib/api/apiError';

export function useCreateRepairOrder() {
  const queryClient = useQueryClient();

  return useMutation<RepairOrder, ApiError, CreateRepairOrderInput>({
    mutationFn: (data) => createRepairOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repairOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
