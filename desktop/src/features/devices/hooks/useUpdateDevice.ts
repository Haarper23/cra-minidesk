import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDevice } from '../api/deviceApi';
import { deviceKeys } from '../api/deviceKeys';
import { Device, DeviceFormInput } from '../types/deviceTypes';
import { ApiError } from '../../../lib/api/apiError';

interface UpdateDeviceVariables {
  id: number;
  data: Omit<DeviceFormInput, 'customerId'>;
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();

  return useMutation<Device, ApiError, UpdateDeviceVariables>({
    mutationFn: ({ id, data }) => updateDevice(id, data),
    onSuccess: (updatedDevice) => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
      queryClient.invalidateQueries({
        queryKey: deviceKeys.detail(updatedDevice.id),
      });
    },
  });
}
