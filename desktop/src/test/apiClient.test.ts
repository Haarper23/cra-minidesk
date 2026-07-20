import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchApi, apiClient } from '../lib/api/apiClient';
import { ApiError } from '../lib/api/apiError';

describe('apiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should prevent duplicate /api/api path joining', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ success: true, message: 'OK', data: {} })),
    });
    vi.stubGlobal('fetch', fetchSpy);

    await apiClient.get('/api/dashboard');
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8088/api/dashboard',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('should successfully parse valid ApiResponse envelope', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockResponse = {
      success: true,
      message: 'Success',
      data: mockData,
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      })
    );

    const res = await apiClient.get<typeof mockData>('/test');
    expect(res.success).toBe(true);
    expect(res.data).toEqual(mockData);
  });

  it('should handle HTTP 204 No Content without crashing JSON parsing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        text: () => Promise.resolve(''),
      })
    );

    const res = await apiClient.delete('/test/1');
    expect(res.success).toBe(true);
    expect(res.message).toBe('No content');
  });

  it('should throw ApiError with HTTP_ERROR when backend returns success=false on HTTP 200', async () => {
    const mockResponse = {
      success: false,
      message: 'İşlem kurallara aykırı',
      data: null,
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      })
    );

    await expect(apiClient.get('/business-fail')).rejects.toThrowError(ApiError);
    try {
      await apiClient.get('/business-fail');
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      expect(apiErr.category).toBe('HTTP_ERROR');
      expect(apiErr.status).toBe(200);
      expect(apiErr.message).toBe('İşlem kurallara aykırı');
    }
  });

  it('should throw ApiError with HTTP_ERROR on non-2xx response', async () => {
    const errorBody = {
      success: false,
      message: 'Kaynağa erişim izniniz yok',
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: () => Promise.resolve(JSON.stringify(errorBody)),
      })
    );

    await expect(apiClient.get('/forbidden')).rejects.toThrowError(ApiError);
    try {
      await apiClient.get('/forbidden');
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      expect(apiErr.category).toBe('HTTP_ERROR');
      expect(apiErr.status).toBe(403);
      expect(apiErr.message).toBe('Kaynağa erişim izniniz yok');
    }
  });

  it('should throw ApiError with NETWORK on fetch TypeError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(apiClient.get('/network-fail')).rejects.toThrowError(ApiError);
    try {
      await apiClient.get('/network-fail');
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      expect(apiErr.category).toBe('NETWORK');
    }
  });

  it('should throw ApiError with INVALID_RESPONSE on HTML or non-JSON body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve('<html>502 Bad Gateway</html>'),
      })
    );

    await expect(apiClient.get('/invalid-json')).rejects.toThrowError(ApiError);
    try {
      await apiClient.get('/invalid-json');
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      expect(apiErr.category).toBe('INVALID_RESPONSE');
    }
  });

  it('should throw ApiError with INVALID_RESPONSE when response lacks ApiResponse envelope', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ raw: 'data without envelope' })),
      })
    );

    await expect(apiClient.get('/no-envelope')).rejects.toThrowError(ApiError);
    try {
      await apiClient.get('/no-envelope');
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      expect(apiErr.category).toBe('INVALID_RESPONSE');
    }
  });

  it('should handle timeout when request times out', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url, init) => {
        return new Promise((_, reject) => {
          if (init?.signal) {
            init.signal.addEventListener('abort', () => {
              const abortError = new DOMException('The operation was aborted', 'AbortError');
              reject(abortError);
            });
          }
        });
      })
    );

    const promise = fetchApi('/timeout', { timeoutMs: 50 });
    await expect(promise).rejects.toThrowError(ApiError);
    try {
      await promise;
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      expect(apiErr.category).toBe('TIMEOUT');
    }
  });

  it('should distinguish user cancellation from timeout', async () => {
    const userController = new AbortController();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url, init) => {
        return new Promise((_, reject) => {
          if (init?.signal) {
            init.signal.addEventListener('abort', () => {
              reject(new DOMException('User cancelled', 'AbortError'));
            });
          }
        });
      })
    );

    const promise = fetchApi('/user-cancel', { signal: userController.signal, timeoutMs: 5000 });
    userController.abort();

    await expect(promise).rejects.toThrowError('İstek kullanıcı tarafından iptal edildi.');
  });
});
