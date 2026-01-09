/* eslint-disable react/prop-types */
import { useEffect } from 'react';

const MapView = ({ stores }) => {
  useEffect(() => {
    const KAKAO_KEY = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;

    if (!KAKAO_KEY) {
      console.error('❌ 카카오 자바스크립트 키가 없습니다! .env 확인하세요.');
      return;
    }

    const script = document.createElement('script');
    script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_API_KEY&autoload=false';
    //  script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById('map');
        const options = {
          center: new window.kakao.maps.LatLng(37.4979, 127.0276), // 강남역
          level: 4,
        };

        const map = new window.kakao.maps.Map(container, options);

        // ⭐ 가게 마커 추가
        stores.forEach((store) => {
          if (!store.lat || !store.lng) return; // 좌표 없는 경우 건너뜀

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

  return <div id="map" className="w-full h-[500px]" />;
};

export default MapView;
