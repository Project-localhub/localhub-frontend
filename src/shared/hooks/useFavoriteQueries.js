import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStoreFavoriteCount, getStoreFavorites } from '@/shared/api/favoriteApi';

// Query Keys
export const favoriteKeys = {
  all: ['favorites'],
  lists: () => [...favoriteKeys.all, 'list'],
  list: (storeId) => [...favoriteKeys.lists(), storeId],
  counts: () => [...favoriteKeys.all, 'count'],
  count: (storeId) => [...favoriteKeys.counts(), storeId],
  myFavorites: () => [...favoriteKeys.all, 'my'],
};

// 가게를 찜한 사용자 수 조회
export const useStoreFavoriteCount = (storeId, options = {}) => {
  return useQuery({
    queryKey: favoriteKeys.count(storeId),
    queryFn: () => getStoreFavoriteCount(storeId),
    enabled: !!storeId && options.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2분
    ...options,
  });
};

// 가게를 찜한 사용자 목록 조회
export const useStoreFavorites = (storeId, params = {}, options = {}) => {
  return useQuery({
    queryKey: favoriteKeys.list(storeId),
    queryFn: () => getStoreFavorites(storeId, params),
    enabled: !!storeId && options.enabled !== false,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

// 찜하기/찜 해제 Mutation (추후 구현)
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, isFavorite }) => {
      // TODO: toggleFavorite API 함수 구현 필요
      // return isFavorite ? addFavorite(storeId) : removeFavorite(storeId);
    },
    onSuccess: (data, variables) => {
      // 찜 수 갱신
      queryClient.invalidateQueries({ queryKey: favoriteKeys.count(variables.storeId) });
      queryClient.invalidateQueries({ queryKey: favoriteKeys.list(variables.storeId) });
      queryClient.invalidateQueries({ queryKey: favoriteKeys.myFavorites() });
      // 가게 정보 갱신 (찜 상태 포함)
      queryClient.invalidateQueries({ queryKey: ['stores', 'detail', variables.storeId] });
    },
  });
};
