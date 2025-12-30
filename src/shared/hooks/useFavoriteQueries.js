import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStoreFavoriteCount, getStoreFavorites } from '@/shared/api/favoriteApi';
import { getLikeList, toggleLike, deleteFavorite } from '@/shared/api/auth';

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

// 내가 찜한 가게 목록 조회
export const useMyFavorites = (options = {}) => {
  return useQuery({
    queryKey: favoriteKeys.myFavorites(),
    queryFn: async () => {
      try {
        const res = await getLikeList();
        return res.data || [];
      } catch (error) {
        console.warn('찜한 가게 목록 조회 실패:', error);
        return [];
      }
    },
    staleTime: 1 * 60 * 1000, // 1분
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// 찜하기/찜 해제 Mutation
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, isFavorite }) => {
      if (isFavorite) {
        return await deleteFavorite(storeId);
      } else {
        return await toggleLike(storeId);
      }
    },
    onSuccess: (data, variables) => {
      // 찜한 가게 목록 갱신
      queryClient.invalidateQueries({ queryKey: favoriteKeys.myFavorites() });
      // 찜 수 갱신
      queryClient.invalidateQueries({ queryKey: favoriteKeys.count(variables.storeId) });
      queryClient.invalidateQueries({ queryKey: favoriteKeys.list(variables.storeId) });
      // 가게 정보 갱신 (찜 상태 포함)
      queryClient.invalidateQueries({ queryKey: ['stores', 'detail', variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ['stores', 'list'] });
    },
  });
};
