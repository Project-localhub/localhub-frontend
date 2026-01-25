import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getUserInfo } from '../shared/api/auth';

const ProtectedRoute = ({ children }) => {
  const [isLogin, setIsLogin] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        await getUserInfo();
        setIsLogin(true);
      } catch {
        setIsLogin(false);
      }
    };
    checkLogin();
  }, []);

  // null 동안은 렌더링 안함
  if (isLogin === null) return null;

  // 로그인 안 되어있으면 → 로그인 페이지
  if (isLogin === false) return <Navigate to="/login" replace />;

  // 로그인 되어있으면 콘텐츠 출력
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
