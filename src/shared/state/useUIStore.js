import { create } from 'zustand';

export const useUIStore = create((set) => ({
  modals: {},
  setModal: (modalName, isOpen) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: isOpen,
      },
    })),

  dropdowns: {},
  setDropdown: (dropdownName, isOpen) =>
    set((state) => ({
      dropdowns: {
        ...state.dropdowns,
        [dropdownName]: isOpen,
      },
    })),

  activeTabs: {},
  setActiveTab: (tabGroup, tabName) =>
    set((state) => ({
      activeTabs: {
        ...state.activeTabs,
        [tabGroup]: tabName,
      },
    })),
}));
