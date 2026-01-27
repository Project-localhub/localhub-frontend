import React from 'react';
import { renderToString } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom';
import { routes } from './app/routes';
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
    const { query, dataRoutes } = createStaticHandler(routes);
    const request = new Request(`http://localhost${url}`);
    const context = await query(request);

    if (context instanceof Response) {
      throw context;
    }

    const router = createStaticRouter(dataRoutes, context);

    html = renderToString(
      <React.StrictMode>
        <StaticRouterProvider router={router} context={context}>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <NoopSocketProvider>
                <div id="root" />
              </NoopSocketProvider>
            </QueryClientProvider>
          </AuthProvider>
        </StaticRouterProvider>
      </React.StrictMode>,
    );
  } catch (error) {
    console.error('SSR 렌더링 오류:', error);
    html = '<div id="root"></div>';
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
