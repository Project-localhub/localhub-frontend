import axios from 'axios';
import { getCookie } from '@/shared/lib/cookie';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  maxRedirects: 0,
});

client.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // localStorage에서 토큰 확인 (일반 로그인)
    let token = localStorage.getItem('accessToken');
    let tokenSource = 'localStorage';

    // localStorage에 없으면 쿠키에서 확인 (소셜 로그인)
    if (!token) {
      // 🔍 디버깅: 쿠키 확인
      console.log('🔍 [client interceptor] localStorage에 토큰 없음. 쿠키 확인 시작...');
      console.log('  - 전체 쿠키:', document.cookie);

      // 쿠키에서 토큰 읽기 (백엔드가 저장한 쿠키 이름: access)
      const cookieAccess = getCookie('access');
      const cookieAccessToken = getCookie('accessToken');
      const cookieAccessToken2 = getCookie('access_token');
      const cookieToken = getCookie('token');

      console.log(
        '  - getCookie("access"):',
        cookieAccess ? '✅ ' + cookieAccess.substring(0, 20) + '...' : '❌ 없음',
      );
      console.log(
        '  - getCookie("accessToken"):',
        cookieAccessToken ? '✅ ' + cookieAccessToken.substring(0, 20) + '...' : '❌ 없음',
      );
      console.log(
        '  - getCookie("access_token"):',
        cookieAccessToken2 ? '✅ ' + cookieAccessToken2.substring(0, 20) + '...' : '❌ 없음',
      );
      console.log(
        '  - getCookie("token"):',
        cookieToken ? '✅ ' + cookieToken.substring(0, 20) + '...' : '❌ 없음',
      );

      token = cookieAccess || cookieAccessToken || cookieAccessToken2 || cookieToken;

      if (token) {
        tokenSource = 'cookie';
        console.log(
          '✅ [client interceptor] 쿠키에서 토큰 읽기 성공:',
          token.substring(0, 20) + '...',
        );
      } else {
        console.log('❌ [client interceptor] 쿠키에서도 토큰을 찾을 수 없음');
      }
    } else {
      console.log(
        '✅ [client interceptor] localStorage에서 토큰 읽기:',
        token.substring(0, 20) + '...',
      );
    }

    if (token) {
      // 쿠키에서 가져온 경우 Bearer가 이미 포함되어 있을 수 있으므로 확인
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      console.log(`✅ [client interceptor] Authorization 헤더 설정 완료 (소스: ${tokenSource})`);
    } else {
      console.log('⚠️ [client interceptor] 토큰 없음 - Authorization 헤더 미설정');
      console.log('  - 요청 URL:', config.url);
      console.log('  - 요청 메서드:', config.method);
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

      // 401 에러 발생 시 로그인 페이지로 리다이렉트
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
