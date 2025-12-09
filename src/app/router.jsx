import { createBrowserRouter, Navigate } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import StoreDetailPage from '@/pages/StoreDetailPage';
import ChatPage from '@/pages/ChatPage';
import FavoritePage from '@/pages/FavoritePage';
import OwnerDashboardPage from '@/pages/owner/OwnerDashboardPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/store/:id',
    element: <StoreDetailPage />,
  },
  {
    path: '/chat',
    element: <ChatPage />,
  },
  {
    path: '/favorites',
    element: <FavoritePage />,
  },
  {
    path: '/dashboard',
    element: <OwnerDashboardPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
