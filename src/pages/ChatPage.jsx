import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Search, Send } from 'lucide-react';
import { webSocketClient } from '@/shared/lib/websocket';
import { connectChatRoom } from '@/shared/api/chatApi';
import { useInquiryChats, useChatMessages } from '@/shared/hooks/useChatQueries';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/shared/ui/use-mobile';

const ChatPage = () => {
  const { user } = useAuth();
  const { roomId } = useParams(); // URL 파라미터에서 roomId 가져오기
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: chats = [], isLoading: isChatsLoading } = useInquiryChats({
    enabled: !!user?.id,
  });

  // URL에서 roomId를 가져오거나, 쿼리 파라미터에서 가져오기 (하위 호환성)
  const roomIdFromQuery = new URLSearchParams(location.search).get('roomId');
  const selectedRoomId = roomId || roomIdFromQuery;

  // URL state에서 채팅방 ID를 받아서 URL 파라미터로 리다이렉트 (하위 호환성)
  useEffect(() => {
    const chatRoomIdFromState = location.state?.chatRoomId;

    if (chatRoomIdFromState && chats.length > 0) {
      // 채팅방 목록에 해당 채팅방이 있는지 확인
      const chatExists = chats.some(
        (chat) => chat.id === chatRoomIdFromState || chat.inquiryChatId === chatRoomIdFromState,
      );
      if (chatExists) {
        // URL 파라미터로 리다이렉트
        navigate(`/chat/${chatRoomIdFromState}`, { replace: true, state: null });
      }
    }
  }, [location.state, chats, navigate]);

  // 선택된 채팅방 찾기 (id 또는 inquiryChatId로 매칭)
  const currentChat = selectedRoomId
    ? chats.find((chat) => chat.id === selectedRoomId || chat.inquiryChatId === selectedRoomId)
    : null;

  // 선택된 채팅방의 실제 ID (inquiryChatId 우선, 없으면 id 사용)
  const selectedChatId = currentChat?.inquiryChatId || currentChat?.id || selectedRoomId;

  // 선택된 채팅방의 메시지 조회
  const { data: chatMessagesData } = useChatMessages(
    selectedChatId,
    {},
    {
      enabled: !!selectedChatId,
    },
  );

  // 메시지 스크롤을 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 기존 메시지 로드
  useEffect(() => {
    if (chatMessagesData?.content) {
      setMessages(chatMessagesData.content || []);
    } else if (chatMessagesData && Array.isArray(chatMessagesData)) {
      setMessages(chatMessagesData);
    }
  }, [chatMessagesData]);

  // 웹소켓 연결 및 메시지 수신
  useEffect(() => {
    if (!selectedChatId) {
      // 채팅방이 선택되지 않으면 웹소켓 연결 해제
      webSocketClient.disconnect();
      return;
    }

    const connectWebSocket = async () => {
      setIsConnecting(true);
      try {
        // POST /stomp/chats로 채팅방 연결
        await connectChatRoom(selectedChatId);

        // 웹소켓 연결
        await webSocketClient.connect(
          selectedChatId,
          (receivedMessage) => {
            // 메시지 수신 시 상태 업데이트
            setMessages((prev) => [...prev, receivedMessage]);
          },
          () => {
            alert('채팅 연결에 실패했습니다. 다시 시도해주세요.');
          },
        );
      } catch {
        alert('채팅 연결에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsConnecting(false);
      }
    };

    connectWebSocket();

    // 컴포넌트 언마운트 시 웹소켓 연결 해제
    return () => {
      webSocketClient.disconnect();
    };
  }, [selectedChatId]);

  const handleSend = () => {
    if (!message.trim() || !selectedChatId) {
      return;
    }

    try {
      // 웹소켓으로 메시지 전송
      webSocketClient.sendMessage(selectedChatId, message.trim(), 'user');
      setMessage('');
    } catch {
      alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 필터링된 채팅방 목록
  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      chat.storeName?.toLowerCase().includes(searchLower) ||
      chat.lastMessage?.toLowerCase().includes(searchLower)
    );
  });

  // 채팅방 목록 컴포넌트
  const ChatList = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
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
        {isChatsLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">로딩 중...</div>
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
            // 채팅방 ID (inquiryChatId 우선, 없으면 id 사용)
            const chatId = chat.inquiryChatId || chat.id;
            const isSelected = selectedRoomId === chatId;
            return (
              <button
                key={chat.id || chat.inquiryChatId}
                onClick={() => {
                  if (isMobile) {
                    navigate(`/chat/${chatId}`);
                  } else {
                    navigate(`/chat/${chatId}`, { replace: true });
                  }
                }}
                className={`w-full flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 ${
                  isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                }`}
              >
                <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden shrink-0">
                  {chat.storeImage ? (
                    <img
                      src={chat.storeImage}
                      alt={chat.storeName || '가게'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white text-lg">
                      {chat.storeName?.[0] || '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-900 font-medium">
                      {chat.storeName || '알 수 없음'}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {chat.lastMessageTime
                        ? new Date(chat.lastMessageTime).toLocaleTimeString('ko-KR', {
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
                      <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">
                        {chat.unreadCount}
                      </span>
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

  // 채팅 내역 컴포넌트
  const ChatDetail = () => {
    if (!currentChat && selectedRoomId) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">채팅방을 찾을 수 없습니다.</div>
        </div>
      );
    }

    if (!selectedRoomId) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center text-gray-500">
            <p className="mb-2">채팅방을 선택해주세요</p>
            <p className="text-sm">왼쪽 목록에서 채팅방을 선택하세요</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          {isMobile && (
            <button onClick={() => navigate('/chat')} className="text-gray-600">
              ←
            </button>
          )}
          <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
            {currentChat?.storeImage ? (
              <img
                src={currentChat.storeImage}
                alt={currentChat.storeName || '가게'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white">
                {currentChat?.storeName?.[0] || '?'}
              </div>
            )}
          </div>
          <span className="text-gray-900 font-medium">
            {currentChat?.storeName || '알 수 없음'}
          </span>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {isConnecting && (
            <div className="text-center text-gray-500 text-sm py-4">채팅 연결 중...</div>
          )}
          {messages.length === 0 && !isConnecting && (
            <div className="text-center text-gray-500 text-sm py-4">메시지가 없습니다</div>
          )}
          {messages.map((msg, index) => {
            // 메시지가 user가 보낸 것인지 확인 (userId와 현재 사용자 ID 비교)
            const isMyMessage = msg.senderId === user?.id || msg.senderType === 'user';
            return (
              <div
                key={msg.id || msg.messageId || index}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] ${
                    isMyMessage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                  } rounded-lg px-4 py-2`}
                >
                  <p>{msg.content || msg.message}</p>
                  <span
                    className={`text-xs ${
                      isMyMessage ? 'text-blue-100' : 'text-gray-500'
                    } block mt-1`}
                  >
                    {msg.timestamp || msg.createdAt
                      ? new Date(msg.timestamp || msg.createdAt).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : msg.time || ''}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <input
              type="text"
              placeholder="메시지를 입력하세요"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="text-blue-600 disabled:text-gray-400"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 모바일: 전체 화면 전환 방식
  if (isMobile) {
    if (!selectedRoomId) {
      return <ChatList />;
    }
    return <ChatDetail />;
  }

  // 데스크톱: 사이드바 + 메인 영역 (한 화면에 둘 다 표시)
  return (
    <div className="flex h-full">
      <div className="w-80 shrink-0">
        <ChatList />
      </div>
      <div className="flex-1 min-w-0">
        <ChatDetail />
      </div>
    </div>
  );
};

export default ChatPage;
