import { describe, it, expect } from 'vitest';
import { parseApiBaseUrl } from '../lib/env';

describe('env configuration', () => {
  it('should return default URL when rawUrl is undefined or empty', () => {
    expect(parseApiBaseUrl()).toBe('http://localhost:8088/api');
    expect(parseApiBaseUrl('')).toBe('http://localhost:8088/api');
  });

  it('should normalize valid localhost URL', () => {
    expect(parseApiBaseUrl('http://localhost:8088/api')).toBe('http://localhost:8088/api');
    expect(parseApiBaseUrl('http://127.0.0.1:8088/api')).toBe('http://127.0.0.1:8088/api');
  });

  it('should normalize trailing slashes correctly', () => {
    expect(parseApiBaseUrl('http://localhost:8088/api/')).toBe('http://localhost:8088/api');
    expect(parseApiBaseUrl('http://localhost:8088/api///')).toBe('http://localhost:8088/api');
  });

  it('should strip query string and fragment from base URL', () => {
    expect(parseApiBaseUrl('http://localhost:8088/api?debug=true')).toBe(
      'http://localhost:8088/api'
    );
    expect(parseApiBaseUrl('http://localhost:8088/api#section')).toBe('http://localhost:8088/api');
    expect(parseApiBaseUrl('http://localhost:8088/api/?debug=true#section')).toBe(
      'http://localhost:8088/api'
    );
  });

  it('should throw clear error on malformed URL', () => {
    expect(() => parseApiBaseUrl('not-a-valid-url')).toThrowError(/Geçersiz VITE_API_BASE_URL/);
  });

  it('should throw clear error on unsupported protocol', () => {
    expect(() => parseApiBaseUrl('ftp://localhost:8088/api')).toThrowError(
      /Desteklenmeyen protokol/
    );
  });
});
