import client from '@/shared/api/client';

// 채팅방 생성
export const createInquiryChat = async (storeId, data) => {
  const response = await client.post(`/api/chat/createInquiry/${storeId}`, data);
  return response.data;
};

// 채팅방 조회 (현재 로그인한 사용자의 채팅방 목록, 파라미터 없음)
// Authorization 헤더의 토큰에서 자동으로 사용자 정보를 가져옴
export const getInquiryChats = async () => {
  const response = await client.get('/api/chat/inquiryChat');
  return response.data;
};

// 채팅 메시지 조회
export const getChatMessages = async (inquiryChatId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.size) queryParams.append('size', params.size);

  const response = await client.get(
    `/api/chat/inquiryChat/${inquiryChatId}/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
  );
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
