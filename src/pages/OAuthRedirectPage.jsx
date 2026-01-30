import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const OAuthRedirectPage = () => {
  const navigate = useNavigate();
  const { loginWithCookie } = useAuth();

  useEffect(() => {
    const init = async () => {
      try {
        // 쿠키에 access 토큰 있음 → 이 API 성공
        await loginWithCookie();
        navigate('/', { replace: true });
      } catch {
        navigate('/login', { replace: true });
      }
    };

    init();
  }, []);

  return <div>로그인 처리중...</div>;
};

export default OAuthRedirectPage;
