import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRepairOrder } from '../api/repairOrderApi';
import { repairOrderKeys } from '../api/repairOrderKeys';
import { UpdateRepairOrderInput } from '../types/repairOrderTypes';

export function useUpdateRepairOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateRepairOrderInput }) =>
      updateRepairOrder(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: repairOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: repairOrderKeys.detail(data.id) });
    },
  });
}
