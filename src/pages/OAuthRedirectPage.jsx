import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthRedirectPage = () => {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const token = params.get('token');

    let hashToken = null;
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      hashToken = hashParams.get('access_token') || hashParams.get('accessToken');
    }

    const finalToken = accessToken || token || hashToken;

    if (!finalToken) {
      alert('소셜 로그인 실패: 토큰을 받지 못했습니다.');
      navigate('/login');
      return;
    }

    loginWithToken(finalToken)
      .then(() => {
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      })
      .catch((error) => {
        alert(`소셜 로그인 처리 중 오류가 발생했습니다.\n${error.message || '알 수 없는 오류'}`);
        navigate('/login');
      });
  }, [navigate, loginWithToken]);

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
