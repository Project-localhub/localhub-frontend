import client from '@/shared/api/client';

// 가게를 찜한 사용자 수 조회
export const getStoreFavoriteCount = async (storeId) => {
  const response = await client.get(`/api/stores/${storeId}/favorites/count`);
  return response.data;
};

// 가게를 찜한 사용자 목록 조회
export const getStoreFavorites = async (storeId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.size) queryParams.append('size', params.size);

  const response = await client.get(
    `/api/stores/${storeId}/favorites${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
  );
  return response.data;
};
