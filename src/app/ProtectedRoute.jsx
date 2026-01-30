import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredUserType }) => {
  const { isLogin, isInitializing, user } = useAuth();

  if (typeof window === 'undefined' || isInitializing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }

  if (requiredUserType) {
    const userTypeUpper = user?.userType?.toUpperCase();
    const requiredTypeUpper = requiredUserType.toUpperCase();
    if (userTypeUpper !== requiredTypeUpper) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredUserType: PropTypes.string,
};

export default ProtectedRoute;
