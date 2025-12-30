import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import StoreDetailPage from '@/pages/StoreDetailPage';
import ChatPage from '@/pages/ChatPage';
import FavoritePage from '@/pages/FavoritePage';
import OwnerDashboardPage from '@/pages/owner/OwnerDashboardPage';
import StoreRegisterPage from '@/pages/owner/StoreRegisterPage';
import OAuthRedirectPage from '@/pages/OAuthRedirectPage';
import FindUserPage from '@/pages/FindUserPage';
import ProtectedRoute from './protectedRoute';
import SignupPage from '../pages/SignupPage';
import ReviewPage from '../pages/ReviewPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // 메인 페이지
      { index: true, element: <HomePage /> },

      // 공용 페이지
      { path: 'login', element: <LoginPage /> },
      { path: 'findUser', element: <FindUserPage /> },
      { path: 'oauth/redirect', element: <OAuthRedirectPage /> },
      { path: 'store/:id', element: <StoreDetailPage /> },
      { path: 'signup', element: <SignupPage /> },

      // 🔒 로그인 필수 페이지 (ProtectedRoute로 감싸기)
      {
        path: 'chat',
        element: (
          <ProtectedRoute>
            <ChatPage />
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
        path: 'review/:id',
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
