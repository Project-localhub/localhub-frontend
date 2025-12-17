import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthRedirectPage = () => {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');

    if (!accessToken) {
      alert('소셜 로그인 실패');
      navigate('/login');
      return;
    }

    loginWithToken(accessToken).then(() => {
      navigate('/');
    });
  }, []);

  return <div>로그인 처리 중...</div>;
};

export default OAuthRedirectPage;
