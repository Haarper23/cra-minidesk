import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRepairOrder } from '../api/repairOrderApi';
import { repairOrderKeys } from '../api/repairOrderKeys';
import { CreateRepairOrderInput } from '../types/repairOrderTypes';

export function useCreateRepairOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRepairOrderInput) => createRepairOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repairOrderKeys.lists() });
    },
  });
}
