import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCustomerSearch } from '../features/devices/hooks/useCustomerSearch';
import { useDeviceSearch } from '../features/repair-orders/hooks/useDeviceSearch';
import * as customerApi from '../features/customers/api/customerApi';
import * as deviceApi from '../features/devices/api/deviceApi';
import { CustomerPage } from '../features/customers/types/customerTypes';
import { DevicePage } from '../features/devices/types/deviceTypes';

vi.mock('../features/customers/api/customerApi');
vi.mock('../features/devices/api/deviceApi');

const emptyCustomerPage: CustomerPage = {
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  hasNext: false,
  hasPrevious: false,
};

const emptyDevicePage: DevicePage = {
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  hasNext: false,
  hasPrevious: false,
};

describe('Selector Hardening Observable Behavior', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(customerApi.fetchCustomers).mockResolvedValue(emptyCustomerPage);
    vi.mocked(deviceApi.fetchDevices).mockResolvedValue(emptyDevicePage);
  });

  describe('Customer Selector Hardening', () => {
    it('requests page=0 and bounded size (between 10 and 25), forwarding AbortSignal and special characters', async () => {
      vi.mocked(customerApi.fetchCustomers).mockResolvedValue({
        content: [
          {
            id: 1,
            fullName: 'Şeref Öztürk',
            email: 'seref@example.com',
            phoneNumber: '05551112233',
            notes: null,
            createdAt: '2026-07-20T10:00:00Z',
            updatedAt: '2026-07-20T10:00:00Z',
          },
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
        hasNext: false,
        hasPrevious: false,
      });

      const { result } = renderHook(() => useCustomerSearch());

      act(() => {
        result.current.setSearchText('Şeref % _ & Öztürk');
      });

      await waitFor(
        () => {
          expect(customerApi.fetchCustomers).toHaveBeenCalledWith(
            expect.objectContaining({
              page: 0,
              size: expect.any(Number),
              query: 'Şeref % _ & Öztürk',
            }),
            expect.any(AbortSignal)
          );
        },
        { timeout: 1000 }
      );

      const lastCallArgs = vi.mocked(customerApi.fetchCustomers).mock.calls.at(-1)?.[0];
      expect(lastCallArgs?.size).toBeGreaterThanOrEqual(10);
      expect(lastCallArgs?.size).toBeLessThanOrEqual(25);
    });

    it('handles search text updates and updates customer state correctly', async () => {
      vi.mocked(customerApi.fetchCustomers).mockResolvedValue({
        content: [
          {
            id: 2,
            fullName: 'Mehmet Demir',
            email: 'mehmet@example.com',
            phoneNumber: null,
            notes: null,
            createdAt: '',
            updatedAt: '',
          },
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
        hasNext: false,
        hasPrevious: false,
      });

      const { result } = renderHook(() => useCustomerSearch());

      act(() => {
        result.current.setSearchText('Mehmet');
      });

      await waitFor(() => {
        expect(result.current.customers[0]?.fullName).toBe('Mehmet Demir');
      });
    });
  });

  describe('Device Selector Hardening', () => {
    it('requests devices with page=0, bounded size, customerId sent exactly, and forwards AbortSignal', async () => {
      vi.mocked(deviceApi.fetchDevices).mockResolvedValue({
        content: [
          {
            id: 10,
            customerId: 5,
            customerFullName: 'Ahmet Yılmaz',
            brand: 'Apple',
            model: 'MacBook Pro',
            serialNumber: 'SN-100',
            deviceType: 'LAPTOP',
            color: null,
            accessories: null,
            conditionNotes: null,
            createdAt: '',
            updatedAt: '',
          },
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
        hasNext: false,
        hasPrevious: false,
      });

      const { result } = renderHook(() => useDeviceSearch(5));

      act(() => {
        result.current.setSearchText('MacBook');
      });

      await waitFor(
        () => {
          expect(deviceApi.fetchDevices).toHaveBeenCalledWith(
            expect.objectContaining({
              customerId: 5,
              page: 0,
              query: 'MacBook',
            }),
            expect.any(AbortSignal)
          );
        },
        { timeout: 1000 }
      );

      const lastCallArgs = vi.mocked(deviceApi.fetchDevices).mock.calls.at(-1)?.[0];
      expect(lastCallArgs?.size).toBeGreaterThanOrEqual(10);
      expect(lastCallArgs?.size).toBeLessThanOrEqual(25);
    });

    it('sends request with customerId exact filter when customerId is provided', async () => {
      renderHook(() => useDeviceSearch(42));

      await waitFor(() => {
        expect(deviceApi.fetchDevices).toHaveBeenCalledWith(
          expect.objectContaining({
            customerId: 42,
            page: 0,
          }),
          expect.any(AbortSignal)
        );
      });
    });
  });
});
