import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyFavoriteList,
  addFavorite,
  removeFavorite,
  getStoreFavoriteCount,
  getStoreFavorites,
} from '@/shared/api/favoriteApi';

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
        const data = await getMyFavoriteList();
        // Spring Boot Page 응답 형태 처리: { content: [...] }
        const favorites = data?.content || (Array.isArray(data) ? data : []);

        // StoreCard가 기대하는 형태로 변환
        return favorites.map((item) => ({
          ...item,
          id: item.restaurantId || item.id,
          image: item.imageUrl || item.image,
          rating: item.score !== undefined ? item.score : item.rating || 0,
          isLiked: true, // 찜한 가게 목록이므로 항상 true
          distance: item.distance || '0m', // distance가 없으면 기본값
          tags: item.keyword || item.tags || [], // keyword 또는 tags
        }));
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
    mutationFn: async ({ restaurantId, isFavorite }) => {
      if (isFavorite) {
        // 이미 찜한 상태면 삭제
        return await removeFavorite(restaurantId);
      } else {
        // 찜하지 않은 상태면 추가
        return await addFavorite(restaurantId);
      }
    },
    // Optimistic Update: UI를 즉시 업데이트
    onMutate: async ({ restaurantId, isFavorite }) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: favoriteKeys.myFavorites() });

      // 이전 데이터 백업
      const previousFavorites = queryClient.getQueryData(favoriteKeys.myFavorites());

      // Optimistic update: 찜한 목록을 즉시 업데이트
      queryClient.setQueryData(favoriteKeys.myFavorites(), (old = []) => {
        if (isFavorite) {
          // 찜 해제: 목록에서 제거 (타입 변환하여 비교)
          return old.filter(
            (fav) =>
              fav.id !== restaurantId &&
              fav.id !== Number(restaurantId) &&
              fav.restaurantId !== restaurantId &&
              fav.restaurantId !== Number(restaurantId),
          );
        } else {
          // 찜하기: 목록에 추가 (임시 데이터)
          const newFavorite = {
            id: restaurantId,
            restaurantId: restaurantId,
            isLiked: true,
          };
          return [...old, newFavorite];
        }
      });

      // 롤백을 위한 컨텍스트 반환
      return { previousFavorites };
    },
    onError: (err, variables, context) => {
      // 에러 발생 시 이전 데이터로 롤백
      if (context?.previousFavorites) {
        queryClient.setQueryData(favoriteKeys.myFavorites(), context.previousFavorites);
      }
    },
    onSuccess: (data, variables) => {
      // 찜한 가게 목록 갱신 (서버 데이터로 최종 동기화)
      queryClient.invalidateQueries({ queryKey: favoriteKeys.myFavorites() });
      // 찜 수 갱신
      queryClient.invalidateQueries({ queryKey: favoriteKeys.count(variables.restaurantId) });
      queryClient.invalidateQueries({ queryKey: favoriteKeys.list(variables.restaurantId) });
      // 가게 정보 갱신 (찜 상태 포함)
      queryClient.invalidateQueries({ queryKey: ['stores', 'detail', variables.restaurantId] });
      // 가게 목록 쿼리 무효화 (HomePage에서 사용하는 쿼리)
      queryClient.invalidateQueries({ queryKey: ['stores', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
};
