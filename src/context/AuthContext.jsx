import { createContext, useContext, useState } from 'react';
import { getUserInfo } from '../shared/api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);

  const login = async (accessToken) => {
    localStorage.setItem('accessToken', accessToken);

    const res = await getUserInfo(); // axios response
    const userData = res.data; // 🔥 여기 중요

    setUser({
      id: userData.id,
      username: userData.username,
      name: userData.name,
      email: userData.email,
    });

    setIsLogin(true);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setIsLogin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLogin, login, logout }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
