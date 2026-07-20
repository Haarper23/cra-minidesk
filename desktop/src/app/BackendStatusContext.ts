import { createContext } from 'react';
import { BackendStatus } from '../lib/api/backendStatus';
import { ApiErrorCategory } from '../lib/api/apiError';

export interface BackendStatusContextType {
  status: BackendStatus;
  updateStatusFromQuery: (
    isLoading: boolean,
    isError: boolean,
    errorCategory?: ApiErrorCategory
  ) => void;
}

export const defaultBackendStatus: BackendStatus = {
  state: 'CONNECTED',
  label: 'Backend Bağlı',
  badgeClass: 'connected',
};

export const BackendStatusContext = createContext<BackendStatusContextType>({
  status: defaultBackendStatus,
  updateStatusFromQuery: () => {},
});
