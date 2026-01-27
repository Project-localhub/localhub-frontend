import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyStores, useStoreStats } from '@/features/store/hooks/useStoreQueries';
import { useDashboardStore } from '@/features/owner-dashboard/state/useDashboardStore';
import { useDashboardStats } from '@/features/owner-dashboard/hooks/useDashboardStats';
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

  const { data: stores = [], isLoading: isStoresLoading } = useMyStores();

  const selectedStore = stores.find((store) => store.id === selectedStoreId);

  const { data: storeStats, isLoading: isStatsLoading } = useStoreStats(selectedStoreId, {
    enabled: !!selectedStoreId,
  });

  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores, selectedStoreId, setSelectedStoreId]);

  useEffect(() => {
    if (selectedStoreId && stores.length > 0 && !selectedStore) {
      setSelectedStoreId(stores[0].id);
    }
  }, [selectedStoreId, stores, selectedStore, setSelectedStoreId]);

  const { statsData, chartData, recentReviews } = useDashboardStats(storeStats, isStatsLoading);

  const handleStoreSelect = (storeId) => {
    setSelectedStoreId(storeId);
    setStoreDropdownOpen(false);
  };

  const handleAddStore = () => {
    setStoreDropdownOpen(false);
    navigate('/dashboard/store/register');
  };

  if (isStoresLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-auto">
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

      <QuickActions selectedStoreId={selectedStoreId} />

      <RecentReviews reviews={recentReviews} />
    </div>
  );
};

export default OwnerDashboardPage;
