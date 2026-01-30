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
          (typeof window !== 'undefined' && localStorage.getItem('isSocialLogin') === 'true');
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
      if (typeof window === 'undefined') {
        return;
      }

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
      } else {
        // localStorage에 토큰이 없으면 HttpOnly 쿠키에서 토큰을 받아올 수 있는지 시도
        // (소셜 로그인 후 /oauth/redirect를 거치지 않고 바로 홈으로 이동한 경우 등)
        // 단, /oauth/redirect 페이지에서는 loginWithCookie가 이미 호출되므로 여기서는 시도하지 않음
        const isOAuthRedirectPage = window.location.pathname === '/oauth/redirect';
        if (!isOAuthRedirectPage) {
          try {
            console.log(
              '🔍 [initializeAuth] localStorage에 토큰 없음. HttpOnly 쿠키에서 토큰 받기 시도...',
            );
            await loginWithCookie();
          } catch (error) {
            // 쿠키에 토큰이 없거나 실패한 경우 (일반적인 경우)
            console.log(
              'ℹ️ [initializeAuth] HttpOnly 쿠키에서 토큰을 받을 수 없음 (로그인 필요)',
              error,
            );
          }
        }
      }

      setIsInitializing(false);
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUserFromApi, isLoggingOut]);

  /** 일반 로그인 */
  const login = async ({ accessToken, mustChangePassword }) => {
    if (typeof window === 'undefined') {
      return;
    }

    setIsLoggingOut(false);
    sessionStorage.removeItem('wasLoggedOut');

    localStorage.setItem('accessToken', accessToken);
    localStorage.removeItem('isSocialLogin'); // 일반 로그인

    setMustChangePassword(mustChangePassword);
    //임시비밀번호면 return
    if (mustChangePassword) {
      setIsLogin(true);
      return;
    }

    await setUserFromApi(false);

    setIsLogin(true);

    // 로그인 성공 후 React Query 캐시 무효화하여 데이터 재요청
    queryClient.invalidateQueries();
  };

  /** 소셜 로그인 (redirect 페이지에서 사용) */
  const loginWithToken = async (accessToken, refreshToken) => {
    if (!accessToken) throw new Error('accessToken이 필요합니다.');
    if (typeof window === 'undefined') {
      return;
    }

    setIsLoggingOut(false);
    sessionStorage.removeItem('wasLoggedOut');

    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    localStorage.setItem('isSocialLogin', 'true');

    await setUserFromApi(true);

    queryClient.invalidateQueries();
  };

  /** 쿠키 기반 로그인 */
  const loginWithCookie = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    setIsLoggingOut(false);
    sessionStorage.removeItem('wasLoggedOut');

    // HttpOnly 쿠키는 JavaScript에서 읽을 수 없으므로, /jwt/exchange API를 통해 토큰을 받아야 합니다.
    console.log('🔍 [loginWithCookie] HttpOnly 쿠키에서 토큰을 받기 위해 /jwt/exchange 호출...');
    let accessToken = null;

    try {
      const res = await client.post('/jwt/exchange', {}, { withCredentials: true });
      accessToken = res.data.accessToken || res.data.access;
      console.log(
        '✅ [loginWithCookie] /jwt/exchange 성공:',
        accessToken ? '토큰 받음' : '토큰 없음',
      );
    } catch (error) {
      console.error('❌ [loginWithCookie] /jwt/exchange 실패:', error);
      throw new Error('토큰을 가져올 수 없습니다.');
    }

    // accessToken이 있으면 localStorage에 저장 (API 호출 시 쿠키에서 읽지만, 일관성을 위해 저장)
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      console.log('✅ [loginWithCookie] accessToken localStorage에 저장 완료');
    }
    localStorage.setItem('isSocialLogin', 'true');

    await setUserFromApi(true);

    queryClient.invalidateQueries();
  }, [setUserFromApi]);

  /** 로그아웃 */
  const logout = async () => {
    if (typeof window === 'undefined') {
      return;
    }

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
