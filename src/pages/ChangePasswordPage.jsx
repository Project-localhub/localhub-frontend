import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../shared/api/auth';
import { useAuth } from '../context/AuthContext';

const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { mustChangePassword } = useAuth();

  useEffect(() => {
    if (!mustChangePassword) {
      navigate('/', { replace: true });
    }
  }, [mustChangePassword]);

  const handleChangePassword = async () => {
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다');
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword: password,
      });

      alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
      navigate('/login', { replace: true });
    } catch {
      alert('비밀번호 변경 실패');
    }
  };

  return (
    <div className="flex flex-col h-screen justify-center px-6">
      <h1 className="text-xl font-semibold mb-6 text-center">비밀번호 변경</h1>

      <input
        type="password"
        placeholder="현재 비밀번호"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="mb-3 px-4 py-3 border rounded-lg"
      />

      <input
        type="password"
        placeholder="새 비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-3 px-4 py-3 border rounded-lg"
      />

      <input
        type="password"
        placeholder="새 비밀번호 확인"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="mb-4 px-4 py-3 border rounded-lg"
      />

      <button onClick={handleChangePassword} className="py-3 bg-blue-600 text-white rounded-lg">
        변경하기
      </button>
    </div>
  );
};

export default ChangePasswordPage;
