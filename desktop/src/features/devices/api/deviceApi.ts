import { apiClient } from '../../../lib/api/apiClient';
import { ApiError } from '../../../lib/api/apiError';
import { Device, DevicePage, DeviceQueryParams, DeviceFormInput } from '../types/deviceTypes';
import { DeviceSchema, DevicePageSchema } from '../schemas/deviceSchema';

export async function fetchDevices(
  params: DeviceQueryParams = {},
  signal?: AbortSignal
): Promise<DevicePage> {
  const searchParams = new URLSearchParams();

  if (params.query && params.query.trim()) {
    searchParams.set('query', params.query.trim());
  }

  if (params.customerId && params.customerId > 0) {
    searchParams.set('customerId', params.customerId.toString());
  }

  if (params.deviceType) {
    searchParams.set('deviceType', params.deviceType);
  }

  searchParams.set('page', (params.page ?? 0).toString());
  searchParams.set('size', (params.size ?? 20).toString());
  searchParams.set('sortBy', params.sortBy || 'createdAt');
  searchParams.set('sortDirection', params.sortDirection || 'desc');

  const url = params.customerId
    ? `/api/customers/${params.customerId}/devices?${searchParams.toString()}`
    : `/api/devices?${searchParams.toString()}`;

  const response = await apiClient.get<DevicePage>(url, { signal });

  const parseResult = DevicePageSchema.safeParse(response.data);
  if (!parseResult.success) {
    console.error('DevicePage Zod validation error:', parseResult.error.format());
    throw ApiError.validation('Sunucudan alınan cihaz listesi verisi beklenen şemaya uymuyor.');
  }

  return parseResult.data;
}

export async function fetchDeviceById(id: number, signal?: AbortSignal): Promise<Device> {
  const response = await apiClient.get<Device>(`/api/devices/${id}`, { signal });

  const parseResult = DeviceSchema.safeParse(response.data);
  if (!parseResult.success) {
    console.error('Device Zod validation error:', parseResult.error.format());
    throw ApiError.validation('Sunucudan alınan cihaz detay verisi beklenen şemaya uymuyor.');
  }

  return parseResult.data;
}

export async function createDevice(
  customerId: number,
  input: Omit<DeviceFormInput, 'customerId'>
): Promise<Device> {
  const payload = {
    brand: input.brand.trim(),
    model: input.model.trim(),
    serialNumber: input.serialNumber?.trim() || null,
    deviceType: input.deviceType,
    color: input.color?.trim() || null,
    accessories: input.accessories?.trim() || null,
    conditionNotes: input.conditionNotes?.trim() || null,
  };

  const response = await apiClient.post<Device>(`/api/customers/${customerId}/devices`, payload);

  const parseResult = DeviceSchema.safeParse(response.data);
  if (!parseResult.success) {
    console.error('Create Device Zod validation error:', parseResult.error.format());
    throw ApiError.validation('Oluşturulan cihaz verisi yanıt şemasına uymuyor.');
  }

  return parseResult.data;
}

export async function updateDevice(
  id: number,
  input: Omit<DeviceFormInput, 'customerId'>
): Promise<Device> {
  const payload = {
    brand: input.brand.trim(),
    model: input.model.trim(),
    serialNumber: input.serialNumber?.trim() || null,
    deviceType: input.deviceType,
    color: input.color?.trim() || null,
    accessories: input.accessories?.trim() || null,
    conditionNotes: input.conditionNotes?.trim() || null,
  };

  const response = await apiClient.put<Device>(`/api/devices/${id}`, payload);

  const parseResult = DeviceSchema.safeParse(response.data);
  if (!parseResult.success) {
    console.error('Update Device Zod validation error:', parseResult.error.format());
    throw ApiError.validation('Güncellenen cihaz verisi yanıt şemasına uymuyor.');
  }

  return parseResult.data;
}

export async function deleteDevice(id: number): Promise<void> {
  await apiClient.delete<void>(`/api/devices/${id}`);
}
