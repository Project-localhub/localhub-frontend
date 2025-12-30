import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  maxRedirects: 0,
});

// 인증 제외 URL
const noAuthRequiredUrls = [
  '/api/auth/login',
  '/api/auth/join',
  '/api/auth/findUsername',
  '/mail/send/verify',
  '/mail/email/verify',
];

// 🔥 요청 인터셉터 (1개만!)
client.interceptors.request.use((config) => {
  console.log('📌 요청 URL:', config.url);
  console.log('📌 전체 요청 객체:', config);

  const isNoAuthRequest = noAuthRequiredUrls.some((url) => config.url.startsWith(url));
  console.log('📌 인증 제외 여부:', isNoAuthRequest);

  if (!isNoAuthRequest) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📌 토큰 추가됨:', token);
    } else {
      console.log('⛔ 토큰 없음');
    }
  }

  return config;
});

// 🔥 응답 인터셉터
client.interceptors.response.use(
  (response) => {
    if (response.status === 302) {
      return Promise.reject(new Error('인증이 필요합니다. 다시 로그인해주세요.'));
    }
    return response;
  },
  (error) => {
    if (error.code === 'ERR_TOO_MANY_REDIRECTS') {
      return Promise.reject(new Error('인증이 필요합니다. 다시 로그인해주세요.'));
    }

    if (error.response?.status === 401) {
      console.log('⛔ 401 에러 발생');
      return Promise.reject(new Error('인증이 필요합니다. 다시 로그인해주세요.'));
    }

    return Promise.reject(error);
  },
);

export default client;
