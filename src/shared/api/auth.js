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
  return res;
};

export const logout = async () => {
  const res = await client.post('/logout');
  return res.data;
};
