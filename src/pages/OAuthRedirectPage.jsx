import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const OAuthRedirectPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');

    if (!accessToken) {
      navigate('/login');
      return;
    }

    login(accessToken).then(() => {
      navigate('/select-user-type');
    });
  }, [navigate, login]);

  return <div>로그인 처리 중...</div>;
};

export default OAuthRedirectPage;
