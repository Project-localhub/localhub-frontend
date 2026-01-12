import { useEffect, useRef } from 'react';

const MapView = ({ stores }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.kakao || !stores?.length) return;

    const { kakao } = window;

    const center = new kakao.maps.LatLng(stores[0].lat, stores[0].lng);

    const map = new kakao.maps.Map(mapRef.current, {
      center,
      level: 5,
    });

    stores.forEach((store) => {
      if (!store.lat || !store.lng) return;

      const marker = new kakao.maps.Marker({
        map,
        position: new kakao.maps.LatLng(store.lat, store.lng),
      });

      const infowindow = new kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:12px;">${store.name}</div>`,
      });

      kakao.maps.event.addListener(marker, 'click', () => {
        infowindow.open(map, marker);
      });
    });
  }, [stores]);

  return <div ref={mapRef} className="flex-1 w-full" />;
};

export default MapView;
