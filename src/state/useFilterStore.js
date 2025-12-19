import { create } from 'zustand';

// 필터 상태 관리 스토어
// 검색어, 카테고리 필터, 정렬 옵션 등
export const useFilterStore = create((set) => ({
  // 홈 페이지 필터
  homeFilters: {
    searchQuery: '',
    category: null,
    sortBy: 'distance', // distance, rating, reviewCount
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

  // 가게 목록 필터
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
