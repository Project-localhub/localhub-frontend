/* eslint-disable react/prop-types */
import { useEffect } from 'react';
import { loadKakaoMapSDK, isKakaoMapLoaded } from '@/shared/lib/kakaoMap';

const MapView = ({ stores }) => {
  useEffect(() => {
    // 카카오맵 SDK 로드 및 지도 초기화
    const initializeMap = async () => {
      try {
        // SDK가 로드되지 않았으면 로드
        if (!isKakaoMapLoaded()) {
          await loadKakaoMapSDK();
        }

        // SDK 로드 확인
        if (!isKakaoMapLoaded()) {
          console.error('카카오맵 SDK를 로드할 수 없습니다.');
          return;
        }

        // 지도 초기화
        window.kakao.maps.load(() => {
          const container = document.getElementById('map');
          if (!container) {
            console.error('지도 컨테이너를 찾을 수 없습니다.');
            return;
          }

          const options = {
            center: new window.kakao.maps.LatLng(37.4979, 127.0276), // 기본 중심 (강남역)
            level: 4,
          };

          const map = new window.kakao.maps.Map(container, options);

          // ⭐ 가게 데이터 마커로 표시
          if (stores && Array.isArray(stores)) {
            stores.forEach((store) => {
              if (store.lat && store.lng) {
                const marker = new window.kakao.maps.Marker({
                  map,
                  position: new window.kakao.maps.LatLng(store.lat, store.lng),
                });

                const info = new window.kakao.maps.InfoWindow({
                  content: `<div style="padding:6px 10px;font-size:14px">${store.name || '가게'}</div>`,
                });

                window.kakao.maps.event.addListener(marker, 'click', () => {
                  info.open(map, marker);
                });
              }
            });
          }
        });
      } catch (error) {
        console.error('카카오맵 초기화 에러:', error);
      }
    };

    initializeMap();
  }, [stores]);

  return <div id="map" className="w-full h-full" />;
};

export default MapView;
