import client from '@/shared/api/client';

// 채팅방 생성
export const createInquiryChat = async (data) => {
  const response = await client.post('/api/chat/createInquiry', data);
  return response.data;
};

// 채팅방 조회
export const getInquiryChats = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.storeId) queryParams.append('storeId', params.storeId);
  if (params.userId) queryParams.append('userId', params.userId);

  const response = await client.get(
    `/api/chat/inquiryChat${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
  );
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
export const getOwnerChatRooms = async (storeId) => {
  return getInquiryChats({ storeId });
};

// 이번 달 채팅 문의 수 조회 (1:1 채팅 기준)
export const getMonthlyChatInquiryCount = async (storeId, year, month) => {
  const response = await client.get(`/api/stores/${storeId}/chat-rooms/count`, {
    params: { year, month },
  });
  return response.data;
};