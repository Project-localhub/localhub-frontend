import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useChatMessages } from '@/shared/hooks/useChatQueries';
import { useAuth } from '@/context/AuthContext';
import ChatHeader from '@/features/chat/components/ChatHeader';
import ChatMessageList from '@/features/chat/components/ChatMessageList';
import ChatInput from '@/features/chat/components/ChatInput';
import { useChatRoom } from '@/features/chat/hooks/useChatRoom';
import { useChatWebSocket } from '@/features/chat/hooks/useChatWebSocket';
import { webSocketClient } from '@/shared/lib/websocket';

const ChatDetailPage = () => {
  const { user } = useAuth();
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [optimisticMessages, setOptimisticMessages] = useState([]);

  // 채팅방 찾기 로직 (커스텀 훅)
  const { selectedChatId, displayStoreName, displayStoreImage } = useChatRoom(
    roomId,
    location.state,
  );

  // 선택된 채팅방의 메시지 조회 (무한 스크롤)
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

  // 메시지 조회 실패 시 재시도
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

  // 마지막 채팅방 ID 저장
  useEffect(() => {
    if (selectedChatId) {
      localStorage.setItem('lastChatRoomId', selectedChatId);
    }
  }, [selectedChatId]);

  const loadedMessages = useMemo(() => {
    if (!chatMessagesData?.pages) {
      return [];
    }

    const allMessages = chatMessagesData.pages.flatMap((page) => {
      if (page?.data && Array.isArray(page.data)) {
        return page.data;
      }
      return [];
    });

    return allMessages;
  }, [chatMessagesData]);

  // 최종 메시지 목록 (로드된 메시지 + optimistic/received 메시지)
  const messages = useMemo(() => {
    // 모든 메시지를 합치되, 중복 제거 및 시간순 정렬
    const allMessages = [...loadedMessages];

    optimisticMessages.forEach((optMsg) => {
      // 같은 ID나 같은 내용+시간의 메시지가 이미 있으면 추가하지 않음
      const exists = allMessages.some(
        (msg) =>
          msg.id === optMsg.id ||
          msg.messageId === optMsg.messageId ||
          (msg.content === optMsg.content &&
            msg.sender === optMsg.sender &&
            Math.abs(new Date(msg.timestamp || 0) - new Date(optMsg.timestamp || 0)) < 1000),
      );
      if (!exists) {
        allMessages.push(optMsg);
      }
    });

    const sortedMessages = allMessages.sort((a, b) => {
      const timeA = new Date(a.timestamp || a.createdAt || 0);
      const timeB = new Date(b.timestamp || b.createdAt || 0);
      return timeA - timeB;
    });

    return sortedMessages;
  }, [loadedMessages, optimisticMessages]);

  // 웹소켓 메시지 수신 핸들러 (useCallback으로 메모이제이션)
  const handleMessageReceived = useCallback(
    (receivedMessage) => {
      // 같은 내용의 optimistic message가 있으면 제거하고 실제 메시지 추가
      setOptimisticMessages((prev) => {
        // optimistic message 제거
        const filtered = prev.filter(
          (msg) => !(msg.isOptimistic && msg.content === receivedMessage.content),
        );

        // 중복 체크 (이미 로드된 메시지나 다른 optimistic message와 중복인지)
        const isDuplicate = filtered.some(
          (msg) =>
            msg.id === receivedMessage.id ||
            (msg.content === receivedMessage.content &&
              Math.abs(new Date(msg.timestamp || 0) - new Date(receivedMessage.timestamp || 0)) <
                1000),
        );

        if (isDuplicate) {
          console.log('⚠️ [ChatDetailPage] 중복 메시지 무시:', receivedMessage);
          return filtered;
        }

        // 실제 메시지 추가 (optimistic이 아닌 실제 메시지)
        return [...filtered, { ...receivedMessage, isOptimistic: false }];
      });

      // 메시지 수신 시 마지막 채팅방 ID 업데이트
      if (selectedChatId) {
        localStorage.setItem('lastChatRoomId', selectedChatId);
      }
    },
    [selectedChatId],
  );

  // 웹소켓 연결 (커스텀 훅)
  const { isConnecting, connectionError, retryConnection } = useChatWebSocket(
    selectedChatId,
    handleMessageReceived,
  );

  // 메시지 전송
  const handleSend = () => {
    if (!message.trim() || !selectedChatId) {
      return;
    }

    const messageContent = message.trim();
    setMessage('');

    // Optimistic update: 메시지 전송 시 즉시 화면에 표시
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      messageId: `temp-${Date.now()}`,
      content: messageContent,
      message: messageContent,
      senderId: user?.id,
      sender: user?.name || user?.id,
      senderType: 'user',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    setOptimisticMessages((prev) => [...prev, optimisticMessage]);
    localStorage.setItem('lastChatRoomId', selectedChatId);

    try {
      webSocketClient.sendMessage(selectedChatId, messageContent, 'user');
    } catch {
      setOptimisticMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
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

      {/* 연결 에러 메시지 */}
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
