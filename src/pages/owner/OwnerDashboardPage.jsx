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
    <div>
      <div className="flex flex-col h-full bg-gray-50 overflow-auto">
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="mb-1">사장님 대시보드</div>
          <div className="text-gray-600 text-sm">맛있는 한식당</div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {statsData.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon size={20} className="text-blue-600" />
                  <span
                    className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {stat.change}
                  </span>
                </div>
                <div className="text-gray-600 text-sm mb-1">{stat.label}</div>
                <div className="text-2xl text-gray-900">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-4 mb-4 bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              <span className="text-gray-900">조회수 추이</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPeriod('week')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedPeriod === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                주간
              </button>
              <button
                onClick={() => setSelectedPeriod('month')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedPeriod === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                월간
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="views" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mx-4 mb-4 bg-white rounded-lg p-4 border border-gray-200">
          <div className="mb-3 text-gray-900">빠른 작업</div>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-blue-600" />
                <span className="text-gray-900">영업시간 수정</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <div className="flex items-center gap-3">
                <MessageCircle size={20} className="text-blue-600" />
                <span className="text-gray-900">메뉴 관리</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="mx-4 mb-4 bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-900">최근 리뷰</span>
            <button className="text-blue-600 text-sm">전체보기</button>
          </div>
          <div className="space-y-3">
            {recentReviews.map((review) => (
              <div key={review.id} className="pb-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-900">{review.userName}</span>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-900">{review.rating}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-1">{review.content}</p>
                <span className="text-gray-500 text-xs">{review.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboardPage;
