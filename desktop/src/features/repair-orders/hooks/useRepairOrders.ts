import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { fetchRepairOrders } from '../api/repairOrderApi';
import { repairOrderKeys } from '../api/repairOrderKeys';
import {
  RepairOrderStatus,
  RepairPriority,
  RepairOrderQueryParams,
} from '../types/repairOrderTypes';

const ALLOWED_SORT_FIELDS = new Set([
  'id',
  'orderNumber',
  'status',
  'priority',
  'receivedAt',
  'completedAt',
  'deliveredAt',
  'createdAt',
  'updatedAt',
]);

const VALID_STATUSES: RepairOrderStatus[] = [
  'RECEIVED',
  'DIAGNOSING',
  'WAITING_FOR_CUSTOMER_APPROVAL',
  'APPROVED',
  'IN_REPAIR',
  'WAITING_FOR_PART',
  'COMPLETED',
  'READY_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

const VALID_PRIORITIES: RepairPriority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

export function useRepairOrders() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract and sanitize query parameters from URL
  const rawQuery = searchParams.get('query') || '';
  const rawStatus = searchParams.get('status');
  const rawPriority = searchParams.get('priority');
  const rawCustomerId = searchParams.get('customerId');
  const rawDeviceId = searchParams.get('deviceId');
  const rawPage = parseInt(searchParams.get('page') || '0', 10);
  const rawSize = parseInt(searchParams.get('size') || '20', 10);
  const rawSortBy = searchParams.get('sortBy') || 'createdAt';
  const rawSortDirection = searchParams.get('sortDirection') || 'desc';

  const status: RepairOrderStatus | undefined =
    rawStatus && VALID_STATUSES.includes(rawStatus as RepairOrderStatus)
      ? (rawStatus as RepairOrderStatus)
      : undefined;

  const priority: RepairPriority | undefined =
    rawPriority && VALID_PRIORITIES.includes(rawPriority as RepairPriority)
      ? (rawPriority as RepairPriority)
      : undefined;

  const customerId =
    rawCustomerId && !isNaN(parseInt(rawCustomerId, 10)) && parseInt(rawCustomerId, 10) > 0
      ? parseInt(rawCustomerId, 10)
      : undefined;

  const deviceId =
    rawDeviceId && !isNaN(parseInt(rawDeviceId, 10)) && parseInt(rawDeviceId, 10) > 0
      ? parseInt(rawDeviceId, 10)
      : undefined;

  const page = isNaN(rawPage) || rawPage < 0 ? 0 : rawPage;
  const size = isNaN(rawSize) || rawSize < 10 || rawSize > 25 ? 20 : rawSize;

  const sortBy: RepairOrderQueryParams['sortBy'] = ALLOWED_SORT_FIELDS.has(rawSortBy)
    ? (rawSortBy as RepairOrderQueryParams['sortBy'])
    : 'createdAt';

  const sortDirection = rawSortDirection === 'asc' ? 'asc' : 'desc';

  const queryParams: RepairOrderQueryParams = {
    query: rawQuery || undefined,
    status,
    priority,
    customerId,
    deviceId,
    page,
    size,
    sortBy,
    sortDirection,
  };

  const queryResult = useQuery({
    queryKey: repairOrderKeys.list(queryParams),
    queryFn: ({ signal }) => fetchRepairOrders(queryParams, signal),
  });

  const updateFilters = useCallback(
    (newFilters: Partial<RepairOrderQueryParams>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        if (newFilters.query !== undefined) {
          if (newFilters.query.trim()) {
            next.set('query', newFilters.query.trim());
          } else {
            next.delete('query');
          }
        }

        if (newFilters.status !== undefined) {
          if (newFilters.status) {
            next.set('status', newFilters.status);
          } else {
            next.delete('status');
          }
        }

        if (newFilters.priority !== undefined) {
          if (newFilters.priority) {
            next.set('priority', newFilters.priority);
          } else {
            next.delete('priority');
          }
        }

        if (newFilters.customerId !== undefined) {
          if (newFilters.customerId && newFilters.customerId > 0) {
            next.set('customerId', String(newFilters.customerId));
          } else {
            next.delete('customerId');
          }
        }

        if (newFilters.deviceId !== undefined) {
          if (newFilters.deviceId && newFilters.deviceId > 0) {
            next.set('deviceId', String(newFilters.deviceId));
          } else {
            next.delete('deviceId');
          }
        }

        if (newFilters.page !== undefined) {
          if (newFilters.page > 0) {
            next.set('page', String(newFilters.page));
          } else {
            next.delete('page');
          }
        }

        if (newFilters.size !== undefined) {
          if (newFilters.size !== 20) {
            next.set('size', String(newFilters.size));
          } else {
            next.delete('size');
          }
        }

        if (newFilters.sortBy !== undefined) {
          if (newFilters.sortBy !== 'createdAt') {
            next.set('sortBy', newFilters.sortBy);
          } else {
            next.delete('sortBy');
          }
        }

        if (newFilters.sortDirection !== undefined) {
          if (newFilters.sortDirection !== 'desc') {
            next.set('sortDirection', newFilters.sortDirection);
          } else {
            next.delete('sortDirection');
          }
        }

        return next;
      });
    },
    [setSearchParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateFilters({ page: newPage });
    },
    [updateFilters]
  );

  const handleSizeChange = useCallback(
    (newSize: number) => {
      updateFilters({ size: newSize, page: 0 });
    },
    [updateFilters]
  );

  const handleSortChange = useCallback(
    (newSortBy: RepairOrderQueryParams['sortBy']) => {
      const newDir = sortBy === newSortBy && sortDirection === 'asc' ? 'desc' : 'asc';
      updateFilters({ sortBy: newSortBy, sortDirection: newDir, page: 0 });
    },
    [sortBy, sortDirection, updateFilters]
  );

  const handleSearchChange = useCallback(
    (newQuery: string) => {
      updateFilters({ query: newQuery, page: 0 });
    },
    [updateFilters]
  );

  const handleStatusFilterChange = useCallback(
    (newStatus?: RepairOrderStatus) => {
      updateFilters({ status: newStatus, page: 0 });
    },
    [updateFilters]
  );

  const handlePriorityFilterChange = useCallback(
    (newPriority?: RepairPriority) => {
      updateFilters({ priority: newPriority, page: 0 });
    },
    [updateFilters]
  );

  const handleCustomerFilterChange = useCallback(
    (newCustomerId?: number) => {
      updateFilters({ customerId: newCustomerId, deviceId: undefined, page: 0 });
    },
    [updateFilters]
  );

  const handleDeviceFilterChange = useCallback(
    (newDeviceId?: number) => {
      updateFilters({ deviceId: newDeviceId, page: 0 });
    },
    [updateFilters]
  );

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  return {
    ...queryResult,
    queryParams,
    updateFilters,
    handlePageChange,
    handleSizeChange,
    handleSortChange,
    handleSearchChange,
    handleStatusFilterChange,
    handlePriorityFilterChange,
    handleCustomerFilterChange,
    handleDeviceFilterChange,
    clearFilters,
  };
}
