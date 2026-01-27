import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useInquiryChats, chatKeys } from '@/shared/hooks/useChatQueries';
import { useAuth } from '@/context/AuthContext';
import { getRestaurantDetail } from '@/shared/api/storeApi';

const ChatListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const isOwner = user?.userType === 'OWNER' || user?.userType === 'owner';

  const {
    data: chats = [],
    isLoading: isChatsLoading,
    refetch,
  } = useInquiryChats({
    enabled: !!user?.id,
    refetchInterval: isOwner ? 5 * 1000 : 30 * 1000, // 사업자는 5초마다, 일반 사용자는 30초마다
    refetchOnWindowFocus: true, // 창 포커스 시 자동 갱신
  });

  useEffect(() => {
    if (!user?.id) return;

    const handleMessage = () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.inquiryChats() });
      refetch();
    };

    window.addEventListener('chatMessageReceived', handleMessage);

    return () => {
      window.removeEventListener('chatMessageReceived', handleMessage);
    };
  }, [user?.id, queryClient, refetch]);

  const restaurantIds = useMemo(() => {
    const ids = chats
      .map((chat) => chat.restaurantId || chat.restaurant?.id)
      .filter((id) => id != null);
    return [...new Set(ids)]; // 중복 제거
  }, [chats]);

  const restaurantQueries = useQuery({
    queryKey: ['restaurants', restaurantIds],
    queryFn: async () => {
      const results = await Promise.all(
        restaurantIds.map(async (restaurantId) => {
          try {
            const restaurant = await getRestaurantDetail(restaurantId);
            return { restaurantId, restaurant };
          } catch {
            return { restaurantId, restaurant: null };
          }
        }),
      );
      const restaurantMap = new Map();
      results.forEach(({ restaurantId, restaurant }) => {
        restaurantMap.set(restaurantId, restaurant);
      });
      return restaurantMap;
    },
    enabled: restaurantIds.length > 0 && !isChatsLoading,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
  });

  const restaurantMap = useMemo(() => {
    return restaurantQueries.data || new Map();
  }, [restaurantQueries.data]);

  // 필터링된 채팅방 목록
  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();

      // 실제 응답 형식에 맞게 필터링
      const restaurantId = chat.restaurantId || chat.restaurant?.id;
      const restaurant = restaurantId ? restaurantMap.get(restaurantId) : null;
      const storeName = restaurant?.name || '';
      const ownerName = chat.ownerName || '';
      const userName = chat.userName || '';

      return (
        storeName.toLowerCase().includes(searchLower) ||
        ownerName.toLowerCase().includes(searchLower) ||
        userName.toLowerCase().includes(searchLower) ||
        chat.lastMessage?.toLowerCase().includes(searchLower)
      );
    });
  }, [chats, searchQuery, restaurantMap]);

  const handleChatClick = (chat) => {
    // 실제 응답 형식: id가 채팅방 ID
    const chatId = chat.id || chat.roomId;

    // 사용자 역할에 따라 표시할 이름과 이미지 결정
    const restaurantId = chat.restaurantId || chat.restaurant?.id;
    const restaurant = restaurantId ? restaurantMap.get(restaurantId) : null;

    let displayName = '알 수 없음';
    let displayImage = null;

    if (isOwner) {
      // 사장님인 경우: 채팅 온 유저 닉네임 표시
      // 응답에 userName 필드가 없으므로, userId가 있으면 "유저"로 표시하거나
      // 백엔드에서 userName 필드를 추가해야 함
      displayName = chat.userName || (chat.userId ? `유저 ${chat.userId}` : '알 수 없음');
      // TODO: 유저 프로필 이미지 API가 있으면 사용
      displayImage = null;
    } else {
      // 일반 유저인 경우: 가게 이름 표시
      displayName = restaurant?.name || chat.ownerName || '알 수 없음';
      displayImage =
        restaurant?.images && restaurant.images.length > 0
          ? restaurant.images[0].imageUrl || restaurant.images[0].imageKey
          : null;
    }

    // 마지막 채팅방 ID 저장
    localStorage.setItem('lastChatRoomId', String(chatId));
    navigate(`/chat/${chatId}`, {
      state: {
        storeName: displayName,
        storeImage: displayImage,
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 mb-4">채팅</h1>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
          <Search size={20} className="text-gray-500" />
          <input
            type="text"
            placeholder="채팅 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isChatsLoading || restaurantQueries.isLoading ? (
          <div className="flex-center h-full">
            <div className="text-muted">로딩 중...</div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="mb-2">채팅방이 없습니다</p>
              <p className="text-sm">새로운 채팅을 시작해보세요!</p>
            </div>
          </div>
        ) : (
          filteredChats.map((chat) => {
            // 실제 응답 형식: id가 채팅방 ID
            const chatId = chat.id || chat.roomId;

            // 사용자 역할에 따라 표시할 이름과 이미지 결정
            const restaurantId = chat.restaurantId || chat.restaurant?.id;
            const restaurant = restaurantId ? restaurantMap.get(restaurantId) : null;

            let displayName = '알 수 없음';
            let displayImage = null;

            if (isOwner) {
              // 사장님인 경우: 채팅 온 유저 닉네임 표시
              // 응답에 userName 필드가 없으므로, userId가 있으면 "유저"로 표시하거나
              // 백엔드에서 userName 필드를 추가해야 함
              displayName = chat.userName || (chat.userId ? `유저 ${chat.userId}` : '알 수 없음');
              // TODO: 유저 프로필 이미지 API가 있으면 사용
              displayImage = null;
            } else {
              // 일반 유저인 경우: 가게 이름 표시
              displayName = restaurant?.name || chat.ownerName || '알 수 없음';
              displayImage =
                restaurant?.images && restaurant.images.length > 0
                  ? restaurant.images[0].imageUrl || restaurant.images[0].imageKey
                  : null;
            }

            return (
              <button
                key={chatId}
                onClick={() => handleChatClick(chat)}
                className="w-full flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50"
              >
                <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden shrink-0">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // 이미지 로드 실패 시 기본 이미지로 대체
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full bg-gray-400 flex items-center justify-center text-white text-lg ${
                      displayImage ? 'hidden' : ''
                    }`}
                  >
                    {displayName?.[0] || '?'}
                  </div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-900 font-medium">{displayName}</span>
                    <span className="text-gray-500 text-sm">
                      {chat.lastMessageTime
                        ? new Date(chat.lastMessageTime).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : chat.lastMessageAt
                          ? new Date(chat.lastMessageAt).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 text-sm truncate">
                      {chat.lastMessage || '메시지가 없습니다'}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="ml-2 badge-primary">{chat.unreadCount}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatListPage;
