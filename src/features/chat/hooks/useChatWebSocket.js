import { useEffect, useState, useRef } from 'react';
import { useSocket } from './useSocket';
import { connectChatRoom } from '@/shared/api/chatApi';

export const useChatWebSocket = (selectedChatId, onMessageReceived) => {
  const socket = useSocket();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const onMessageReceivedRef = useRef(onMessageReceived);
  const isMountedRef = useRef(true);

  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  const connectWebSocket = async () => {
    if (!selectedChatId) {
      return;
    }

    if (!isMountedRef.current) {
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      await connectChatRoom(selectedChatId);

      if (!isMountedRef.current) {
        return;
      }

      await socket.connect(selectedChatId, (receivedMessage) => {
        if (onMessageReceivedRef.current && isMountedRef.current) {
          onMessageReceivedRef.current(receivedMessage);
        }
      });
    } catch (error) {
      if (isMountedRef.current) {
        setConnectionError('채팅 연결에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsConnecting(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    if (!selectedChatId) {
      socket.disconnect(selectedChatId);
      setConnectionError(null);
      return;
    }

    connectWebSocket();

    return () => {
      isMountedRef.current = false;
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
