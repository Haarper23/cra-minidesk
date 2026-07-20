import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStatistics } from './dashboardApi';
import { DashboardData } from '../types/dashboardTypes';
import { ApiError } from '../../../lib/api/apiError';

export function useDashboard() {
  return useQuery<DashboardData, ApiError>({
    queryKey: ['dashboard', 'statistics'],
    queryFn: fetchDashboardStatistics,
    staleTime: 1000 * 30, // 30 seconds
  });
}
