import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useChatMessages } from '@/features/chat/hooks/useChatQueries';
import { useAuth } from '@/context/AuthContext';
import ChatHeader from '@/features/chat/components/ChatHeader';
import ChatMessageList from '@/features/chat/components/ChatMessageList';
import ChatInput from '@/features/chat/components/ChatInput';
import { useChatRoom } from '@/features/chat/hooks/useChatRoom';
import { useChatWebSocket } from '@/features/chat/hooks/useChatWebSocket';
import { useSocket } from '@/features/chat/hooks/useSocket';

const ChatDetailPage = () => {
  const { user } = useAuth();
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const socket = useSocket();
  const [message, setMessage] = useState('');

  const { selectedChatId, displayStoreName, displayStoreImage } = useChatRoom(
    roomId,
    location.state,
  );

  const {
    data: chatMessagesData,
    error: messagesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchMessages,
  } = useChatMessages(
    selectedChatId,
    { size: 20 },
    {
      enabled: !!selectedChatId,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (messagesError) {
      console.error('❌ [ChatDetailPage] 메시지 조회 에러:', messagesError);
      const timer = setTimeout(() => {
        console.log('🔄 [ChatDetailPage] 메시지 조회 재시도');
        refetchMessages();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [messagesError, refetchMessages]);

  const chatListKey = useMemo(() => {
    return `chat-${selectedChatId}`;
  }, [selectedChatId]);

  const messages = useMemo(() => {
    if (!chatMessagesData?.pages) {
      return [];
    }

    const allMessages = chatMessagesData.pages.flatMap((page) => {
      if (page?.data && Array.isArray(page.data)) {
        return page.data.map((msg) => ({
          ...msg,
          content: msg.message || msg.content || '',
          message: msg.message || msg.content || '',
        }));
      }
      return [];
    });

    return allMessages.reverse();
  }, [chatMessagesData]);

  const handleMessageReceived = useCallback(
    (_receivedMessage) => {
      // 메시지 수신 처리
    },
    [],
  );

  const { isConnecting, connectionError, retryConnection } = useChatWebSocket(
    selectedChatId,
    handleMessageReceived,
  );

  const handleSend = () => {
    if (!message.trim() || !selectedChatId) {
      return;
    }

    const messageContent = message.trim();
    setMessage('');

    try {
      socket.sendMessage(selectedChatId, messageContent, 'user');
    } catch (error) {
      console.error('❌ [ChatDetailPage] 메시지 전송 실패:', error);
    }
  };

  const handleBack = () => {
    navigate('/chat');
  };

  if (!roomId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">채팅방을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <ChatHeader storeName={displayStoreName} storeImage={displayStoreImage} onBack={handleBack} />

      {connectionError && (
        <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <span className="text-red-700 text-sm flex-1">{connectionError}</span>
          <button
            onClick={retryConnection}
            className="ml-3 px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            재시도
          </button>
        </div>
      )}

      <ChatMessageList
        key={chatListKey}
        messages={messages}
        currentUser={user}
        isConnecting={isConnecting}
        onLoadMore={fetchNextPage}
        hasNextPage={hasNextPage || false}
        isFetchingNextPage={isFetchingNextPage || false}
      />

      <ChatInput
        message={message}
        setMessage={setMessage}
        onSend={handleSend}
        disabled={isConnecting || !!connectionError}
      />
    </div>
  );
};

export default ChatDetailPage;
