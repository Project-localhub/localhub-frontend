import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getUserInfo, logout as logoutAPI, changeUserType } from '../shared/api/auth';
import { queryClient } from '../app/queryClient';
import { kakaoLogout } from '../shared/lib/kakao';
import { createContext, useContext, useEffect, useState } from 'react';
import { getUserInfo } from '../shared/api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const setUserFromApi = useCallback(
    async (forceSocialLogin = null) => {
      if (isLoggingOut) {
        return;
      }

      const res = await getUserInfo();
      const userData = res.data;

      if (!userData) {
        throw new Error('사용자 정보를 가져올 수 없습니다.');
      }

      if (isLoggingOut) {
        return;
      }

      // 소셜 로그인 여부 확인
      // forceSocialLogin이 명시적으로 전달된 경우 그 값을 사용
      // 그렇지 않으면 API 응답의 provider/isSocialLogin 필드를 우선 확인
      // API 응답에 없으면 localStorage 확인
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
      } else {
        try {
          await setUserFromApi(isSocialLogin);
        } catch {
          // 쿠키도 없으면 로그인 안 된 상태
          localStorage.removeItem('isSocialLogin');
        }
      }

      setIsInitializing(false);
    };

    initializeAuth();
  }, [setUserFromApi, isLoggingOut]);
  const [loading, setLoading] = useState(true);

  const login = async (accessToken) => {
    // 로그인 시 로그아웃 플래그 해제
    setIsLoggingOut(false);
    sessionStorage.removeItem('wasLoggedOut');

    // 일반 로그인은 소셜 로그인 플래그 제거
    localStorage.removeItem('isSocialLogin');

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }

    // 일반 로그인으로 명시적으로 설정
    await setUserFromApi(false);
  };

  const loginWithCookie = async () => {
    // 쿠키 로그인은 localStorage의 isSocialLogin 값을 확인
    // 없으면 일반 로그인으로 간주
    const isSocialLogin = localStorage.getItem('isSocialLogin') === 'true';
    await setUserFromApi(isSocialLogin);
  };

  const logout = async () => {
    setIsLoggingOut(true);
    sessionStorage.setItem('wasLoggedOut', 'true');

    try {
      try {
        await kakaoLogout();
      } catch {
        // 카카오 로그아웃 실패해도 계속 진행
      }

      await logoutAPI();
    } catch {
      // 백엔드 로그아웃 실패해도 프론트엔드에서는 로그아웃 처리
    } finally {
      setUser(null);
      setIsLogin(false);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('isSocialLogin');
      queryClient.clear();
    }
  };

  const loginWithToken = async (accessToken) => {
    if (!accessToken) {
      throw new Error('accessToken이 필요합니다.');
    }

    // 로그인 시 로그아웃 플래그 해제
    setIsLoggingOut(false);
    sessionStorage.removeItem('wasLoggedOut');

    // 소셜 로그인 플래그 설정 (OAuthRedirectPage에서 호출)
    localStorage.setItem('isSocialLogin', 'true');
    localStorage.setItem('accessToken', accessToken);

    try {
      // 소셜 로그인으로 명시적으로 설정
      await setUserFromApi(true);
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('isSocialLogin');
      throw error;
    }
  };

  const updateUserType = async (newUserType) => {
    await changeUserType(newUserType);
    // user 객체의 isSocialLogin 값을 유지
    const currentIsSocialLogin = user?.isSocialLogin ?? false;
    await setUserFromApi(currentIsSocialLogin);
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
    <AuthContext.Provider
      value={{
        user,
        isLogin,
        login,
        logout,
        loginWithToken,
        loginWithCookie,
        isInitializing,
        updateUserType,
      }}
    >
    <AuthContext.Provider value={{ user, isLogin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
