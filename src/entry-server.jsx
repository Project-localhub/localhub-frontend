import React from 'react';
import { renderToString } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { App } from './app/App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const NoopSocketProvider = ({ children }) => children;

export async function render(url, _context = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  let html = '';

  try {
    const appElement = (
      <React.StrictMode>
        <MemoryRouter initialEntries={[url]}>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <NoopSocketProvider>
                <App />
              </NoopSocketProvider>
            </QueryClientProvider>
          </AuthProvider>
        </MemoryRouter>
      </React.StrictMode>
    );

    html = renderToString(appElement);

    if (!html || html.trim() === '') {
      console.error('renderToString returned empty string');
      html = '<div id="root"><div>로딩 중...</div></div>';
    }
  } catch (error) {
    console.error('SSR 렌더링 오류:', error);
    console.error('Error stack:', error.stack);
    html = '<div id="root"><div>로딩 중...</div></div>';
  }

  const queryState = queryClient
    .getQueryCache()
    .getAll()
    .map((query) => ({
      queryKey: query.queryKey,
      queryHash: query.queryHash,
      state: query.state,
    }));

  return {
    html,
    queryState,
  };
}
