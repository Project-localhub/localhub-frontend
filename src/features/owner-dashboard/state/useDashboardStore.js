import { create } from 'zustand';

export const useDashboardStore = create((set) => ({
  selectedStoreId: null,
  setSelectedStoreId: (storeId) => set({ selectedStoreId: storeId }),

  selectedPeriod: 'week',
  setSelectedPeriod: (period) => set({ selectedPeriod: period }),

  isStoreDropdownOpen: false,
  setStoreDropdownOpen: (isOpen) => set({ isStoreDropdownOpen: isOpen }),
}));
