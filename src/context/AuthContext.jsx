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
  const [isInitializing, setIsInitializing] = useState(() => typeof window !== 'undefined');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  /** 사용자 정보 API 호출 */
  const setUserFromApi = useCallback(
    async (forceSocialLogin = null) => {
      if (isLoggingOut) return;

      const res = await getUserInfo();
      const userData = res.data;
      if (!userData) throw new Error('사용자 정보를 가져올 수 없습니다.');

      const isSocialLogin =
        forceSocialLogin !== null
          ? forceSocialLogin
          : Boolean(
              userData.provider ||
              userData.isSocialLogin ||
              localStorage.getItem('isSocialLogin') === 'true',
            );

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

  /** 앱 시작 시 로그인 복구 */
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
      const isSocialLogin = localStorage.getItem('isSocialLogin') === 'true';

      if (token) {
        try {
          if (!mustChangePassword) {
            await setUserFromApi(isSocialLogin);
          }
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('isSocialLogin');
        }
      }

      setIsInitializing(false);
    };

    initializeAuth();
  }, [setUserFromApi, isLoggingOut, mustChangePassword]);

  /** 일반 로그인 */
  const login = async ({ accessToken, mustChangePassword }) => {
    if (typeof window === 'undefined') return;

    setIsLoggingOut(false);
    sessionStorage.removeItem('wasLoggedOut');

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

  /** 소셜 로그인 */
  const loginWithToken = async (accessToken) => {
    if (!accessToken) throw new Error('accessToken이 필요합니다.');
    if (typeof window === 'undefined') return;

    setIsLoggingOut(false);
    sessionStorage.removeItem('wasLoggedOut');

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('isSocialLogin', 'true');

    await setUserFromApi(true);
    queryClient.invalidateQueries();
  };

  /** 쿠키 기반 로그인 */
  const loginWithCookie = useCallback(async () => {
    if (typeof window === 'undefined') return;

    setIsLoggingOut(false);
    sessionStorage.removeItem('wasLoggedOut');

    let accessToken;

    try {
      const res = await client.post('/jwt/exchange', {}, { withCredentials: true });
      accessToken = res.data.accessToken || res.data.access;
    } catch {
      throw new Error('쿠키에서 토큰을 가져올 수 없습니다.');
    }

    if (!accessToken) throw new Error('accessToken 없음');

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('isSocialLogin', 'true');

    await setUserFromApi(true);
    queryClient.invalidateQueries();
  }, [setUserFromApi]);

  /** 로그아웃 */
  const logout = async () => {
    if (typeof window === 'undefined') return;

    setIsLoggingOut(true);
    sessionStorage.setItem('wasLoggedOut', 'true');

    try {
      const isSocialLogin = user?.isSocialLogin || localStorage.getItem('isSocialLogin') === 'true';
      if (isSocialLogin) {
        await kakaoLogout().catch(() => {});
      }
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
