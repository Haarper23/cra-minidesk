import { apiClient } from '../../../lib/api/apiClient';
import { ApiError } from '../../../lib/api/apiError';
import { DashboardResponseSchema } from '../schemas/dashboardSchema';
import { DashboardData } from '../types/dashboardTypes';

export async function fetchDashboardStatistics(): Promise<DashboardData> {
  const response = await apiClient.get<DashboardData>('/dashboard');

  if (!response.data) {
    throw ApiError.invalidResponse('Dashboard API payload is empty');
  }

  const result = DashboardResponseSchema.safeParse(response.data);
  if (!result.success) {
    console.error('Dashboard Zod schema validation error:', result.error.format());
    throw ApiError.validation('Sunucudan alınan gösterge paneli verisi beklenen şemaya uymuyor.');
  }

  return result.data;
}
