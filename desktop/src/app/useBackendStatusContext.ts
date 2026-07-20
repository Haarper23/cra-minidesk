import { useContext } from 'react';
import { BackendStatusContext } from './BackendStatusContext';

export function useBackendStatusContext() {
  return useContext(BackendStatusContext);
}
