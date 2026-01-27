import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  createInquiryChat,
  getInquiryChats,
  getChatMessages,
  getOwnerChatRooms,
  getMonthlyChatInquiryCount,
} from '@/shared/api/chatApi';

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

export const useCreateInquiryChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId }) => createInquiryChat(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
    },
  });
};

export const useInquiryChats = (options = {}) => {
  return useQuery({
    queryKey: chatKeys.inquiryChats(),
    queryFn: () => getInquiryChats(),
    staleTime: 30 * 1000,
    refetchInterval: options.refetchInterval !== undefined ? options.refetchInterval : 30 * 1000,
    ...options,
  });
};

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
      if (lastPage?.hasNext && lastPage?.nextId !== undefined) {
        return lastPage.nextId;
      }
      return undefined;
    },
    initialPageParam: undefined,
    enabled: !!inquiryChatId && (enabled !== undefined ? Boolean(enabled) : true),
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    ...restOptions,
  });
};
