import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRepairOrder } from '../api/repairOrderApi';
import { repairOrderKeys } from '../api/repairOrderKeys';

export function useDeleteRepairOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRepairOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: repairOrderKeys.all });
      queryClient.removeQueries({ queryKey: repairOrderKeys.detail(id) });
    },
  });
}
