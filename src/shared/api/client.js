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
  const isNoAuthRequest = noAuthRequiredUrls.some((url) => config.url.startsWith(url));

  if (isNoAuthRequest) {
    return config;
  }

  if (!isNoAuthRequest) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // 단, 특정 엔드포인트는 조용히 처리 (로그아웃, 가게 목록 조회 등)
    if (error.response?.status === 401) {
      const silent401Urls = ['/logout', '/api/restaurant/findByOwnerID'];
      const shouldSilent = silent401Urls.some((url) => error.config?.url?.includes(url));

      if (shouldSilent) {
        // 조용히 처리 (에러를 reject하지 않고 빈 응답 반환)
        return Promise.resolve({ data: null, status: 401 });
      }

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
