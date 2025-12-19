import Layout from '@/components/Layout';
import StoreCard from '@/components/StoreCard';
import { useFavorites } from '../context/FavoritesContext';

const { favorites } = useFavorites();

const FavoritesPage = () => {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="mb-2">찜한 가게</div>
        <div className="text-gray-600 text-sm">
          총 <span className="text-blue-600">{favorites.length}</span>개
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {favorites.length > 0 ? (
          <div className="space-y-3">
            {favorites.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-gray-400 mb-2">찜한 가게가 없습니다</div>
            <p className="text-gray-500 text-sm">마음에 드는 가게를 찜해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
