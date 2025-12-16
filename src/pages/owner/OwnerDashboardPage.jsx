import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  Star,
  MessageCircle,
  Eye,
  ChevronRight,
  Calendar,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMyStores, useStoreStats } from '@/shared/hooks/useStoreQueries';
import { useDashboardStore } from '@/state/useDashboardStore';

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
  const { data: stores = [], isLoading: isStoresLoading, error: storesError } = useMyStores();

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

  // 기본 통계 데이터 (모든 값 0)
  const defaultStats = {
    todayViews: 0,
    monthlyReviews: 0,
    favoriteCount: 0,
    chatInquiries: 0,
    chartData: [
      { day: '월', views: 0 },
      { day: '화', views: 0 },
      { day: '수', views: 0 },
      { day: '목', views: 0 },
      { day: '금', views: 0 },
      { day: '토', views: 0 },
      { day: '일', views: 0 },
    ],
    recentReviews: [],
  };

  // 통계 데이터 (항상 표시, 값이 없으면 0)
  const currentStats = storeStats || defaultStats;

  // 전달 대비 증감률 계산 함수
  const calculateChangePercentage = (current, previous) => {
    if (!previous || previous === 0) {
      return current > 0 ? '+100%' : '0%';
    }
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${Math.round(change)}%`;
  };

  // 전달 대비 트렌드 판단
  const getTrend = (current, previous) => {
    if (!previous || previous === 0) {
      return current > 0 ? 'up' : 'neutral';
    }
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'neutral';
  };

  const statsData = [
    {
      label: '오늘 조회수',
      value: currentStats.todayViews || 0,
      icon: Eye,
      change: '+0%', // 조회수는 일일 기준이므로 전달 비교 불필요
      trend: 'up',
    },
    {
      label: '이번 달 리뷰',
      value: currentStats.monthlyReviews || 0,
      icon: Star,
      change: calculateChangePercentage(
        currentStats.monthlyReviews || 0,
        currentStats.lastMonthReviews || 0,
      ),
      trend: getTrend(currentStats.monthlyReviews || 0, currentStats.lastMonthReviews || 0),
    },
    {
      label: '찜한 고객',
      value: currentStats.favoriteCount || 0,
      icon: Users,
      change: calculateChangePercentage(
        currentStats.favoriteCount || 0,
        currentStats.lastMonthFavoriteCount || 0,
      ),
      trend: getTrend(currentStats.favoriteCount || 0, currentStats.lastMonthFavoriteCount || 0),
    },
    {
      label: '채팅 문의',
      value: currentStats.chatInquiries || 0,
      icon: MessageCircle,
      change: '0%', // 채팅 문의는 이번 달 기준만 표시
      trend: 'neutral',
    },
  ];

  const chartData = currentStats.chartData || defaultStats.chartData;
  const recentReviews = currentStats.recentReviews || [];

  const selectedStore = stores.find((store) => store.id === selectedStoreId);

  const handleStoreSelect = (storeId) => {
    setSelectedStoreId(storeId);
    setStoreDropdownOpen(false);
  };

  // 로딩 상태
  if (isStoresLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  // 에러 상태
  if (storesError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">가게 목록을 불러오는데 실패했습니다.</div>
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

      {/* 가게 선택 드롭다운 */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="mb-2 text-sm text-gray-600">등록한 가게</div>
        <div className="relative">
          <button
            onClick={() => setStoreDropdownOpen(!isStoreDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="text-gray-900">
              {selectedStore ? selectedStore.name : '가게를 선택하세요'}
            </span>
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform ${
                isStoreDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isStoreDropdownOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10"
                onClick={() => setStoreDropdownOpen(false)}
                aria-label="드롭다운 닫기"
              ></button>
              <div className="absolute z-20 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {stores.length > 0 ? (
                  stores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => handleStoreSelect(store.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 ${
                        selectedStoreId === store.id ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                      }`}
                    >
                      {store.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-sm text-center">
                    등록된 가게가 없습니다
                  </div>
                )}
                <button
                  onClick={() => {
                    setStoreDropdownOpen(false);
                    navigate('/dashboard/store/register');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-t border-gray-200 text-blue-600 flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>가게 추가</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 통계 정보 */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <stat.icon size={20} className="text-blue-600" />
                <span
                  className={`text-sm ${
                    stat.trend === 'up'
                      ? 'text-green-600'
                      : stat.trend === 'down'
                        ? 'text-red-600'
                        : 'text-gray-600'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <div className="text-gray-600 text-sm mb-1">{stat.label}</div>
              <div className="text-2xl text-gray-900">{isStatsLoading ? '...' : stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 조회수 추이 차트 */}
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
                selectedPeriod === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
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

      {/* 최근 리뷰 */}
      <div className="mx-4 mb-4 bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-900">최근 리뷰</span>
          <button className="text-blue-600 text-sm">전체보기</button>
        </div>
        {recentReviews.length > 0 ? (
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
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">리뷰가 없습니다</div>
        )}
      </div>

      {/* 빠른 작업 */}
      <div className="mx-4 mb-4 bg-white rounded-lg p-4 border border-gray-200">
        <div className="mb-3 text-gray-900">빠른 작업</div>
        <div className="space-y-2">
          <button
            onClick={() => navigate('/dashboard/store/register')}
            className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200"
          >
            <div className="flex items-center gap-3">
              <Plus size={20} className="text-blue-600" />
              <span className="text-gray-900 font-medium">가게 등록</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          {selectedStoreId && (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboardPage;
