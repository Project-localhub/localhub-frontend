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

export const storeKeys = {
  all: ['stores'],
  lists: () => [...storeKeys.all, 'list'],
  list: (filters) => [...storeKeys.lists(), { filters }],
  details: () => [...storeKeys.all, 'detail'],
  detail: (id) => [...storeKeys.details(), id],
  myStores: () => [...storeKeys.all, 'my'],
  stats: (id) => [...storeKeys.all, 'stats', id],
};

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
          name: filters.name || undefined,
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

export const useAllRestaurants = (options = {}) => {
  const { name, ...restOptions } = options;

  return useInfiniteQuery({
    queryKey: [...storeKeys.lists(), 'infinite', { name }],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const response = await getAllRestaurants({
          page: pageParam,
          size: 10,
          sort: 'createdAt,desc',
          name: name || undefined,
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
    ...restOptions,
  });
};

export const useMyStores = () => {
  return useQuery({
    queryKey: storeKeys.myStores(),
    queryFn: async () => {
      try {
        const stores = await getMyStores();
        return Array.isArray(stores) ? stores : [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useRestaurantDetail = (restaurantId, options = {}) => {
  return useQuery({
    queryKey: storeKeys.detail(restaurantId),
    queryFn: () => getRestaurantDetail(restaurantId),
    enabled: !!restaurantId && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useStoreStats = (storeId, options = {}) => {
  return useQuery({
    queryKey: storeKeys.stats(storeId),
    queryFn: async () => {
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
    },
    enabled: !!storeId && options.enabled !== false,
    staleTime: 1 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useCreateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.myStores() });
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
    },
  });
};

export const useUpdateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, storeData }) => updateStore(storeId, storeData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(variables.storeId) });
      queryClient.invalidateQueries({ queryKey: storeKeys.stats(variables.storeId) });
      queryClient.invalidateQueries({ queryKey: storeKeys.myStores() });
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
    },
  });
};

export const useIncrementStoreView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: incrementStoreView,
    onSuccess: (data, storeId) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.stats(storeId) });
    },
    onError: () => {},
  });
};
