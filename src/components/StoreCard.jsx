import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StoreCard = ({ store }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/store/${store.id}`)}
      className="bg-white rounded-lg shadow p-3 flex gap-3 cursor-pointer"
    >
      <img
        src={store.image || '/no-image.png'}
        alt={store.name}
        className="w-20 h-20 rounded object-cover"
      />

      <div className="flex-1">
        <div className="flex justify-between">
          <h3 className="font-semibold">{store.name}</h3>
          <Heart
            size={18}
            className={store.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'}
          />
        </div>

        <p className="text-sm text-gray-500">{store.category}</p>
        <p className="text-sm text-gray-600">
          ⭐ {store.rating} · 리뷰 {store.reviewCount}
        </p>
        <p className="text-xs text-gray-400">{store.distance}</p>
      </div>
    </div>
  );
};

export default StoreCard;
