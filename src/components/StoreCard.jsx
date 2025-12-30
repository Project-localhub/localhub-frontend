/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom';
import { Star, Heart, MapPin } from 'lucide-react';
import ImageWithFallback from '@/components/figma/imageWithFallback';
import { useFavorites } from '../context/FavoritesContext';
import { toggleLike } from '../shared/api/auth';

const StoreCard = ({ store, onDelete, onRefresh }) => {
  const favorite = store.isLiked;

  const favoriteButtonHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (favorite) {
        await deleteFavorite(store.id);
      } else {
        await toggleLike(store.id);
      }

      // 부모 컴포넌트에서 새로 불러오게
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Link
      to={`/store/${store.id}`}
      className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative">
        <ImageWithFallback
          src={store.image}
          alt={store.name}
          className="w-full h-48 object-cover"
        />

        <button
          onClick={favoriteButtonHandler}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md"
        >
          <Heart size={20} className={favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
        </button>

        <div className="absolute bottom-2 left-2 px-2 py-1 bg-white rounded-full text-xs flex items-center gap-1">
          <MapPin size={12} className="text-blue-600" />
          {store.distance}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
              {store.category}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Star size={16} className="fill-yellow-400 text-yellow-400" />
            <span className="text-gray-900">{store.rating}</span>
            <span className="text-gray-500 text-sm">({store.reviewCount})</span>
          </div>
        </div>

        <div className="mb-2 text-gray-900">{store.name}</div>

        <div className="flex flex-wrap gap-1">
          {store.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default StoreCard;
