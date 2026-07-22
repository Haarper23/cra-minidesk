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
    it('calls createCustomer API exactly once and invalidates customerKeys.all on success', async () => {
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
      expect(customerApi.createCustomer).toHaveBeenCalledWith({
        fullName: 'Test Customer',
        email: 'test@example.com',
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: customerKeys.all });
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

      expect(customerApi.createCustomer).toHaveBeenCalledTimes(1);
      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(result.current.error?.message).toContain('Email already exists');
    });
  });

  describe('useUpdateCustomer', () => {
    it('calls updateCustomer API once and invalidates customer list & detail keys on success', async () => {
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
        input: { fullName: 'Updated Name', email: 'updated@example.com' },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(customerApi.updateCustomer).toHaveBeenCalledTimes(1);
      expect(customerApi.updateCustomer).toHaveBeenCalledWith(15, {
        fullName: 'Updated Name',
        email: 'updated@example.com',
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: customerKeys.all });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: customerKeys.detail(15) });
    });

    it('does not invalidate queries when update rejects', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(customerApi.updateCustomer).mockRejectedValueOnce(
        ApiError.http(400, 'Invalid email')
      );

      const { result } = renderHook(() => useUpdateCustomer(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({ id: 15, input: { fullName: 'Bad', email: 'bad' } });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });

  describe('useDeleteCustomer', () => {
    it('calls deleteCustomer API once, invalidates customerKeys.all, and removes customer detail cache', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const removeSpy = vi.spyOn(queryClient, 'removeQueries');
      vi.mocked(customerApi.deleteCustomer).mockResolvedValueOnce();

      const { result } = renderHook(() => useDeleteCustomer(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(20);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(customerApi.deleteCustomer).toHaveBeenCalledTimes(1);
      expect(customerApi.deleteCustomer).toHaveBeenCalledWith(20);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: customerKeys.all });
      expect(removeSpy).toHaveBeenCalledWith({ queryKey: customerKeys.detail(20) });
    });

    it('does not remove or invalidate query cache when delete customer rejects', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const removeSpy = vi.spyOn(queryClient, 'removeQueries');
      vi.mocked(customerApi.deleteCustomer).mockRejectedValueOnce(
        ApiError.http(409, 'Customer has devices')
      );

      const { result } = renderHook(() => useDeleteCustomer(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(20);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(removeSpy).not.toHaveBeenCalled();
    });
  });

  describe('useCreateDevice', () => {
    it('calls createDevice API once with numeric customerId and invalidates deviceKeys.all on success', async () => {
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

      expect(deviceApi.createDevice).toHaveBeenCalledTimes(1);
      expect(deviceApi.createDevice).toHaveBeenCalledWith(5, {
        brand: 'Dell',
        model: 'XPS 13',
        deviceType: 'LAPTOP',
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: deviceKeys.all });
    });

    it('does not invalidate device queries on create failure', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(deviceApi.createDevice).mockRejectedValueOnce(
        ApiError.http(404, 'Customer not found')
      );

      const { result } = renderHook(() => useCreateDevice(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({
        customerId: 99,
        brand: 'Asus',
        model: 'ROG',
        deviceType: 'LAPTOP',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });

  describe('useUpdateDevice', () => {
    it('calls updateDevice API once and invalidates device list and detail keys on success', async () => {
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
        data: { brand: 'Dell Updated', model: 'XPS 13', deviceType: 'LAPTOP' },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(deviceApi.updateDevice).toHaveBeenCalledTimes(1);
      expect(deviceApi.updateDevice).toHaveBeenCalledWith(50, {
        brand: 'Dell Updated',
        model: 'XPS 13',
        deviceType: 'LAPTOP',
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: deviceKeys.all });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: deviceKeys.detail(50) });
    });
  });

  describe('useDeleteDevice', () => {
    it('calls deleteDevice API once, invalidates deviceKeys.all, and removes detail cache on success', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const removeSpy = vi.spyOn(queryClient, 'removeQueries');
      vi.mocked(deviceApi.deleteDevice).mockResolvedValueOnce();

      const { result } = renderHook(() => useDeleteDevice(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(50);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(deviceApi.deleteDevice).toHaveBeenCalledTimes(1);
      expect(deviceApi.deleteDevice).toHaveBeenCalledWith(50);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: deviceKeys.all });
      expect(removeSpy).toHaveBeenCalledWith({ queryKey: deviceKeys.detail(50) });
    });
  });

  describe('useCreateRepairOrder', () => {
    it('calls createRepairOrder API once and invalidates repairOrderKeys.all on success', async () => {
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

      expect(repairOrderApi.createRepairOrder).toHaveBeenCalledTimes(1);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: repairOrderKeys.all });
    });

    it('does not invalidate queries on create repair order failure', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(repairOrderApi.createRepairOrder).mockRejectedValueOnce(
        ApiError.http(400, 'Device mismatch')
      );

      const { result } = renderHook(() => useCreateRepairOrder(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({
        deviceId: 999,
        reportedIssue: 'Broken screen',
        priority: 'HIGH',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });

  describe('useUpdateRepairOrder', () => {
    it('calls updateRepairOrder API once and invalidates repairOrderKeys.all & detail on success', async () => {
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
        input: { reportedIssue: 'Updated issue', priority: 'URGENT' },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(repairOrderApi.updateRepairOrder).toHaveBeenCalledTimes(1);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: repairOrderKeys.all });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: repairOrderKeys.detail(100) });
    });
  });

  describe('useUpdateRepairOrderStatus', () => {
    it('calls updateRepairOrderStatus API once and invalidates repairOrderKeys.all & detail on success', async () => {
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

      result.current.mutate({ id: 100, input: { status: 'DIAGNOSING' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(repairOrderApi.updateRepairOrderStatus).toHaveBeenCalledTimes(1);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: repairOrderKeys.all });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: repairOrderKeys.detail(100) });
    });

    it('does not invalidate repair order keys when status update rejects due to invalid transition', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(repairOrderApi.updateRepairOrderStatus).mockRejectedValueOnce(
        ApiError.http(400, 'Invalid status transition from DIAGNOSING to DELIVERED')
      );

      const { result } = renderHook(() => useUpdateRepairOrderStatus(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({ id: 100, input: { status: 'DELIVERED' } });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });

  describe('useDeleteRepairOrder', () => {
    it('calls deleteRepairOrder API once, invalidates repairOrderKeys.all, and removes detail query cache on success', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const removeSpy = vi.spyOn(queryClient, 'removeQueries');
      vi.mocked(repairOrderApi.deleteRepairOrder).mockResolvedValueOnce();

      const { result } = renderHook(() => useDeleteRepairOrder(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(100);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(repairOrderApi.deleteRepairOrder).toHaveBeenCalledTimes(1);
      expect(repairOrderApi.deleteRepairOrder).toHaveBeenCalledWith(100);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: repairOrderKeys.all });
      expect(removeSpy).toHaveBeenCalledWith({ queryKey: repairOrderKeys.detail(100) });
    });
  });

  describe('Connection-state semantics', () => {
    it('distinguishes HTTP 400/404/409 application errors from Network disconnects', () => {
      // 400 Bad Request
      const status400 = getBackendStatusFromQuery(false, true, 'HTTP_ERROR');
      expect(status400.state).toBe('RESPONSE_ERROR');
      expect(status400.label).toBe('Backend Yanıt Hatası');

      // 404 Not Found
      const status404 = getBackendStatusFromQuery(false, true, 'HTTP_ERROR');
      expect(status404.state).toBe('RESPONSE_ERROR');

      // 409 Conflict
      const status409 = getBackendStatusFromQuery(false, true, 'HTTP_ERROR');
      expect(status409.state).toBe('RESPONSE_ERROR');

      // Network disconnect
      const statusNet = getBackendStatusFromQuery(false, true, 'NETWORK');
      expect(statusNet.state).toBe('NO_CONNECTION');
      expect(statusNet.label).toBe('Backend Bağlantısı Yok');

      // Timeout
      const statusTimeout = getBackendStatusFromQuery(false, true, 'TIMEOUT');
      expect(statusTimeout.state).toBe('NO_CONNECTION');

      // Connected and Healthy
      const statusOk = getBackendStatusFromQuery(false, false);
      expect(statusOk.state).toBe('CONNECTED');
      expect(statusOk.label).toBe('Backend Bağlı');
    });
  });
});
