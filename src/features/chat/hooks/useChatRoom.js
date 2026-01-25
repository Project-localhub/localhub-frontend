import { useMemo } from 'react';
import { useInquiryChats } from '@/shared/hooks/useChatQueries';

/**
 * 채팅방 찾기 로직을 처리하는 커스텀 훅
 * @param {string} roomId - URL 파라미터로 받은 roomId
 * @param {object} locationState - location.state (가게 정보 포함)
 * @returns {object} { currentChat, selectedChatId, displayStoreName, displayStoreImage }
 */
export const useChatRoom = (roomId, locationState) => {
  const { data: chats = [] } = useInquiryChats({
    enabled: true, // roomId가 없어도 채팅방 목록을 가져와야 함
  });

  // 선택된 채팅방 찾기
  const currentChat = useMemo(() => {
    if (!roomId) return null;

    return chats.find((chat) => {
      const chatId = String(chat.id || chat.roomId || '');
      const roomIdStr = String(roomId);
      // id로 직접 매칭
      if (chatId === roomIdStr) return true;
      // restaurantId로도 찾기
      const chatRestaurantId = String(chat.restaurantId || chat.restaurant?.id || '');
      if (chatRestaurantId === roomIdStr) return true;
      return false;
    });
  }, [roomId, chats]);

  // 선택된 채팅방의 실제 ID (inquiryChatId)
  const selectedChatId = useMemo(() => {
    let chatId = currentChat?.id || roomId;

    // currentChat을 찾지 못했지만 채팅방 목록이 있고, roomId가 매칭되지 않으면
    // 채팅방 목록에서 restaurantId로 매칭 시도
    if (!currentChat && chats.length > 0 && roomId) {
      const matchedByRestaurantId = chats.find((chat) => {
        const chatRestaurantId = String(chat.restaurantId || chat.restaurant?.id || '');
        return chatRestaurantId === String(roomId);
      });
      if (matchedByRestaurantId) {
        chatId = matchedByRestaurantId.id;
      } else if (chats.length > 0 && chats[0].id) {
        // restaurantId로도 매칭되지 않으면, 채팅방 목록의 첫 번째 채팅방 ID 사용
        chatId = chats[0].id;
      }
    }

    return chatId;
  }, [currentChat, roomId, chats]);

  // 표시할 가게 이름과 이미지
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
