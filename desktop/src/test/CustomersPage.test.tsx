import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CustomersPage } from '../features/customers/pages/CustomersPage';
import * as customerApi from '../features/customers/api/customerApi';
import { CustomerPage, Customer } from '../features/customers/types/customerTypes';
import { ApiError } from '../lib/api/apiError';
import { BackendStatusProvider } from '../app/BackendStatusProvider';
import { TopBar } from '../components/layout/TopBar';

vi.mock('../features/customers/api/customerApi');

const mockCustomerList: Customer[] = [
  {
    id: 1,
    fullName: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    phoneNumber: '05551234567',
    notes: 'VIP Müşteri',
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
];

const mockPageResponse: CustomerPage = {
  content: mockCustomerList,
  page: 0,
  size: 20,
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

function renderCustomersPage(initialEntries = ['/customers']) {
  const queryClient = createTestQueryClient();
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <QueryClientProvider client={queryClient}>
        <BackendStatusProvider>
          <TopBar />
          <Routes>
            <Route path="/customers" element={<CustomersPage />} />
          </Routes>
        </BackendStatusProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('CustomersPage Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(customerApi.fetchCustomers).mockImplementation(() => new Promise(() => {}));

    renderCustomersPage();
    expect(screen.getByText('Müşteri verileri yükleniyor...')).toBeInTheDocument();
  });

  it('renders populated customer table and updates TopBar status to connected', async () => {
    vi.mocked(customerApi.fetchCustomers).mockResolvedValue(mockPageResponse);

    renderCustomersPage();

    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
      expect(screen.getByText('Ayşe Kaya')).toBeInTheDocument();
    });

    expect(screen.getByText('ahmet@example.com')).toBeInTheDocument();
    expect(screen.getByText('05551234567')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Backend Bağlı');
  });

  it('normalizes malformed URL search parameters to safe defaults', async () => {
    vi.mocked(customerApi.fetchCustomers).mockResolvedValue(mockPageResponse);

    renderCustomersPage(['/customers?page=-1&sortBy=invalidField&sortDirection=sideways']);

    await waitFor(() => {
      expect(customerApi.fetchCustomers).toHaveBeenCalledWith(
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
    vi.mocked(customerApi.fetchCustomers).mockResolvedValue({
      ...mockPageResponse,
      content: [],
      totalElements: 0,
      totalPages: 0,
    });

    renderCustomersPage();

    await waitFor(() => {
      expect(screen.getByText('Henüz Müşteri Bulunmuyor')).toBeInTheDocument();
    });
  });

  it('renders no search results empty notice when search returns 0 elements', async () => {
    vi.mocked(customerApi.fetchCustomers).mockResolvedValue({
      ...mockPageResponse,
      content: [],
      totalElements: 0,
      totalPages: 0,
    });

    renderCustomersPage(['/customers?query=Bilinmeyen']);

    await waitFor(() => {
      expect(screen.getByText('Arama Sonucu Bulunamadı')).toBeInTheDocument();
      expect(screen.getByText(/"Bilinmeyen" terimine uygun/)).toBeInTheDocument();
    });
  });

  it('handles search debounce and clear search button', async () => {
    vi.mocked(customerApi.fetchCustomers).mockResolvedValue(mockPageResponse);

    renderCustomersPage();

    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('textbox', {
      name: /Müşterilerde ara/i,
    });
    fireEvent.change(searchInput, { target: { value: 'Mehmet' } });

    // Wait for 350ms debounce
    await waitFor(
      () => {
        expect(customerApi.fetchCustomers).toHaveBeenCalledWith(
          expect.objectContaining({ query: 'Mehmet', page: 0 }),
          expect.anything()
        );
      },
      { timeout: 1000 }
    );

    const clearButton = screen.getByRole('button', {
      name: /Aramayı temizle/i,
    });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(searchInput).toHaveValue('');
    });
  });

  it('handles pagination navigation and disables previous/next appropriately', async () => {
    const multiPageResponse: CustomerPage = {
      content: [mockCustomerList[0]],
      page: 0,
      size: 1,
      totalElements: 2,
      totalPages: 2,
      first: true,
      last: false,
      hasNext: true,
      hasPrevious: false,
    };

    vi.mocked(customerApi.fetchCustomers).mockResolvedValue(multiPageResponse);

    renderCustomersPage();

    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });

    const prevButton = screen.getByRole('button', {
      name: /Önceki sayfaya git/i,
    });
    const nextButton = screen.getByRole('button', {
      name: /Sonraki sayfaya git/i,
    });

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(customerApi.fetchCustomers).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 }),
        expect.anything()
      );
    });
  });

  it('handles sorting toggle when clicking header buttons', async () => {
    vi.mocked(customerApi.fetchCustomers).mockResolvedValue(mockPageResponse);

    renderCustomersPage();

    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });

    const nameSortBtn = screen.getByRole('button', {
      name: /Ad Soyad sütununa göre sırala/i,
    });
    fireEvent.click(nameSortBtn);

    await waitFor(() => {
      expect(customerApi.fetchCustomers).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'fullName', sortDirection: 'asc' }),
        expect.anything()
      );
    });
  });

  it('opens create dialog, performs client validation, and submits successfully', async () => {
    vi.mocked(customerApi.fetchCustomers).mockResolvedValue(mockPageResponse);
    vi.mocked(customerApi.createCustomer).mockResolvedValue({
      id: 3,
      fullName: 'Yeni Müşteri',
      email: 'yeni@example.com',
      phoneNumber: '05550000000',
      notes: null,
      createdAt: '2026-07-20T12:00:00Z',
      updatedAt: '2026-07-20T12:00:00Z',
    });

    renderCustomersPage();

    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Yeni Müşteri/i }));

    const dialog = screen.getByRole('dialog', {
      name: /Yeni Müşteri Oluştur/i,
    });
    expect(dialog).toBeInTheDocument();

    // Trigger validation error by submitting empty form
    fireEvent.click(within(dialog).getByRole('button', { name: /Kaydet/i }));
    expect(within(dialog).getByText('Ad Soyad alanı zorunludur')).toBeInTheDocument();

    // Fill valid data
    const fullNameInput = dialog.querySelector('input[name="fullName"]')!;
    const emailInput = dialog.querySelector('input[name="email"]')!;

    fireEvent.change(fullNameInput, { target: { value: 'Yeni Müşteri' } });
    fireEvent.change(emailInput, { target: { value: 'yeni@example.com' } });

    fireEvent.click(within(dialog).getByRole('button', { name: /Kaydet/i }));

    await waitFor(() => {
      expect(customerApi.createCustomer).toHaveBeenCalledWith({
        fullName: 'Yeni Müşteri',
        email: 'yeni@example.com',
        phoneNumber: '',
        notes: '',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Müşteri başarıyla oluşturuldu.')).toBeInTheDocument();
    });
  });

  it('displays backend validation error inside create dialog on HTTP 400', async () => {
    vi.mocked(customerApi.fetchCustomers).mockResolvedValue(mockPageResponse);
    vi.mocked(customerApi.createCustomer).mockRejectedValue(
      ApiError.http(400, "Customer with email 'exist@example.com' already exists")
    );

    renderCustomersPage();

    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Yeni Müşteri/i }));

    const dialog = screen.getByRole('dialog', {
      name: /Yeni Müşteri Oluştur/i,
    });

    const fullNameInput = dialog.querySelector('input[name="fullName"]')!;
    const emailInput = dialog.querySelector('input[name="email"]')!;

    fireEvent.change(fullNameInput, { target: { value: 'Var Olan' } });
    fireEvent.change(emailInput, { target: { value: 'exist@example.com' } });

    fireEvent.click(within(dialog).getByRole('button', { name: /Kaydet/i }));

    await waitFor(() => {
      expect(
        within(dialog).getByText("Customer with email 'exist@example.com' already exists")
      ).toBeInTheDocument();
    });

    // Backend connection state must remain CONNECTED (validation error != network loss)
    expect(screen.getByRole('status')).toHaveTextContent('Backend Bağlı');
  });

  it('opens edit dialog with prefilled values and updates customer', async () => {
    vi.mocked(customerApi.fetchCustomers).mockResolvedValue(mockPageResponse);
    vi.mocked(customerApi.updateCustomer).mockResolvedValue({
      ...mockCustomerList[0],
      fullName: 'Ahmet Yılmaz Güncel',
    });

    renderCustomersPage();

    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });

    const editBtn = screen.getByRole('button', {
      name: /Ahmet Yılmaz müşterisini düzenle/i,
    });
    fireEvent.click(editBtn);

    const dialog = screen.getByRole('dialog', { name: /Müşteriyi Düzenle/i });
    expect(dialog).toBeInTheDocument();

    const fullNameInput = dialog.querySelector('input[name="fullName"]')!;
    expect(fullNameInput).toHaveValue('Ahmet Yılmaz');

    fireEvent.change(fullNameInput, {
      target: { value: 'Ahmet Yılmaz Güncel' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: /Güncelle/i }));

    await waitFor(() => {
      expect(customerApi.updateCustomer).toHaveBeenCalledWith(1, {
        fullName: 'Ahmet Yılmaz Güncel',
        email: 'ahmet@example.com',
        phoneNumber: '05551234567',
        notes: 'VIP Müşteri',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Müşteri başarıyla güncellendi.')).toBeInTheDocument();
    });
  });

  it('opens delete confirmation dialog and deletes customer', async () => {
    vi.mocked(customerApi.fetchCustomers).mockResolvedValue(mockPageResponse);
    vi.mocked(customerApi.deleteCustomer).mockResolvedValue();

    renderCustomersPage();

    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole('button', {
      name: /Ahmet Yılmaz müşterisini sil/i,
    });
    fireEvent.click(deleteBtn);

    const dialog = screen.getByRole('dialog', { name: /Müşteriyi Sil/i });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Ahmet Yılmaz')).toBeInTheDocument();

    const confirmDeleteBtn = within(dialog).getByRole('button', {
      name: /^Müşteriyi Sil$/i,
    });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(customerApi.deleteCustomer).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(screen.getByText('Müşteri başarıyla silindi.')).toBeInTheDocument();
    });
  });

  it('displays delete relationship conflict error inside delete dialog on HTTP 409 and keeps modal open', async () => {
    vi.mocked(customerApi.fetchCustomers).mockResolvedValue(mockPageResponse);
    vi.mocked(customerApi.deleteCustomer).mockRejectedValue(
      ApiError.http(
        409,
        'Customer cannot be deleted because related devices or repair orders exist'
      )
    );

    renderCustomersPage();

    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Ahmet Yılmaz müşterisini sil/i }));
    const dialog = screen.getByRole('dialog', { name: /Müşteriyi Sil/i });
    const confirmDeleteBtn = within(dialog).getByRole('button', {
      name: /^Müşteriyi Sil$/i,
    });

    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(
        within(dialog).getByText(
          'Bu müşteri, bağlı cihazları veya servis kayıtları bulunduğu için silinemiyor.'
        )
      ).toBeInTheDocument();
    });

    // Modal remains open, customer name remains visible
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Ahmet Yılmaz')).toBeInTheDocument();

    // Buttons return from pending state (enabled)
    expect(confirmDeleteBtn).not.toBeDisabled();

    // TopBar status must remain CONNECTED (application conflict error != network loss)
    expect(screen.getByRole('status')).toHaveTextContent('Backend Bağlı');
  });

  it('navigates to previous page if last item on page is deleted', async () => {
    const singleItemPageResponse: CustomerPage = {
      content: [mockCustomerList[0]],
      page: 1,
      size: 1,
      totalElements: 2,
      totalPages: 2,
      first: false,
      last: true,
      hasNext: false,
      hasPrevious: true,
    };

    vi.mocked(customerApi.fetchCustomers).mockResolvedValue(singleItemPageResponse);
    vi.mocked(customerApi.deleteCustomer).mockResolvedValue();

    renderCustomersPage(['/customers?page=1']);

    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Ahmet Yılmaz müşterisini sil/i }));

    const dialog = screen.getByRole('dialog', { name: /Müşteriyi Sil/i });
    fireEvent.click(within(dialog).getByRole('button', { name: /^Müşteriyi Sil$/i }));

    await waitFor(() => {
      expect(customerApi.deleteCustomer).toHaveBeenCalledWith(1);
    });
  });

  it('closes dialog on ESC key press', async () => {
    vi.mocked(customerApi.fetchCustomers).mockResolvedValue(mockPageResponse);

    renderCustomersPage();

    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Yeni Müşteri/i }));
    expect(screen.getByRole('dialog', { name: /Yeni Müşteri Oluştur/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('updates TopBar status to connection error when list query fails with network error', async () => {
    vi.mocked(customerApi.fetchCustomers).mockRejectedValue(
      ApiError.network('Backend sunucusuna bağlanılamadı.')
    );

    renderCustomersPage();

    await waitFor(() => {
      expect(screen.getByText('Müşteriler Yüklenemedi')).toBeInTheDocument();
    });

    const statusBadge = screen.getByRole('status');
    expect(statusBadge).toHaveTextContent('Backend Bağlantısı Yok');
  });
});
