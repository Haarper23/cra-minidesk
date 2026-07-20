import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchCustomers,
  fetchCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../features/customers/api/customerApi';
import { CustomerFormInputSchema } from '../features/customers/schemas/customerSchema';
import { ApiError } from '../lib/api/apiError';

describe('customerApi', () => {
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

    await fetchCustomers({
      query: '  Ahmet & Yılmaz  ',
      page: 2,
      size: 10,
      sortBy: 'fullName',
      sortDirection: 'asc',
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8088/api/customers?query=Ahmet+%26+Y%C4%B1lmaz&page=2&size=10&sortBy=fullName&sortDirection=asc',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('encodes special characters and Turkish letters in search query safely', async () => {
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

    await fetchCustomers({ query: 'İlker + Şahin %20 _ ğ' });

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8088/api/customers?query=%C4%B0lker+%2B+%C5%9Eahin+%2520+_+%C4%9F&page=0&size=20&sortBy=createdAt&sortDirection=desc',
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

    await fetchCustomers({ query: '   ' });

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8088/api/customers?page=0&size=20&sortBy=createdAt&sortDirection=desc',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('validates successful PageResponse schema with null phoneNumber and notes', async () => {
    const mockCustomer = {
      id: 1,
      fullName: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      phoneNumber: null,
      notes: null,
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
                content: [mockCustomer],
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

    const result = await fetchCustomers();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].phoneNumber).toBeNull();
    expect(result.content[0].notes).toBeNull();
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

    await expect(fetchCustomers()).rejects.toThrowError(ApiError);
  });

  it('enforces character boundary constraints in CustomerFormInputSchema', () => {
    // 120 vs 121 name
    expect(
      CustomerFormInputSchema.safeParse({
        fullName: 'a'.repeat(120),
        email: 'test@example.com',
      }).success
    ).toBe(true);
    expect(
      CustomerFormInputSchema.safeParse({
        fullName: 'a'.repeat(121),
        email: 'test@example.com',
      }).success
    ).toBe(false);

    // 160 vs 161 email
    const validLongEmail = 'a'.repeat(148) + '@example.com'; // 160 chars
    expect(
      CustomerFormInputSchema.safeParse({
        fullName: 'Test',
        email: validLongEmail,
      }).success
    ).toBe(true);

    const invalidLongEmail = 'a'.repeat(149) + '@example.com'; // 161 chars
    expect(
      CustomerFormInputSchema.safeParse({
        fullName: 'Test',
        email: invalidLongEmail,
      }).success
    ).toBe(false);

    // 40 vs 41 phone boundary
    expect(
      CustomerFormInputSchema.safeParse({
        fullName: 'Test',
        email: 'test@example.com',
        phoneNumber: '1'.repeat(40),
      }).success
    ).toBe(true);
    expect(
      CustomerFormInputSchema.safeParse({
        fullName: 'Test',
        email: 'test@example.com',
        phoneNumber: '1'.repeat(41),
      }).success
    ).toBe(false);

    // 1000 vs 1001 notes boundary
    expect(
      CustomerFormInputSchema.safeParse({
        fullName: 'Test',
        email: 'test@example.com',
        notes: 'n'.repeat(1000),
      }).success
    ).toBe(true);
    expect(
      CustomerFormInputSchema.safeParse({
        fullName: 'Test',
        email: 'test@example.com',
        notes: 'n'.repeat(1001),
      }).success
    ).toBe(false);
  });

  it('executes createCustomer correctly', async () => {
    const createdData = {
      id: 10,
      fullName: 'Mehmet Demir',
      email: 'mehmet@example.com',
      phoneNumber: '05441112233',
      notes: null,
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

    const res = await createCustomer({
      fullName: 'Mehmet Demir',
      email: 'mehmet@example.com',
      phoneNumber: '05441112233',
    });

    expect(res.id).toBe(10);
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8088/api/customers',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          fullName: 'Mehmet Demir',
          email: 'mehmet@example.com',
          phoneNumber: '05441112233',
          notes: null,
        }),
      })
    );
  });

  it('executes updateCustomer correctly', async () => {
    const updatedData = {
      id: 10,
      fullName: 'Mehmet Güncellendi',
      email: 'mehmet@example.com',
      phoneNumber: null,
      notes: null,
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

    const res = await updateCustomer(10, {
      fullName: 'Mehmet Güncellendi',
      email: 'mehmet@example.com',
    });

    expect(res.fullName).toBe('Mehmet Güncellendi');
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8088/api/customers/10',
      expect.objectContaining({
        method: 'PUT',
      })
    );
  });

  it('executes deleteCustomer on HTTP 204 successfully without JSON parsing', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      text: () => Promise.resolve(''),
    });
    vi.stubGlobal('fetch', fetchSpy);

    await expect(deleteCustomer(10)).resolves.toBeUndefined();
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8088/api/customers/10',
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });

  it('handles deleteCustomer HTTP 404 or 500 error safely', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () =>
          Promise.resolve(
            JSON.stringify({
              success: false,
              message: 'Customer with ID 10 not found',
            })
          ),
      })
    );

    await expect(deleteCustomer(10)).rejects.toThrowError(ApiError);
  });

  it('handles deleteCustomer network failure safely', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(deleteCustomer(10)).rejects.toThrowError(ApiError);
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
                fullName: 'Ayşe Kaya',
                email: 'ayse@example.com',
                phoneNumber: null,
                notes: null,
                createdAt: '2026-07-20T10:00:00Z',
                updatedAt: '2026-07-20T10:00:00Z',
              },
            })
          ),
      });
    });
    vi.stubGlobal('fetch', fetchSpy);

    await fetchCustomerById(5, controller.signal);
  });
});
