import { ApiErrorCategory } from './apiError';

export type BackendConnectionState = 'PENDING' | 'CONNECTED' | 'NO_CONNECTION' | 'RESPONSE_ERROR';

export interface BackendStatus {
  state: BackendConnectionState;
  label: string;
  badgeClass: 'pending' | 'connected' | 'disconnected' | 'error';
}

export function getBackendStatusFromQuery(
  isLoading: boolean,
  isError: boolean,
  errorCategory?: ApiErrorCategory
): BackendStatus {
  if (isLoading) {
    return {
      state: 'PENDING',
      label: 'Bağlantı Kontrol Ediliyor',
      badgeClass: 'pending',
    };
  }

  if (isError && errorCategory) {
    if (errorCategory === 'NETWORK' || errorCategory === 'TIMEOUT') {
      return {
        state: 'NO_CONNECTION',
        label: 'Backend Bağlantısı Yok',
        badgeClass: 'disconnected',
      };
    }
    return {
      state: 'RESPONSE_ERROR',
      label: 'Backend Yanıt Hatası',
      badgeClass: 'error',
    };
  }

  return {
    state: 'CONNECTED',
    label: 'Backend Bağlı',
    badgeClass: 'connected',
  };
}
