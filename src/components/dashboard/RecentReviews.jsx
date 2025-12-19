import { Star } from 'lucide-react';
import PropTypes from 'prop-types';

const RecentReviews = ({ reviews }) => {
  return (
    <div className="mx-4 mb-4 bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-900">최근 리뷰</span>
        <button className="text-blue-600 text-sm">전체보기</button>
      </div>
      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="pb-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-900">{review.userName}</span>
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-900">{review.rating}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{review.content}</p>
              <span className="text-gray-500 text-xs">{review.date}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 text-sm">리뷰가 없습니다</div>
      )}
    </div>
  );
};

RecentReviews.propTypes = {
  reviews: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      userName: PropTypes.string.isRequired,
      rating: PropTypes.number.isRequired,
      content: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default RecentReviews;
