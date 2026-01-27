import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './app/queryClient';
import { router } from './app/router';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { initKakao } from './shared/lib/kakao';
import client from './shared/api/client';

const token = localStorage.getItem('accessToken');

if (token) {
  client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
const KAKAO_JAVASCRIPT_KEY =
  import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY || '276aa066755d990c6678fa24c9076e24';

// 카카오 SDK 초기화를 지연시켜 초기 렌더링 차단 방지
if (typeof window !== 'undefined') {
  // requestIdleCallback을 사용하여 브라우저가 idle 상태일 때 초기화
  const initKakaoWhenReady = () => {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
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
    } else {
      // requestIdleCallback이 없으면 setTimeout으로 지연
      setTimeout(() => {
        const checkKakaoSDK = setInterval(() => {
          if (window.Kakao) {
            initKakao(KAKAO_JAVASCRIPT_KEY);
            clearInterval(checkKakaoSDK);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkKakaoSDK);
        }, 5000);
      }, 1000);
    }
  };

  if (document.readyState === 'complete') {
    initKakaoWhenReady();
  } else {
    window.addEventListener('load', initKakaoWhenReady);
  }
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
