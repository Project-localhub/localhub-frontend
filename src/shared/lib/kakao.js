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
 * 카카오 로그아웃
 * @returns {Promise} 카카오 로그아웃 Promise
 */
export const kakaoLogout = async () => {
  if (!isKakaoInitialized()) {
    return Promise.resolve();
  }

  try {
    await window.Kakao.Auth.logout();
    return Promise.resolve();
  } catch (error) {
    // 401 에러는 이미 로그아웃된 상태이므로 조용히 처리
    // 다른 에러도 조용히 처리 (카카오 로그아웃 실패는 치명적이지 않음)
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
