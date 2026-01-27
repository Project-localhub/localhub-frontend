import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider, HydrationBoundary } from '@tanstack/react-query';
import { queryClient } from './app/queryClient';
import { App } from './app/App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './features/chat/context/SocketProvider';
import client from './shared/api/client';

if (typeof window !== 'undefined') {
  const token = localStorage.getItem('accessToken');
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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

  if (rootElement.hasChildNodes() && rootElement.innerHTML.trim() !== '') {
    hydrateRoot(rootElement, app);
  } else {
    createRoot(rootElement).render(app);
  }
}
