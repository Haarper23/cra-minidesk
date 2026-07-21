import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../lib/api/apiClient';
import {
  fetchRepairOrders,
  fetchRepairOrderById,
  createRepairOrder,
  updateRepairOrder,
  updateRepairOrderStatus,
  deleteRepairOrder,
} from '../features/repair-orders/api/repairOrderApi';
import {
  RepairOrder,
  RepairOrderPageResponse,
} from '../features/repair-orders/types/repairOrderTypes';
import { ApiError } from '../lib/api/apiError';

vi.mock('../lib/api/apiClient');

const mockOrder: RepairOrder = {
  id: 1,
  orderNumber: 'CRA-20260721-ABCD1234',
  deviceId: 10,
  deviceBrand: 'Apple',
  deviceModel: 'MacBook Pro',
  customerId: 2,
  customerFullName: 'Ahmet Yılmaz',
  reportedIssue: 'Ekran kırık ve açılmıyor',
  diagnosisNotes: 'Ekran paneli değişimi gerekiyor',
  technicianNotes: null,
  status: 'RECEIVED',
  priority: 'HIGH',
  estimatedCost: 3500,
  finalCost: null,
  receivedAt: '2026-07-21T10:00:00Z',
  completedAt: null,
  deliveredAt: null,
  createdAt: '2026-07-21T10:00:00Z',
  updatedAt: '2026-07-21T10:00:00Z',
};

const mockPageResponse: RepairOrderPageResponse = {
  content: [mockOrder],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
  hasNext: false,
  hasPrevious: false,
};

describe('repairOrderApi', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchRepairOrders', () => {
    it('fetches repair orders with default parameters', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockPageResponse,
      });

      const result = await fetchRepairOrders();

      expect(apiClient.get).toHaveBeenCalledWith(
        '/repair-orders?page=0&size=20&sortBy=createdAt&sortDirection=desc',
        { signal: undefined }
      );
      expect(result).toEqual(mockPageResponse);
    });

    it('passes search, status, priority, and pagination filters correctly', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockPageResponse,
      });

      await fetchRepairOrders({
        query: 'Apple',
        status: 'IN_REPAIR',
        priority: 'HIGH',
        customerId: 2,
        deviceId: 10,
        page: 1,
        size: 10,
        sortBy: 'orderNumber',
        sortDirection: 'asc',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/repair-orders?query=Apple&status=IN_REPAIR&priority=HIGH&customerId=2&deviceId=10&page=1&size=10&sortBy=orderNumber&sortDirection=asc',
        { signal: undefined }
      );
    });

    it('throws ApiError.validation when response fails Zod schema parse', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        success: true,
        message: 'Success',
        data: { invalid: 'data' },
      });

      await expect(fetchRepairOrders()).rejects.toThrow(ApiError);
    });
  });

  describe('fetchRepairOrderById', () => {
    it('fetches single repair order by ID', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockOrder,
      });

      const result = await fetchRepairOrderById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/repair-orders/1', { signal: undefined });
      expect(result).toEqual(mockOrder);
    });
  });

  describe('createRepairOrder', () => {
    it('sends POST request to /repair-orders and returns created order', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        success: true,
        message: 'Created',
        data: mockOrder,
      });

      const input = {
        deviceId: 10,
        reportedIssue: 'Ekran kırık ve açılmıyor',
        priority: 'HIGH' as const,
        estimatedCost: 3500,
      };

      const result = await createRepairOrder(input);

      expect(apiClient.post).toHaveBeenCalledWith('/repair-orders', input);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('updateRepairOrder', () => {
    it('sends PUT request to /repair-orders/{id} and returns updated order', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({
        success: true,
        message: 'Updated',
        data: mockOrder,
      });

      const input = {
        reportedIssue: 'Güncellenmiş şikayet',
        priority: 'NORMAL' as const,
        diagnosisNotes: 'Yeni teşhis',
      };

      const result = await updateRepairOrder(1, input);

      expect(apiClient.put).toHaveBeenCalledWith('/repair-orders/1', input);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('updateRepairOrderStatus', () => {
    it('sends PATCH request to /repair-orders/{id}/status and returns updated order', async () => {
      const updatedOrder = { ...mockOrder, status: 'DIAGNOSING' as const };
      vi.mocked(apiClient.patch).mockResolvedValue({
        success: true,
        message: 'Status updated',
        data: updatedOrder,
      });

      const result = await updateRepairOrderStatus(1, { status: 'DIAGNOSING' });

      expect(apiClient.patch).toHaveBeenCalledWith('/repair-orders/1/status', {
        status: 'DIAGNOSING',
      });
      expect(result).toEqual(updatedOrder);
    });
  });

  describe('deleteRepairOrder', () => {
    it('sends DELETE request to /repair-orders/{id}', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        success: true,
        message: 'Deleted',
        data: null,
      });

      await deleteRepairOrder(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/repair-orders/1');
    });
  });
});
