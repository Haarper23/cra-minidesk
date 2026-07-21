import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchDevices } from '../api/deviceApi';
import { deviceKeys } from '../api/deviceKeys';
import { DeviceQueryParams, DevicePage } from '../types/deviceTypes';
import { ApiError } from '../../../lib/api/apiError';

export function useDevices(params: DeviceQueryParams = {}) {
  return useQuery<DevicePage, ApiError>({
    queryKey: deviceKeys.list(params),
    queryFn: ({ signal }) => fetchDevices(params, signal),
    placeholderData: keepPreviousData,
  });
}
