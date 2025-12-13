import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  // 로그인 / 회원가입 요청에는 토큰 안 붙임
  if (config.url.includes('/auth/login') || config.url.includes('/auth/join')) {
    return config;
  }

  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
