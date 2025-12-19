import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { findUsername, verifyEmailCode } from '../shared/api/auth';

const FindUserPage = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  //인증코드 전송
  const handleSendCode = async () => {
    await sendEMailCode(email);
    alert('인증코드를 발송했습니다');
    setStep(2);
  };
  //인증코드 검증
  const handleVerifyCode = async () => {
    await verifyEmailCode(email, code);
    alert('이메일 전송 완료');
    setStep(3);
  };
  //아이디 찾기
  const handleFind = async (e) => {
    e.preventDefault();
    try {
      const res = await findUsername(email);
      alert(`아이디는 ${res.data.username}`);
      navigate('/login');
    } catch (err) {
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
            아이디 찾기
          </button>
        )}
      </form>
    </div>
  );
};
export default FindUserPage;
