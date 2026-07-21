import { apiClient } from '../../../lib/api/apiClient';
import { ApiError } from '../../../lib/api/apiError';
import {
  RepairOrder,
  RepairOrderQueryParams,
  RepairOrderPageResponse,
  CreateRepairOrderInput,
  UpdateRepairOrderInput,
  UpdateRepairOrderStatusInput,
} from '../types/repairOrderTypes';
import { RepairOrderPageResponseSchema, RepairOrderSchema } from '../schemas/repairOrderSchema';

export async function fetchRepairOrders(
  params: RepairOrderQueryParams = {},
  signal?: AbortSignal
): Promise<RepairOrderPageResponse> {
  const searchParams = new URLSearchParams();

  if (params.query?.trim()) searchParams.append('query', params.query.trim());
  if (params.status) searchParams.append('status', params.status);
  if (params.priority) searchParams.append('priority', params.priority);
  if (params.customerId && params.customerId > 0)
    searchParams.append('customerId', String(params.customerId));
  if (params.deviceId && params.deviceId > 0)
    searchParams.append('deviceId', String(params.deviceId));

  searchParams.append('page', String(params.page ?? 0));
  searchParams.append('size', String(params.size ?? 20));
  searchParams.append('sortBy', params.sortBy ?? 'createdAt');
  searchParams.append('sortDirection', params.sortDirection ?? 'desc');

  const queryString = searchParams.toString();
  const endpoint = `/repair-orders${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<RepairOrderPageResponse>(endpoint, { signal });

  const parsed = RepairOrderPageResponseSchema.safeParse(response.data);
  if (!parsed.success) {
    console.error('RepairOrderPage Zod validation error:', parsed.error.format());
    throw ApiError.validation(
      'Sunucudan alınan servis kaydı listesi verisi geçersiz format içeriyor.'
    );
  }

  return parsed.data;
}

export async function fetchRepairOrderById(id: number, signal?: AbortSignal): Promise<RepairOrder> {
  const response = await apiClient.get<RepairOrder>(`/repair-orders/${id}`, { signal });

  const parsed = RepairOrderSchema.safeParse(response.data);
  if (!parsed.success) {
    console.error('RepairOrder Zod validation error:', parsed.error.format());
    throw ApiError.validation(
      'Sunucudan alınan servis kaydı detay verisi geçersiz format içeriyor.'
    );
  }

  return parsed.data;
}

export async function createRepairOrder(input: CreateRepairOrderInput): Promise<RepairOrder> {
  const response = await apiClient.post<RepairOrder>('/repair-orders', input);

  const parsed = RepairOrderSchema.safeParse(response.data);
  if (!parsed.success) {
    console.error('Create RepairOrder Zod validation error:', parsed.error.format());
    throw ApiError.validation('Sunucudan dönen yeni servis kaydı verisi geçersiz format içeriyor.');
  }

  return parsed.data;
}

export async function updateRepairOrder(
  id: number,
  input: UpdateRepairOrderInput
): Promise<RepairOrder> {
  const response = await apiClient.put<RepairOrder>(`/repair-orders/${id}`, input);

  const parsed = RepairOrderSchema.safeParse(response.data);
  if (!parsed.success) {
    console.error('Update RepairOrder Zod validation error:', parsed.error.format());
    throw ApiError.validation(
      'Sunucudan dönen güncellenmiş servis kaydı verisi geçersiz format içeriyor.'
    );
  }

  return parsed.data;
}

export async function updateRepairOrderStatus(
  id: number,
  input: UpdateRepairOrderStatusInput
): Promise<RepairOrder> {
  const response = await apiClient.patch<RepairOrder>(`/repair-orders/${id}/status`, input);

  const parsed = RepairOrderSchema.safeParse(response.data);
  if (!parsed.success) {
    console.error('Update RepairOrder status Zod validation error:', parsed.error.format());
    throw ApiError.validation(
      'Sunucudan dönen güncellenmiş servis kaydı durumu geçersiz format içeriyor.'
    );
  }

  return parsed.data;
}

export async function deleteRepairOrder(id: number): Promise<void> {
  await apiClient.delete<void>(`/repair-orders/${id}`);
}
