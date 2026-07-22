import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDevice } from '../api/deviceApi';
import { deviceKeys } from '../api/deviceKeys';
import { dashboardKeys } from '../../dashboard/api/dashboardKeys';
import { ApiError } from '../../../lib/api/apiError';

export function useDeleteDevice() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id) => deleteDevice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
      queryClient.removeQueries({ queryKey: deviceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
