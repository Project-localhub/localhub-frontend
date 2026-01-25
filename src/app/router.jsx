import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import StoreDetailPage from '@/pages/StoreDetailPage';
import ChatListPage from '@/pages/ChatListPage';
import ChatDetailPage from '@/pages/ChatDetailPage';
import FavoritePage from '@/pages/FavoritePage';
import OwnerDashboardPage from '@/pages/owner/OwnerDashboardPage';
import StoreRegisterPage from '@/pages/owner/StoreRegisterPage';
import StoreEditPage from '@/pages/owner/StoreEditPage';
import MenuManagePage from '@/pages/owner/MenuManagePage';
import OAuthRedirectPage from '@/pages/OAuthRedirectPage';
import FindUserPage from '@/pages/FindUserPage';
import FindPasswordPage from '../pages/FindPasswordPage';
import ReviewPage from '@/pages/ReviewPage';
import ProtectedRoute from '@/app/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // 메인 페이지
      { index: true, element: <HomePage /> },

      // 공용 페이지
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'findUser', element: <FindUserPage /> },
      { path: 'findPassword', element: <FindPasswordPage /> },
      { path: 'oauth/redirect', element: <OAuthRedirectPage /> },
      { path: 'store/:id', element: <StoreDetailPage /> },

      // 🔒 로그인 필수 페이지 (ProtectedRoute로 감싸기)
      {
        path: 'chat',
        element: (
          <ProtectedRoute>
            <ChatListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'chat/:roomId',
        element: (
          <ProtectedRoute>
            <ChatDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'favorites',
        element: (
          <ProtectedRoute>
            <FavoritePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <OwnerDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/store/register',
        element: (
          <ProtectedRoute>
            <StoreRegisterPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/store/edit/:id',
        element: (
          <ProtectedRoute>
            <StoreEditPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/menu/:id',
        element: (
          <ProtectedRoute>
            <MenuManagePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'review/:restaurantId',
        element: (
          <ProtectedRoute>
            <ReviewPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // 404 → 홈으로 이동
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
