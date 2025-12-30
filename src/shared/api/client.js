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

    // 디버깅: 토큰 전송 확인
    if (import.meta.env.DEV) {
      console.log('🔑 API 요청:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        tokenPreview: token.substring(0, 20) + '...',
        headers: {
          Authorization: config.headers.Authorization?.substring(0, 30) + '...',
        },
      });
    }
  } else {
    // 디버깅: 토큰이 없을 때
    if (import.meta.env.DEV) {
      console.warn('⚠️ 토큰 없음:', {
        url: config.url,
        method: config.method,
      });
    }
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
    // 단, 특정 엔드포인트는 조용히 처리 (로그아웃, 가게 목록 조회 등)
    if (error.response?.status === 401) {
      const silent401Urls = ['/logout', '/api/stores/my'];
      const shouldSilent = silent401Urls.some((url) => error.config?.url?.includes(url));

      if (shouldSilent) {
        // 조용히 처리 (에러를 reject하지 않고 빈 응답 반환)
        return Promise.resolve({ data: null, status: 401 });
      }

      // 디버깅: 401 에러 상세 정보
      if (import.meta.env.DEV) {
        const token = localStorage.getItem('accessToken');
        console.error('❌ 401 에러 발생:', {
          url: error.config?.url,
          method: error.config?.method,
          hasToken: !!token,
          tokenPreview: token ? token.substring(0, 30) + '...' : '없음',
          authorizationHeader: error.config?.headers?.Authorization
            ? error.config.headers.Authorization.substring(0, 40) + '...'
            : '없음',
          requestHeaders: error.config?.headers,
          responseData: error.response?.data,
          responseStatus: error.response?.status,
          fullError: error,
        });
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
