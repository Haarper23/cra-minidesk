import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchDevices } from '../../devices/api/deviceApi';
import { Device } from '../../devices/types/deviceTypes';

const DEBOUNCE_MS = 350;
const PAGE_SIZE = 20;

export interface UseDeviceSearchResult {
  devices: Device[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  searchText: string;
  setSearchText: (text: string) => void;
}

export function useDeviceSearch(customerId?: number): UseDeviceSearchResult {
  const [searchText, setSearchText] = useState('');
  const [debouncedText, setDebouncedText] = useState('');
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(searchText);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const currentRequestId = ++requestIdRef.current;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    fetchDevices(
      {
        query: debouncedText.trim() || undefined,
        customerId: customerId && customerId > 0 ? customerId : undefined,
        page: 0,
        size: PAGE_SIZE,
        sortBy: 'brand',
        sortDirection: 'asc',
      },
      controller.signal
    )
      .then((page) => {
        if (currentRequestId !== requestIdRef.current) return;
        setDevices(page.content);
        setIsLoading(false);
      })
      .catch((err) => {
        if (currentRequestId !== requestIdRef.current) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        if (err instanceof Error && err.message.includes('iptal edildi')) return;
        setIsError(true);
        setErrorMessage(err?.userMessage || err?.message || 'Cihaz araması başarısız oldu.');
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [debouncedText, customerId]);

  const setSearchTextStable = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  return {
    devices,
    isLoading,
    isError,
    errorMessage,
    searchText,
    setSearchText: setSearchTextStable,
  };
}
