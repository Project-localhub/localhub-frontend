import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './app/queryClient';
import { router } from './app/router';
import './index.css';
import { AuthProvider } from './context/AuthContext';

// Kakao SDK 초기화
// const kakaoJavaScriptKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;
// if (kakaoJavaScriptKey && window.Kakao) {
//   if (!window.Kakao.isInitialized()) {
//     window.Kakao.init(kakaoJavaScriptKey);
//     console.log('Kakao SDK initialized:', window.Kakao.isInitialized());
//   }
// }

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>,
);
