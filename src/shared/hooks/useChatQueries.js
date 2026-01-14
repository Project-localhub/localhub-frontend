import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createInquiryChat,
  getInquiryChats,
  getChatMessages,
  getOwnerChatRooms,
  getMonthlyChatInquiryCount,
} from '@/shared/api/chatApi';

// Query Keys
export const chatKeys = {
  all: ['chats'],
  rooms: () => [...chatKeys.all, 'rooms'],
  inquiryChats: () => [...chatKeys.rooms(), 'inquiry'],
  ownerRooms: (storeId) => [...chatKeys.rooms(), 'owner', storeId],
  messages: () => [...chatKeys.all, 'messages'],
  roomMessages: (inquiryChatId) => [...chatKeys.messages(), inquiryChatId],
  counts: () => [...chatKeys.all, 'count'],
  monthlyCount: (storeId, year, month) => [...chatKeys.counts(), storeId, year, month],
};

// 채팅방 생성
export const useCreateInquiryChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, ...data }) => createInquiryChat(storeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
    },
  });
};

// 채팅방 조회 (현재 로그인한 사용자의 채팅방 목록)
export const useInquiryChats = (options = {}) => {
  return useQuery({
    queryKey: chatKeys.inquiryChats(),
    queryFn: () => getInquiryChats(),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    ...options,
  });
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
export const useChatMessages = (inquiryChatId, params = {}, options = {}) => {
  return useQuery({
    queryKey: chatKeys.roomMessages(inquiryChatId),
    queryFn: () => getChatMessages(inquiryChatId, params),
    enabled: !!inquiryChatId && options.enabled !== false,
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    ...options,
  });
};

// 메시지 전송 Mutation (웹소켓으로 전송하므로 React Query 사용 안 함)
// useSendMessage는 웹소켓 클라이언트를 직접 사용
