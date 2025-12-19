import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './app/queryClient';
import { router } from './app/router';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { initKakao } from './shared/lib/kakao';

const KAKAO_JAVASCRIPT_KEY =
  import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY || '276aa066755d990c6678fa24c9076e24';

if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const checkKakaoSDK = setInterval(() => {
      if (window.Kakao) {
        initKakao(KAKAO_JAVASCRIPT_KEY);
        clearInterval(checkKakaoSDK);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkKakaoSDK);
    }, 5000);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>,
);
