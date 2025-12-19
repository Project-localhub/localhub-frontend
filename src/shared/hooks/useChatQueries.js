import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOwnerChatRooms,
  getMonthlyChatInquiryCount,
  getChatMessages,
} from '@/shared/api/chatApi';

// Query Keys
export const chatKeys = {
  all: ['chats'],
  rooms: () => [...chatKeys.all, 'rooms'],
  ownerRooms: (storeId) => [...chatKeys.rooms(), 'owner', storeId],
  messages: () => [...chatKeys.all, 'messages'],
  roomMessages: (roomId) => [...chatKeys.messages(), roomId],
  counts: () => [...chatKeys.all, 'count'],
  monthlyCount: (storeId, year, month) => [...chatKeys.counts(), storeId, year, month],
};

// 사장님의 채팅방 목록 조회
export const useOwnerChatRooms = (storeId, options = {}) => {
  return useQuery({
    queryKey: chatKeys.ownerRooms(storeId),
    queryFn: () => getOwnerChatRooms(storeId),
    enabled: !!storeId && options.enabled !== false,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, 
    ...options,
  });
};

// 이번 달 채팅 문의 수 조회
export const useMonthlyChatInquiryCount = (storeId, year, month, options = {}) => {
  return useQuery({
    queryKey: chatKeys.monthlyCount(storeId, year, month),
    queryFn: () => getMonthlyChatInquiryCount(storeId, year, month),
    enabled: !!storeId && !!year && !!month && options.enabled !== false,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

// 채팅방 메시지 조회
export const useChatMessages = (roomId, params = {}, options = {}) => {
  return useQuery({
    queryKey: chatKeys.roomMessages(roomId),
    queryFn: () => getChatMessages(roomId, params),
    enabled: !!roomId && options.enabled !== false,
    staleTime: 10 * 1000, 
    refetchInterval: 10 * 1000, 
    ...options,
  });
};

// 메시지 전송 Mutation (추후 구현)
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, message }) => {
      // TODO: sendMessage API 함수 구현 필요
      // return sendMessage(roomId, message);
    },
    onSuccess: (data, variables) => {
      // 메시지 목록 갱신
      queryClient.invalidateQueries({ queryKey: chatKeys.roomMessages(variables.roomId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
    },
  });
};
