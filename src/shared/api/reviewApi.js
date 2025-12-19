import client from '@/shared/api/client';

// 가게의 리뷰 목록 조회
export const getStoreReviews = async (storeId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.size) queryParams.append('size', params.size);
  if (params.month) queryParams.append('month', params.month); // 특정 월 필터링

  const response = await client.get(
    `/api/stores/${storeId}/reviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
  );
  return response.data;
};

// 이번 달 리뷰 수 조회
export const getMonthlyReviewCount = async (storeId, year, month) => {
  const response = await client.get(`/api/stores/${storeId}/reviews/count`, {
    params: { year, month },
  });
  return response.data;
};
