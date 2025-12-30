import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStoreReviews, getMonthlyReviewCount } from '@/shared/api/reviewApi';

// Query Keys
export const reviewKeys = {
  all: ['reviews'],
  lists: () => [...reviewKeys.all, 'list'],
  list: (storeId, filters) => [...reviewKeys.lists(), storeId, { filters }],
  counts: () => [...reviewKeys.all, 'count'],
  count: (storeId, year, month) => [...reviewKeys.counts(), storeId, year, month],
};

// 가게 리뷰 목록 조회
export const useStoreReviews = (storeId, params = {}, options = {}) => {
  return useQuery({
    queryKey: reviewKeys.list(storeId, params),
    queryFn: () => getStoreReviews(storeId, params),
    enabled: !!storeId && options.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2분
    ...options,
  });
};

// 이번 달 리뷰 수 조회
export const useMonthlyReviewCount = (storeId, year, month, options = {}) => {
  return useQuery({
    queryKey: reviewKeys.count(storeId, year, month),
    queryFn: () => getMonthlyReviewCount(storeId, year, month),
    enabled: !!storeId && !!year && !!month && options.enabled !== false,
    staleTime: 1 * 60 * 1000, // 1분
    ...options,
  });
};

// 리뷰 작성 Mutation (추후 구현)
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, reviewData }) => {
      // TODO: createReview API 함수 구현 필요 
      // return createReview(storeId, reviewData);
    },
    onSuccess: (data, variables) => {
      // 리뷰 목록 갱신
      queryClient.invalidateQueries({ queryKey: reviewKeys.list(variables.storeId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.counts() });
      // 가게 정보 갱신 (리뷰 수 포함)
      queryClient.invalidateQueries({ queryKey: ['stores', 'detail', variables.storeId] });
    },
  });
};
