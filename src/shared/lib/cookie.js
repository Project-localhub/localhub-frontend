/**
 * 쿠키 유틸리티 함수
 */

/**
 * 쿠키에서 값을 가져옵니다.
 * @param {string} name - 쿠키 이름
 * @returns {string|null} 쿠키 값 또는 null
 */
export const getCookie = (name) => {
  if (typeof document === 'undefined') {
    return null;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }

  return null;
};

/**
 * 쿠키를 설정합니다.
 * @param {string} name - 쿠키 이름
 * @param {string} value - 쿠키 값
 * @param {number} days - 만료일 (일 단위, 기본값: 7일)
 */
export const setCookie = (name, value, days = 7) => {
  if (typeof document === 'undefined') {
    return;
  }

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};

/**
 * 쿠키를 삭제합니다.
 * @param {string} name - 쿠키 이름
 */
export const deleteCookie = (name) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};
