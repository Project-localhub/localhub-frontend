import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider, HydrationBoundary } from '@tanstack/react-query';
import { queryClient } from './app/queryClient';
import { App } from './app/App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './features/chat/context/SocketProvider';
import { initKakao } from './shared/lib/kakao';
import client from './shared/api/client';

if (typeof window !== 'undefined') {
  const token = localStorage.getItem('accessToken');
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  const KAKAO_JAVASCRIPT_KEY = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;

  if (KAKAO_JAVASCRIPT_KEY) {
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

  const dehydratedState = window.__REACT_QUERY_STATE__ ?? null;
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const app = (
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            {dehydratedState ? (
              <HydrationBoundary state={dehydratedState}>
                <SocketProvider>
                  <App />
                </SocketProvider>
              </HydrationBoundary>
            ) : (
              <SocketProvider>
                <App />
              </SocketProvider>
            )}
          </QueryClientProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );

  try {
    if (rootElement.hasChildNodes() && rootElement.innerHTML.trim() !== '') {
      hydrateRoot(rootElement, app);
    } else {
      createRoot(rootElement).render(app);
    }
  } catch (error) {
    console.error('Hydration error, falling back to client-side rendering:', error);
    createRoot(rootElement).render(app);
  }
}
