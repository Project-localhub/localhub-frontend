import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Home,
  MessageCircle,
  Heart,
  LayoutDashboard,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLogin, logout, isInitializing, updateUserType } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUserTypeDropdownOpen, setIsUserTypeDropdownOpen] = useState(false);
  const [isChangingUserType, setIsChangingUserType] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    const confirmed = window.confirm('로그아웃 하시겠습니까?');
    if (!confirmed) return;

    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('로그아웃 처리 중 오류:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  const handleUserTypeChange = async (newUserType) => {
    if (isChangingUserType || user?.userType === newUserType) {
      setIsUserTypeDropdownOpen(false);
      return;
    }

    const confirmed = window.confirm(
      `${newUserType === 'OWNER' ? '사업자' : '일반 사용자'} 모드로 전환하시겠습니까?`,
    );
    if (!confirmed) {
      setIsUserTypeDropdownOpen(false);
      return;
    }

    setIsChangingUserType(true);
    try {
      await updateUserType(newUserType);
      alert('회원 유형이 변경되었습니다.');
      setIsUserTypeDropdownOpen(false);
    } catch (error) {
      console.error('회원 유형 변경 오류:', error);
      const errorMessage =
        error.response?.status === 401
          ? '인증이 필요합니다. 다시 로그인해주세요.'
          : error.message || '회원 유형 변경에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setIsChangingUserType(false);
    }
  };

  const getUserTypeLabel = (userType) => {
    return userType === 'OWNER' ? '사업자' : '일반';
  };

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
            <div className="relative">
              {!user?.isSocialLogin ? (
                <button
                  onClick={() => setIsUserTypeDropdownOpen(!isUserTypeDropdownOpen)}
                  disabled={isChangingUserType}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="회원 유형 변경"
                >
                  <span className="text-gray-900 font-medium text-sm">
                    {user?.name ?? ''}님 ({getUserTypeLabel(user?.userType)})
                  </span>
                  <ChevronDown size={16} className="text-gray-600" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    alert(
                      '회원 유형 변경 기능은 로컬 로그인(아이디/비밀번호)으로 로그인한 경우에만 이용 가능합니다.\n\n로컬 로그인으로 다시 로그인해주세요.',
                    );
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  title="회원 유형 변경 (로컬 로그인 필요)"
                >
                  <span className="text-gray-900 font-medium text-sm">
                    {user?.name ?? ''}님 ({getUserTypeLabel(user?.userType)})
                  </span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
              )}

              {isUserTypeDropdownOpen && !user?.isSocialLogin && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10"
                    onClick={() => setIsUserTypeDropdownOpen(false)}
                    aria-label="드롭다운 닫기"
                  />
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <div className="py-1">
                      <button
                        onClick={() => handleUserTypeChange('CUSTOMER')}
                        disabled={isChangingUserType || user?.userType === 'CUSTOMER'}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          user?.userType === 'CUSTOMER'
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        일반 사용자
                      </button>
                      <button
                        onClick={() => handleUserTypeChange('OWNER')}
                        disabled={isChangingUserType || user?.userType === 'OWNER'}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          user?.userType === 'OWNER'
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        사업자
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
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
