import client from './client';

export const signUp = async (data) => {
  const response = await client.post('/api/auth/join', data);
  return response;
};

export const login = async (data) => {
  const response = await client.post('/api/auth/login', data);
  return response; // 🔥 headers 필요
};
