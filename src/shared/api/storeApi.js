import client from '@/shared/api/client';

// 가게 등록
export const createStore = async (storeData) => {
  const requestData = {
    name: storeData.name,
    businessNumber: storeData.businessNumber.replace(/-/g, ''), // 하이픈 제거
    description: storeData.description || '',
    category: storeData.category,
    phone: storeData.phone,
    address: storeData.address, // String
    latitude: parseFloat(storeData.latitude) || 0, // BigDecimal (Number로 전송)
    longitude: parseFloat(storeData.longitude) || 0, // BigDecimal (Number로 전송)
    keywords: storeData.keywords || [], // List<String>
    openTime: storeData.openTime, // LocalTime (HH:mm 형식)
    closeTime: storeData.closeTime, // LocalTime (HH:mm 형식)
    hasBreakTime: storeData.hasBreakTime || false, // Boolean
    breakStartTime: storeData.hasBreakTime ? storeData.breakStartTime : null, // LocalTime (HH:mm 형식)
    breakEndTime: storeData.hasBreakTime ? storeData.breakEndTime : null, // LocalTime (HH:mm 형식)
    images: storeData.imageKeys.map((key, index) => ({
      imageKey: key, // presign 발급받은 key값 (S3/R2에 저장된 경로)
      sortOrder: index + 1, // 이미지 조회 순서 (1부터 시작)
    })),
  };

  console.log('📤 [가게 등록] Request 데이터:', JSON.stringify(requestData, null, 2));

  const response = await client.post('/api/restaurant/save', requestData);

  return response.data;
};

// 사장님의 가게 목록 조회 (OWNER 권한 필요)
export const getMyStores = async () => {
  try {
    const response = await client.get('/api/restaurant/findByOwnerID');
    return response.data;
  } catch (error) {
    // 401 Unauthorized 에러는 조용히 처리 (로그인하지 않은 상태 또는 OWNER가 아닌 경우)
    if (error.response?.status === 401 || error.response?.status === 403) {
      return [];
    }
    // 다른 에러는 그대로 throw
    throw error;
  }
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
  } catch {
    // 조회수 증가 실패는 조용히 처리 (사용자 경험에 영향 없음)
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

// 모든 가게 목록 조회
export const getAllRestaurants = async () => {
  const response = await client.get('/api/restaurant/get-all-restaurants');

  console.log('📥 [get-all-restaurants] Response 데이터:', JSON.stringify(response.data, null, 2));

  return response.data;
};

// 가게 정보 수정
export const updateStore = async (storeId, storeData) => {
  const requestData = {
    id: storeId, // 필수
    ...(storeData.name && { name: storeData.name }),
    ...(storeData.businessNumber && {
      businessNumber: storeData.businessNumber.replace(/-/g, ''),
    }),
    ...(storeData.description && { description: storeData.description }),
    ...(storeData.category && { category: storeData.category }),
    ...(storeData.phone && { phone: storeData.phone }),
    ...(storeData.address && { address: storeData.address }),
    ...(storeData.latitude && { latitude: parseFloat(storeData.latitude) }),
    ...(storeData.longitude && { longitude: parseFloat(storeData.longitude) }),
    ...(storeData.keywords && storeData.keywords.length > 0 && { keywords: storeData.keywords }),
    ...(storeData.openTime && { openTime: storeData.openTime }),
    ...(storeData.closeTime && { closeTime: storeData.closeTime }),
    ...(storeData.hasBreakTime !== undefined && { hasBreakTime: storeData.hasBreakTime }),
    ...(storeData.hasBreakTime &&
      storeData.breakStartTime && { breakStartTime: storeData.breakStartTime }),
    ...(storeData.hasBreakTime &&
      storeData.breakEndTime && { breakEndTime: storeData.breakEndTime }),
    ...(storeData.imageKeys &&
      storeData.imageKeys.length > 0 && {
        images: storeData.imageKeys.map((key, index) => ({
          imageKey: key,
          sortOrder: index + 1,
        })),
      }),
  };

  const response = await client.put('/api/restaurant/update', requestData);

  return response.data;
};
