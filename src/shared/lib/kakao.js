/**
 * 카카오 SDK 관련 유틸리티 함수
 */

/**
 * 카카오 SDK 초기화 여부 확인
 * @returns {boolean} 카카오 SDK가 초기화되어 있는지 여부
 */
export const isKakaoInitialized = () => {
  return typeof window !== 'undefined' && window.Kakao && window.Kakao.isInitialized();
};

/**
 * 카카오 SDK 초기화
 * @param {string} javascriptKey - 카카오 JavaScript 키
 */
export const initKakao = (javascriptKey) => {
  if (typeof window === 'undefined' || !window.Kakao) {
    return false;
  }

  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(javascriptKey);
    return true;
  }

  return true;
};

/**
 * 카카오 로그인 상태 확인
 * @returns {boolean} 카카오 로그인 여부
 */
export const isKakaoLoggedIn = () => {
  if (!isKakaoInitialized()) {
    return false;
  }

  try {
    // 카카오 액세스 토큰이 있으면 로그인된 상태
    const accessToken = window.Kakao.Auth.getAccessToken();
    return !!accessToken;
  } catch {
    return false;
  }
};

/**
 * 카카오 로그아웃
 * @returns {Promise} 카카오 로그아웃 Promise
 */
export const kakaoLogout = async () => {
  // 카카오 SDK가 초기화되지 않았거나 로그인하지 않은 경우 바로 반환
  if (!isKakaoInitialized() || !isKakaoLoggedIn()) {
    return Promise.resolve();
  }

  try {
    await window.Kakao.Auth.logout();
    return Promise.resolve();
  } catch (error) {
    // 401 에러는 이미 로그아웃된 상태이므로 조용히 처리
    // 다른 에러도 조용히 처리 (카카오 로그아웃 실패는 치명적이지 않음)
    if (error?.response?.status === 401) {
      // 401 에러는 이미 로그아웃된 상태이므로 정상 처리
      return Promise.resolve();
    }
    // 다른 에러도 조용히 처리
    return Promise.resolve();
  }
};

/**
 * 카카오 사용자 정보 조회
 * @returns {Promise} 카카오 사용자 정보 Promise
 */
export const getKakaoUserInfo = async () => {
  if (!isKakaoInitialized()) {
    throw new Error('카카오 SDK가 초기화되지 않았습니다.');
  }

  const response = await window.Kakao.API.request({
    url: '/v2/user/me',
  });
  return response;
};
