import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { CustomersPage } from '../features/customers/pages/CustomersPage';
import { DevicesPage } from '../features/devices/pages/DevicesPage';
import { RepairOrdersPage } from '../features/repair-orders/pages/RepairOrdersPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'customers',
        element: <CustomersPage />,
      },
      {
        path: 'devices',
        element: <DevicesPage />,
      },
      {
        path: 'repair-orders',
        element: <RepairOrdersPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
