import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  getMyStores,
  getRestaurantDetail,
  createStore,
  updateStore,
  incrementStoreView,
  getAllRestaurants,
  getRestaurantsByFilter,
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

// 필터로 가게 목록 조회 (무한 스크롤)
export const useRestaurantsByFilter = (filters = {}, options = {}) => {
  const { enabled, ...restOptions } = options;

  return useInfiniteQuery({
    queryKey: [...storeKeys.lists(), 'filter', filters],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const response = await getRestaurantsByFilter({
          page: pageParam,
          size: 10,
          category: filters.category || undefined,
          divide: filters.divide || undefined,
        });
        return response;
      } catch {
        return {
          content: [],
          totalElements: 0,
          last: true,
        };
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.last !== undefined) {
        return lastPage.last ? undefined : allPages.length;
      }
      const hasMore = lastPage.content?.length === 10;
      return hasMore ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: enabled !== undefined ? Boolean(enabled) : true,
    ...restOptions,
  });
};

// 모든 가게 목록 조회 (홈페이지용, 무한 스크롤)
export const useAllRestaurants = (options = {}) => {
  return useInfiniteQuery({
    queryKey: [...storeKeys.lists(), 'infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const response = await getAllRestaurants({
          page: pageParam,
          size: 10, // 한 번에 10개씩
          sort: 'createdAt,desc', // 기본 정렬
        });
        return response;
      } catch {
        return {
          content: [],
          totalElements: 0,
          last: true,
        };
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      // Spring Boot Page 응답 형식: last 필드로 확인
      if (lastPage.last !== undefined) {
        return lastPage.last ? undefined : allPages.length;
      }
      // last 필드가 없으면 content 길이로 판단
      const hasMore = lastPage.content?.length === 10;
      return hasMore ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2분
    retry: false,
    refetchOnWindowFocus: false,
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
