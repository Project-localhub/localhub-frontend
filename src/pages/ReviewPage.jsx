import React, { useEffect, useState } from 'react';
import { getUserInfo, saveReview } from '../shared/api/auth';
import { useParams, useNavigate } from 'react-router-dom';

const ReviewWritePage = () => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [writer, setWriter] = useState('');

  const { id: restaurantId } = useParams(); // ⭐ URL에서 식당 ID 가져오기
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await getUserInfo();
      setWriter(res.data.name);
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await saveReview(restaurantId, content);

      alert('리뷰가 등록되었습니다!');
      navigate(-1); // ⭐ 이전 페이지로 이동
    } catch (err) {
      console.error(err);
      alert('리뷰 등록 실패!');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-6">
      <h1 className="text-xl font-semibold mb-6 text-center">리뷰 작성</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 로그인 유저 이름 */}
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
              onClick={() => setRating(value)}
              className={`text-3xl ${value <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
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
