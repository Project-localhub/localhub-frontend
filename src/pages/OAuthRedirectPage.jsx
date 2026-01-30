import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthRedirectPage = () => {
  const navigate = useNavigate();
  const { loginWithCookie } = useAuth();

  useEffect(() => {
    loginWithCookie()
      .then(() => {
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      })
      .catch((error) => {
        alert(`소셜 로그인 처리 중 오류가 발생했습니다.\n${error.message || '알 수 없는 오류'}`);
        navigate('/login');
      });
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
