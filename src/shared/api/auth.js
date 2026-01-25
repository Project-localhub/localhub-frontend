import client from './client';

export const signUp = async (data) => {
  const res = await client.post('/api/auth/join', data);
  return res.data;
};

export const login = async (data) => {
  const response = await client.post('/api/auth/login', data);

  return response.data;
};
export const changeUserType = async (userType) => {
  const res = await client.put('/api/user/changeUserType', {
    userType, // 'CUSTOMER' | 'OWNER'
  });
  return res.data;
};

export const getUserInfo = async () => {
  const res = await client.get('/api/user/getUserInfo');
  return res; // data만 넘기기 (응답 통일)
};

export const logout = async () => {
  try {
    const res = await client.post('/logout');
    return res.data;
  } catch (error) {
    // 401 에러는 이미 로그아웃된 상태이므로 조용히 처리
    if (error.response?.status === 401) {
      return;
    }
    // 다른 에러는 그대로 throw
    throw error;
  }
};

export const findUsername = (email) => {
  return client.post('/api/auth/findUsername', {
    email,
  });
};

export const findPassword = (email) => {
  return client.post(`/api/auth/findPassword`, {
    email,
  });
};

export const sendEmailCode = (email) => {
  return client.post('/mail/send/verify', { email });
};

export const verifyEmailCode = (email, code) => {
  return client.post('/mail/email/verify', { email, code });
};

export const toggleLike = async (restaurantId) => {
  const res = await client.post(`/api/restaurant/like/${Number(restaurantId)}`);
  return res.data;
};

export const saveReview = (payload) => {
  return client.post('/api/restaurant/save-review', payload);
};

export const getLikeList = async () => {
  const res = await client.get('/api/restaurant/get/likeList');
  return res;
};

export const deleteFavorite = async (restaurantId) => {
  return client.delete(`/api/restaurant/deleteBy/${Number(restaurantId)}`);
};

export const getRestaurantList = (params) => {
  return axios.get('/restaurant/list', { params });
};

export const getRestaurantDetail = async (restaurantId) => {
  const response = await client.get(`/api/restaurant/${restaurantId}`);
  return response.data;
};

export const getRestaurantMenu = async (restaurantId) => {
  const response = await client.get(`/api/getMenu/${restaurantId}`);
  return response.data;
};

export const getReviewBy = async (restaurantId) => {
  console.log('[getReviewBy] restaurantId:', restaurantId);

  try {
    const response = await client.get(`/api/restaurant/getReviewBy/${restaurantId}`);
    console.log('[getReviewBy] response:', response);
    console.log('[getReviewBy] response.data:', response.data);
    return response.data;
  } catch (err) {
    console.error('[getReviewBy] error:', err);
    throw err;
  }
};
