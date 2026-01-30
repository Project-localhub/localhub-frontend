import client from '@/shared/api/client';

// 필터로 가게 목록 조회
export const getRestaurantsByFilter = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size !== undefined) queryParams.append('size', params.size);
  if (params.category) queryParams.append('category', params.category);
  if (params.divide) queryParams.append('divide', params.divide);
  if (params.name) queryParams.append('name', params.name);

  const queryString = queryParams.toString();
  const url = `/api/restaurant/get-all-restaurantsByFilter${queryString ? `?${queryString}` : ''}`;

  const response = await client.get(url);
  return response.data;
};

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
    divide: storeData.divide || '', // 구 정보 (String, 필수)
    keyword: storeData.keywords || [], // List<String>
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

  const response = await client.post('/api/restaurant/save', requestData);

  return response.data;
};

// 사장님의 가게 목록 조회 (OWNER 권한 필요, 배열 반환)
export const getMyStores = async () => {
  try {
    const response = await client.get('/api/restaurant/findByOwnerId');
    // 배열이면 그대로 반환, 단일 객체면 배열로 변환
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    // 단일 객체인 경우 배열로 변환
    return data ? [data] : [];
  } catch (error) {
    // 400, 401, 403, 404 에러는 조용히 처리
    if (
      error.response?.status === 400 ||
      error.response?.status === 401 ||
      error.response?.status === 403 ||
      error.response?.status === 404
    ) {
      return [];
    }
    // 다른 에러는 그대로 throw
    throw error;
  }
};

// 가게 상세 정보 조회 (상세 페이지용)
export const getRestaurantDetail = async (restaurantId) => {
  const response = await client.get(`/api/restaurant/details/${restaurantId}`);
  return response.data;
};

export const incrementStoreView = async (storeId) => {
  try {
    const response = await client.post(`/api/stores/${storeId}/views`);
    return response.data;
  } catch {
    return null;
  }
};

// 가게별 통계 조회 (백엔드 API 미완성으로 주석처리)
// TODO: 백엔드 API 완성 후 주석 해제
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
// export const getStoreStats = async (storeId) => {
//   const response = await client.get(`/api/stores/${storeId}/stats`);
//   return response.data;
// };

// 모든 가게 목록 조회 (페이지네이션 지원)
export const getAllRestaurants = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size !== undefined) queryParams.append('size', params.size);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.name) queryParams.append('name', params.name);
  if (params.lat !== undefined) queryParams.append('lat', params.lat);
  if (params.lng !== undefined) queryParams.append('lng', params.lng);
  if (params.radiusMeter !== undefined) {
    queryParams.append('radiusMeter', params.radiusMeter);
  } else if (params.lat !== undefined && params.lng !== undefined) {
    // lat, lng가 있으면 기본 반경 3000m 설정
    queryParams.append('radiusMeter', 3000);
  }

  const queryString = queryParams.toString();
  const url = `/api/restaurant/get-all-restaurants${queryString ? `?${queryString}` : ''}`;
  const response = await client.get(url);
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
    ...(storeData.divide && { divide: storeData.divide }), // 구 정보 (주소 변경 시 자동 업데이트)
    ...(storeData.keywords && storeData.keywords.length > 0 && { keyword: storeData.keywords }),
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

// 메뉴 조회
export const getMenu = async (restaurantId) => {
  const response = await client.get(`/api/restaurant/getMenu/${restaurantId}`);
  return response.data;
};

// 메뉴 수정 (전체 수정, 기존 메뉴 전부 삭제 후 재등록)
export const updateMenu = async (menuItems) => {
  const response = await client.put('/api/restaurant/updateMenu', menuItems);
  return response.data;
};
