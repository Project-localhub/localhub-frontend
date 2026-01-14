import { useEffect, useRef } from 'react';
import { loadKakaoMap } from '../utils/loadKakaoMap.js';

const MapView = ({ stores }) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!stores || stores.length === 0) return;
    if (!containerRef.current) return;

    loadKakaoMap(() => {
      const validStore = stores.find((s) => s.lat && s.lng);
      if (!validStore) return;

      const center = new window.kakao.maps.LatLng(validStore.lat, validStore.lng);

      const map = new window.kakao.maps.Map(containerRef.current, {
        center,
        level: 4,
      });

      mapRef.current = map;

      stores.forEach((store) => {
        if (!store.lat || !store.lng) return;

        const marker = new window.kakao.maps.Marker({
          map,
          position: new window.kakao.maps.LatLng(store.lat, store.lng),
          title: store.name,
        });
      });
    });
  }, [stores]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default MapView;
