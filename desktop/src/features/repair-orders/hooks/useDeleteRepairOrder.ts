import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRepairOrder } from '../api/repairOrderApi';
import { repairOrderKeys } from '../api/repairOrderKeys';

export function useDeleteRepairOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRepairOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repairOrderKeys.lists() });
    },
  });
}
