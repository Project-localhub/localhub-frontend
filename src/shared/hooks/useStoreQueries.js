import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyStores,
  getStore,
  getRestaurantDetail,
  // getStoreStats, // 백엔드 API 미완성으로 주석처리
  createStore,
  updateStore,
  incrementStoreView,
  getAllRestaurants,
} from '@/shared/api/storeApi';

// Query Keys
export const storeKeys = {
  all: ['stores'],
  lists: () => [...storeKeys.all, 'list'],
  list: (filters) => [...storeKeys.lists(), { filters }],
  details: () => [...storeKeys.all, 'detail'],
  detail: (id) => [...storeKeys.details(), id],
  myStores: () => [...storeKeys.all, 'my'],
  stats: (id) => [...storeKeys.all, 'stats', id],
};

// 모든 가게 목록 조회 (홈페이지용)
export const useAllRestaurants = ({ lat, lng, page = 0, size = 10 } = {}, options = {}) => {
  return useQuery({
    queryKey: storeKeys.lists({ lat, lng, page, size }),
    queryFn: async () => {
      try {
        const response = await getAllRestaurants({
          lat,
          lng,
          page,
          size,
        });
        return response;
      } catch (err) {
        console.error('가게 목록 조회 실패:', err);
        return {
          content: [],
          totalElements: 0,
        };
      }
    },

    enabled: typeof lat === 'number' && typeof lng === 'number',

    staleTime: 2 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// 사장님의 가게 목록 조회 (배열 반환)
export const useStoreDetail = (storeId, options = {}) => {
  return useQuery({
    queryKey: storeKeys.detail(storeId),
    queryFn: () => getStore(storeId),
    enabled: !!storeId && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// 사장님의 가게 목록 조회
export const useMyStores = () => {
  return useQuery({
    queryKey: storeKeys.myStores(),
    queryFn: async () => {
      try {
        const stores = await getMyStores();
        return Array.isArray(stores) ? stores : [];
      } catch {
        // 네트워크 에러나 기타 에러는 조용히 빈 배열 반환
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5분
    retry: false,
    refetchOnWindowFocus: false,
  });
};

// 가게 상세 정보 조회 (상세 페이지용)
export const useRestaurantDetail = (restaurantId, options = {}) => {
  return useQuery({
    queryKey: storeKeys.detail(restaurantId),
    queryFn: () => getRestaurantDetail(restaurantId),
    enabled: !!restaurantId && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// 가게 정보 조회 (기존)
export const useStore = (storeId, options = {}) => {
  return useQuery({
    queryKey: storeKeys.detail(storeId),
    queryFn: () => getStore(storeId),
    enabled: !!storeId && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// 가게 통계 조회 (백엔드 API 미완성으로 기본값만 반환)
// TODO: 백엔드 API 완성 후 getStoreStats 호출로 변경
export const useStoreStats = (storeId, options = {}) => {
  return useQuery({
    queryKey: storeKeys.stats(storeId),
    queryFn: async () => {
      // 백엔드 API 미완성으로 기본값 반환 (UI는 정상 작동)
      return {
        todayViews: 0,
        monthlyReviews: 0,
        lastMonthReviews: 0,
        favoriteCount: 0,
        lastMonthFavoriteCount: 0,
        chatInquiries: 0,
        chartData: [
          { day: '월', views: 0 },
          { day: '화', views: 0 },
          { day: '수', views: 0 },
          { day: '목', views: 0 },
          { day: '금', views: 0 },
          { day: '토', views: 0 },
          { day: '일', views: 0 },
        ],
        recentReviews: [],
      };
      // TODO: 백엔드 API 완성 후 아래 코드로 교체
      // try {
      //   const response = await getStoreStats(storeId);
      //   return response.data || response;
      // } catch (error) {
      //   console.warn('통계 조회 실패:', error);
      //   return { ...기본값 };
      // }
    },
    enabled: !!storeId && options.enabled !== false,
    staleTime: 1 * 60 * 1000, // 1분 (통계는 자주 갱신)
    retry: false, // 백엔드가 없을 때 재시도 방지
    refetchOnWindowFocus: false,
    ...options,
  });
};

// 가게 등록 Mutation
export const useCreateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      // 가게 목록 갱신
      queryClient.invalidateQueries({ queryKey: storeKeys.myStores() });
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
    },
  });
};

// 가게 수정 Mutation
export const useUpdateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, storeData }) => updateStore(storeId, storeData),
    onSuccess: (data, variables) => {
      // 해당 가게 정보 갱신
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(variables.storeId) });
      queryClient.invalidateQueries({ queryKey: storeKeys.stats(variables.storeId) });
      queryClient.invalidateQueries({ queryKey: storeKeys.myStores() });
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
    },
  });
};

// 조회수 증가 Mutation (Optimistic Update 없이 조용히 처리)
export const useIncrementStoreView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: incrementStoreView,
    onSuccess: (data, storeId) => {
      // 통계 데이터 갱신 (조회수 포함)
      queryClient.invalidateQueries({ queryKey: storeKeys.stats(storeId) });
    },
    // 실패해도 사용자에게 보이지 않도록 조용히 처리
    onError: () => {},
  });
};
