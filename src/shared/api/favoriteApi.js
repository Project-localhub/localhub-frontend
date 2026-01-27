import client from '@/shared/api/client';

// 내가 찜한 가게 목록 조회
export const getMyFavoriteList = async () => {
  const response = await client.get('/api/restaurant/get/likeList');
  return response.data;
};

// 가게 찜하기
export const addFavorite = async (restaurantId) => {
  const response = await client.post(`/api/restaurant/like/${restaurantId}`);
  return response.data;
};

// 가게 찜 삭제
export const removeFavorite = async (restaurantId) => {
  const response = await client.delete(`/api/restaurant/deleteBy/${restaurantId}`);
  return response.data;
};
