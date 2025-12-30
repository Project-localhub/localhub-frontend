import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { login as loginAPI } from '../shared/api/auth';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    const data = {
      username: formData.username,
      password: formData.password,
    };

    try {
      const res = await loginAPI(data);
      const accessToken = res.accessToken;

      // 디버깅: 로그인 응답 확인
      if (import.meta.env.DEV) {
        console.log('🔐 로그인 응답:', {
          hasAccessToken: !!accessToken,
          accessTokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : '없음',
          fullResponse: res,
        });
      }

      if (!accessToken) {
        alert('로그인 실패: 서버에서 accessToken을 주지 않음');
        return;
      }

      await login(accessToken);
      navigate('/');
    } catch (error) {
      console.error('로그인 에러:', error);
      alert('로그인 실패');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`;
  };

  const handleKakaoLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/kakao`;
  };

  const findButtonHandler = () => {
    navigate('/findUser');
  };

  return (
    <div className="flex flex-col h-screen bg-white w-full max-w-md mx-auto shadow-lg">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <span className="text-gray-900">로그인</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-3">
              <span className="text-white text-2xl">L</span>
            </div>
            <div className="text-2xl text-blue-600 mb-2">LocalHub</div>
            <p className="text-gray-600 text-sm text-center">
              지역 기반 실시간 커뮤니티 & 소상공인 홍보 서비스
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-gray-700 mb-2">
                아이디
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="아이디를 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-600"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              로그인
            </button>
          </form>

          <div className="flex items-center justify-center gap-4 mt-6 text-sm">
            <div className="flex flex-row gap-2">
              <button onClick={findButtonHandler} className="text-gray-600">
                아이디 찾기
              </button>
              <span>/</span>
              <button className="text-gray-600">비밀번호 찾기</button>
            </div>
            <span className="text-gray-300">|</span>
            <Link to="/signup" className="text-blue-600">
              회원가입
            </Link>
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-gray-500 text-sm">또는</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleKakaoLogin}
              className="w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
            >
              <span className="text-gray-900">카카오로 시작하기</span>
            </button>
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
            >
              <span className="text-gray-900">구글로 시작하기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
