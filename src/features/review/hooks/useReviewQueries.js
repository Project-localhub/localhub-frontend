import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStoreReviews, getMonthlyReviewCount } from '@/shared/api/reviewApi';

export const reviewKeys = {
  all: ['reviews'],
  lists: () => [...reviewKeys.all, 'list'],
  list: (storeId, filters) => [...reviewKeys.lists(), storeId, { filters }],
  counts: () => [...reviewKeys.all, 'count'],
  count: (storeId, year, month) => [...reviewKeys.counts(), storeId, year, month],
};

export const useStoreReviews = (storeId, params = {}, options = {}) => {
  return useQuery({
    queryKey: reviewKeys.list(storeId, params),
    queryFn: () => getStoreReviews(storeId, params),
    enabled: !!storeId && options.enabled !== false,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

export const useMonthlyReviewCount = (storeId, year, month, options = {}) => {
  return useQuery({
    queryKey: reviewKeys.count(storeId, year, month),
    queryFn: () => getMonthlyReviewCount(storeId, year, month),
    enabled: !!storeId && !!year && !!month && options.enabled !== false,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      // TODO: createReview API 함수 구현 필요
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.list(variables.storeId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.counts() });
      queryClient.invalidateQueries({ queryKey: ['stores', 'detail', variables.storeId] });
    },
  });
};
