/* eslint-disable react/prop-types */
import { Star } from 'lucide-react';

const ReviewCard = ({ review }) => {
  console.log('review:', review);
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-white">{review.userName?.[0] ?? '?'}</span>
          </div>
          <div>
            <div className="text-gray-900">{review.userName}</div>
            <div className="text-gray-500 text-sm">{review.date}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star size={16} className="fill-yellow-400 text-yellow-400" />
          <span className="text-gray-900">{review.score}</span>
        </div>
      </div>
      <p className="text-gray-700">{review.content}</p>
      {review.images?.length > 0 && (
        <div className="flex gap-2 mt-3">
          {review.images?.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review ${index + 1}`}
              className="w-20 h-20 object-cover rounded"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
