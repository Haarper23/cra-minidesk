import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDevice } from '../api/deviceApi';
import { deviceKeys } from '../api/deviceKeys';
import { Device, DeviceFormInput } from '../types/deviceTypes';
import { ApiError } from '../../../lib/api/apiError';

export function useCreateDevice() {
  const queryClient = useQueryClient();

  return useMutation<Device, ApiError, DeviceFormInput>({
    mutationFn: (input) => {
      const { customerId, ...rest } = input;
      return createDevice(customerId, rest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}
