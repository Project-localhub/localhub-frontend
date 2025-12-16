import { create } from 'zustand';

// UI 상태 관리 스토어
// 모달, 드롭다운, 탭 선택 등 UI 관련 상태
export const useUIStore = create((set) => ({
  // 모달 상태
  modals: {
    // 예시: reviewModal: false, favoriteModal: false 등
  },
  setModal: (modalName, isOpen) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: isOpen,
      },
    })),

  // 드롭다운 상태
  dropdowns: {},
  setDropdown: (dropdownName, isOpen) =>
    set((state) => ({
      dropdowns: {
        ...state.dropdowns,
        [dropdownName]: isOpen,
      },
    })),

  // 탭 선택 상태
  activeTabs: {},
  setActiveTab: (tabGroup, tabName) =>
    set((state) => ({
      activeTabs: {
        ...state.activeTabs,
        [tabGroup]: tabName,
      },
    })),
}));
