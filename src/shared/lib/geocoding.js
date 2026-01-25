import { loadKakaoMapSDK, isKakaoMapLoaded } from './kakaoMap';

/**
 * 주소를 좌표로 변환하는 유틸리티 함수
 */

/**
 * @param {string} address - 변환할 주소
 * @returns {Promise<{latitude: number, longitude: number}>} 위도와 경도
 */
export const convertAddressToCoordinates = async (address) => {
  if (!address || !address.trim()) {
    return { latitude: 0, longitude: 0 };
  }

  try {
    if (!isKakaoMapLoaded()) {
      await loadKakaoMapSDK();
    }

    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      console.warn('카카오맵 API가 로드되지 않았습니다. 기본 좌표(0, 0)를 사용합니다.');
      return { latitude: 0, longitude: 0 };
    }

    return new Promise((resolve) => {
      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.addressSearch(address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result && result.length > 0) {
          const coords = result[0];
          resolve({
            latitude: parseFloat(coords.y),
            longitude: parseFloat(coords.x),
          });
        } else {
          console.warn('주소를 좌표로 변환할 수 없습니다. 기본 좌표(0, 0)를 사용합니다.');
          resolve({ latitude: 0, longitude: 0 });
        }
      });
    });
  } catch (error) {
    console.error('카카오 지도 SDK 로드 실패:', error);
    return { latitude: 0, longitude: 0 };
  }
};
