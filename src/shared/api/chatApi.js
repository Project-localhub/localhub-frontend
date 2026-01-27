import client from '@/shared/api/client';

export const createInquiryChat = async (storeId) => {
  const response = await client.post(`/api/chat/createInquiry/${storeId}`);
  return response.data;
};

export const getInquiryChats = async () => {
  const response = await client.get('/api/chat/inquiryChat');
  return response.data;
};

// 채팅 메시지 조회 (cursorId 기반 무한 스크롤)
export const getChatMessages = async (inquiryChatId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.cursorId !== undefined && params.cursorId !== null) {
    queryParams.append('cursorId', params.cursorId);
  }
  if (params.size) {
    queryParams.append('size', params.size);
  }

  const url = `/api/chat/inquiryChat/${inquiryChatId}/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await client.get(url);
  return response.data;
};

export const connectChatRoom = async (roomId) => {
  const response = await client.post('/stomp/chats', { roomId });
  return response.data;
};

export const getOwnerChatRooms = async (_storeId) => {
  return getInquiryChats();
};

// 이번 달 채팅 문의 수 조회 (1:1 채팅 기준)
export const getMonthlyChatInquiryCount = async (storeId, year, month) => {
  const response = await client.get(`/api/stores/${storeId}/chat-rooms/count`, {
    params: { year, month },
  });
  return response.data;
};
