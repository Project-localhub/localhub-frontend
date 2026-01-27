import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
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
    mutationFn: ({ storeId }) => createInquiryChat(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
    },
  });
};

// 채팅방 조회 (현재 로그인한 사용자의 채팅방 목록)
// 백엔드에서 사용자 역할(USER/OWNER)에 따라 자동으로 필터링된 채팅방 목록을 반환해야 함
export const useInquiryChats = (options = {}) => {
  return useQuery({
    queryKey: chatKeys.inquiryChats(),
    queryFn: () => getInquiryChats(),
    staleTime: 30 * 1000,
    refetchInterval: options.refetchInterval !== undefined ? options.refetchInterval : 30 * 1000,
    ...options,
  });
};

// 사장님의 채팅방 목록 조회
export const useOwnerChatRooms = (storeId, options = {}) => {
  const { enabled, ...restOptions } = options;

  return useQuery({
    queryKey: chatKeys.ownerRooms(storeId),
    queryFn: () => getOwnerChatRooms(storeId),
    enabled: !!storeId && (enabled !== undefined ? Boolean(enabled) : true),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    ...restOptions,
  });
};

// 이번 달 채팅 문의 수 조회
export const useMonthlyChatInquiryCount = (storeId, year, month, options = {}) => {
  const { enabled, ...restOptions } = options;

  return useQuery({
    queryKey: chatKeys.monthlyCount(storeId, year, month),
    queryFn: () => getMonthlyChatInquiryCount(storeId, year, month),
    enabled: !!storeId && !!year && !!month && (enabled !== undefined ? Boolean(enabled) : true),
    staleTime: 1 * 60 * 1000,
    ...restOptions,
  });
};

// 채팅방 메시지 조회 (무한 스크롤, cursorId 기반)
export const useChatMessages = (inquiryChatId, params = {}, options = {}) => {
  const { enabled, ...restOptions } = options;

  return useInfiniteQuery({
    queryKey: [...chatKeys.roomMessages(inquiryChatId), params],
    queryFn: ({ pageParam }) => {
      return getChatMessages(inquiryChatId, {
        ...params,
        cursorId: pageParam,
        size: params.size || 10,
      });
    },
    getNextPageParam: (lastPage) => {
      // hasNext가 true이고 nextId가 있으면 nextId 반환, 아니면 undefined
      if (lastPage?.hasNext && lastPage?.nextId !== undefined) {
        return lastPage.nextId;
      }
      return undefined;
    },
    initialPageParam: undefined, // 첫 요청은 cursorId 없이
    enabled: !!inquiryChatId && (enabled !== undefined ? Boolean(enabled) : true),
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    ...restOptions,
  });
};

// 메시지 전송 Mutation (웹소켓으로 전송하므로 React Query 사용 안 함)
// useSendMessage는 웹소켓 클라이언트를 직접 사용
