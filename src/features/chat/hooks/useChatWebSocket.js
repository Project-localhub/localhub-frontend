import { useEffect, useState, useRef } from 'react';
import { webSocketClient } from '@/shared/lib/websocket';
import { connectChatRoom } from '@/shared/api/chatApi';

/**
 * 웹소켓 연결 및 메시지 수신을 처리하는 커스텀 훅
 * @param {string} selectedChatId - 채팅방 ID
 * @param {function} onMessageReceived - 메시지 수신 콜백
 * @returns {object} { isConnecting, connectionError, retryConnection }
 */
export const useChatWebSocket = (selectedChatId, onMessageReceived) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  // onMessageReceived를 ref로 관리하여 의존성 배열 문제 해결
  const onMessageReceivedRef = useRef(onMessageReceived);

  // ref 업데이트
  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  const connectWebSocket = async () => {
    if (!selectedChatId) {
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      // POST /stomp/chats로 채팅방 연결
      await connectChatRoom(selectedChatId);

      // 웹소켓 연결
      await webSocketClient.connect(
        selectedChatId,
        (receivedMessage) => {
          if (onMessageReceivedRef.current) {
            onMessageReceivedRef.current(receivedMessage);
          }
        },
        () => {
          console.error('❌ [useChatWebSocket] 웹소켓 연결 실패');
          setConnectionError('채팅 연결에 실패했습니다. 다시 시도해주세요.');
        },
      );
      console.log('✅ [useChatWebSocket] 웹소켓 연결 성공:', selectedChatId);
    } catch (error) {
      console.error('❌ [useChatWebSocket] 채팅방 연결 실패:', error);
      setConnectionError('채팅 연결에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (!selectedChatId) {
      webSocketClient.disconnect();
      setConnectionError(null);
      return;
    }

    connectWebSocket();

    // 컴포넌트 언마운트 시 웹소켓 연결 해제
    return () => {
      webSocketClient.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatId]); // onMessageReceived는 ref로 관리하므로 의존성에서 제외

  const retryConnection = () => {
    setConnectionError(null);
    connectWebSocket();
  };

  return { isConnecting, connectionError, retryConnection };
};
