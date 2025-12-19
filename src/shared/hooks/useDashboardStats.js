import { useMemo } from 'react';
import { Eye, Star, Users, MessageCircle } from 'lucide-react';
import { calculateChangePercentage, getTrend, getDefaultStats } from '@/shared/lib/statsUtils';

// 대시보드 통계 데이터 생성 훅
export const useDashboardStats = (storeStats, isLoading) => {
  const defaultStats = getDefaultStats();
  const currentStats = storeStats || defaultStats;

  const statsData = useMemo(
    () => [
      {
        label: '오늘 조회수',
        value: currentStats.todayViews || 0,
        icon: Eye,
        change: '+0%',
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
        change: '0%',
        trend: 'neutral',
      },
    ],
    [currentStats],
  );

  const chartData = currentStats.chartData || defaultStats.chartData;
  const recentReviews = currentStats.recentReviews || [];

  return {
    statsData,
    chartData,
    recentReviews,
    isLoading,
  };
};
