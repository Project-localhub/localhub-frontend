import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Home, MessageCircle, Heart, LayoutDashboard, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLogin, logout, isInitializing } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    const confirmed = window.confirm('로그아웃 하시겠습니까?');
    if (!confirmed) return;

    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      alert('로그아웃 중 오류가 발생했습니다.');
    } finally {
      setIsLoggingOut(false);
    }
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

        {isInitializing ? (
          <div className="w-20 h-8" />
        ) : isLogin && user ? (
          <div className="flex items-center gap-2">
            <span className="text-gray-900 font-medium text-sm">{user?.name ?? ''}님</span>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="로그아웃"
            >
              <LogOut size={16} />
              <span className="text-sm">{isLoggingOut ? '로그아웃 중...' : '로그아웃'}</span>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            title="로그인"
          >
            <User size={20} />
          </Link>
        )}
      </header>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

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
