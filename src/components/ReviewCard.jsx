/* eslint-disable react/prop-types */
import { Star } from 'lucide-react';

const ReviewCard = ({ review }) => {
  const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString('ko-KR') : '';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-white">{review.username?.[0]?.toUpperCase() ?? '?'}</span>
          </div>
          <div>
            <div className="text-gray-900">{review.username}</div>
            <div className="text-gray-500 text-sm">{date}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star size={16} className="fill-yellow-400 text-yellow-400" />
          <span className="text-gray-900">{review.score}</span>
        </div>
      </div>
      <p className="text-gray-700">{review.content}</p>
    </div>
  );
};

export default ReviewCard;
