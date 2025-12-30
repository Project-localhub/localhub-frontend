import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Send } from 'lucide-react';
import { webSocketClient } from '@/shared/lib/websocket';
import { connectChatRoom } from '@/shared/api/chatApi';
import { useInquiryChats, useChatMessages } from '@/shared/hooks/useChatQueries';
import { useAuth } from '@/context/AuthContext';

const ChatPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef(null);

  // 채팅방 목록 조회 (일반 사용자는 userId로, 사장님은 storeId로 조회)
  const { data: chats = [], isLoading: isChatsLoading } = useInquiryChats(
    user?.userType === 'OWNER' ? { storeId: user?.id } : { userId: user?.id },
    {
      enabled: !!user?.id,
    },
  );

  // URL state나 쿼리 파라미터에서 채팅방 ID 가져오기
  useEffect(() => {
    const chatRoomIdFromState = location.state?.chatRoomId;
    const chatRoomIdFromQuery = new URLSearchParams(location.search).get('roomId');

    const chatRoomId = chatRoomIdFromState || chatRoomIdFromQuery;

    if (chatRoomId && chats.length > 0) {
      // 채팅방 목록에 해당 채팅방이 있는지 확인
      const chatExists = chats.some(
        (chat) => chat.id === chatRoomId || chat.inquiryChatId === chatRoomId,
      );
      if (chatExists) {
        setSelectedChat(chatRoomId);
        // state 정리 (뒤로가기 시 중복 선택 방지)
        navigate(location.pathname, { replace: true, state: null });
      }
    }
  }, [location.state, location.search, chats, navigate, location.pathname]);

  // 선택된 채팅방의 메시지 조회
  const { data: chatMessagesData } = useChatMessages(
    selectedChat,
    {},
    {
      enabled: !!selectedChat,
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
    if (!selectedChat) {
      // 채팅방이 선택되지 않으면 웹소켓 연결 해제
      webSocketClient.disconnect();
      return;
    }

    const connectWebSocket = async () => {
      setIsConnecting(true);
      try {
        // POST /stomp/chats로 채팅방 연결
        await connectChatRoom(selectedChat);

        // 웹소켓 연결
        await webSocketClient.connect(
          selectedChat,
          (receivedMessage) => {
            // 메시지 수신 시 상태 업데이트
            setMessages((prev) => [...prev, receivedMessage]);
          },
          (error) => {
            console.error('웹소켓 에러:', error);
            alert('채팅 연결에 실패했습니다. 다시 시도해주세요.');
          },
        );
      } catch (error) {
        console.error('웹소켓 연결 오류:', error);
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
  }, [selectedChat]);

  const handleSend = () => {
    if (!message.trim() || !selectedChat) {
      return;
    }

    try {
      // 웹소켓으로 메시지 전송
      webSocketClient.sendMessage(selectedChat, message.trim(), 'user');
      setMessage('');
    } catch (error) {
      console.error('메시지 전송 오류:', error);
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

  if (!selectedChat) {
    return (
      <div className="flex flex-col h-full bg-white">
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
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className="w-full flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50"
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
                    <span className="text-gray-900">{chat.storeName || '알 수 없음'}</span>
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
            ))
          )}
        </div>
      </div>
    );
  }

  const currentChat = chats.find((chat) => chat.id === selectedChat);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <button onClick={() => setSelectedChat(null)} className="text-gray-600">
          ←
        </button>
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
        <span className="text-gray-900">{currentChat?.storeName || '알 수 없음'}</span>
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

export default ChatPage;
