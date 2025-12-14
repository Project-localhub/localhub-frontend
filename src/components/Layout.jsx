import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Home, MessageCircle, Heart, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLogin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col h-screen bg-gray-50 w-full max-w-md mx-auto shadow-lg">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white">L</span>
          </div>
          <span className="text-blue-600">LocalHub</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-2">
            <span>{user.name}님</span>
            <button
              onClick={handleLogout}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <Link to="/login" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <User size={20} />
          </Link>
        )}
      </header>

      {/* 페이지 콘텐츠 */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* 하단 네비게이션 */}
      <nav className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-around">
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${
            isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
          }`}
        >
          <Home size={24} />
          <span className="text-xs">홈</span>
        </Link>
        <Link
          to="/chat"
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${
            isActive('/chat') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
          }`}
        >
          <MessageCircle size={24} />
          <span className="text-xs">채팅</span>
        </Link>
        <Link
          to="/favorites"
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${
            isActive('/favorites') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
          }`}
        >
          <Heart size={24} />
          <span className="text-xs">찜</span>
        </Link>
        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${
            isActive('/dashboard') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
          }`}
        >
          <LayoutDashboard size={24} />
          <span className="text-xs">대시보드</span>
        </Link>
      </nav>
    </div>
  );
};

export default Layout;
