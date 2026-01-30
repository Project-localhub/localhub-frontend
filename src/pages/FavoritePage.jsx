import StoreCard from '@/components/StoreCard';
import { useMyFavorites } from '@/features/favorite/hooks/useFavoriteQueries';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

const FavoritesPage = () => {
  const { isLogin } = useAuth();
  const { data: favorites = [], isLoading } = useMyFavorites();

  if (!isLogin) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="text-gray-400 mb-4">로그인이 필요한 서비스입니다</div>
        <Link
          to="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

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
