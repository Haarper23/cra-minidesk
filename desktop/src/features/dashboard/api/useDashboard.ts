import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from './dashboardApi';
import { dashboardKeys } from './dashboardKeys';
import { DashboardSummaryData } from '../types/dashboardTypes';
import { ApiError } from '../../../lib/api/apiError';

export function useDashboard() {
  return useQuery<DashboardSummaryData, ApiError>({
    queryKey: dashboardKeys.summary(),
    queryFn: fetchDashboardSummary,
    staleTime: 30000,
  });
}
