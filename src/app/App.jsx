import { useRoutes, Navigate } from 'react-router-dom';
import { routes } from './routes';

export const App = () => {
  return useRoutes([
    ...routes,
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ]);
};
