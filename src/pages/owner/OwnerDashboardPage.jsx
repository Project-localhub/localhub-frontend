import { useState } from 'react';
import Layout from '@/components/Layout';
import { TrendingUp, Users, Star, MessageCircle, Eye, ChevronRight, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statsData = [
  { label: '오늘 조회수', value: '234', icon: Eye, change: '+12%', trend: 'up' },
  { label: '이번 달 리뷰', value: '45', icon: Star, change: '+8%', trend: 'up' },
  { label: '찜한 고객', value: '178', icon: Users, change: '+5%', trend: 'up' },
  { label: '채팅 문의', value: '23', icon: MessageCircle, change: '-3%', trend: 'down' },
];

const chartData = [
  { day: '월', views: 120 },
  { day: '화', views: 180 },
  { day: '수', views: 150 },
  { day: '목', views: 200 },
  { day: '금', views: 280 },
  { day: '토', views: 320 },
  { day: '일', views: 250 },
];

const recentReviews = [
  {
    id: '1',
    userName: '김철수',
    rating: 5,
    content: '정말 맛있어요! 김치찌개가 특히 일품입니다.',
    date: '1시간 전',
  },
  {
    id: '2',
    userName: '이영희',
    rating: 4,
    content: '가성비가 좋아요. 반찬도 계속 리필해주시고 맛도 괜찮습니다.',
    date: '3시간 전',
  },
  {
    id: '3',
    userName: '박민수',
    rating: 5,
    content: '동네 맛집이에요. 자주 가는데 항상 만족스럽습니다.',
    date: '5시간 전',
  },
];

const OwnerDashboardPage = () => {
  const [selectedPeriod, setSelectedPeriod] = (useState < 'week') | 'month' | ('year' > 'week');

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
