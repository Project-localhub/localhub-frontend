import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { findPassword, sendEmailCode, verifyEmailCode } from '../shared/api/auth';

const FindPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1); // 1: 코드 전송, 2: 코드 검증, 3: 임시 비밀번호 발급
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 1️⃣ 인증코드 전송
  const handleSendCode = async () => {
    if (!email) {
      alert('이메일을 입력해주세요');
      return;
    }
    try {
      setLoading(true);
      await sendEmailCode(email);
      alert('인증코드를 발송했습니다');
      setStep(2);
    } catch (e) {
      alert('이메일 전송 실패: ' + (e.response?.data?.message ?? ''));
    } finally {
      setLoading(false);
    }
  };

  // 2️⃣ 인증코드 검증
  const handleVerifyCode = async () => {
    if (!code) {
      alert('인증코드를 입력해주세요');
      return;
    }
    try {
      setLoading(true);
      await verifyEmailCode(email, code);

      // 🔥 서버 인증 상태 반영 대기
      await new Promise((resolve) => setTimeout(resolve, 300));

      alert('인증 성공');
      setStep(3);
    } catch (e) {
      alert('인증 실패: ' + (e.response?.data?.message ?? ''));
    } finally {
      setLoading(false);
    }
  };

  // 3️⃣ 임시 비밀번호 발급
  const handleFindPassword = async () => {
    try {
      setLoading(true);
      await findPassword(email);
      alert('임시 비밀번호가 이메일로 발송되었습니다');
      navigate('/login');
    } catch (e) {
      alert('비밀번호 재설정 실패: ' + (e.response?.data?.message ?? ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white px-6 justify-center">
      <h1 className="text-xl font-semibold mb-6 text-center">비밀번호 찾기</h1>

      {/* ❌ form submit 안 쓰고 버튼 type="button"만 사용 */}
      <div className="space-y-4">
        {/* 이메일 입력 */}
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
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
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
            />
            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              인증코드 확인
            </button>
          </>
        )}

        {/* 3️⃣ 임시 비밀번호 발급 */}
        {step === 3 && (
          <button
            type="button"
            onClick={handleFindPassword}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            임시 비밀번호 발급
          </button>
        )}
      </div>
    </div>
  );
};

export default FindPasswordPage;
