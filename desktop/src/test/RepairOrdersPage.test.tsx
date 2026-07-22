import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RepairOrdersPage } from '../features/repair-orders/pages/RepairOrdersPage';
import * as repairOrderApi from '../features/repair-orders/api/repairOrderApi';
import * as customerApi from '../features/customers/api/customerApi';
import * as deviceApi from '../features/devices/api/deviceApi';
import { BackendStatusProvider } from '../app/BackendStatusProvider';
import { TopBar } from '../components/layout/TopBar';
import {
  RepairOrder,
  RepairOrderPageResponse,
} from '../features/repair-orders/types/repairOrderTypes';
import { CustomerPage } from '../features/customers/types/customerTypes';
import { DevicePage } from '../features/devices/types/deviceTypes';
import { ApiError } from '../lib/api/apiError';

vi.mock('../features/repair-orders/api/repairOrderApi');
vi.mock('../features/customers/api/customerApi');
vi.mock('../features/devices/api/deviceApi');

const mockOrder1: RepairOrder = {
  id: 1,
  orderNumber: 'CRA-20260721-0001',
  deviceId: 10,
  deviceBrand: 'Apple',
  deviceModel: 'MacBook Pro',
  customerId: 2,
  customerFullName: 'Ahmet Yılmaz',
  reportedIssue: 'Ekran kırık ve açılmıyor',
  diagnosisNotes: 'Ekran değişimi gerekiyor',
  technicianNotes: null,
  status: 'RECEIVED',
  priority: 'HIGH',
  estimatedCost: 3500,
  finalCost: null,
  receivedAt: '2026-07-21T10:00:00Z',
  completedAt: null,
  deliveredAt: null,
  createdAt: '2026-07-21T10:00:00Z',
  updatedAt: '2026-07-21T10:00:00Z',
};

const mockOrder2: RepairOrder = {
  id: 2,
  orderNumber: 'CRA-20260721-0002',
  deviceId: 20,
  deviceBrand: 'Dell',
  deviceModel: 'XPS 15',
  customerId: 3,
  customerFullName: 'Ayşe Kaya',
  reportedIssue: 'Batarya dolmuyor',
  diagnosisNotes: 'Batarya yıpranmış',
  technicianNotes: 'Batarya değiştirildi',
  status: 'COMPLETED',
  priority: 'NORMAL',
  estimatedCost: 1200,
  finalCost: 1200,
  receivedAt: '2026-07-20T09:00:00Z',
  completedAt: '2026-07-21T11:00:00Z',
  deliveredAt: null,
  createdAt: '2026-07-20T09:00:00Z',
  updatedAt: '2026-07-21T11:00:00Z',
};

const mockRepairOrderPageResponse: RepairOrderPageResponse = {
  content: [mockOrder1, mockOrder2],
  page: 0,
  size: 20,
  totalElements: 2,
  totalPages: 1,
  first: true,
  last: true,
  hasNext: false,
  hasPrevious: false,
};

const mockCustomerPageResponse: CustomerPage = {
  content: [
    {
      id: 2,
      fullName: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      phoneNumber: '05551234567',
      notes: null,
      createdAt: '2026-07-20T10:00:00Z',
      updatedAt: '2026-07-20T10:00:00Z',
    },
  ],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
  hasNext: false,
  hasPrevious: false,
};

const mockDevicePageResponse: DevicePage = {
  content: [
    {
      id: 10,
      customerId: 2,
      customerFullName: 'Ahmet Yılmaz',
      brand: 'Apple',
      model: 'MacBook Pro',
      serialNumber: 'SN-123',
      deviceType: 'LAPTOP',
      color: 'Gray',
      accessories: null,
      conditionNotes: null,
      createdAt: '2026-07-20T10:00:00Z',
      updatedAt: '2026-07-20T10:00:00Z',
    },
  ],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
  hasNext: false,
  hasPrevious: false,
};

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function renderRepairOrdersPage(initialEntries = ['/repair-orders']) {
  const queryClient = createTestQueryClient();
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <QueryClientProvider client={queryClient}>
        <BackendStatusProvider>
          <TopBar />
          <Routes>
            <Route path="/repair-orders" element={<RepairOrdersPage />} />
          </Routes>
        </BackendStatusProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('RepairOrdersPage Integration', () => {
  beforeEach(() => {
    vi.mocked(repairOrderApi.fetchRepairOrders).mockReset();
    vi.mocked(customerApi.fetchCustomers).mockReset();
    vi.mocked(deviceApi.fetchDevices).mockReset();

    vi.mocked(repairOrderApi.fetchRepairOrders).mockResolvedValue(mockRepairOrderPageResponse);
    vi.mocked(customerApi.fetchCustomers).mockResolvedValue(mockCustomerPageResponse);
    vi.mocked(deviceApi.fetchDevices).mockResolvedValue(mockDevicePageResponse);
  });

  it('renders loading state initially', () => {
    vi.mocked(repairOrderApi.fetchRepairOrders).mockImplementation(() => new Promise(() => {}));
    renderRepairOrdersPage();

    expect(screen.getByText('Servis kayıtları yükleniyor...')).toBeInTheDocument();
  });

  it('renders repair orders list with columns and status badges on success', async () => {
    vi.mocked(repairOrderApi.fetchRepairOrders).mockResolvedValue(mockRepairOrderPageResponse);
    renderRepairOrdersPage();

    expect(await screen.findByText('CRA-20260721-0001')).toBeInTheDocument();
    expect(screen.getByText('CRA-20260721-0002')).toBeInTheDocument();
    expect(screen.getAllByText('Ahmet Yılmaz').length).toBeGreaterThan(0);
    expect(screen.getByText('Ayşe Kaya')).toBeInTheDocument();
    expect(screen.getAllByText('Teslim Alındı').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Tamamlandı').length).toBeGreaterThan(0);
  });

  it('renders empty state when no repair orders exist', async () => {
    vi.mocked(repairOrderApi.fetchRepairOrders).mockResolvedValue({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      hasNext: false,
      hasPrevious: false,
    });

    renderRepairOrdersPage();

    await waitFor(() => {
      expect(screen.getByText('Henüz servis kaydı yok')).toBeInTheDocument();
    });
  });

  it('renders error state on API failure', async () => {
    vi.mocked(repairOrderApi.fetchRepairOrders).mockRejectedValue(
      ApiError.http(500, 'Internal Server Error')
    );

    renderRepairOrdersPage();

    await waitFor(() => {
      expect(screen.getByText('Servis kayıtları yüklenemedi')).toBeInTheDocument();
    });
  });

  it('opens details dialog when view button is clicked', async () => {
    vi.mocked(repairOrderApi.fetchRepairOrders).mockResolvedValue(mockRepairOrderPageResponse);
    renderRepairOrdersPage();

    await waitFor(() => {
      expect(screen.getByText('CRA-20260721-0001')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByRole('button', { name: /detaylarını görüntüle/i });
    fireEvent.click(viewButtons[0]);

    const detailsDialog = await screen.findByRole('dialog', { name: /Servis Kaydı Detayları/i });
    expect(detailsDialog).toBeInTheDocument();
    expect(within(detailsDialog).getByText('Ekran kırık ve açılmıyor')).toBeInTheDocument();
  });

  it('opens status change dialog and submits status update', async () => {
    vi.mocked(repairOrderApi.fetchRepairOrders).mockResolvedValue(mockRepairOrderPageResponse);
    vi.mocked(repairOrderApi.updateRepairOrderStatus).mockResolvedValue({
      ...mockOrder1,
      status: 'DIAGNOSING',
    });

    renderRepairOrdersPage();

    await waitFor(() => {
      expect(screen.getByText('CRA-20260721-0001')).toBeInTheDocument();
    });

    const statusButtons = screen.getAllByRole('button', { name: /durumunu değiştir/i });
    fireEvent.click(statusButtons[0]);

    const statusDialog = screen.getByRole('dialog', { name: /Servis Kaydı Durumu Güncelle/i });
    expect(statusDialog).toBeInTheDocument();

    const select = within(statusDialog).getByRole('combobox', { name: /Yeni Durum Seçin/i });
    fireEvent.change(select, { target: { value: 'DIAGNOSING' } });

    fireEvent.click(within(statusDialog).getByRole('button', { name: /Güncelle/i }));

    await waitFor(() => {
      expect(repairOrderApi.updateRepairOrderStatus).toHaveBeenCalledWith(1, {
        status: 'DIAGNOSING',
      });
      expect(screen.getByText('Servis kaydı durumu başarıyla güncellendi.')).toBeInTheDocument();
    });
  });

  it('opens delete dialog and prevents deleting order in COMPLETED status', async () => {
    vi.mocked(repairOrderApi.fetchRepairOrders).mockResolvedValue(mockRepairOrderPageResponse);

    renderRepairOrdersPage();

    await waitFor(() => {
      expect(screen.getByText('CRA-20260721-0002')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /kaydını sil/i });
    // Click delete on mockOrder2 (status: COMPLETED)
    fireEvent.click(deleteButtons[1]);

    const deleteDialog = screen.getByRole('dialog', { name: /Servis Kaydını Sil/i });
    expect(deleteDialog).toBeInTheDocument();

    expect(deleteDialog.textContent).toContain('durumundaki servis kayıtları silinebilir');

    const confirmDeleteBtn = within(deleteDialog).getByRole('button', { name: /^Sil$/i });
    expect(confirmDeleteBtn).toBeDisabled();
  });

  it('allows deleting order in RECEIVED status and submits delete call', async () => {
    vi.mocked(repairOrderApi.fetchRepairOrders).mockResolvedValue(mockRepairOrderPageResponse);
    vi.mocked(repairOrderApi.deleteRepairOrder).mockResolvedValue(undefined);

    renderRepairOrdersPage();

    await waitFor(() => {
      expect(screen.getByText('CRA-20260721-0001')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /kaydını sil/i });
    // Click delete on mockOrder1 (status: RECEIVED)
    fireEvent.click(deleteButtons[0]);

    const deleteDialog = screen.getByRole('dialog', { name: /Servis Kaydını Sil/i });
    expect(deleteDialog).toBeInTheDocument();

    const confirmDeleteBtn = within(deleteDialog).getByRole('button', { name: /^Sil$/i });
    expect(confirmDeleteBtn).not.toBeDisabled();

    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(repairOrderApi.deleteRepairOrder).toHaveBeenCalledWith(1);
      expect(screen.getByText('Servis kaydı başarıyla silindi.')).toBeInTheDocument();
    });
  });

  it('automatically opens details dialog when selectedId is passed in search params', async () => {
    vi.mocked(repairOrderApi.fetchRepairOrders).mockResolvedValue(mockRepairOrderPageResponse);

    renderRepairOrdersPage(['/repair-orders?selectedId=1']);

    await waitFor(() => {
      expect(screen.getByText(/Servis Kaydı Detayları/i)).toBeInTheDocument();
      expect(screen.getAllByText('CRA-20260721-0001').length).toBeGreaterThan(0);
    });
  });
});
