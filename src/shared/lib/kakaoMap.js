// kakaoMap.js
const KAKAO_MAP_JS_KEY = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;

export const isKakaoMapLoaded = () =>
  !!(window.kakao && window.kakao.maps && window.kakao.maps.services);

export const loadKakaoMapSDK = () =>
  new Promise((resolve, reject) => {
    if (isKakaoMapLoaded()) return resolve();

    if (!KAKAO_MAP_JS_KEY) {
      return reject(new Error('VITE_KAKAO_MAP_JS_KEY가 없습니다.'));
    }

    const existing = document.querySelector('script[data-kakao-map-sdk="true"]');
    if (existing) {
      existing.addEventListener('load', () => {
        window.kakao.maps.load(() => resolve());
      });
      return;
    }

    const script = document.createElement('script');
    script.dataset.kakaoMapSdk = 'true';
    script.async = true;
    script.src =
      `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_JS_KEY}` +
      `&libraries=services&autoload=false`;

    script.onload = () => {
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () => reject(new Error('카카오맵 SDK 로드 실패'));

    document.head.appendChild(script);
  });
