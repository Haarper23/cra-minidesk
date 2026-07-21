import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from '../components/layout/AppLayout';
import { CustomersPage } from '../features/customers/pages/CustomersPage';
import { DevicesPage } from '../features/devices/pages/DevicesPage';
import { RepairOrdersPage } from '../features/repair-orders/pages/RepairOrdersPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { BackendStatusProvider } from '../app/BackendStatusProvider';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
}

function renderWithRouter(initialEntries: string[]) {
  const queryClient = createTestQueryClient();
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { path: 'dashboard', element: <div>Dashboard Component</div> },
          { path: 'customers', element: <CustomersPage /> },
          { path: 'devices', element: <DevicesPage /> },
          { path: 'repair-orders', element: <RepairOrdersPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
    { initialEntries }
  );

  return render(
    <QueryClientProvider client={queryClient}>
      <BackendStatusProvider>
        <RouterProvider router={router} />
      </BackendStatusProvider>
    </QueryClientProvider>
  );
}

describe('AppLayout and Navigation', () => {
  it('renders sidebar brand and navigation links with accessible roles', () => {
    renderWithRouter(['/dashboard']);

    expect(screen.getByText('CRA MiniDesk')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Gösterge Paneli/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Müşteriler/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Cihazlar/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Servis Kayıtları/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Gösterge Paneli' })).toBeInTheDocument();
  });

  it('highlights active navigation link', () => {
    renderWithRouter(['/customers']);

    const activeLink = screen.getByRole('link', { name: /Müşteriler/i });
    expect(activeLink).toHaveClass(/active/);
  });

  it('renders customer route header', () => {
    renderWithRouter(['/customers']);

    expect(screen.getByRole('heading', { name: 'Müşteri Yönetimi' })).toBeInTheDocument();
  });

  it('renders devices route header', () => {
    renderWithRouter(['/devices']);

    expect(screen.getByRole('heading', { name: 'Cihaz Yönetimi' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cihazlar' })).toBeInTheDocument();
  });

  it('renders repair orders placeholder route', () => {
    renderWithRouter(['/repair-orders']);

    expect(screen.getByText('Servis Kayıtları Modülü')).toBeInTheDocument();
  });

  it('renders not found page for unknown route', () => {
    renderWithRouter(['/unknown-route-123']);

    expect(screen.getByText('Sayfa Bulunamadı (404)')).toBeInTheDocument();
  });
});
