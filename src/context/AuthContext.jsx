import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      setAccessToken(token);
      // ⚠️ 현재는 로그인 응답에 user 정보가 없으므로 임시 처리
      // 나중에 백엔드에서 user 내려주면 여기서 setUser 가능
    }

    setIsLoading(false);
  }, []);

  const login = (token, userData = null) => {
    localStorage.setItem('accessToken', token);
    setAccessToken(token);
    if (userData) setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isLogin: !!accessToken,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용해야 합니다');
  }
  return context;
};
