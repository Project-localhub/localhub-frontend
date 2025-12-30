/* eslint-disable react/prop-types */
import { useEffect } from 'react';

const MapView = ({ stores }) => {
  useEffect(() => {
    // 스크립트 로드
    const script = document.createElement('script');
    script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_API_KEY&autoload=false';
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById('map');
        const options = {
          center: new window.kakao.maps.LatLng(37.4979, 127.0276), // 기본 중심 (강남역)
          level: 4,
        };

        const map = new window.kakao.maps.Map(container, options);

        // ⭐ 가게 데이터 마커로 표시
        stores.forEach((store) => {
          const marker = new window.kakao.maps.Marker({
            map,
            position: new window.kakao.maps.LatLng(store.lat, store.lng),
          });

          const info = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:6px 10px;font-size:14px">${store.name}</div>`,
          });

          window.kakao.maps.event.addListener(marker, 'click', () => {
            info.open(map, marker);
          });
        });
      });
    };

    document.head.appendChild(script);
  }, [stores]);

  return <div id="map" className="w-full h-full" />;
};

export default MapView;
