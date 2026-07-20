/**
 * Environment configuration for the CRA MiniDesk desktop client.
 */

export interface EnvConfig {
  apiBaseUrl: string;
}

export function parseApiBaseUrl(rawUrl?: string): string {
  const defaultUrl = 'http://localhost:8088/api';
  const urlToParse = rawUrl?.trim() || defaultUrl;

  try {
    const parsed = new URL(urlToParse);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error(
        `Desteklenmeyen protokol: "${parsed.protocol}". Yalnızca http veya https kullanılabilir.`
      );
    }

    if (!parsed.hostname) {
      throw new Error('Geçersiz sunucu adresi.');
    }

    // Strip trailing slashes and remove query params / fragments
    let normalizedPath = parsed.pathname.replace(/\/+$/, '');
    if (!normalizedPath) {
      normalizedPath = '';
    }

    return `${parsed.origin}${normalizedPath}`;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Desteklenmeyen protokol')) {
      throw error;
    }
    throw new Error(
      `Geçersiz VITE_API_BASE_URL çevre değişkeni: "${rawUrl}". Geçerli bir URL olmalıdır (ör. http://localhost:8088/api)`
    );
  }
}

export const env: EnvConfig = {
  apiBaseUrl: parseApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
};
