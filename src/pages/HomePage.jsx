import { useState, useEffect, useRef, useMemo } from 'react';
import StoreCard from '@/components/StoreCard';
import MapView from '@/components/MapView';
import { Search, Filter, MapPin, X } from 'lucide-react';
import { useAllRestaurants, useRestaurantsByFilter } from '@/shared/hooks/useStoreQueries';
import { useMyFavorites } from '@/shared/hooks/useFavoriteQueries';
import { calculateDistance, formatDistance } from '@/shared/lib/storeUtils';

// 지역구 목록
const REGIONS = [
  '강남구',
  '강동구',
  '강북구',
  '강서구',
  '관악구',
  '광진구',
  '구로구',
  '금천구',
  '노원구',
  '도봉구',
  '동대문구',
  '동작구',
  '마포구',
  '서대문구',
  '서초구',
  '성동구',
  '성북구',
  '송파구',
  '양천구',
  '영등포구',
  '용산구',
  '은평구',
  '종로구',
  '중구',
  '중랑구',
];

// 카테고리 목록
const CATEGORIES = [
  '한식',
  '일식',
  '중식',
  '양식',
  '카페',
  '베이커리',
  '분식',
  '치킨',
  '피자',
  '기타',
];

const HomePage = () => {
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDivide, setSelectedDivide] = useState('');
  const loadMoreRef = useRef(null);

  // 필터가 적용되었는지 확인
  const hasActiveFilters = selectedCategory || selectedDivide;

  // 필터가 있으면 필터 API 사용, 없으면 전체 목록 API 사용
  const filterParams = useMemo(
    () => ({
      category: selectedCategory || undefined,
      divide: selectedDivide || undefined,
    }),
    [selectedCategory, selectedDivide],
  );

  const {
    data: allData,
    fetchNextPage: fetchNextPageAll,
    hasNextPage: hasNextPageAll,
    isFetchingNextPage: isFetchingNextPageAll,
    isLoading: isLoadingAll,
  } = useAllRestaurants({ enabled: !hasActiveFilters });

  const {
    data: filterData,
    fetchNextPage: fetchNextPageFilter,
    hasNextPage: hasNextPageFilter,
    isFetchingNextPage: isFetchingNextPageFilter,
    isLoading: isLoadingFilter,
  } = useRestaurantsByFilter(filterParams, { enabled: hasActiveFilters });

  // 필터 적용 여부에 따라 다른 데이터 사용
  const data = hasActiveFilters ? filterData : allData;
  const fetchNextPage = hasActiveFilters ? fetchNextPageFilter : fetchNextPageAll;
  const hasNextPage = hasActiveFilters ? hasNextPageFilter : hasNextPageAll;
  const isFetchingNextPage = hasActiveFilters ? isFetchingNextPageFilter : isFetchingNextPageAll;
  const isLoading = hasActiveFilters ? isLoadingFilter : isLoadingAll;

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
          // 에러 타입에 따라 다른 메시지 표시
          let errorMessage = '위치 정보를 가져올 수 없습니다.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
              console.warn('⚠️ [HomePage] 위치 권한 거부:', error.message);
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '위치 정보를 사용할 수 없습니다.';
              console.warn('⚠️ [HomePage] 위치 정보 사용 불가:', error.message);
              break;
            case error.TIMEOUT:
              errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
              console.warn('⚠️ [HomePage] 위치 정보 요청 타임아웃:', error.message);
              break;
            default:
              console.warn('⚠️ [HomePage] 위치 정보를 가져올 수 없습니다:', error.message);
              break;
          }
          // 사용자에게는 콘솔에만 표시 (필요시 alert나 toast로 변경 가능)
          console.warn('⚠️ [HomePage]', errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 5초에서 10초로 증가
          maximumAge: 300000, // 5분간 캐시 사용 (0에서 변경)
        },
      );
    } else {
      console.warn('⚠️ [HomePage] 이 브라우저는 위치 정보를 지원하지 않습니다.');
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
  // myFavorites가 변경되면 자동으로 재계산되도록 useMemo 사용
  const favoriteIds = useMemo(
    () => new Set(myFavorites.map((fav) => fav.id || fav.restaurantId)),
    [myFavorites],
  );

  // 모든 페이지의 데이터를 하나의 배열로 합치기
  const allRestaurants = useMemo(
    () => data?.pages?.flatMap((page) => page?.content || []) || [],
    [data?.pages],
  );
  const totalElements = data?.pages?.[0]?.totalElements || allRestaurants.length;

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

  // stores 배열 생성 시 favoriteIds를 의존성에 포함하여 찜 상태가 변경되면 자동으로 갱신
  const stores = useMemo(() => {
    return filteredStores.map((restaurant) => {
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

      return storeData;
    });
  }, [filteredStores, favoriteIds, userLocation]);

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
          <button
            onClick={() => setShowFilterModal(true)}
            className={`text-gray-600 ${hasActiveFilters ? 'text-blue-600' : ''}`}
          >
            <Filter size={20} />
          </button>
        </div>

        {/* 활성 필터 표시 */}
        {(selectedCategory || selectedDivide) && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory('')}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
              >
                {selectedCategory}
                <X size={14} />
              </button>
            )}
            {selectedDivide && (
              <button
                onClick={() => setSelectedDivide('')}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
              >
                <MapPin size={14} />
                {selectedDivide}
                <X size={14} />
              </button>
            )}
          </div>
        )}
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
        <div className="flex-1 relative" style={{ minHeight: '400px' }}>
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

      {/* 필터 모달 */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">필터</h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* 지역구 선택 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">지역구</h3>
              <div className="grid grid-cols-4 gap-2">
                {REGIONS.map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedDivide(selectedDivide === region ? '' : region)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      selectedDivide === region
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {/* 카테고리 선택 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">카테고리</h3>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() =>
                      setSelectedCategory(selectedCategory === category ? '' : category)
                    }
                    className={`px-3 py-2 rounded-lg text-sm ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* 적용 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedDivide('');
                  setShowFilterModal(false);
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium"
              >
                초기화
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium"
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
