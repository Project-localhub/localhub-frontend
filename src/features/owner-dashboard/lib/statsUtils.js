export const calculateChangePercentage = (current, previous) => {
  if (!previous || previous === 0) {
    return current > 0 ? '+100%' : '0%';
  }
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${Math.round(change)}%`;
};

export const getTrend = (current, previous) => {
  if (!previous || previous === 0) {
    return current > 0 ? 'up' : 'neutral';
  }
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'neutral';
};

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
