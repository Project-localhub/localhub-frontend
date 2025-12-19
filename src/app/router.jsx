import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import StoreDetailPage from '@/pages/StoreDetailPage';
import ChatPage from '@/pages/ChatPage';
import FavoritePage from '@/pages/FavoritePage';
import OwnerDashboardPage from '@/pages/owner/OwnerDashboardPage';
import StoreRegisterPage from '@/pages/owner/StoreRegisterPage';
import SelectUserTypePage from '@/pages/SelectUserTypePage';

import { createBrowserRouter, Navigate } from 'react-router-dom';
import OAuthRedirectPage from '../pages/OAuthRedirectPage';
import FindUserPage from '../pages/FindUserPage';
// 나머지 페이지 import

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, // 최상위 Layout
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'findUser', element: <FindUserPage /> },
      { path: 'select-user-type', element: <SelectUserTypePage /> },
      { path: 'oauth/redirect', element: <OAuthRedirectPage /> },
      { path: 'store/:id', element: <StoreDetailPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'favorites', element: <FavoritePage /> },
      { path: 'dashboard', element: <OwnerDashboardPage /> },
      { path: 'dashboard/store/register', element: <StoreRegisterPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
