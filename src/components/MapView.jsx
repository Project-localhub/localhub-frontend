import { useEffect, useRef } from 'react';
import { loadKakaoMap } from '../utils/loadKakaoMap.js';
import { getLocation } from '../utils/getLocation.js';

const MapView = ({ stores = [], mode = 'home' }) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    loadKakaoMap(async () => {
      let centerLatLng;

      // 🔹 홈 지도: 내 위치 우선
      if (mode === 'home') {
        try {
          const myLocation = await getLocation();
          centerLatLng = new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng);
        } catch {
          const fallbackStore = stores.find((s) => s.lat && s.lng);
          if (!fallbackStore) return;

          centerLatLng = new window.kakao.maps.LatLng(fallbackStore.lat, fallbackStore.lng);
        }
      }

      //  가게 상세: 해당 가게 고정
      if (mode === 'detail') {
        const store = stores.find((s) => s.lat && s.lng);
        if (!store) return;

        centerLatLng = new window.kakao.maps.LatLng(store.lat, store.lng);
      }

      const map = new window.kakao.maps.Map(containerRef.current, {
        center: centerLatLng,
        level: 4,
      });

      mapRef.current = map;

      //  홈일 때만 내 위치 마커
      if (mode === 'home') {
        new window.kakao.maps.Marker({
          map,
          position: centerLatLng,
          title: '내 위치',
        });
      }

      //  가게 마커
      stores.forEach((store) => {
        if (!store.lat || !store.lng) return;

        new window.kakao.maps.Marker({
          map,
          position: new window.kakao.maps.LatLng(store.lat, store.lng),
          title: store.name,
        });
      });
    });
  }, [stores, mode]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default MapView;
