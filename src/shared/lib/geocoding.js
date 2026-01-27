import { loadKakaoMapSDK, isKakaoMapLoaded } from './kakaoMap';

export const convertAddressToCoordinates = async (address) => {
  if (!address || !address.trim()) {
    return { latitude: 0, longitude: 0 };
  }

  try {
    if (!isKakaoMapLoaded()) {
      await loadKakaoMapSDK();
    }

    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
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
          resolve({ latitude: 0, longitude: 0 });
        }
      });
    });
  } catch {
    return { latitude: 0, longitude: 0 };
  }
};
