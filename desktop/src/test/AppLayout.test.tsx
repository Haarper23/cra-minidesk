import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { CustomersPage } from '../features/customers/pages/CustomersPage';
import { DevicesPage } from '../features/devices/pages/DevicesPage';
import { RepairOrdersPage } from '../features/repair-orders/pages/RepairOrdersPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { BackendStatusProvider } from '../app/BackendStatusProvider';

function renderWithRouter(initialEntries: string[]) {
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
    <BackendStatusProvider>
      <RouterProvider router={router} />
    </BackendStatusProvider>
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

  it('renders customer placeholder route with Turkish status notes', () => {
    renderWithRouter(['/customers']);

    expect(screen.getByText('Müşteri Yönetimi Modülü')).toBeInTheDocument();
    expect(screen.getByText(/Sprint 5B/)).toBeInTheDocument();
  });

  it('renders devices placeholder route', () => {
    renderWithRouter(['/devices']);

    expect(screen.getByText('Cihaz Yönetimi Modülü')).toBeInTheDocument();
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
