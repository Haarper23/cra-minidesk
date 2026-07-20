import React, { useState, useMemo } from 'react';
import { BackendStatus, getBackendStatusFromQuery } from '../lib/api/backendStatus';
import { ApiErrorCategory } from '../lib/api/apiError';
import { BackendStatusContext, defaultBackendStatus } from './BackendStatusContext';

export const BackendStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<BackendStatus>(defaultBackendStatus);

  const updateStatusFromQuery = (
    isLoading: boolean,
    isError: boolean,
    errorCategory?: ApiErrorCategory
  ) => {
    const newStatus = getBackendStatusFromQuery(isLoading, isError, errorCategory);
    setStatus((prev) => {
      if (prev.state === newStatus.state && prev.label === newStatus.label) {
        return prev;
      }
      return newStatus;
    });
  };

  const value = useMemo(() => ({ status, updateStatusFromQuery }), [status]);

  return <BackendStatusContext.Provider value={value}>{children}</BackendStatusContext.Provider>;
};
