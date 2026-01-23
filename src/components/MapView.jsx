import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { loadKakaoMapSDK, isKakaoMapLoaded } from '@/shared/lib/kakaoMap';

const MapView = ({ stores = [], mode: _mode = 'home' }) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // containerRef가 아직 설정되지 않았을 수 있으므로 재시도 로직 추가
    let retryCount = 0;
    const maxRetries = 10; // 최대 10번 재시도 (약 500ms)

    const tryInitialize = async () => {
      if (!containerRef.current) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(tryInitialize, 50);
          return;
        }
        return;
      }

      // containerRef가 설정되었으면 지도 초기화 시작
      initializeMap();
    };

    const initializeMap = async () => {
      try {
        // SDK가 로드되지 않았으면 로드
        if (!isKakaoMapLoaded()) {
          await loadKakaoMapSDK();
        }

        // SDK 로드 확인
        if (!isKakaoMapLoaded()) {
          return;
        }

        // 지도 초기화
        window.kakao.maps.load(() => {
          // 유효한 좌표를 가진 가게들만 필터링
          const validStores = stores.filter((s) => {
            const hasLat = !!(s.lat || s.latitude);
            const hasLng = !!(s.lng || s.longitude);
            return hasLat && hasLng;
          });

          if (validStores.length === 0) {
            // 기존 지도가 있으면 그대로 유지, 없으면 기본 위치로 생성
            if (!mapRef.current) {
              const defaultCenter = new window.kakao.maps.LatLng(37.5665, 126.978); // 서울시청
              const defaultMap = new window.kakao.maps.Map(containerRef.current, {
                center: defaultCenter,
                level: 4,
              });
              mapRef.current = defaultMap;
            }
            return;
          }

          // 기존 마커 제거 (정보창도 함께 닫기)
          if (markersRef.current.length > 0) {
            markersRef.current.forEach((marker) => {
              // 정보창이 열려있으면 닫기
              if (marker.infoWindow) {
                marker.infoWindow.close();
              }
              marker.setMap(null);
            });
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
            // InfoWindow에 고유 ID 부여 (닫기 버튼 이벤트 처리를 위해)
            const infoWindowId = `info-window-${store.id || Date.now()}-${Math.random()}`;
            const infoWindowContent = `
              <div id="${infoWindowId}" style="
                min-width: 200px;
                padding: 12px 16px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                position: relative;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              ">
                <div style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 12px;
                ">
                  <span style="
                    font-size: 15px;
                    font-weight: 600;
                    color: #1f2937;
                    line-height: 1.4;
                    flex: 1;
                  ">${store.name || '가게'}</span>
                  <button 
                    id="close-btn-${infoWindowId}"
                    style="
                      background: #f3f4f6;
                      border: none;
                      border-radius: 50%;
                      width: 24px;
                      height: 24px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      cursor: pointer;
                      padding: 0;
                      flex-shrink: 0;
                      transition: background-color 0.2s;
                    "
                    onmouseover="this.style.background='#e5e7eb'"
                    onmouseout="this.style.background='#f3f4f6'"
                    aria-label="닫기"
                  >
                    <svg 
                      width="14" 
                      height="14" 
                      viewBox="0 0 14 14" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      style="pointer-events: none;"
                    >
                      <path 
                        d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" 
                        stroke="#6b7280" 
                        stroke-width="1.5" 
                        stroke-linecap="round" 
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            `;

            const infoWindow = new window.kakao.maps.InfoWindow({
              content: infoWindowContent,
              removable: false, // 기본 닫기 버튼 제거 (우리가 만든 버튼 사용)
            });

            // InfoWindow를 전역 객체에 저장 (닫기 버튼에서 접근하기 위해)
            if (!window.kakaoInfoWindows) {
              window.kakaoInfoWindows = {};
            }
            window.kakaoInfoWindows[infoWindowId] = infoWindow;

            window.kakao.maps.event.addListener(marker, 'click', () => {
              // 다른 정보창 닫기
              markers.forEach((m) => {
                if (m.infoWindow) {
                  m.infoWindow.close();
                }
              });
              infoWindow.open(map, marker);
              marker.infoWindow = infoWindow;

              // InfoWindow가 열린 후 닫기 버튼에 이벤트 리스너 추가
              setTimeout(() => {
                const closeButton = document.getElementById(`close-btn-${infoWindowId}`);
                if (closeButton) {
                  closeButton.onclick = () => {
                    infoWindow.close();
                  };
                }
              }, 100);
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
      } catch {
        // 에러 발생 시 조용히 처리
      }
    };

    // containerRef가 설정될 때까지 재시도하며 지도 초기화 시작
    tryInitialize();

    // cleanup: 컴포넌트 언마운트 시 마커 제거
    return () => {
      if (markersRef.current.length > 0) {
        markersRef.current.forEach((marker) => {
          // 정보창이 열려있으면 닫기
          if (marker.infoWindow) {
            marker.infoWindow.close();
          }
          marker.setMap(null);
        });
        markersRef.current = [];
      }
      // 전역 InfoWindow 객체 정리
      if (window.kakaoInfoWindows) {
        Object.keys(window.kakaoInfoWindows).forEach((key) => {
          const infoWindow = window.kakaoInfoWindows[key];
          if (infoWindow) {
            infoWindow.close();
          }
        });
        window.kakaoInfoWindows = {};
      }
    };
  }, [stores]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: '400px', width: '100%' }}
    />
  );
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
  mode: PropTypes.string,
};

export default MapView;
