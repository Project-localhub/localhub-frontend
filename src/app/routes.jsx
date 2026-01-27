import Layout from '../components/Layout';
import ProtectedRoute from '@/app/ProtectedRoute';
import { lazy, Suspense } from 'react';

import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';

const StoreDetailPage = lazy(() => import('@/pages/StoreDetailPage'));
const ChatListPage = lazy(() => import('@/pages/ChatListPage'));
const ChatDetailPage = lazy(() => import('@/pages/ChatDetailPage'));
const FavoritePage = lazy(() => import('@/pages/FavoritePage'));
const OwnerDashboardPage = lazy(() => import('@/pages/owner/OwnerDashboardPage'));
const StoreRegisterPage = lazy(() => import('@/pages/owner/StoreRegisterPage'));
const StoreEditPage = lazy(() => import('@/pages/owner/StoreEditPage'));
const MenuManagePage = lazy(() => import('@/pages/owner/MenuManagePage'));
const OAuthRedirectPage = lazy(() => import('@/pages/OAuthRedirectPage'));
const FindUserPage = lazy(() => import('@/pages/FindUserPage'));
const FindPasswordPage = lazy(() => import('@/pages/FindPasswordPage'));
const ChangePasswordPage = lazy(() => import('@/pages/ChangePasswordPage'));
const ReviewPage = lazy(() => import('@/pages/ReviewPage'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-gray-500">로딩 중...</div>
  </div>
);

export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      {
        path: 'findUser',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <FindUserPage />
          </Suspense>
        ),
      },
      {
        path: 'findPassword',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <FindPasswordPage />
          </Suspense>
        ),
      },
      {
        path: 'oauth/redirect',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <OAuthRedirectPage />
          </Suspense>
        ),
      },
      {
        path: 'store/:id',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <StoreDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'change-password',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ChangePasswordPage />
          </Suspense>
        ),
      },
      {
        path: 'chat',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ChatListPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'chat/:roomId',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ChatDetailPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'favorites',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <FavoritePage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <OwnerDashboardPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/store/register',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <StoreRegisterPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/store/edit/:id',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <StoreEditPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/menu/:id',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <MenuManagePage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'review/:restaurantId',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ReviewPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
];

