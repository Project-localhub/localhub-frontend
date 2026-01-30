import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const OAuthRedirectPage = () => {
  const navigate = useNavigate();
  const { loginWithCookie } = useAuth();

  useEffect(() => {
    const init = async () => {
      try {
        await loginWithCookie();
        navigate('/', { replace: true });
      } catch (error) {
        console.error('OAuth 처리 실패:', error);
        navigate('/login', { replace: true });
      }
    };

    init();
  }, [navigate, loginWithCookie]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="text-lg font-medium mb-2">로그인 처리 중...</div>
        <div className="text-sm text-gray-500">잠시만 기다려주세요</div>
      </div>
    </div>
  );
};

export default OAuthRedirectPage;
