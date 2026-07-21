import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRepairOrderStatus } from '../api/repairOrderApi';
import { repairOrderKeys } from '../api/repairOrderKeys';
import { UpdateRepairOrderStatusInput } from '../types/repairOrderTypes';

export function useUpdateRepairOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateRepairOrderStatusInput }) =>
      updateRepairOrderStatus(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: repairOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: repairOrderKeys.detail(data.id) });
    },
  });
}
