import { create } from 'zustand';

export const useMapStore = create((set) => ({
  center: {
    lat: 37.5665,
    lng: 126.978,
  },
  setCenter: (lat, lng) => set({ center: { lat, lng } }),

  zoom: 15,
  setZoom: (zoom) => set({ zoom }),

  selectedMarkerId: null,
  setSelectedMarkerId: (storeId) => set({ selectedMarkerId: storeId }),

  viewMode: 'list',
  setViewMode: (mode) => set({ viewMode: mode }),
}));
