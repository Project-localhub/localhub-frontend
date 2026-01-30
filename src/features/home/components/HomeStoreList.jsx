import { Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import StoreCard from '@/components/StoreCard';

const MapView = lazy(() => import('@/components/MapView'));

const HomeStoreList = ({
  viewMode,
  stores,
  isLoading,
  totalElements,
  loadMoreRef,
  isFetchingNextPage,
  hasNextPage,
}) => {
  if (viewMode === 'list') {
    return (
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
                  {stores.map((store, index) => (
                    <StoreCard key={`${store.id}-${index}`} store={store} />
                  ))}
                </div>
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
    );
  }

  return (
    <div className="flex-1 relative" style={{ minHeight: '400px' }}>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      ) : stores.length > 0 ? (
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full text-gray-500">
              지도 로딩 중...
            </div>
          }
        >
          <MapView stores={stores} />
        </Suspense>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-gray-400 mb-2">등록된 가게가 없습니다</div>
          <p className="text-gray-500 text-sm">첫 번째 가게를 등록해보세요!</p>
        </div>
      )}
    </div>
  );
};

HomeStoreList.propTypes = {
  viewMode: PropTypes.oneOf(['list', 'map']).isRequired,
  stores: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  totalElements: PropTypes.number.isRequired,
  loadMoreRef: PropTypes.object.isRequired,
  isFetchingNextPage: PropTypes.bool.isRequired,
  hasNextPage: PropTypes.bool.isRequired,
};

export default HomeStoreList;
