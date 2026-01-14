import { useState, useEffect, useRef, useMemo } from 'react';
import StoreCard from '@/components/StoreCard';
import MapView from '@/components/MapView';
import { Search, Filter, MapPin } from 'lucide-react';
import { useAllRestaurants } from '@/shared/hooks/useStoreQueries';
import { useMyFavorites } from '@/shared/hooks/useFavoriteQueries';
import { calculateDistance, formatDistance } from '@/shared/lib/storeUtils';

const HomePage = () => {
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('강남구');
  const [userLocation, setUserLocation] = useState(null);
  const loadMoreRef = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useAllRestaurants();
  const { data: myFavorites = [] } = useMyFavorites();

  // 사용자 위치 요청 (한 번만)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          console.log('📍 [HomePage] 사용자 위치:', location);
          setUserLocation(location);
        },
        (error) => {
          console.warn('⚠️ [HomePage] 위치 정보를 가져올 수 없습니다:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        },
      );
    }
  }, []);

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    const currentRef = loadMoreRef.current;
    if (!currentRef || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      },
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 찜한 가게 ID Set 생성 (빠른 조회를 위해)
  const favoriteIds = new Set(myFavorites.map((fav) => fav.id || fav.restaurantId));

  // 모든 페이지의 데이터를 하나의 배열로 합치기
  const allRestaurants = useMemo(
    () => data?.pages?.flatMap((page) => page?.content || []) || [],
    [data?.pages],
  );
  const totalElements = data?.pages?.[0]?.totalElements || allRestaurants.length;

  // 디버깅: 원본 데이터 확인
  useEffect(() => {
    console.log('📊 [HomePage] 원본 데이터:', {
      pages: data?.pages?.length || 0,
      totalElements,
      allRestaurantsCount: allRestaurants.length,
      firstRestaurant: allRestaurants[0],
      userLocation,
    });
  }, [data, totalElements, allRestaurants, userLocation]);

  // 필터링된 가게 목록 (검색어, 지역, 카테고리 등으로 필터링 가능)
  const filteredStores = useMemo(() => {
    return allRestaurants
      .filter((restaurant) => restaurant && restaurant.restaurantId) // 유효한 데이터만 필터링
      .filter((restaurant) => {
        // 검색어 필터 (가게 이름, 카테고리)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesName = restaurant.name?.toLowerCase().includes(query);
          const matchesCategory = restaurant.category?.toLowerCase().includes(query);
          if (!matchesName && !matchesCategory) return false;
        }
        // 지역 필터 (나중에 추가 가능)
        // if (selectedRegion && restaurant.region !== selectedRegion) return false;
        return true;
      });
  }, [allRestaurants, searchQuery]);

  const stores = filteredStores.map((restaurant) => {
    // 사용자 위치가 있으면 거리 계산, 없으면 빈 문자열
    const distance =
      userLocation && restaurant.latitude && restaurant.longitude
        ? formatDistance(
            calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              restaurant.latitude,
              restaurant.longitude,
            ),
          )
        : '';

    const storeData = {
      id: restaurant.restaurantId,
      name: restaurant.name || '',
      category: restaurant.category || '',
      rating: restaurant.score || 0,
      reviewCount: restaurant.reviewCount || 0,
      distance,
      image: restaurant.imageUrl || '',
      tags: restaurant.keyword || [],
      isLiked: favoriteIds.has(restaurant.restaurantId),
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
    };

    // 디버깅: 거리 계산 확인
    if (userLocation && restaurant.latitude && restaurant.longitude) {
      const calculatedDistance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        restaurant.latitude,
        restaurant.longitude,
      );
      console.log('📏 [HomePage] 거리 계산:', {
        storeName: restaurant.name,
        userLocation,
        storeLocation: { latitude: restaurant.latitude, longitude: restaurant.longitude },
        distanceKm: calculatedDistance,
        formattedDistance: distance,
      });
    }

    return storeData;
  });

  // 디버깅: 최종 stores 배열 확인
  useEffect(() => {
    console.log('🏪 [HomePage] 최종 stores 배열:', {
      count: stores.length,
      stores: stores.slice(0, 3), // 처음 3개만 로그
      allStores: stores,
    });
  }, [stores]);
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
                주변 가게 <span className="text-blue-600">{totalElements}</span>개
              </div>
              {stores.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {stores.map((store) => (
                      <StoreCard key={store.id} store={store} />
                    ))}
                  </div>
                  {/* 무한 스크롤 트리거 요소 */}
                  <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
                    {isFetchingNextPage && (
                      <div className="text-gray-500 text-sm">더 많은 가게를 불러오는 중...</div>
                    )}
                    {!hasNextPage && stores.length > 0 && (
                      <div className="text-gray-400 text-sm">모든 가게를 불러왔습니다</div>
                    )}
                  </div>
                </>
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
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">로딩 중...</div>
            </div>
          ) : stores.length > 0 ? (
            <MapView stores={stores} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-gray-400 mb-2">등록된 가게가 없습니다</div>
              <p className="text-gray-500 text-sm">첫 번째 가게를 등록해보세요!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
