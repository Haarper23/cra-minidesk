import { DeviceQueryParams } from '../types/deviceTypes';

export const deviceKeys = {
  all: ['devices'] as const,
  lists: () => [...deviceKeys.all, 'list'] as const,
  list: (params: DeviceQueryParams) => [...deviceKeys.lists(), params] as const,
  details: () => [...deviceKeys.all, 'detail'] as const,
  detail: (id: number) => [...deviceKeys.details(), id] as const,
};
