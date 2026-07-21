import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDevice } from '../api/deviceApi';
import { deviceKeys } from '../api/deviceKeys';
import { ApiError } from '../../../lib/api/apiError';

export function useDeleteDevice() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id) => deleteDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}
