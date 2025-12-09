/* eslint-disable react/prop-types */
import React from 'react';
import { MapPin } from 'lucide-react';

const MapView = ({ stores = [] }) => {
  return (
    <div className="flex-1 relative bg-gray-100">
      {/* 지도 영역 - 실제 지도 라이브러리 연동 필요 */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MapPin size={48} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm">지도 기능은 추후 구현 예정입니다</p>
          <p className="text-xs text-gray-400 mt-1">주변 가게 {stores.length}개</p>
        </div>
      </div>

      {/* 지도 마커 영역 (추후 구현) */}
      {stores.map((store) => (
        <div key={store.id} className="absolute" style={{ display: 'none' }}>
          {/* 마커 위치는 실제 지도 라이브러리로 구현 */}
        </div>
      ))}
    </div>
  );
};

export default MapView;
