import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getUserInfo, logout as logoutAPI, changeUserType } from '../shared/api/auth';
import { queryClient } from '../app/queryClient';
import { kakaoLogout } from '../shared/lib/kakao';
import client from '../shared/api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  /** 사용자 정보 세팅 */
  const setUserFromApi = useCallback(
    async (forceSocialLogin = null) => {
      if (isLoggingOut) return;

      const res = await getUserInfo();
      const userData = res.data;
      if (!userData) throw new Error('사용자 정보 없음');

      const isSocialLogin =
        forceSocialLogin ??
        userData.provider ??
        userData.isSocialLogin ??
        localStorage.getItem('isSocialLogin') === 'true';

      setUser({
        id: userData.id,
        username: userData.username,
        name: userData.name,
        email: userData.email,
        userType: userData.userType || 'CUSTOMER',
        isSocialLogin,
      });

      setIsLogin(true);
    },
    [isLoggingOut],
  );

  /** 쿠키 기반 로그인 (자동 로그인 핵심) */
  const loginWithCookie = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const res = await client.post('/jwt/exchange', {}, { withCredentials: true });
    const accessToken = res.data.accessToken || res.data.access;

    if (!accessToken) {
      throw new Error('accessToken이 없습니다.');
    }

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('isSocialLogin', 'true');

    await setUserFromApi(true);
    queryClient.invalidateQueries();
  }, [setUserFromApi]);

  /** 앱 시작 시 인증 복구 */
  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === 'undefined') return;

      if (isLoggingOut) {
        setIsInitializing(false);
        return;
      }

      const wasLoggedOut = sessionStorage.getItem('wasLoggedOut');
      if (wasLoggedOut === 'true') {
        sessionStorage.removeItem('wasLoggedOut');
        setIsInitializing(false);
        return;
      }

      const token = localStorage.getItem('accessToken');

      try {
        if (token) {
          await setUserFromApi(localStorage.getItem('isSocialLogin') === 'true');
        } else if (window.location.pathname !== '/oauth/redirect') {
          await loginWithCookie();
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('isSocialLogin');
      }

      setIsInitializing(false);
    };

    initializeAuth();
  }, [setUserFromApi, loginWithCookie, isLoggingOut]);

  /** 일반 로그인 */
  const login = async ({ accessToken, mustChangePassword }) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.removeItem('isSocialLogin');

    setMustChangePassword(mustChangePassword);
    if (mustChangePassword) {
      setIsLogin(true);
      return;
    }

    await setUserFromApi(false);
    queryClient.invalidateQueries();
  };

  /** OAuth redirect 페이지 전용 */
  const loginWithToken = async (accessToken) => {
    if (!accessToken) throw new Error('accessToken 필요');

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('isSocialLogin', 'true');

    await setUserFromApi(true);
    queryClient.invalidateQueries();
  };

  /** 로그아웃 */
  const logout = async () => {
    setIsLoggingOut(true);
    sessionStorage.setItem('wasLoggedOut', 'true');

    try {
      const isSocial = user?.isSocialLogin;
      if (isSocial) await kakaoLogout().catch(() => {});
      await logoutAPI().catch(() => {});
    } finally {
      setUser(null);
      setIsLogin(false);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('isSocialLogin');
      queryClient.clear();
    }
  };

  /** userType 변경 */
  const updateUserType = async (newUserType) => {
    await changeUserType(newUserType);
    await setUserFromApi(user?.isSocialLogin ?? false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLogin,
        isInitializing,
        mustChangePassword,
        login,
        loginWithToken,
        loginWithCookie,
        logout,
        updateUserType,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
