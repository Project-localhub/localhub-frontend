import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  maxRedirects: 0,
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

client.interceptors.response.use(
  (response) => {
    // 302 리다이렉트 응답 처리
    if (response.status === 302) {
      const error = new Error('인증이 필요합니다. 다시 로그인해주세요.');
      error.response = response;
      return Promise.reject(error);
    }
    return response;
  },
  (error) => {
    // 리다이렉트 무한 루프 에러 처리
    if (error.code === 'ERR_TOO_MANY_REDIRECTS') {
      const redirectError = new Error('인증이 필요합니다. 다시 로그인해주세요.');
      redirectError.response = error.response;
      return Promise.reject(redirectError);
    }

    // 401 Unauthorized 에러 처리
    if (error.response?.status === 401) {
      const authError = new Error('인증이 필요합니다. 다시 로그인해주세요.');
      authError.response = error.response;
      return Promise.reject(authError);
    }

    // 302 리다이렉트 에러 처리
    if (error.response?.status === 302) {
      const redirectError = new Error('인증이 필요합니다. 다시 로그인해주세요.');
      redirectError.response = error.response;
      return Promise.reject(redirectError);
    }

    return Promise.reject(error);
  },
);

export default client;
