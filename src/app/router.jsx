import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import StoreListPage from '@/pages/StoreListPage';
import StoreDetailPage from '@/pages/StoreDetailPage';
import OwnerDashboardPage from '@/pages/owner/OwnerDashboardPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/stores',
    element: <StoreListPage />,
  },
  {
    path: '/stores/:storeId',
    element: <StoreDetailPage />,
  },
  {
    path: '/owner/*',
    element: <OwnerDashboardPage />,
  },
]);
