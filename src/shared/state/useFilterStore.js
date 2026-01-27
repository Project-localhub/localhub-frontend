import { create } from 'zustand';

export const useFilterStore = create((set) => ({
  homeFilters: {
    searchQuery: '',
    category: null,
    sortBy: 'distance',
    location: null,
  },
  setHomeFilters: (filters) =>
    set((state) => ({
      homeFilters: {
        ...state.homeFilters,
        ...filters,
      },
    })),
  resetHomeFilters: () =>
    set({
      homeFilters: {
        searchQuery: '',
        category: null,
        sortBy: 'distance',
        location: null,
      },
    }),

  storeListFilters: {
    searchQuery: '',
    category: null,
    minRating: null,
    tags: [],
  },
  setStoreListFilters: (filters) =>
    set((state) => ({
      storeListFilters: {
        ...state.storeListFilters,
        ...filters,
      },
    })),
}));
