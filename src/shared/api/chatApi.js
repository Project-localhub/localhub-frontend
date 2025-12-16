import client from '@/shared/api/client';

// 사장님의 채팅방 목록 조회
export const getOwnerChatRooms = async (storeId) => {
  const response = await client.get(`/api/stores/${storeId}/chat-rooms`);
  return response.data;
};

// 이번 달 채팅 문의 수 조회 (1:1 채팅 기준)
export const getMonthlyChatInquiryCount = async (storeId, year, month) => {
  const response = await client.get(`/api/stores/${storeId}/chat-rooms/count`, {
    params: { year, month },
  });
  return response.data;
};

// 채팅방 메시지 조회
export const getChatMessages = async (roomId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.size) queryParams.append('size', params.size);

  const response = await client.get(
    `/api/chat-rooms/${roomId}/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
  );
  return response.data;
};
