import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getUserInfo, logout as logoutAPI, changeUserType } from '../shared/api/auth';
import { queryClient } from '../app/queryClient';
import { kakaoLogout } from '../shared/lib/kakao';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /** 사용자 정보 API 호출 후 user 업데이트 */
  const setUserFromApi = useCallback(
    async (forceSocialLogin = null) => {
      if (isLoggingOut) return;

      const res = await getUserInfo();
      const userData = res.data;

      if (!userData) throw new Error('사용자 정보를 가져올 수 없습니다.');

      let isSocialLogin;
      if (forceSocialLogin !== null) {
        isSocialLogin = forceSocialLogin;
      } else {
        isSocialLogin =
          userData.provider ||
          userData.isSocialLogin ||
          localStorage.getItem('isSocialLogin') === 'true';
      }

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

  /** 앱 시작 시 자동 로그인 복구 */
  useEffect(() => {
    const initializeAuth = async () => {
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
          await setUserFromApi(isSocialLogin);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('isSocialLogin');
        }
      }

      setIsInitializing(false);
    };

    initializeAuth();
  }, [setUserFromApi, isLoggingOut]);

  /** 일반 로그인 */
  const login = async (accessToken) => {
    setIsLoggingOut(false);
    sessionStorage.removeItem('wasLoggedOut');

    localStorage.setItem('accessToken', accessToken);
    localStorage.removeItem('isSocialLogin'); // 일반 로그인

    await setUserFromApi(false);
    setIsLogin(true);
  };

  /** 소셜 로그인 (redirect 페이지에서 사용) */
  const loginWithToken = async (accessToken) => {
    if (!accessToken) throw new Error('accessToken이 필요합니다.');

    setIsLoggingOut(false);
    sessionStorage.removeItem('wasLoggedOut');

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('isSocialLogin', 'true');

    await setUserFromApi(true);
  };

  /** 쿠키 기반 로그인 */
  const loginWithCookie = async () => {
    const isSocialLogin = localStorage.getItem('isSocialLogin') === 'true';
    await setUserFromApi(isSocialLogin);
  };

  /** 로그아웃 */
  const logout = async () => {
    setIsLoggingOut(true);
    sessionStorage.setItem('wasLoggedOut', 'true');

    try {
      // 카카오 로그인 사용자에게만 카카오 로그아웃 호출
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

    const currentIsSocialLogin = user?.isSocialLogin ?? false;
    await setUserFromApi(currentIsSocialLogin);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLogin,
        isInitializing,
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
