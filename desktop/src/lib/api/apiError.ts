export type ApiErrorCategory =
  'NETWORK' | 'TIMEOUT' | 'HTTP_ERROR' | 'INVALID_RESPONSE' | 'VALIDATION_ERROR';

export class ApiError extends Error {
  public readonly category: ApiErrorCategory;
  public readonly status?: number;
  public readonly userMessage: string;

  constructor(message: string, category: ApiErrorCategory, status?: number, userMessage?: string) {
    super(message);
    this.name = 'ApiError';
    this.category = category;
    this.status = status;
    this.userMessage = userMessage || this.getDefaultUserMessage(category, status);

    // Maintain proper prototype chain for instance checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  private getDefaultUserMessage(category: ApiErrorCategory, status?: number): string {
    switch (category) {
      case 'NETWORK':
        return 'Backend sunucusuna bağlanılamadı. Lütfen sunucunun ve ağ bağlantınızın aktif olduğunu kontrol edin.';
      case 'TIMEOUT':
        return 'İstek zaman aşımına uğradı. Sunucu yanıt vermedi.';
      case 'INVALID_RESPONSE':
        return 'Sunucudan geçersiz veya hatalı biçimlendirilmiş bir yanıt alındı.';
      case 'VALIDATION_ERROR':
        return 'Sunucudan alınan veri beklenen formata uymuyor.';
      case 'HTTP_ERROR':
        if (status === 404) return 'İstenen kaynak veya servis bulunamadı.';
        if (status === 403 || status === 401) return 'Bu işlem için yetkiniz bulunmamaktadır.';
        if (status && status >= 500)
          return 'Sunucu tarafında bir hata oluştu (500). Lütfen tekrar deneyin.';
        return `İstek işlenirken bir hata oluştu (HTTP ${status || 'Bilinmiyor'}).`;
      default:
        return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
    }
  }

  public static network(message = 'Network error during request'): ApiError {
    return new ApiError(message, 'NETWORK');
  }

  public static timeout(message = 'Request timed out'): ApiError {
    return new ApiError(message, 'TIMEOUT');
  }

  public static http(status: number, message: string, userMessage?: string): ApiError {
    return new ApiError(message, 'HTTP_ERROR', status, userMessage);
  }

  public static invalidResponse(message: string): ApiError {
    return new ApiError(message, 'INVALID_RESPONSE');
  }

  public static validation(message: string): ApiError {
    return new ApiError(message, 'VALIDATION_ERROR');
  }
}
