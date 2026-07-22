import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import * as dashboardApi from '../features/dashboard/api/dashboardApi';
import { dashboardKeys } from '../features/dashboard/api/dashboardKeys';
import { DashboardSummaryData } from '../features/dashboard/types/dashboardTypes';
import { ApiError } from '../lib/api/apiError';
import { BackendStatusProvider } from '../app/BackendStatusProvider';
import { TopBar } from '../components/layout/TopBar';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../features/dashboard/api/dashboardApi');

const sampleSummaryFixture: DashboardSummaryData = {
  generatedAt: '2026-07-22T15:00:00Z',
  totals: {
    customers: 12,
    devices: 24,
    repairOrders: 30,
    activeRepairOrders: 10,
    readyForDelivery: 3,
    openedToday: 5,
    deliveredToday: 2,
  },
  statusDistribution: [
    { status: 'RECEIVED', count: 4 },
    { status: 'DIAGNOSING', count: 2 },
    { status: 'WAITING_FOR_CUSTOMER_APPROVAL', count: 1 },
    { status: 'APPROVED', count: 1 },
    { status: 'IN_REPAIR', count: 2 },
    { status: 'WAITING_FOR_PART', count: 0 },
    { status: 'COMPLETED', count: 0 },
    { status: 'READY_FOR_DELIVERY', count: 3 },
    { status: 'DELIVERED', count: 15 },
    { status: 'CANCELLED', count: 2 },
  ],
  recentRepairOrders: [
    {
      id: 101,
      orderNumber: 'CRA-2026-0101',
      customerId: 1,
      customerName: 'Ahmet Yılmaz',
      deviceId: 5,
      deviceLabel: 'Apple MacBook Pro',
      status: 'DIAGNOSING',
      priority: 'URGENT',
      createdAt: '2026-07-22T14:00:00Z',
      updatedAt: '2026-07-22T14:30:00Z',
    },
  ],
  priorityQueue: [
    {
      id: 101,
      orderNumber: 'CRA-2026-0101',
      customerName: 'Ahmet Yılmaz',
      deviceLabel: 'Apple MacBook Pro',
      status: 'DIAGNOSING',
      priority: 'URGENT',
      createdAt: '2026-07-20T10:00:00Z',
      ageInDays: 2,
    },
  ],
  readyForDeliveryQueue: [
    {
      id: 88,
      orderNumber: 'CRA-2026-0088',
      customerName: 'Mehmet Demir',
      deviceLabel: 'Dell XPS 15',
      readySince: '2026-07-19T11:00:00Z',
      waitingDays: 3,
    },
  ],
  recentActivity: [
    {
      id: 501,
      repairOrderId: 101,
      orderNumber: 'CRA-2026-0101',
      eventType: 'STATUS_CHANGED',
      description: 'Durum DIAGNOSING olarak güncellendi',
      createdAt: '2026-07-22T14:30:00Z',
    },
  ],
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

describe('DashboardPage & Key Verification', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('proves dashboardKeys.summary returns correct query key structure', () => {
    expect(dashboardKeys.all).toEqual(['dashboard']);
    expect(dashboardKeys.summary()).toEqual(['dashboard', 'summary']);
  });

  it('renders all six summary cards with exact backend totals', async () => {
    vi.mocked(dashboardApi.fetchDashboardSummary).mockResolvedValue(sampleSummaryFixture);

    renderDashboardWithHeader();

    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument(); // customers
      expect(screen.getByText('24')).toBeInTheDocument(); // devices
      expect(screen.getByText('10')).toBeInTheDocument(); // activeRepairOrders
      expect(screen.getByText('3')).toBeInTheDocument(); // readyForDelivery
      expect(screen.getByText('5')).toBeInTheDocument(); // openedToday
      expect(screen.getByText('2')).toBeInTheDocument(); // deliveredToday
    });

    const statusBadge = screen.getByRole('status');
    expect(statusBadge).toHaveTextContent('Backend Bağlı');
  });

  it('renders recent repair orders section', async () => {
    vi.mocked(dashboardApi.fetchDashboardSummary).mockResolvedValue(sampleSummaryFixture);

    renderDashboardWithHeader();

    await waitFor(() => {
      expect(screen.getAllByText('CRA-2026-0101').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Ahmet Yılmaz').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Apple MacBook Pro').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders priority queue section with age in days', async () => {
    vi.mocked(dashboardApi.fetchDashboardSummary).mockResolvedValue(sampleSummaryFixture);

    renderDashboardWithHeader();

    await waitFor(() => {
      expect(screen.getByText('Öncelikli İşler (Acil & Yüksek)')).toBeInTheDocument();
      expect(screen.getByText('2 gün')).toBeInTheDocument();
    });
  });

  it('renders ready for delivery queue section with waiting days', async () => {
    vi.mocked(dashboardApi.fetchDashboardSummary).mockResolvedValue(sampleSummaryFixture);

    renderDashboardWithHeader();

    await waitFor(() => {
      expect(screen.getByText('Teslim Bekleyen Cihazlar')).toBeInTheDocument();
      expect(screen.getByText('CRA-2026-0088')).toBeInTheDocument();
      expect(screen.getByText('Mehmet Demir')).toBeInTheDocument();
      expect(screen.getByText('3 gün')).toBeInTheDocument();
    });
  });

  it('renders recent activity section', async () => {
    vi.mocked(dashboardApi.fetchDashboardSummary).mockResolvedValue(sampleSummaryFixture);

    renderDashboardWithHeader();

    await waitFor(() => {
      expect(screen.getByText('Son Operasyonel Aktivite')).toBeInTheDocument();
      expect(screen.getByText('Durum DIAGNOSING olarak güncellendi')).toBeInTheDocument();
    });
  });

  it('navigates to repair-orders with selectedId when dashboard row or activity is clicked', async () => {
    vi.mocked(dashboardApi.fetchDashboardSummary).mockResolvedValue(sampleSummaryFixture);

    renderDashboardWithHeader();

    await waitFor(() => {
      expect(screen.getByText('CRA-2026-0088')).toBeInTheDocument();
    });

    const readyRow = screen.getByText('CRA-2026-0088').closest('tr');
    expect(readyRow).not.toBeNull();
    fireEvent.click(readyRow!);

    expect(mockNavigate).toHaveBeenCalledWith('/repair-orders?selectedId=88', {
      state: { selectedId: 88 },
    });
  });

  it('renders empty notice when all totals are zero', async () => {
    const emptyFixture: DashboardSummaryData = {
      ...sampleSummaryFixture,
      totals: {
        customers: 0,
        devices: 0,
        repairOrders: 0,
        activeRepairOrders: 0,
        readyForDelivery: 0,
        openedToday: 0,
        deliveredToday: 0,
      },
      statusDistribution: sampleSummaryFixture.statusDistribution.map((item) => ({
        ...item,
        count: 0,
      })),
      recentRepairOrders: [],
      priorityQueue: [],
      readyForDeliveryQueue: [],
      recentActivity: [],
    };

    vi.mocked(dashboardApi.fetchDashboardSummary).mockResolvedValue(emptyFixture);

    renderDashboardWithHeader();

    await waitFor(() => {
      expect(screen.getByText('Henüz Kayıt Bulunmuyor')).toBeInTheDocument();
    });
  });

  it('handles network error cleanly and updates TopBar status', async () => {
    vi.mocked(dashboardApi.fetchDashboardSummary).mockRejectedValue(
      ApiError.network('Sunucuya erişilemiyor')
    );

    renderDashboardWithHeader();

    await waitFor(() => {
      expect(screen.getByText('Gösterge Paneli Yüklenemedi')).toBeInTheDocument();
    });

    const statusBadge = screen.getByRole('status');
    expect(statusBadge).toHaveTextContent('Backend Bağlantısı Yok');
  });

  it('handles validation error cleanly and updates TopBar status', async () => {
    vi.mocked(dashboardApi.fetchDashboardSummary).mockRejectedValue(
      ApiError.validation('Şema uyumsuzluğu')
    );

    renderDashboardWithHeader();

    await waitFor(() => {
      expect(screen.getByText('Gösterge Paneli Yüklenemedi')).toBeInTheDocument();
    });

    const statusBadge = screen.getByRole('status');
    expect(statusBadge).toHaveTextContent('Backend Yanıt Hatası');
  });

  it('triggers manual refresh when refresh button is clicked', async () => {
    vi.mocked(dashboardApi.fetchDashboardSummary).mockResolvedValue(sampleSummaryFixture);

    renderDashboardWithHeader();

    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', {
      name: /Gösterge paneli verilerini yenile/i,
    });
    fireEvent.click(refreshButton);

    expect(dashboardApi.fetchDashboardSummary).toHaveBeenCalledTimes(2);
  });

  it('opens quick action dialogs when action buttons are clicked', async () => {
    vi.mocked(dashboardApi.fetchDashboardSummary).mockResolvedValue(sampleSummaryFixture);

    renderDashboardWithHeader();

    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    const customerBtn = screen.getByRole('button', { name: /Yeni Müşteri/i });
    fireEvent.click(customerBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
