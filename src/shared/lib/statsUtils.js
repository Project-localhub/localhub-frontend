// 통계 관련 유틸리티 함수

// 전달 대비 증감률 계산
export const calculateChangePercentage = (current, previous) => {
  if (!previous || previous === 0) {
    return current > 0 ? '+100%' : '0%';
  }
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${Math.round(change)}%`;
};

// 전달 대비 트렌드 판단
export const getTrend = (current, previous) => {
  if (!previous || previous === 0) {
    return current > 0 ? 'up' : 'neutral';
  }
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'neutral';
};

// 기본 통계 데이터
export const getDefaultStats = () => ({
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
});
