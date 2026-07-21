import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { DevicesPage } from '../features/devices/pages/DevicesPage';
import * as deviceApi from '../features/devices/api/deviceApi';
import * as customerApi from '../features/customers/api/customerApi';
import { DevicePage, Device } from '../features/devices/types/deviceTypes';
import { CustomerPage } from '../features/customers/types/customerTypes';
import { ApiError } from '../lib/api/apiError';
import { BackendStatusProvider } from '../app/BackendStatusProvider';
import { TopBar } from '../components/layout/TopBar';

vi.mock('../features/devices/api/deviceApi');
vi.mock('../features/customers/api/customerApi');

const mockDeviceList: Device[] = [
  {
    id: 1,
    customerId: 1,
    customerFullName: 'Ahmet Yılmaz',
    brand: 'Apple',
    model: 'MacBook Pro',
    serialNumber: 'MBP-123',
    deviceType: 'LAPTOP',
    color: 'Uzay Grisi',
    accessories: 'Şarj Aleti',
    conditionNotes: 'Ekran temiz',
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-07-20T10:00:00Z',
  },
  {
    id: 2,
    customerId: 2,
    customerFullName: 'Ayşe Kaya',
    brand: 'Dell',
    model: 'OptiPlex 7090',
    serialNumber: null,
    deviceType: 'DESKTOP',
    color: null,
    accessories: null,
    conditionNotes: null,
    createdAt: '2026-07-20T11:00:00Z',
    updatedAt: '2026-07-20T11:00:00Z',
  },
];

const mockDevicePageResponse: DevicePage = {
  content: mockDeviceList,
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
      id: 1,
      fullName: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      phoneNumber: '05551234567',
      notes: null,
      createdAt: '2026-07-20T10:00:00Z',
      updatedAt: '2026-07-20T10:00:00Z',
    },
    {
      id: 2,
      fullName: 'Ayşe Kaya',
      email: 'ayse@example.com',
      phoneNumber: '05449876543',
      notes: null,
      createdAt: '2026-07-20T11:00:00Z',
      updatedAt: '2026-07-20T11:00:00Z',
    },
  ],
  page: 0,
  size: 100,
  totalElements: 2,
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

function renderDevicesPage(initialEntries = ['/devices']) {
  const queryClient = createTestQueryClient();
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <QueryClientProvider client={queryClient}>
        <BackendStatusProvider>
          <TopBar />
          <Routes>
            <Route path="/devices" element={<DevicesPage />} />
          </Routes>
        </BackendStatusProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('DevicesPage Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(customerApi.fetchCustomers).mockResolvedValue(mockCustomerPageResponse);
  });

  it('renders loading state initially', () => {
    vi.mocked(deviceApi.fetchDevices).mockImplementation(() => new Promise(() => {}));

    renderDevicesPage();
    expect(screen.getByText('Cihaz verileri yükleniyor...')).toBeInTheDocument();
  });

  it('renders populated device table and updates TopBar status to connected', async () => {
    vi.mocked(deviceApi.fetchDevices).mockResolvedValue(mockDevicePageResponse);

    renderDevicesPage();

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('MacBook Pro')).toBeInTheDocument();
      expect(screen.getByText('Dell')).toBeInTheDocument();
      expect(screen.getByText('OptiPlex 7090')).toBeInTheDocument();
    });

    expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    expect(screen.getByText('Ayşe Kaya')).toBeInTheDocument();
    expect(screen.getByText('MBP-123')).toBeInTheDocument();
    expect(screen.getAllByText('Dizüstü').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Masaüstü').length).toBeGreaterThan(0);
    expect(screen.getByRole('status')).toHaveTextContent('Backend Bağlı');
  });

  it('normalizes malformed URL search parameters to safe defaults', async () => {
    vi.mocked(deviceApi.fetchDevices).mockResolvedValue(mockDevicePageResponse);

    renderDevicesPage(['/devices?page=-1&sortBy=invalidField&sortDirection=sideways']);

    await waitFor(() => {
      expect(deviceApi.fetchDevices).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 0,
          sortBy: 'createdAt',
          sortDirection: 'desc',
        }),
        expect.anything()
      );
    });
  });

  it('renders empty database notice when totalElements is 0 without search', async () => {
    vi.mocked(deviceApi.fetchDevices).mockResolvedValue({
      ...mockDevicePageResponse,
      content: [],
      totalElements: 0,
      totalPages: 0,
    });

    renderDevicesPage();

    await waitFor(() => {
      expect(screen.getByText('Henüz Cihaz Bulunmuyor')).toBeInTheDocument();
    });
  });

  it('renders no search results empty notice when search returns 0 elements', async () => {
    vi.mocked(deviceApi.fetchDevices).mockResolvedValue({
      ...mockDevicePageResponse,
      content: [],
      totalElements: 0,
      totalPages: 0,
    });

    renderDevicesPage(['/devices?query=BilinmeyenCihaz']);

    await waitFor(() => {
      expect(screen.getByText('Arama Sonucu Bulunamadı')).toBeInTheDocument();
    });
  });

  it('handles search debounce and clear search button', async () => {
    vi.mocked(deviceApi.fetchDevices).mockResolvedValue(mockDevicePageResponse);

    renderDevicesPage();

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('textbox', { name: /Cihazlarda ara/i });
    fireEvent.change(searchInput, { target: { value: 'MacBook' } });

    await waitFor(
      () => {
        expect(deviceApi.fetchDevices).toHaveBeenCalledWith(
          expect.objectContaining({ query: 'MacBook', page: 0 }),
          expect.anything()
        );
      },
      { timeout: 1000 }
    );

    const clearButton = screen.getByRole('button', { name: /Aramayı temizle/i });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(searchInput).toHaveValue('');
    });
  });

  it('handles deviceType filter selection', async () => {
    vi.mocked(deviceApi.fetchDevices).mockResolvedValue(mockDevicePageResponse);

    renderDevicesPage();

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    const filterSelect = screen.getByRole('combobox', { name: /Cihaz türü filtresi/i });
    fireEvent.change(filterSelect, { target: { value: 'LAPTOP' } });

    await waitFor(() => {
      expect(deviceApi.fetchDevices).toHaveBeenCalledWith(
        expect.objectContaining({ deviceType: 'LAPTOP', page: 0 }),
        expect.anything()
      );
    });
  });

  it('handles sorting toggle when clicking header buttons', async () => {
    vi.mocked(deviceApi.fetchDevices).mockResolvedValue(mockDevicePageResponse);

    renderDevicesPage();

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    const brandSortBtn = screen.getByRole('button', { name: /Marka sütununa göre sırala/i });
    fireEvent.click(brandSortBtn);

    await waitFor(() => {
      expect(deviceApi.fetchDevices).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'brand', sortDirection: 'asc' }),
        expect.anything()
      );
    });
  });

  it('opens create dialog, loads customer options, performs validation, and submits successfully', async () => {
    vi.mocked(deviceApi.fetchDevices).mockResolvedValue(mockDevicePageResponse);
    vi.mocked(deviceApi.createDevice).mockResolvedValue({
      id: 3,
      customerId: 1,
      customerFullName: 'Ahmet Yılmaz',
      brand: 'Lenovo',
      model: 'ThinkPad',
      serialNumber: 'TP-999',
      deviceType: 'LAPTOP',
      color: 'Black',
      accessories: null,
      conditionNotes: null,
      createdAt: '2026-07-20T12:00:00Z',
      updatedAt: '2026-07-20T12:00:00Z',
    });

    renderDevicesPage();

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Yeni Cihaz/i }));

    const dialog = screen.getByRole('dialog', { name: /Yeni Cihaz Kaydı/i });
    expect(dialog).toBeInTheDocument();

    // Fill valid form fields
    const customerInput = screen.getByRole('combobox', { name: /Müşteri ara/i });
    fireEvent.focus(customerInput);
    await waitFor(() => {
      expect(within(dialog).getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });
    fireEvent.mouseDown(within(dialog).getByText('Ahmet Yılmaz'));

    const brandInput = dialog.querySelector('input[name="brand"]')!;
    const modelInput = dialog.querySelector('input[name="model"]')!;

    fireEvent.change(brandInput, { target: { value: 'Lenovo' } });
    fireEvent.change(modelInput, { target: { value: 'ThinkPad' } });

    fireEvent.click(within(dialog).getByRole('button', { name: /Kaydet/i }));

    await waitFor(() => {
      expect(deviceApi.createDevice).toHaveBeenCalledWith(1, {
        brand: 'Lenovo',
        model: 'ThinkPad',
        serialNumber: '',
        deviceType: 'LAPTOP',
        color: '',
        accessories: '',
        conditionNotes: '',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Cihaz başarıyla oluşturuldu.')).toBeInTheDocument();
    });
  });

  it('displays backend validation error inside create dialog on HTTP 400', async () => {
    vi.mocked(deviceApi.fetchDevices).mockResolvedValue(mockDevicePageResponse);
    vi.mocked(deviceApi.createDevice).mockRejectedValue(
      ApiError.http(400, "Device with serial number 'EXISTING-SN' already exists")
    );

    renderDevicesPage();

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Yeni Cihaz/i }));

    const dialog = screen.getByRole('dialog', { name: /Yeni Cihaz Kaydı/i });

    const customerInput = screen.getByRole('combobox', { name: /Müşteri ara/i });
    fireEvent.focus(customerInput);
    await waitFor(() => {
      expect(within(dialog).getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });
    fireEvent.mouseDown(within(dialog).getByText('Ahmet Yılmaz'));

    const brandInput = dialog.querySelector('input[name="brand"]')!;
    const modelInput = dialog.querySelector('input[name="model"]')!;

    fireEvent.change(brandInput, { target: { value: 'Apple' } });
    fireEvent.change(modelInput, { target: { value: 'MacBook' } });

    fireEvent.click(within(dialog).getByRole('button', { name: /Kaydet/i }));

    await waitFor(() => {
      expect(
        within(dialog).getByText("Device with serial number 'EXISTING-SN' already exists")
      ).toBeInTheDocument();
    });

    // TopBar status must remain CONNECTED (application error != network loss)
    expect(screen.getByRole('status')).toHaveTextContent('Backend Bağlı');
  });

  it('opens edit dialog with prefilled values and updates device', async () => {
    vi.mocked(deviceApi.fetchDevices).mockResolvedValue(mockDevicePageResponse);
    vi.mocked(deviceApi.updateDevice).mockResolvedValue({
      ...mockDeviceList[0],
      model: 'MacBook Pro M3',
    });

    renderDevicesPage();

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    const editBtn = screen.getByRole('button', { name: /Apple MacBook Pro cihazını düzenle/i });
    fireEvent.click(editBtn);

    const dialog = screen.getByRole('dialog', { name: /Cihazı Düzenle/i });
    expect(dialog).toBeInTheDocument();

    const modelInput = dialog.querySelector('input[name="model"]')!;
    expect(modelInput).toHaveValue('MacBook Pro');

    fireEvent.change(modelInput, { target: { value: 'MacBook Pro M3' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Güncelle/i }));

    await waitFor(() => {
      expect(deviceApi.updateDevice).toHaveBeenCalledWith(1, {
        brand: 'Apple',
        model: 'MacBook Pro M3',
        serialNumber: 'MBP-123',
        deviceType: 'LAPTOP',
        color: 'Uzay Grisi',
        accessories: 'Şarj Aleti',
        conditionNotes: 'Ekran temiz',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Cihaz başarıyla güncellendi.')).toBeInTheDocument();
    });
  });

  it('opens delete confirmation dialog and deletes unreferenced device', async () => {
    vi.mocked(deviceApi.fetchDevices).mockResolvedValue(mockDevicePageResponse);
    vi.mocked(deviceApi.deleteDevice).mockResolvedValue();

    renderDevicesPage();

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole('button', { name: /Apple MacBook Pro cihazını sil/i });
    fireEvent.click(deleteBtn);

    const dialog = screen.getByRole('dialog', { name: /Cihazı Sil/i });
    expect(dialog).toBeInTheDocument();

    const confirmDeleteBtn = within(dialog).getByRole('button', { name: /^Cihazı Sil$/i });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(deviceApi.deleteDevice).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(screen.getByText('Cihaz başarıyla silindi.')).toBeInTheDocument();
    });
  });

  it('displays delete relationship conflict error inside delete dialog on HTTP 409 and keeps modal open', async () => {
    vi.mocked(deviceApi.fetchDevices).mockResolvedValue(mockDevicePageResponse);
    vi.mocked(deviceApi.deleteDevice).mockRejectedValue(
      ApiError.http(409, 'Device cannot be deleted because related repair orders exist')
    );

    renderDevicesPage();

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Apple MacBook Pro cihazını sil/i }));
    const dialog = screen.getByRole('dialog', { name: /Cihazı Sil/i });
    const confirmDeleteBtn = within(dialog).getByRole('button', { name: /^Cihazı Sil$/i });

    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(
        within(dialog).getByText('Bu cihaz, bağlı servis kayıtları bulunduğu için silinemiyor.')
      ).toBeInTheDocument();
    });

    // Modal remains open
    expect(dialog).toBeInTheDocument();
    expect(confirmDeleteBtn).not.toBeDisabled();

    // TopBar status must remain CONNECTED (application conflict error != network loss)
    expect(screen.getByRole('status')).toHaveTextContent('Backend Bağlı');
  });

  it('closes dialog on ESC key press', async () => {
    vi.mocked(deviceApi.fetchDevices).mockResolvedValue(mockDevicePageResponse);

    renderDevicesPage();

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Yeni Cihaz/i }));
    expect(screen.getByRole('dialog', { name: /Yeni Cihaz Kaydı/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('updates TopBar status to connection error when list query fails with network error', async () => {
    vi.mocked(deviceApi.fetchDevices).mockRejectedValue(
      ApiError.network('Backend sunucusuna bağlanılamadı.')
    );

    renderDevicesPage();

    await waitFor(() => {
      expect(screen.getByText('Cihazlar Yüklenemedi')).toBeInTheDocument();
    });

    const statusBadge = screen.getByRole('status');
    expect(statusBadge).toHaveTextContent('Backend Bağlantısı Yok');
  });
});
