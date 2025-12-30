import { useEffect, useState } from 'react';
import { deleteFavorite, getLikeList } from '../shared/api/auth';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const res = await getLikeList();
    setFavorites(res.data);
  };

  // ⭐ 삭제 처리
  const handleDelete = async (id) => {
    try {
      await deleteFavorite(id);
      setFavorites((prev) => prev.filter((item) => item.id !== id)); // UI 즉시 반영
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  };

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
              <StoreCard
                key={store.id}
                store={store}
                onDelete={handleDelete} // ⭐ 여기에서 삭제 함수 전달
              />
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
