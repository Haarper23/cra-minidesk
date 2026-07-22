import { apiClient } from '../../../lib/api/apiClient';
import { ApiError } from '../../../lib/api/apiError';
import { DashboardSummarySchema } from '../schemas/dashboardSchema';
import { DashboardSummaryData } from '../types/dashboardTypes';

export async function fetchDashboardSummary(): Promise<DashboardSummaryData> {
  const response = await apiClient.get<DashboardSummaryData>('/dashboard/summary');

  if (!response.data) {
    throw ApiError.invalidResponse('Dashboard API payload is empty');
  }

  const result = DashboardSummarySchema.safeParse(response.data);
  if (!result.success) {
    console.error('Dashboard Zod schema validation error:', result.error.format());
    throw ApiError.validation('Sunucudan alınan gösterge paneli verisi beklenen şemaya uymuyor.');
  }

  return result.data;
}
