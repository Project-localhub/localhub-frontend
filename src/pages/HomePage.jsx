import { useState } from 'react';
import StoreCard from '@/components/StoreCard';
import MapView from '@/components/MapView';
import { Search, Filter, MapPin } from 'lucide-react';
import { useAllRestaurants } from '@/shared/hooks/useStoreQueries';
import { useMyFavorites } from '@/shared/hooks/useFavoriteQueries';

const HomePage = () => {
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('강남구');
  const [stores, setStores] = useState([]);
  const loadStores = async () => {
    const { lat, lng } = await getCurrentLocation();

    const res = await getRestaurantList({
      region,
      lat,
      lng,
    });

    setStores(res.data.content);
  };

  const { data: restaurantsData, isLoading } = useAllRestaurants();
  const { data: myFavorites = [] } = useMyFavorites();

  // 찜한 가게 ID Set 생성 (빠른 조회를 위해)
  const favoriteIds = new Set(myFavorites.map((fav) => fav.id || fav.restaurantId));

  const stores =
    restaurantsData?.content?.map((restaurant) => ({
      id: restaurant.restaurantId,
      name: restaurant.name,
      category: restaurant.category,
      rating: restaurant.score || 0,
      reviewCount: restaurant.reviewCount || 0,
      distance: '0.0km',
      image: restaurant.imageUrl || '',
      tags: restaurant.keyword || [],
      isLiked: favoriteIds.has(restaurant.restaurantId),
    })) || [];

  return (
    <div className="flex flex-col h-full">
      {/* 검색창 */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
          <Search size={20} className="text-gray-500" />
          <input
            type="text"
            placeholder="가게 이름, 카테고리 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none"
          />
          <button className="text-gray-600">
            <Filter size={20} />
          </button>
        </div>

        {/* 지역 + 카테고리 */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setSelectedRegion('강남구')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
              selectedRegion === '강남구'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <MapPin size={14} />
            강남구
          </button>

          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">한식</button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">카페</button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            베이커리
          </button>
        </div>
      </div>

      {/* 리스트/지도 스위치 */}
      <div className="bg-white px-4 py-2 border-b border-gray-200 flex gap-2">
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 py-2 rounded-lg ${
            viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          리스트
        </button>
        <button
          onClick={() => setViewMode('map')}
          className={`flex-1 py-2 rounded-lg ${
            viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          지도
        </button>
      </div>

      {/* 리스트 or 지도 */}
      {viewMode === 'list' ? (
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">로딩 중...</div>
            </div>
          ) : (
            <>
              <div className="mb-3 text-gray-600">
                주변 가게{' '}
                <span className="text-blue-600">
                  {restaurantsData?.totalElements || stores.length}
                </span>
                개
              </div>
              {stores.length > 0 ? (
                <div className="space-y-3">
                  {stores.map((store) => (
                    <StoreCard key={store.id} store={store} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-gray-400 mb-2">등록된 가게가 없습니다</div>
                  <p className="text-gray-500 text-sm">첫 번째 가게를 등록해보세요!</p>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <MapView stores={stores} />
      )}
    </div>
  );
};

export default HomePage;
