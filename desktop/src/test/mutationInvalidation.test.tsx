import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { useCreateCustomer } from '../features/customers/hooks/useCreateCustomer';
import { useUpdateCustomer } from '../features/customers/hooks/useUpdateCustomer';
import { useDeleteCustomer } from '../features/customers/hooks/useDeleteCustomer';
import { useCreateDevice } from '../features/devices/hooks/useCreateDevice';
import { useUpdateDevice } from '../features/devices/hooks/useUpdateDevice';
import { useDeleteDevice } from '../features/devices/hooks/useDeleteDevice';
import { useCreateRepairOrder } from '../features/repair-orders/hooks/useCreateRepairOrder';
import { useUpdateRepairOrder } from '../features/repair-orders/hooks/useUpdateRepairOrder';
import { useUpdateRepairOrderStatus } from '../features/repair-orders/hooks/useUpdateRepairOrderStatus';
import { useDeleteRepairOrder } from '../features/repair-orders/hooks/useDeleteRepairOrder';

import * as customerApi from '../features/customers/api/customerApi';
import * as deviceApi from '../features/devices/api/deviceApi';
import * as repairOrderApi from '../features/repair-orders/api/repairOrderApi';

import { customerKeys } from '../features/customers/api/customerKeys';
import { deviceKeys } from '../features/devices/api/deviceKeys';
import { repairOrderKeys } from '../features/repair-orders/api/repairOrderKeys';
import { dashboardKeys } from '../features/dashboard/api/dashboardKeys';
import { ApiError } from '../lib/api/apiError';
import { getBackendStatusFromQuery } from '../lib/api/backendStatus';

vi.mock('../features/customers/api/customerApi');
vi.mock('../features/devices/api/deviceApi');
vi.mock('../features/repair-orders/api/repairOrderApi');

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('Mutation Invalidation & API Behavior Hardening', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.resetAllMocks();
    queryClient = createTestQueryClient();
  });

  describe('useCreateCustomer', () => {
    it('calls createCustomer API exactly once and invalidates customerKeys.all & dashboardKeys.all on success', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(customerApi.createCustomer).mockResolvedValueOnce({
        id: 10,
        fullName: 'Test Customer',
        email: 'test@example.com',
        phoneNumber: null,
        notes: null,
        createdAt: '2026-07-22T10:00:00Z',
        updatedAt: '2026-07-22T10:00:00Z',
      });

      const { result } = renderHook(() => useCreateCustomer(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({ fullName: 'Test Customer', email: 'test@example.com' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(customerApi.createCustomer).toHaveBeenCalledTimes(1);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: customerKeys.all });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: dashboardKeys.all });
    });

    it('propagates error and does not invalidate queries on API rejection', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(customerApi.createCustomer).mockRejectedValueOnce(
        ApiError.http(409, 'Email already exists')
      );

      const { result } = renderHook(() => useCreateCustomer(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({ fullName: 'Test', email: 'dup@example.com' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(result.current.error?.message).toContain('Email already exists');
    });
  });

  describe('useUpdateCustomer', () => {
    it('calls updateCustomer API once and invalidates customer & dashboard keys on success', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(customerApi.updateCustomer).mockResolvedValueOnce({
        id: 15,
        fullName: 'Updated Name',
        email: 'updated@example.com',
        phoneNumber: null,
        notes: null,
        createdAt: '2026-07-22T10:00:00Z',
        updatedAt: '2026-07-22T10:00:00Z',
      });

      const { result } = renderHook(() => useUpdateCustomer(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({
        id: 15,
        data: { fullName: 'Updated Name', email: 'updated@example.com' },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: customerKeys.all });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: customerKeys.detail(15) });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: dashboardKeys.all });
    });

    it('does not invalidate queries when update rejects', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(customerApi.updateCustomer).mockRejectedValueOnce(
        ApiError.http(400, 'Invalid email')
      );

      const { result } = renderHook(() => useUpdateCustomer(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({ id: 15, data: { fullName: 'Bad', email: 'bad' } });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });

  describe('useDeleteCustomer', () => {
    it('calls deleteCustomer API once, invalidates customer & dashboard keys on success', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const removeSpy = vi.spyOn(queryClient, 'removeQueries');
      vi.mocked(customerApi.deleteCustomer).mockResolvedValueOnce();

      const { result } = renderHook(() => useDeleteCustomer(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(20);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: customerKeys.all });
      expect(removeSpy).toHaveBeenCalledWith({ queryKey: customerKeys.detail(20) });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: dashboardKeys.all });
    });
  });

  describe('useCreateDevice', () => {
    it('calls createDevice API once and invalidates device & dashboard keys on success', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(deviceApi.createDevice).mockResolvedValueOnce({
        id: 50,
        customerId: 5,
        customerFullName: 'Owner Name',
        brand: 'Dell',
        model: 'XPS 13',
        serialNumber: 'SN123',
        deviceType: 'LAPTOP',
        color: null,
        accessories: null,
        conditionNotes: null,
        createdAt: '2026-07-22T10:00:00Z',
        updatedAt: '2026-07-22T10:00:00Z',
      });

      const { result } = renderHook(() => useCreateDevice(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({
        customerId: 5,
        brand: 'Dell',
        model: 'XPS 13',
        deviceType: 'LAPTOP',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: deviceKeys.all });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: dashboardKeys.all });
    });
  });

  describe('useUpdateDevice', () => {
    it('calls updateDevice API once and invalidates device & dashboard keys on success', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(deviceApi.updateDevice).mockResolvedValueOnce({
        id: 50,
        customerId: 5,
        customerFullName: 'Owner Name',
        brand: 'Dell Updated',
        model: 'XPS 13',
        serialNumber: 'SN123',
        deviceType: 'LAPTOP',
        color: null,
        accessories: null,
        conditionNotes: null,
        createdAt: '2026-07-22T10:00:00Z',
        updatedAt: '2026-07-22T10:00:00Z',
      });

      const { result } = renderHook(() => useUpdateDevice(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({
        id: 50,
        data: { customerId: 5, brand: 'Dell Updated', model: 'XPS 13', deviceType: 'LAPTOP' },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: deviceKeys.all });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: deviceKeys.detail(50) });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: dashboardKeys.all });
    });
  });

  describe('useDeleteDevice', () => {
    it('calls deleteDevice API once, invalidates device & dashboard keys on success', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const removeSpy = vi.spyOn(queryClient, 'removeQueries');
      vi.mocked(deviceApi.deleteDevice).mockResolvedValueOnce();

      const { result } = renderHook(() => useDeleteDevice(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(50);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: deviceKeys.all });
      expect(removeSpy).toHaveBeenCalledWith({ queryKey: deviceKeys.detail(50) });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: dashboardKeys.all });
    });
  });

  describe('useCreateRepairOrder', () => {
    it('calls createRepairOrder API once and invalidates repairOrder & dashboard keys on success', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(repairOrderApi.createRepairOrder).mockResolvedValueOnce({
        id: 100,
        orderNumber: 'CRA-20260722-001',
        deviceId: 50,
        deviceBrand: 'Dell',
        deviceModel: 'XPS 13',
        customerId: 5,
        customerFullName: 'Owner Name',
        reportedIssue: 'Broken screen',
        diagnosisNotes: null,
        technicianNotes: null,
        status: 'RECEIVED',
        priority: 'HIGH',
        estimatedCost: 150,
        finalCost: null,
        receivedAt: '2026-07-22T10:00:00Z',
        completedAt: null,
        deliveredAt: null,
        createdAt: '2026-07-22T10:00:00Z',
        updatedAt: '2026-07-22T10:00:00Z',
      });

      const { result } = renderHook(() => useCreateRepairOrder(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({
        deviceId: 50,
        reportedIssue: 'Broken screen',
        priority: 'HIGH',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: repairOrderKeys.all });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: dashboardKeys.all });
    });
  });

  describe('useUpdateRepairOrder', () => {
    it('calls updateRepairOrder API once and invalidates repairOrder & dashboard keys on success', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(repairOrderApi.updateRepairOrder).mockResolvedValueOnce({
        id: 100,
        orderNumber: 'CRA-20260722-001',
        deviceId: 50,
        deviceBrand: 'Dell',
        deviceModel: 'XPS 13',
        customerId: 5,
        customerFullName: 'Owner Name',
        reportedIssue: 'Updated issue',
        diagnosisNotes: null,
        technicianNotes: null,
        status: 'RECEIVED',
        priority: 'URGENT',
        estimatedCost: 200,
        finalCost: null,
        receivedAt: '2026-07-22T10:00:00Z',
        completedAt: null,
        deliveredAt: null,
        createdAt: '2026-07-22T10:00:00Z',
        updatedAt: '2026-07-22T10:00:00Z',
      });

      const { result } = renderHook(() => useUpdateRepairOrder(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({
        id: 100,
        data: { reportedIssue: 'Updated issue', priority: 'URGENT' },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: repairOrderKeys.all });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: repairOrderKeys.detail(100) });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: dashboardKeys.all });
    });
  });

  describe('useUpdateRepairOrderStatus', () => {
    it('calls updateRepairOrderStatus API once and invalidates repairOrder & dashboard keys on success', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(repairOrderApi.updateRepairOrderStatus).mockResolvedValueOnce({
        id: 100,
        orderNumber: 'CRA-20260722-001',
        deviceId: 50,
        deviceBrand: 'Dell',
        deviceModel: 'XPS 13',
        customerId: 5,
        customerFullName: 'Owner Name',
        reportedIssue: 'Issue',
        diagnosisNotes: null,
        technicianNotes: null,
        status: 'DIAGNOSING',
        priority: 'HIGH',
        estimatedCost: 150,
        finalCost: null,
        receivedAt: '2026-07-22T10:00:00Z',
        completedAt: null,
        deliveredAt: null,
        createdAt: '2026-07-22T10:00:00Z',
        updatedAt: '2026-07-22T10:00:00Z',
      });

      const { result } = renderHook(() => useUpdateRepairOrderStatus(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({ id: 100, data: { status: 'DIAGNOSING' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: repairOrderKeys.all });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: repairOrderKeys.detail(100) });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: dashboardKeys.all });
    });
  });

  describe('useDeleteRepairOrder', () => {
    it('calls deleteRepairOrder API once, invalidates repairOrder & dashboard keys on success', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const removeSpy = vi.spyOn(queryClient, 'removeQueries');
      vi.mocked(repairOrderApi.deleteRepairOrder).mockResolvedValueOnce();

      const { result } = renderHook(() => useDeleteRepairOrder(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(100);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: repairOrderKeys.all });
      expect(removeSpy).toHaveBeenCalledWith({ queryKey: repairOrderKeys.detail(100) });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: dashboardKeys.all });
    });
  });

  describe('Connection-state semantics', () => {
    it('distinguishes HTTP 400/404/409 application errors from Network disconnects', () => {
      const status400 = getBackendStatusFromQuery(false, true, 'HTTP_ERROR');
      expect(status400.state).toBe('RESPONSE_ERROR');
      expect(status400.label).toBe('Backend Yanıt Hatası');

      const statusNet = getBackendStatusFromQuery(false, true, 'NETWORK');
      expect(statusNet.state).toBe('NO_CONNECTION');
      expect(statusNet.label).toBe('Backend Bağlantısı Yok');

      const statusOk = getBackendStatusFromQuery(false, false);
      expect(statusOk.state).toBe('CONNECTED');
      expect(statusOk.label).toBe('Backend Bağlı');
    });
  });
});
