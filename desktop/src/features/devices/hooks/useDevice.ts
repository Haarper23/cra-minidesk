import { useQuery } from '@tanstack/react-query';
import { fetchDeviceById } from '../api/deviceApi';
import { deviceKeys } from '../api/deviceKeys';
import { Device } from '../types/deviceTypes';
import { ApiError } from '../../../lib/api/apiError';

export function useDevice(id: number | null | undefined) {
  return useQuery<Device, ApiError>({
    queryKey: deviceKeys.detail(id!),
    queryFn: ({ signal }) => fetchDeviceById(id!, signal),
    enabled: Boolean(id && id > 0),
  });
}
