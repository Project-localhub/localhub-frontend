import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { loadKakaoMapSDK, isKakaoMapLoaded } from '@/shared/lib/kakaoMap';

const MapView = ({ stores }) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!stores || stores.length === 0) return;
    if (!containerRef.current) return;

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
          // 유효한 좌표를 가진 가게들만 필터링
          const validStores = stores.filter((s) => (s.lat || s.latitude) && (s.lng || s.longitude));

          if (validStores.length === 0) {
            console.warn('유효한 좌표를 가진 가게가 없습니다.');
            return;
          }

          // 기존 마커 제거
          if (markersRef.current.length > 0) {
            markersRef.current.forEach((marker) => marker.setMap(null));
            markersRef.current = [];
          }

          // 기존 지도가 있으면 재사용, 없으면 새로 생성
          let map = mapRef.current;
          if (!map) {
            // 첫 번째 가게의 위치를 중심으로 설정
            const firstStore = validStores[0];
            const centerLat = firstStore.lat || firstStore.latitude;
            const centerLng = firstStore.lng || firstStore.longitude;
            const center = new window.kakao.maps.LatLng(centerLat, centerLng);

            // 지도 생성
            map = new window.kakao.maps.Map(containerRef.current, {
              center,
              level: 4,
            });

            mapRef.current = map;
          }

          // 마커 생성 및 bounds 계산을 위한 배열
          const positions = [];
          const markers = [];

          validStores.forEach((store) => {
            const storeLat = store.lat || store.latitude;
            const storeLng = store.lng || store.longitude;
            if (!storeLat || !storeLng) return;

            const position = new window.kakao.maps.LatLng(storeLat, storeLng);
            positions.push(position);

            const marker = new window.kakao.maps.Marker({
              map,
              position,
              title: store.name,
            });

            markers.push(marker);

            // 마커 클릭 시 정보창 표시
            const infoWindow = new window.kakao.maps.InfoWindow({
              content: `<div style="padding:6px 10px;font-size:14px">${store.name || '가게'}</div>`,
            });

            window.kakao.maps.event.addListener(marker, 'click', () => {
              // 다른 정보창 닫기
              markers.forEach((m) => {
                if (m.infoWindow) {
                  m.infoWindow.close();
                }
              });
              infoWindow.open(map, marker);
              marker.infoWindow = infoWindow;
            });
          });

          // 마커 참조 저장
          markersRef.current = markers;

          // 지도 범위 조정
          if (positions.length > 1) {
            // 여러 마커가 있으면 모든 마커가 보이도록 지도 범위 조정
            const bounds = new window.kakao.maps.LatLngBounds();
            positions.forEach((position) => {
              bounds.extend(position);
            });
            map.setBounds(bounds);
          } else if (positions.length === 1) {
            // 마커가 하나면 해당 위치로 중심 이동
            map.setCenter(positions[0]);
            map.setLevel(4);
          }
        });
      } catch (error) {
        console.error('카카오맵 초기화 에러:', error);
      }
    };

    initializeMap();

    // cleanup: 컴포넌트 언마운트 시 마커 제거
    return () => {
      if (markersRef.current.length > 0) {
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];
      }
    };
  }, [stores]);

  return <div ref={containerRef} className="w-full h-full" />;
};

MapView.propTypes = {
  stores: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
      latitude: PropTypes.number,
      longitude: PropTypes.number,
      name: PropTypes.string,
    }),
  ).isRequired,
};

export default MapView;
