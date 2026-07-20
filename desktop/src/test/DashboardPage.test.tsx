import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import * as dashboardApi from '../features/dashboard/api/dashboardApi';
import { DashboardData } from '../features/dashboard/types/dashboardTypes';
import { ApiError } from '../lib/api/apiError';
import { BackendStatusProvider } from '../app/BackendStatusProvider';
import { TopBar } from '../components/layout/TopBar';

vi.mock('../features/dashboard/api/dashboardApi');

// Real structural backend payload fixture
const realBackendContractFixture: DashboardData = {
  totalCustomers: 2,
  totalDevices: 1,
  totalRepairOrders: 1,
  activeRepairOrders: 1,
  waitingForCustomerApproval: 0,
  waitingForPart: 0,
  readyForDelivery: 0,
  urgentRepairOrders: 0,
  completedToday: 0,
  deliveredToday: 0,
  repairOrdersByStatus: [
    { status: 'RECEIVED', count: 0 },
    { status: 'DIAGNOSING', count: 0 },
    { status: 'WAITING_FOR_CUSTOMER_APPROVAL', count: 0 },
    { status: 'APPROVED', count: 0 },
    { status: 'IN_REPAIR', count: 1 },
    { status: 'WAITING_FOR_PART', count: 0 },
    { status: 'COMPLETED', count: 0 },
    { status: 'READY_FOR_DELIVERY', count: 0 },
    { status: 'DELIVERED', count: 0 },
    { status: 'CANCELLED', count: 0 },
  ],
  generatedAt: '2026-07-20T16:58:35.957210Z',
};

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

function renderDashboardWithHeader() {
  const queryClient = createTestQueryClient();
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <QueryClientProvider client={queryClient}>
        <BackendStatusProvider>
          <TopBar />
          <DashboardPage />
        </BackendStatusProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('DashboardPage Contract & Connection State', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders real backend contract fixture successfully and updates TopBar status', async () => {
    vi.mocked(dashboardApi.fetchDashboardStatistics).mockResolvedValue(realBackendContractFixture);

    renderDashboardWithHeader();

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // totalCustomers
      expect(screen.getAllByText('1')).toHaveLength(3); // totalDevices, totalRepairOrders, activeRepairOrders
    });

    const statusBadge = screen.getByRole('status');
    expect(statusBadge).toHaveTextContent('Backend Bağlı');
  });

  it('proves contradictory connection state CANNOT render on NETWORK error', async () => {
    vi.mocked(dashboardApi.fetchDashboardStatistics).mockRejectedValue(
      ApiError.network('Backend sunucusuna bağlanılamadı.')
    );

    renderDashboardWithHeader();

    await waitFor(() => {
      expect(screen.getByText('Gösterge Paneli Yüklenemedi')).toBeInTheDocument();
    });

    // TopBar status must NOT say "Backend Bağlı"
    const statusBadge = screen.getByRole('status');
    expect(statusBadge).toHaveTextContent('Backend Bağlantısı Yok');
    expect(statusBadge).not.toHaveTextContent('Backend Bağlı');
  });

  it('proves contradictory connection state CANNOT render on VALIDATION error', async () => {
    vi.mocked(dashboardApi.fetchDashboardStatistics).mockRejectedValue(
      ApiError.validation('Sunucudan alınan veri beklenen formata uymuyor.')
    );

    renderDashboardWithHeader();

    await waitFor(() => {
      expect(screen.getByText('Gösterge Paneli Yüklenemedi')).toBeInTheDocument();
    });

    const statusBadge = screen.getByRole('status');
    expect(statusBadge).toHaveTextContent('Backend Yanıt Hatası');
    expect(statusBadge).not.toHaveTextContent('Backend Bağlı');
  });

  it('renders zero values and empty state notice when counts are 0', async () => {
    const emptyData: DashboardData = {
      ...realBackendContractFixture,
      totalCustomers: 0,
      totalDevices: 0,
      totalRepairOrders: 0,
      activeRepairOrders: 0,
      repairOrdersByStatus: realBackendContractFixture.repairOrdersByStatus.map((item) => ({
        ...item,
        count: 0,
      })),
    };

    vi.mocked(dashboardApi.fetchDashboardStatistics).mockResolvedValue(emptyData);

    renderDashboardWithHeader();

    await waitFor(() => {
      expect(screen.getByText('Henüz Kayıt Bulunmuyor')).toBeInTheDocument();
    });
  });

  it('triggers exactly one refetch when refresh button is clicked', async () => {
    vi.mocked(dashboardApi.fetchDashboardStatistics).mockResolvedValue(realBackendContractFixture);

    renderDashboardWithHeader();

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', {
      name: /Gösterge paneli verilerini yenile/i,
    });
    fireEvent.click(refreshButton);

    expect(dashboardApi.fetchDashboardStatistics).toHaveBeenCalledTimes(2);
  });
});
