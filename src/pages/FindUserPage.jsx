import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { findUsername, sendEmailCode, verifyEmailCode } from '../shared/api/auth';

const FindUserPage = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1); // 1: 전송, 2: 검증, 3: 아이디 찾기
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
      alert(e.response?.data?.message ?? '이메일 전송에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 2️⃣ 인증코드 검증 (🔥 딜레이 추가됨)
  const handleVerifyCode = async () => {
    if (!code) {
      alert('인증코드를 입력해주세요');
      return;
    }

    try {
      setLoading(true);
      await verifyEmailCode(email, code);

      // 🔥 서버 인증 상태 반영 대기 (핵심)
      await new Promise((resolve) => setTimeout(resolve, 300));

      alert('이메일 인증이 완료되었습니다');
      setStep(3);
    } catch (e) {
      alert(e.response?.data?.message ?? '인증에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 3️⃣ 아이디 찾기
  const handleFind = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await findUsername(email);
      console.log('findUsername 응답:', res.data);

      const username =
        typeof res.data === 'string' ? res.data : (res.data?.username ?? res.data?.data);

      if (!username) {
        alert('아이디를 찾을 수 없습니다');
        return;
      }

      alert(`회원님의 아이디가 이메일로 전송되었습니다`);
      navigate('/login');
    } catch (e) {
      alert(e.response?.data?.message ?? '아이디 찾기에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white px-6 justify-center">
      <h1 className="text-xl font-semibold mb-6 text-center">아이디 찾기</h1>

      <form onSubmit={handleFind} className="space-y-4">
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

        {step === 3 && (
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            아이디 확인
          </button>
        )}
      </form>
    </div>
  );
};

export default FindUserPage;
