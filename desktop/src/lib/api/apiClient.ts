import { env } from '../env';
import { ApiError } from './apiError';
import { ApiResponse } from './apiTypes';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  timeoutMs?: number;
  body?: unknown;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    timeoutMs = 10000,
    body,
    headers: customHeaders,
    signal: userSignal,
    ...fetchInit
  } = options;

  // Clean path to prevent duplicate /api/api
  let cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (cleanPath.startsWith('/api/')) {
    cleanPath = cleanPath.substring(4);
  }
  const fullUrl = `${env.apiBaseUrl}${cleanPath}`;

  // AbortController setup for timeout & composition
  const controller = new AbortController();
  let isUserAborted = false;

  const onUserAbort = () => {
    isUserAborted = true;
    controller.abort();
  };

  if (userSignal) {
    if (userSignal.aborted) {
      isUserAborted = true;
      controller.abort();
    } else {
      userSignal.addEventListener('abort', onUserAbort);
    }
  }

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  let serializedBody: string | undefined;
  if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json';
    serializedBody = JSON.stringify(body);
  }

  try {
    const response = await fetch(fullUrl, {
      ...fetchInit,
      headers,
      body: serializedBody,
      signal: controller.signal,
    });

    // Handle HTTP 204 No Content
    if (response.status === 204) {
      return {
        success: true,
        message: 'No content',
        data: null as unknown as T,
      };
    }

    // Read response text safely
    const responseText = await response.text();
    let parsedJson: unknown;

    if (responseText.trim().length > 0) {
      try {
        parsedJson = JSON.parse(responseText);
      } catch (e) {
        if (!response.ok) {
          throw ApiError.http(
            response.status,
            `HTTP ${response.status}: Server returned non-JSON content`
          );
        }
        throw ApiError.invalidResponse('Sunucudan geçersiz JSON yanıtı alındı.');
      }
    } else if (response.ok) {
      return {
        success: true,
        message: 'Empty response',
        data: null as unknown as T,
      };
    }

    if (!response.ok) {
      const errorObj = parsedJson as { message?: string; success?: boolean } | undefined;
      const backendMessage = errorObj?.message || `HTTP ${response.status} ${response.statusText}`;
      throw ApiError.http(response.status, backendMessage);
    }

    // Validate ApiResponse structure
    if (typeof parsedJson !== 'object' || parsedJson === null || !('success' in parsedJson)) {
      throw ApiError.invalidResponse(
        'Yanıt gereksinim duyulan ApiResponse zarf yapısını içermiyor.'
      );
    }

    const apiResponse = parsedJson as ApiResponse<T>;

    // Handle success = false on HTTP 200 OK explicitly
    if (apiResponse.success === false) {
      throw ApiError.http(
        200,
        apiResponse.message || 'İşlem sunucu tarafından başarısız olarak işaretlendi.'
      );
    }

    return apiResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (isUserAborted) {
      throw new Error('İstek kullanıcı tarafından iptal edildi.');
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw ApiError.timeout(
        `İstek ${timeoutMs}ms içerisinde yanıt vermedi ve zaman aşımına uğradı.`
      );
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw ApiError.network(
        'Backend sunucusuna bağlanılamadı. Lütfen sunucunun ve ağ bağlantınızın aktif olduğunu kontrol edin.'
      );
    }

    throw ApiError.network(
      error instanceof Error ? error.message : 'Bilinmeyen ağ veya yürütme hatası'
    );
  } finally {
    clearTimeout(timeoutId);
    if (userSignal) {
      userSignal.removeEventListener('abort', onUserAbort);
    }
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    fetchApi<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    fetchApi<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    fetchApi<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    fetchApi<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),
};
