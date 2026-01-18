import { useEffect, useState } from 'react';
import StoreCard from '@/components/StoreCard';
import MapView from '@/components/MapView';
import { Search, Filter, MapPin } from 'lucide-react';
import { useAllRestaurants } from '@/shared/hooks/useStoreQueries';
import { useMyFavorites } from '@/shared/hooks/useFavoriteQueries';
import { getDistanceKm } from '../utils/getDistance';

const HomePage = () => {
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('강남구');

  const [location, setLocation] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },

      () => {
        // 실패 시 기본 위치 (강남)
        setLocation({
          lat: 37.4979,
          lng: 127.0276,
        });
      },
    );
  }, []);

  const { data: restaurantsData, isLoading } = useAllRestaurants(
    location
      ? {
          lat: location.lat,
          lng: location.lng,
        }
      : {},
  );

  const { data: myFavorites = [] } = useMyFavorites();

  const favoriteIds = new Set(myFavorites.map((fav) => fav.id || fav.restaurantId));

  const stores =
    restaurantsData?.content?.map((restaurant) => {
      const distance =
        location && restaurant.latitude && restaurant.longitude
          ? `${getDistanceKm(
              location.lat,
              location.lng,
              restaurant.latitude,
              restaurant.longitude,
            ).toFixed(1)}km`
          : restaurant.distance || '0.0km';

      return {
        id: restaurant.restaurantId,
        name: restaurant.name,
        category: restaurant.category,
        rating: restaurant.score || 0,
        reviewCount: restaurant.reviewCount || 0,
        distance,
        image: restaurant.imageUrl || '',
        tags: restaurant.keyword || [],
        isLiked: favoriteIds.has(restaurant.restaurantId),
        lat: restaurant.latitude,
        lng: restaurant.longitude,
      };
    }) || [];
  return (
    <div className="flex flex-col min-h-screen">
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
        <div className="w-full h-[300px]">
          <MapView stores={stores} mode="home" />
        </div>
      )}
    </div>
  );
};

export default HomePage;
