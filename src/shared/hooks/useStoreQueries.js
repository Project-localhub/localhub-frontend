import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyStores,
  getStore,
  getStoreStats,
  createStore,
  updateStore,
  incrementStoreView,
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

// 사장님의 가게 목록 조회
export const useMyStores = () => {
  return useQuery({
    queryKey: storeKeys.myStores(),
    queryFn: async () => {
      const response = await getMyStores();
      return Array.isArray(response) ? response : response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 가게 정보 조회
export const useStore = (storeId, options = {}) => {
  return useQuery({
    queryKey: storeKeys.detail(storeId),
    queryFn: () => getStore(storeId),
    enabled: !!storeId && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// 가게 통계 조회
export const useStoreStats = (storeId, options = {}) => {
  return useQuery({
    queryKey: storeKeys.stats(storeId),
    queryFn: async () => {
      const response = await getStoreStats(storeId);
      return response.data || response;
    },
    enabled: !!storeId && options.enabled !== false,
    staleTime: 1 * 60 * 1000, // 1분 (통계는 자주 갱신)
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
