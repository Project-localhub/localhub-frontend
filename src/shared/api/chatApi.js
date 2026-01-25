import client from '@/shared/api/client';

// 채팅방 생성
export const createInquiryChat = async (storeId) => {
  const response = await client.post(`/api/chat/createInquiry/${storeId}`);
  // 디버깅: 전체 응답 구조 확인
  console.log('🔍 [chatApi] createInquiryChat 전체 응답:', {
    status: response.status,
    statusText: response.statusText,
    data: response.data,
    dataType: typeof response.data,
    isArray: Array.isArray(response.data),
    dataKeys:
      response.data && typeof response.data === 'object' ? Object.keys(response.data) : null,
  });

  // 응답 데이터의 id 필드 상세 확인
  if (response.data && typeof response.data === 'object') {
    console.log('🔍 [chatApi] createInquiryChat 응답 데이터 상세:', {
      id: response.data.id,
      idType: typeof response.data.id,
      exist: response.data.exist,
      existType: typeof response.data.exist,
      전체데이터: response.data,
    });
  }

  return response.data;
};

// 채팅방 조회 (현재 로그인한 사용자의 채팅방 목록, 파라미터 없음)
// Authorization 헤더의 토큰에서 자동으로 사용자 정보를 가져옴
export const getInquiryChats = async () => {
  const response = await client.get('/api/chat/inquiryChat');

  // 디버깅: 실제 응답 데이터 구조 확인
  console.log('🔍 [chatApi] getInquiryChats 응답:', {
    status: response.status,
    statusText: response.statusText,
    data: response.data,
    dataType: typeof response.data,
    isArray: Array.isArray(response.data),
    dataLength: Array.isArray(response.data) ? response.data.length : 0,
  });

  // 배열인 경우 첫 번째 항목의 구조 확인
  if (Array.isArray(response.data) && response.data.length > 0) {
    console.log('🔍 [chatApi] 첫 번째 채팅방 데이터:', response.data[0]);
    console.log('🔍 [chatApi] 첫 번째 채팅방 키:', Object.keys(response.data[0]));

    // 각 필드의 타입과 값 확인
    const firstChat = response.data[0];
    console.log('🔍 [chatApi] 첫 번째 채팅방 상세:', {
      roomId: firstChat.roomId,
      roomIdType: typeof firstChat.roomId,
      peer: firstChat.peer,
      peerType: typeof firstChat.peer,
      restaurant: firstChat.restaurant,
      restaurantType: typeof firstChat.restaurant,
      lastMessage: firstChat.lastMessage,
      lastMessageAt: firstChat.lastMessageAt,
      unreadCount: firstChat.unreadCount,
      전체데이터: firstChat,
    });
  }

  return response.data;
};

// 채팅 메시지 조회
export const getChatMessages = async (inquiryChatId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.size) queryParams.append('size', params.size);

  const url = `/api/chat/inquiryChat/${inquiryChatId}/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  console.log('🔍 [chatApi] 메시지 조회 API 호출:', url);
  console.log('🔍 [chatApi] inquiryChatId:', inquiryChatId);

  const response = await client.get(url);

  console.log('🔍 [chatApi] 메시지 조회 응답:', {
    status: response.status,
    data: response.data,
    dataType: typeof response.data,
    isArray: Array.isArray(response.data),
    hasContent: !!response.data?.content,
    dataLength: Array.isArray(response.data)
      ? response.data.length
      : response.data?.content?.length || 0,
  });

  // 메시지 응답 상세 로그 (발신자 구분을 위해)
  if (Array.isArray(response.data) && response.data.length > 0) {
    console.log('🔍 [chatApi] 메시지 응답 상세:', {
      메시지개수: response.data.length,
      첫번째메시지: response.data[0],
      마지막메시지: response.data[response.data.length - 1],
      모든메시지: response.data.map((msg, idx) => ({
        index: idx,
        sender: msg.sender,
        message: msg.message,
        전체데이터: msg,
      })),
    });
  }

  // 응답이 빈 배열인 경우 상세 로그
  if (Array.isArray(response.data) && response.data.length === 0) {
    console.warn('⚠️ [chatApi] 메시지 조회 응답이 빈 배열입니다:', {
      inquiryChatId,
      url,
      responseHeaders: response.headers,
    });
  }

  return response.data;
};

// 웹소켓 연결 (POST /stomp/chats)
export const connectChatRoom = async (roomId) => {
  const response = await client.post('/stomp/chats', { roomId });
  return response.data;
};

// 사장님의 채팅방 목록 조회 (기존 호환성 유지)
// TODO: 사장님용 별도 API가 있으면 수정 필요
export const getOwnerChatRooms = async (_storeId) => {
  // 현재는 일반 사용자와 동일하게 조회 (백엔드에서 ownerId로 필터링)
  return getInquiryChats();
};

// 이번 달 채팅 문의 수 조회 (1:1 채팅 기준)
export const getMonthlyChatInquiryCount = async (storeId, year, month) => {
  const response = await client.get(`/api/stores/${storeId}/chat-rooms/count`, {
    params: { year, month },
  });
  return response.data;
};
