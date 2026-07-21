import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchCustomers } from '../../customers/api/customerApi';
import { Customer } from '../../customers/types/customerTypes';

const DEBOUNCE_MS = 350;
const PAGE_SIZE = 20;

export interface UseCustomerSearchResult {
  customers: Customer[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  searchText: string;
  setSearchText: (text: string) => void;
}

export function useCustomerSearch(): UseCustomerSearchResult {
  const [searchText, setSearchText] = useState('');
  const [debouncedText, setDebouncedText] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Monotonic counter to discard stale responses
  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce the search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(searchText);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch customers when debounced text changes
  useEffect(() => {
    const currentRequestId = ++requestIdRef.current;

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    fetchCustomers(
      {
        query: debouncedText.trim() || undefined,
        page: 0,
        size: PAGE_SIZE,
        sortBy: 'fullName',
        sortDirection: 'asc',
      },
      controller.signal
    )
      .then((page) => {
        // Discard stale response
        if (currentRequestId !== requestIdRef.current) return;
        setCustomers(page.content);
        setIsLoading(false);
      })
      .catch((err) => {
        // Discard stale/aborted
        if (currentRequestId !== requestIdRef.current) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        if (err instanceof Error && err.message.includes('iptal edildi')) return;
        setIsError(true);
        setErrorMessage(err?.userMessage || err?.message || 'Müşteri araması başarısız oldu.');
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [debouncedText]);

  const setSearchTextStable = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  return {
    customers,
    isLoading,
    isError,
    errorMessage,
    searchText,
    setSearchText: setSearchTextStable,
  };
}
