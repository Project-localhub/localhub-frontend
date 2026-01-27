import { useMemo } from 'react';
import { useInquiryChats } from '@/features/chat/hooks/useChatQueries';

export const useChatRoom = (roomId, locationState) => {
  const { data: chats = [] } = useInquiryChats({
    enabled: true,
  });

  const currentChat = useMemo(() => {
    if (!roomId) return null;

    return chats.find((chat) => {
      const chatId = String(chat.id || chat.roomId || '');
      const roomIdStr = String(roomId);
      if (chatId === roomIdStr) return true;
      const chatRestaurantId = String(chat.restaurantId || chat.restaurant?.id || '');
      if (chatRestaurantId === roomIdStr) return true;
      return false;
    });
  }, [roomId, chats]);

  const selectedChatId = useMemo(() => {
    let chatId = currentChat?.id || roomId;

    if (!currentChat && chats.length > 0 && roomId) {
      const matchedByRestaurantId = chats.find((chat) => {
        const chatRestaurantId = String(chat.restaurantId || chat.restaurant?.id || '');
        return chatRestaurantId === String(roomId);
      });
      if (matchedByRestaurantId) {
        chatId = matchedByRestaurantId.id;
      } else if (chats.length > 0 && chats[0].id) {
        chatId = chats[0].id;
      }
    }

    return chatId;
  }, [currentChat, roomId, chats]);
  const displayStoreName =
    currentChat?.restaurant?.name ||
    currentChat?.peer?.displayName ||
    locationState?.storeName ||
    '알 수 없음';

  const displayStoreImage = currentChat?.peer?.profileUrl || locationState?.storeImage;

  return {
    currentChat,
    selectedChatId,
    displayStoreName,
    displayStoreImage,
  };
};
