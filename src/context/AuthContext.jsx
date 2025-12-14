// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { getUserInfo } from '../shared/api/auth';

export const AuthContext = createContext();

// ✅ 이게 있어야 함
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (accessToken) => {
    localStorage.setItem('accessToken', accessToken);

    const res = await getUserInfo();

    setUser({
      id: res.data.id,
      username: res.data.username,
      name: res.data.name,
      email: res.data.email,
    });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
