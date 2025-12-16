import client from '@/shared/api/client';

// 가게 등록
export const createStore = async (storeData) => {
  const formData = new FormData();

  // 기본 정보
  formData.append('name', storeData.name);
  if (storeData.businessNumber) {
    formData.append('businessNumber', storeData.businessNumber.replace(/-/g, '')); // 하이픈 제거
  }
  formData.append('description', storeData.description);
  formData.append('category', storeData.category);
  formData.append('phone', storeData.phone);
  formData.append('address', storeData.address);
  formData.append('latitude', storeData.latitude);
  formData.append('longitude', storeData.longitude);

  // 키워드 (배열)
  if (storeData.keywords && storeData.keywords.length > 0) {
    storeData.keywords.forEach((keyword) => {
      formData.append('keywords', keyword);
    });
  }

  // 영업시간
  formData.append('openTime', storeData.openTime);
  formData.append('closeTime', storeData.closeTime);
  formData.append('hasBreakTime', storeData.hasBreakTime || false);
  if (storeData.hasBreakTime) {
    formData.append('breakStartTime', storeData.breakStartTime);
    formData.append('breakEndTime', storeData.breakEndTime);
  }

  // 이미지 파일 (최대 3개)
  if (storeData.images && storeData.images.length > 0) {
    storeData.images.forEach((image) => {
      if (image instanceof File) {
        formData.append('images', image);
      }
    });
  }

  const response = await client.post('/api/stores', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// 사장님의 가게 목록 조회
export const getMyStores = async () => {
  const response = await client.get('/api/stores/my');
  return response.data;
};

// 가게 정보 조회
export const getStore = async (storeId) => {
  const response = await client.get(`/api/stores/${storeId}`);
  return response.data;
};

// 가게 조회수 증가
// 중복 방문 방지를 위해 백엔드에서 처리하거나, 프론트엔드에서 localStorage로 같은 날 중복 방지 가능
export const incrementStoreView = async (storeId) => {
  try {
    const response = await client.post(`/api/stores/${storeId}/views`);
    return response.data;
  } catch (error) {
    // 조회수 증가 실패는 조용히 처리 (사용자 경험에 영향 없음)
    console.error('조회수 증가 실패:', error);
    return null;
  }
};

// 가게별 통계 조회
// 응답 형식:
// {
//   todayViews: number,           // 오늘 조회수
//   monthlyReviews: number,       // 이번 달 리뷰 수
//   lastMonthReviews: number,     // 전달 리뷰 수 (비교용)
//   favoriteCount: number,        // 현재 찜한 고객 수
//   lastMonthFavoriteCount: number, // 전달 찜한 고객 수 (비교용)
//   chatInquiries: number,        // 이번 달 채팅 문의 수
//   chartData: Array<{day: string, views: number}>, // 조회수 추이 데이터
//   recentReviews: Array<{...}>   // 최근 리뷰 목록
// }
export const getStoreStats = async (storeId) => {
  const response = await client.get(`/api/stores/${storeId}/stats`);
  return response.data;
};

// 가게 정보 수정
export const updateStore = async (storeId, storeData) => {
  const formData = new FormData();

  // 기본 정보
  if (storeData.name) formData.append('name', storeData.name);
  if (storeData.description) formData.append('description', storeData.description);
  if (storeData.category) formData.append('category', storeData.category);
  if (storeData.phone) formData.append('phone', storeData.phone);
  if (storeData.address) formData.append('address', storeData.address);
  if (storeData.latitude) formData.append('latitude', storeData.latitude);
  if (storeData.longitude) formData.append('longitude', storeData.longitude);

  // 키워드
  if (storeData.keywords && storeData.keywords.length > 0) {
    storeData.keywords.forEach((keyword) => {
      formData.append('keywords', keyword);
    });
  }

  // 영업시간
  if (storeData.openTime) formData.append('openTime', storeData.openTime);
  if (storeData.closeTime) formData.append('closeTime', storeData.closeTime);
  if (storeData.hasBreakTime !== undefined) {
    formData.append('hasBreakTime', storeData.hasBreakTime);
  }
  if (storeData.hasBreakTime && storeData.breakStartTime) {
    formData.append('breakStartTime', storeData.breakStartTime);
    formData.append('breakEndTime', storeData.breakEndTime);
  }

  // 이미지 파일
  if (storeData.images && storeData.images.length > 0) {
    storeData.images.forEach((image) => {
      if (image instanceof File) {
        formData.append('images', image);
      }
    });
  }

  const response = await client.put(`/api/stores/${storeId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
