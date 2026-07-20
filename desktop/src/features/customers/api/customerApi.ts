import { apiClient } from '../../../lib/api/apiClient';
import { ApiError } from '../../../lib/api/apiError';
import { CustomerResponseSchema, CustomerPageResponseSchema } from '../schemas/customerSchema';
import {
  Customer,
  CustomerPage,
  CustomerFormInput,
  CustomerListQueryParams,
} from '../types/customerTypes';

export async function fetchCustomers(
  params: CustomerListQueryParams = {},
  signal?: AbortSignal
): Promise<CustomerPage> {
  const urlParams = new URLSearchParams();

  if (params.query && params.query.trim().length > 0) {
    urlParams.set('query', params.query.trim());
  }

  urlParams.set('page', String(params.page ?? 0));
  urlParams.set('size', String(params.size ?? 20));
  urlParams.set('sortBy', params.sortBy ?? 'createdAt');
  urlParams.set('sortDirection', params.sortDirection ?? 'desc');

  const endpoint = `/customers?${urlParams.toString()}`;
  const response = await apiClient.get<CustomerPage>(endpoint, { signal });

  if (!response.data) {
    throw ApiError.invalidResponse('Müşteri listesi verisi boş döndü');
  }

  const result = CustomerPageResponseSchema.safeParse(response.data);
  if (!result.success) {
    console.error('CustomerPage Zod validation error:', result.error.format());
    throw ApiError.validation('Sunucudan alınan müşteri listesi verisi beklenen şemaya uymuyor.');
  }

  return result.data;
}

export async function fetchCustomerById(id: number, signal?: AbortSignal): Promise<Customer> {
  const response = await apiClient.get<Customer>(`/customers/${id}`, { signal });

  if (!response.data) {
    throw ApiError.invalidResponse('Müşteri detay verisi boş döndü');
  }

  const result = CustomerResponseSchema.safeParse(response.data);
  if (!result.success) {
    console.error('CustomerResponse Zod validation error:', result.error.format());
    throw ApiError.validation('Sunucudan alınan müşteri detayı beklenen şemaya uymuyor.');
  }

  return result.data;
}

export async function createCustomer(input: CustomerFormInput): Promise<Customer> {
  const payload = {
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    phoneNumber: input.phoneNumber?.trim() || null,
    notes: input.notes?.trim() || null,
  };

  const response = await apiClient.post<Customer>('/customers', payload);

  if (!response.data) {
    throw ApiError.invalidResponse('Oluşturulan müşteri yanıt payload verisi boş');
  }

  const result = CustomerResponseSchema.safeParse(response.data);
  if (!result.success) {
    throw ApiError.validation('Oluşturulan müşteri verisi beklenen şemaya uymuyor.');
  }

  return result.data;
}

export async function updateCustomer(id: number, input: CustomerFormInput): Promise<Customer> {
  const payload = {
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    phoneNumber: input.phoneNumber?.trim() || null,
    notes: input.notes?.trim() || null,
  };

  const response = await apiClient.put<Customer>(`/customers/${id}`, payload);

  if (!response.data) {
    throw ApiError.invalidResponse('Güncellenen müşteri yanıt payload verisi boş');
  }

  const result = CustomerResponseSchema.safeParse(response.data);
  if (!result.success) {
    throw ApiError.validation('Güncellenen müşteri verisi beklenen şemaya uymuyor.');
  }

  return result.data;
}

export async function deleteCustomer(id: number): Promise<void> {
  await apiClient.delete<void>(`/customers/${id}`);
}
