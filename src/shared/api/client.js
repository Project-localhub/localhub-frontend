import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const noAuthRequiredUrls = [
    '/api/auth/login',
    '/api/auth/join',
    '/api/auth/findUsername',
    '/mail/send/verify',
    '/mail/email/verify',
  ];

  const isNoAuthRequest = config.method === 'post' && noAuthRequiredUrls.includes(config.url);

  if (isNoAuthRequest) {
    return config;
  }

  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default client;
