import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchDevices,
  fetchDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
} from '../features/devices/api/deviceApi';
import { DeviceFormInputSchema } from '../features/devices/schemas/deviceSchema';
import { ApiError } from '../lib/api/apiError';

describe('deviceApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('generates correct query URL with encoded search parameters and defaults', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            success: true,
            message: 'OK',
            data: {
              content: [],
              page: 0,
              size: 20,
              totalElements: 0,
              totalPages: 0,
              first: true,
              last: true,
              hasNext: false,
              hasPrevious: false,
            },
          })
        ),
    });
    vi.stubGlobal('fetch', fetchSpy);

    await fetchDevices({
      query: '  MacBook Pro & Air  ',
      page: 1,
      size: 10,
      sortBy: 'model',
      sortDirection: 'asc',
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8088/api/devices?query=MacBook+Pro+%26+Air&page=1&size=10&sortBy=model&sortDirection=asc',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('uses customer-specific endpoint when customerId parameter is provided', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            success: true,
            message: 'OK',
            data: {
              content: [],
              page: 0,
              size: 20,
              totalElements: 0,
              totalPages: 0,
              first: true,
              last: true,
              hasNext: false,
              hasPrevious: false,
            },
          })
        ),
    });
    vi.stubGlobal('fetch', fetchSpy);

    await fetchDevices({ customerId: 5, deviceType: 'LAPTOP' });

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8088/api/customers/5/devices?customerId=5&deviceType=LAPTOP&page=0&size=20&sortBy=createdAt&sortDirection=desc',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('encodes special characters and Turkish letters in query safely', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            success: true,
            message: 'OK',
            data: {
              content: [],
              page: 0,
              size: 20,
              totalElements: 0,
              totalPages: 0,
              first: true,
              last: true,
              hasNext: false,
              hasPrevious: false,
            },
          })
        ),
    });
    vi.stubGlobal('fetch', fetchSpy);

    await fetchDevices({ query: 'İlker + Şahin %20 _ ğ' });

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8088/api/devices?query=%C4%B0lker+%2B+%C5%9Eahin+%2520+_+%C4%9F&page=0&size=20&sortBy=createdAt&sortDirection=desc',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('omits blank query from search parameters', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            success: true,
            message: 'OK',
            data: {
              content: [],
              page: 0,
              size: 20,
              totalElements: 0,
              totalPages: 0,
              first: true,
              last: true,
              hasNext: false,
              hasPrevious: false,
            },
          })
        ),
    });
    vi.stubGlobal('fetch', fetchSpy);

    await fetchDevices({ query: '   ' });

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8088/api/devices?page=0&size=20&sortBy=createdAt&sortDirection=desc',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('validates successful PageResponse schema for devices', async () => {
    const mockDevice = {
      id: 10,
      customerId: 1,
      customerFullName: 'Ahmet Yılmaz',
      brand: 'Apple',
      model: 'MacBook Air',
      serialNumber: 'MBA-123',
      deviceType: 'LAPTOP',
      color: 'Midnight',
      accessories: 'Charger',
      conditionNotes: 'Good',
      createdAt: '2026-07-20T10:00:00Z',
      updatedAt: '2026-07-20T10:00:00Z',
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              success: true,
              message: 'OK',
              data: {
                content: [mockDevice],
                page: 0,
                size: 20,
                totalElements: 1,
                totalPages: 1,
                first: true,
                last: true,
                hasNext: false,
                hasPrevious: false,
              },
            })
          ),
      })
    );

    const result = await fetchDevices();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].brand).toBe('Apple');
    expect(result.content[0].model).toBe('MacBook Air');
  });

  it('throws ApiError.validation when response fails Zod schema parse', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              success: true,
              message: 'OK',
              data: {
                content: [{ invalidField: 123 }],
                page: 0,
              },
            })
          ),
      })
    );

    await expect(fetchDevices()).rejects.toThrowError(ApiError);
  });

  it('enforces character boundary constraints in DeviceFormInputSchema', () => {
    // Brand 80 vs 81
    expect(
      DeviceFormInputSchema.safeParse({
        customerId: 1,
        brand: 'a'.repeat(80),
        model: 'Model Test',
        deviceType: 'LAPTOP',
      }).success
    ).toBe(true);

    expect(
      DeviceFormInputSchema.safeParse({
        customerId: 1,
        brand: 'a'.repeat(81),
        model: 'Model Test',
        deviceType: 'LAPTOP',
      }).success
    ).toBe(false);

    // Model 120 vs 121
    expect(
      DeviceFormInputSchema.safeParse({
        customerId: 1,
        brand: 'Apple',
        model: 'm'.repeat(120),
        deviceType: 'LAPTOP',
      }).success
    ).toBe(true);

    expect(
      DeviceFormInputSchema.safeParse({
        customerId: 1,
        brand: 'Apple',
        model: 'm'.repeat(121),
        deviceType: 'LAPTOP',
      }).success
    ).toBe(false);

    // Serial 120 vs 121
    expect(
      DeviceFormInputSchema.safeParse({
        customerId: 1,
        brand: 'Apple',
        model: 'MacBook',
        serialNumber: 's'.repeat(120),
        deviceType: 'LAPTOP',
      }).success
    ).toBe(true);

    expect(
      DeviceFormInputSchema.safeParse({
        customerId: 1,
        brand: 'Apple',
        model: 'MacBook',
        serialNumber: 's'.repeat(121),
        deviceType: 'LAPTOP',
      }).success
    ).toBe(false);
  });

  it('executes createDevice correctly with encoded customer ID path', async () => {
    const createdData = {
      id: 10,
      customerId: 2,
      customerFullName: 'Mehmet Demir',
      brand: 'Asus',
      model: 'ZenBook',
      serialNumber: 'SN-999',
      deviceType: 'LAPTOP',
      color: null,
      accessories: null,
      conditionNotes: null,
      createdAt: '2026-07-20T12:00:00Z',
      updatedAt: '2026-07-20T12:00:00Z',
    };

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            success: true,
            message: 'Created',
            data: createdData,
          })
        ),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const res = await createDevice(2, {
      brand: 'Asus',
      model: 'ZenBook',
      serialNumber: 'SN-999',
      deviceType: 'LAPTOP',
    });

    expect(res.id).toBe(10);
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8088/api/customers/2/devices',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          brand: 'Asus',
          model: 'ZenBook',
          serialNumber: 'SN-999',
          deviceType: 'LAPTOP',
          color: null,
          accessories: null,
          conditionNotes: null,
        }),
      })
    );
  });

  it('executes updateDevice correctly', async () => {
    const updatedData = {
      id: 10,
      customerId: 2,
      customerFullName: 'Mehmet Demir',
      brand: 'Asus Updated',
      model: 'ZenBook Pro',
      serialNumber: 'SN-999',
      deviceType: 'LAPTOP',
      color: 'Black',
      accessories: null,
      conditionNotes: null,
      createdAt: '2026-07-20T12:00:00Z',
      updatedAt: '2026-07-20T13:00:00Z',
    };

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            success: true,
            message: 'Updated',
            data: updatedData,
          })
        ),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const res = await updateDevice(10, {
      brand: 'Asus Updated',
      model: 'ZenBook Pro',
      serialNumber: 'SN-999',
      deviceType: 'LAPTOP',
      color: 'Black',
    });

    expect(res.brand).toBe('Asus Updated');
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8088/api/devices/10',
      expect.objectContaining({
        method: 'PUT',
      })
    );
  });

  it('executes deleteDevice on HTTP 204 successfully without JSON parsing', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      text: () => Promise.resolve(''),
    });
    vi.stubGlobal('fetch', fetchSpy);

    await expect(deleteDevice(10)).resolves.toBeUndefined();
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8088/api/devices/10',
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });

  it('handles deleteDevice HTTP 409 Conflict error safely', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        statusText: 'Conflict',
        text: () =>
          Promise.resolve(
            JSON.stringify({
              success: false,
              message: 'Device cannot be deleted because related repair orders exist',
            })
          ),
      })
    );

    await expect(deleteDevice(10)).rejects.toThrowError(ApiError);
  });

  it('handles deleteDevice network failure safely', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(deleteDevice(10)).rejects.toThrowError(ApiError);
  });

  it('forwards AbortSignal to fetch caller', async () => {
    const controller = new AbortController();
    const fetchSpy = vi.fn().mockImplementation((_url, init) => {
      expect(init.signal).toBeDefined();
      expect(init.signal?.aborted).toBe(false);
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              success: true,
              message: 'OK',
              data: {
                id: 5,
                customerId: 1,
                customerFullName: 'Ayşe Kaya',
                brand: 'Dell',
                model: 'OptiPlex',
                serialNumber: null,
                deviceType: 'DESKTOP',
                color: null,
                accessories: null,
                conditionNotes: null,
                createdAt: '2026-07-20T10:00:00Z',
                updatedAt: '2026-07-20T10:00:00Z',
              },
            })
          ),
      });
    });
    vi.stubGlobal('fetch', fetchSpy);

    await fetchDeviceById(5, controller.signal);
  });
});
