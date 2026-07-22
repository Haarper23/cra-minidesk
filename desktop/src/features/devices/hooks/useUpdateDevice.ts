import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDevice } from '../api/deviceApi';
import { deviceKeys } from '../api/deviceKeys';
import { dashboardKeys } from '../../dashboard/api/dashboardKeys';
import { DeviceFormInput, Device } from '../types/deviceTypes';
import { ApiError } from '../../../lib/api/apiError';

export function useUpdateDevice() {
  const queryClient = useQueryClient();

  return useMutation<Device, ApiError, { id: number; data: DeviceFormInput }>({
    mutationFn: ({ id, data }) => {
      const payload: Omit<DeviceFormInput, 'customerId'> & { customerId?: number } = { ...data };
      delete payload.customerId;
      return updateDevice(id, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
      queryClient.invalidateQueries({ queryKey: deviceKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
