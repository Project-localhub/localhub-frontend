import { Star, MapPin, Clock, Phone } from 'lucide-react';
import PropTypes from 'prop-types';

const StoreDetailInfo = ({ store }) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-1 bg-blue-600 text-white rounded text-sm">
              {store.category}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star size={18} className="fill-yellow-400 text-yellow-400" />
              <span>{store.rating.toFixed(1)}</span>
            </div>
            <span className="text-gray-500 text-sm">리뷰 {store.reviewCount}</span>
            <span className="text-gray-500 text-sm">찜 {store.favoriteCount}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {store.tags.map((tag, index) => (
          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
            #{tag}
          </span>
        ))}
      </div>
      <p className="text-gray-700 mb-3">{store.description}</p>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={16} />
          {store.address}
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={16} />
          {store.hours}
          {store.hasBreakTime && store.breakStartTime && store.breakEndTime && (
            <span className="ml-1">
              (브레이크타임 {store.breakStartTime}-{store.breakEndTime})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Phone size={16} />
          {store.phone}
        </div>
      </div>
    </div>
  );
};

StoreDetailInfo.propTypes = {
  store: PropTypes.shape({
    category: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    reviewCount: PropTypes.number.isRequired,
    favoriteCount: PropTypes.number.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    description: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    hours: PropTypes.string.isRequired,
    hasBreakTime: PropTypes.bool,
    breakStartTime: PropTypes.string,
    breakEndTime: PropTypes.string,
    phone: PropTypes.string.isRequired,
  }).isRequired,
};

export default StoreDetailInfo;
