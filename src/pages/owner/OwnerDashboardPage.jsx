import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyStores, useStoreStats } from '@/shared/hooks/useStoreQueries';
import { useDashboardStore } from '@/state/useDashboardStore';
import { useDashboardStats } from '@/shared/hooks/useDashboardStats';
import StoreSelector from '@/components/dashboard/StoreSelector';
import StatsCards from '@/components/dashboard/StatsCards';
import ViewsChart from '@/components/dashboard/ViewsChart';
import RecentReviews from '@/components/dashboard/RecentReviews';
import QuickActions from '@/components/dashboard/QuickActions';

const OwnerDashboardPage = () => {
  const navigate = useNavigate();
  const {
    selectedStoreId,
    setSelectedStoreId,
    selectedPeriod,
    setSelectedPeriod,
    isStoreDropdownOpen,
    setStoreDropdownOpen,
  } = useDashboardStore();

  // 가게 목록 조회 (React Query)
  const { data: stores = [], isLoading: isStoresLoading } = useMyStores();

  // 선택된 가게의 통계 조회 (React Query)
  const { data: storeStats, isLoading: isStatsLoading } = useStoreStats(selectedStoreId, {
    enabled: !!selectedStoreId,
  });

  // 첫 번째 가게 자동 선택
  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores, selectedStoreId, setSelectedStoreId]);

  // 통계 데이터 생성
  const { statsData, chartData, recentReviews } = useDashboardStats(storeStats, isStatsLoading);

  const selectedStore = stores.find((store) => store.id === selectedStoreId);

  const handleStoreSelect = (storeId) => {
    setSelectedStoreId(storeId);
    setStoreDropdownOpen(false);
  };

  const handleAddStore = () => {
    setStoreDropdownOpen(false);
    navigate('/dashboard/store/register');
  };

  // 로딩 상태
  if (isStoresLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-auto">
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="mb-1">사장님 대시보드</div>
        <div className="text-gray-600 text-sm">
          {selectedStore ? selectedStore.name : '가게를 선택해주세요'}
        </div>
      </div>

      <StoreSelector
        stores={stores}
        selectedStoreId={selectedStoreId}
        isOpen={isStoreDropdownOpen}
        onToggle={() => setStoreDropdownOpen(!isStoreDropdownOpen)}
        onSelect={handleStoreSelect}
        onAddStore={handleAddStore}
      />

      <StatsCards statsData={statsData} isLoading={isStatsLoading} />

      <ViewsChart
        chartData={chartData}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />

      <RecentReviews reviews={recentReviews} />

      <QuickActions selectedStoreId={selectedStoreId} />
    </div>
  );
};

export default OwnerDashboardPage;
