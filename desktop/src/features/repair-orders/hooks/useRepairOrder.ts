import { useQuery } from '@tanstack/react-query';
import { fetchRepairOrderById } from '../api/repairOrderApi';
import { repairOrderKeys } from '../api/repairOrderKeys';

export function useRepairOrder(id: number | null | undefined) {
  return useQuery({
    queryKey: repairOrderKeys.detail(id || 0),
    queryFn: ({ signal }) => fetchRepairOrderById(id!, signal),
    enabled: Boolean(id && id > 0),
  });
}
