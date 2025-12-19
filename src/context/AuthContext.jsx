import { createContext, useContext, useEffect, useState } from 'react';
import { getUserInfo } from '../shared/api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    const restoreLogin = async () => {
      try {
        const res = await getUserInfo();
        setUser(res.data);
        setIsLogin(true);
      } catch (e) {
        localStorage.removeItem('accessToken');
        setUser(null);
        setIsLogin(false);
      } finally {
        setLoading(false);
      }
    };
    restoreLogin();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLogin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
