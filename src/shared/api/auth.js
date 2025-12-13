import client from './client';

export const signUp = async (data) => {
  try {
    const res = await client.post('/api/auth/join', data);
    console.log('회원가입 응답:', res.data);
    return res.data;
  } catch (err) {
    console.error('회원가입 에러:', err.response?.data || err);
    throw err;
  }
};

export const login = async (data) => {
  console.log('auth.js: 로그인 요청 보낼 데이터:', data);

  try {
    const response = await client.post('/api/auth/login', data);
    console.log('auth.js: 로그인 응답 전체(response):', response);
    console.log('auth.js: 로그인 응답 데이터(response.data):', response.data);
    return response.data; // body에 accessToken이 있다고 가정
  } catch (err) {
    console.error('auth.js: 로그인 요청 에러 전체(err):', err);
    console.error('auth.js: err.response:', err.response);
    console.error('auth.js: err.response?.data:', err.response?.data);
    console.error('auth.js: err.response?.status:', err.response?.status);
    console.error('auth.js: err.response?.headers:', err.response?.headers);
    console.error('auth.js: err.request:', err.request);
    console.error('auth.js: err.message:', err.message);
    throw err;
  }
};
