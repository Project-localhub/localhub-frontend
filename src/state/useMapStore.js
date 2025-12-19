import { create } from 'zustand';

// 지도 상태 관리 스토어
// 중심 좌표, 줌 레벨, 선택된 마커 등
export const useMapStore = create((set) => ({
  // 지도 중심 좌표
  center: {
    lat: 37.5665, // 서울 기본값
    lng: 126.978,
  },
  setCenter: (lat, lng) => set({ center: { lat, lng } }),

  // 줌 레벨
  zoom: 15,
  setZoom: (zoom) => set({ zoom }),

  // 선택된 마커 (가게 ID)
  selectedMarkerId: null,
  setSelectedMarkerId: (storeId) => set({ selectedMarkerId: storeId }),

  // 지도 보기 모드 (list, map)
  viewMode: 'list',
  setViewMode: (mode) => set({ viewMode: mode }),
}));
