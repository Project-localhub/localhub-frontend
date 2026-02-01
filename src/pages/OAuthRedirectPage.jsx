import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const OAuthRedirectPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();

  const accessToken = searchParams.get('accessToken');

  useEffect(() => {
    if (!accessToken) {
      alert('로그인에 실패했습니다.');
      navigate('/login', { replace: true });
      return;
    }

    loginWithToken(accessToken)
      .then(() => {
        navigate('/', { replace: true });
      })
      .catch((error) => {
        alert(`소셜 로그인 처리 중 오류가 발생했습니다.\n${error.message}`);
        navigate('/login', { replace: true });
      });
  }, [accessToken, loginWithToken, navigate]);

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
