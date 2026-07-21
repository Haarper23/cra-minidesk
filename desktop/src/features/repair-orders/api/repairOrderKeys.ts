import { RepairOrderQueryParams } from '../types/repairOrderTypes';

export const repairOrderKeys = {
  all: ['repair-orders'] as const,
  lists: () => [...repairOrderKeys.all, 'list'] as const,
  list: (params: RepairOrderQueryParams) => [...repairOrderKeys.lists(), params] as const,
  details: () => [...repairOrderKeys.all, 'detail'] as const,
  detail: (id: number) => [...repairOrderKeys.details(), id] as const,
};
