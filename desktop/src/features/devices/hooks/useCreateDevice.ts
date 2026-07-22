import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDevice } from '../api/deviceApi';
import { deviceKeys } from '../api/deviceKeys';
import { dashboardKeys } from '../../dashboard/api/dashboardKeys';
import { DeviceFormInput, Device } from '../types/deviceTypes';
import { ApiError } from '../../../lib/api/apiError';

export function useCreateDevice() {
  const queryClient = useQueryClient();

  return useMutation<Device, ApiError, DeviceFormInput>({
    mutationFn: (data) => {
      const { customerId, ...payload } = data;
      return createDevice(customerId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
