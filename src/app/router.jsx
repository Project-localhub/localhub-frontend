import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import StoreDetailPage from '@/pages/StoreDetailPage';
import ChatPage from '@/pages/ChatPage';
import FavoritePage from '@/pages/FavoritePage';
import OwnerDashboardPage from '@/pages/owner/OwnerDashboardPage';
import SelectUserTypePage from '@/pages/SelectUserTypePage';

import { createBrowserRouter, Navigate } from 'react-router-dom';
// 나머지 페이지 import

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, // 최상위 Layout
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'select-user-type', element: <SelectUserTypePage /> },
      { path: 'oauth/redirect', element: <OAuthRedirectPage /> },
      { path: 'store/:id', element: <StoreDetailPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'favorites', element: <FavoritePage /> },
      { path: 'dashboard', element: <OwnerDashboardPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
