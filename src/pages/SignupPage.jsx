import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { signUp } from '../shared/api/auth';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    userType: 'CUSTOMER',
  });

  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handlePasswordBlur = () => {
    if (formData.password === '') return;
    if (formData.password.length < 8) {
      setPasswordError('비밀번호는 8글자 이상입니다');
      return;
    }
    setPasswordError('');
  };

  const handleConfirmPasswordBlur = () => {
    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다');
      return;
    }
    setConfirmPasswordError('');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다');
      return;
    }
    try {
      await signUp({
        username: formData.email,
        password: formData.password,
        phone: formData.phone,
        userType: formData.userType.toUpperCase(),
      });
      alert('회원가입 완료');
      navigate('/login');
    } catch (err) {
      console.error('회원가입 에러 전체:', err); // err 객체 전체 확인
      if (err.response) {
        console.error('백엔드 응답 데이터:', err.response.data);
        alert('회원가입 실패: ' + JSON.stringify(err.response.data));
      } else {
        alert('회원가입 실패: 서버 연결 문제 또는 네트워크 오류');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white w-full max-w-md mx-auto shadow-lg">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <span className="text-gray-900">회원가입</span>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="w-full max-w-sm mx-auto">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <div className="block text-gray-700 mb-2">회원 유형</div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'customer' })}
                  className={`py-3 rounded-lg border ${
                    formData.userType === 'customer'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  일반 회원
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'owner' })}
                  className={`py-3 rounded-lg border ${
                    formData.userType === 'owner'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  사업자 회원
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-gray-700 mb-2">
                이름
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="이름을 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="이메일을 입력하세요"
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
                onBlur={handlePasswordBlur}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-600"
                required
              />
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                onBlur={handleConfirmPasswordBlur}
                placeholder="비밀번호를 다시 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-600"
                required
              />
              {confirmPasswordError && (
                <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-gray-700 mb-2">
                전화번호
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="전화번호를 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-600"
                required
              />
            </div>

            <div className="space-y-3 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" required />
                <span className="text-gray-700 text-sm">(필수) 서비스 이용약관 동의</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" required />
                <span className="text-gray-700 text-sm">(필수) 개인정보 수집 및 이용 동의</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-gray-700 text-sm">(선택) 마케팅 정보 수신 동의</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-6"
            >
              회원가입
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
