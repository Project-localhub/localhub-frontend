import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserInfo, saveReview } from '../shared/api/auth';

const ReviewWritePage = () => {
  const [score, setScore] = useState(0);
  const [content, setContent] = useState('');
  const [writer, setWriter] = useState('');

  const { restaurantId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserInfo();
        setWriter(res.data.name);
      } catch {
        // 사용자 정보 조회 실패 시 무시
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!restaurantId) {
      alert('식당 정보가 올바르지 않습니다.');
      return;
    }

    if (score === 0) {
      alert('별점을 선택해주세요.');
      return;
    }

    if (!content.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }

    const payload = {
      restaurantId: Number(restaurantId),
      score: Number(score),
      content: content,
    };

    try {
      await saveReview(payload);
      alert('리뷰가 등록되었습니다!');
      navigate(-1); // ⭐ 이전 페이지로 이동
    } catch {
      alert('리뷰 등록 실패!');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-6">
      <h1 className="text-xl font-semibold mb-6 text-center">리뷰 작성</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 작성자 */}
        <input
          type="text"
          value={writer}
          disabled
          className="w-full px-4 py-3 border rounded-lg bg-gray-100"
        />

        {/* 별점 */}
        <div className="flex items-center justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setScore(value)}
              className={`text-3xl ${value <= score ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </button>
          ))}
        </div>

        {/* 리뷰 내용 */}
        <textarea
          placeholder="리뷰 내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg h-40 resize-none"
          required
        />

        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg">
          리뷰 등록
        </button>
      </form>
    </div>
  );
};

export default ReviewWritePage;
