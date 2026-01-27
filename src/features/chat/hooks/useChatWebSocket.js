import { useEffect, useState, useRef } from 'react';
import { useSocket } from './useSocket';
import { connectChatRoom } from '@/shared/api/chatApi';

export const useChatWebSocket = (selectedChatId, onMessageReceived) => {
  const socket = useSocket();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const onMessageReceivedRef = useRef(onMessageReceived);

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
      await connectChatRoom(selectedChatId);

      await socket.connect(selectedChatId, (receivedMessage) => {
        if (onMessageReceivedRef.current) {
          onMessageReceivedRef.current(receivedMessage);
        }
      });
    } catch {
      setConnectionError('채팅 연결에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (!selectedChatId) {
      socket.disconnect(selectedChatId);
      setConnectionError(null);
      return;
    }

    connectWebSocket();

    return () => {
      socket.disconnect(selectedChatId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatId]);

  const retryConnection = () => {
    setConnectionError(null);
    connectWebSocket();
  };

  return { isConnecting, connectionError, retryConnection };
};
