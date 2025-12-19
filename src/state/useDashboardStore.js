import { create } from 'zustand';

// 대시보드 상태 관리 스토어
// 선택된 가게, 기간 선택 등
export const useDashboardStore = create((set) => ({
  // 선택된 가게 ID
  selectedStoreId: null,
  setSelectedStoreId: (storeId) => set({ selectedStoreId: storeId }),

  // 통계 기간 선택 (week, month)
  selectedPeriod: 'week',
  setSelectedPeriod: (period) => set({ selectedPeriod: period }),

  // 드롭다운 열림 상태
  isStoreDropdownOpen: false,
  setStoreDropdownOpen: (isOpen) => set({ isStoreDropdownOpen: isOpen }),
}));
