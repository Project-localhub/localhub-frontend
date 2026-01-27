import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { findUsername, sendEmailCode, verifyEmailCode } from '../shared/api/auth';

const FindUserPage = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  //인증코드 전송
  const handleSendCode = async () => {
    try {
      await sendEmailCode(email);
      alert('인증코드를 발송했습니다');
      setStep(2);
    } catch (e) {
      alert('이메일 전송 실패: ' + (e.response?.data?.message ?? ''));
    }
  };

  //인증코드 검증
  const handleVerifyCode = async () => {
    try {
      await verifyEmailCode(email, code);
      alert('인증 성공');
      setStep(3);
    } catch (e) {
      alert('인증 실패: ' + (e.response?.data?.message ?? ''));
    }
  };

  //아이디 찾기
  const handleFind = async (e) => {
    e.preventDefault();
    try {
      const res = await findUsername(email);
      alert(`아이디는 ${res.data}`);
      navigate('/login');
    } catch {
      alert('아이디 찾기에 실패했습니다');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white px-6 justify-center">
      <h1 className="text-xl font-semibold mb-6 text-center">아이디 찾기</h1>

      <form onSubmit={handleFind} className="space-y-4">
        {/* 이메일 입력 (모든 단계 공통) */}
        <input
          type="email"
          placeholder="가입한 이메일 입력"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg"
          required
          disabled={step > 1}
        />

        {/* 1️⃣ 인증코드 전송 */}
        {step === 1 && (
          <button
            type="button"
            onClick={handleSendCode}
            className="w-full py-3 bg-blue-600 text-white rounded-lg"
          >
            인증코드 전송
          </button>
        )}

        {/* 2️⃣ 인증코드 입력 */}
        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="인증코드 입력"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
              required
            />
            <button
              type="button"
              onClick={handleVerifyCode}
              className="w-full py-3 bg-blue-600 text-white rounded-lg"
            >
              인증코드 확인
            </button>
          </>
        )}

        {/* 3️⃣ 아이디 찾기 */}
        {step === 3 && (
          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg">
            아이디 전송
          </button>
        )}
      </form>
    </div>
  );
};
export default FindUserPage;
