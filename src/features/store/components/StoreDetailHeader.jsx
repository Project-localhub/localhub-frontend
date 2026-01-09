import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';
import ImageWithFallback from '@/components/figma/imageWithFallback';

const StoreDetailHeader = ({ store, isFavorite, onToggleFavorite, isPending }) => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <ImageWithFallback
        src={store.image}
        alt={store.name}
        className="w-full h-64 object-cover"
      />
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md"
      >
        <ArrowLeft size={20} />
      </button>
      <div className="absolute top-4 right-4 flex gap-2">
        <button className="p-2 bg-white rounded-full shadow-md">
          <Share2 size={20} />
        </button>
        <button
          onClick={onToggleFavorite}
          className="p-2 bg-white rounded-full shadow-md"
          disabled={isPending}
        >
          <Heart
            size={20}
            className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}
          />
        </button>
      </div>
    </div>
  );
};

export default StoreDetailHeader;

