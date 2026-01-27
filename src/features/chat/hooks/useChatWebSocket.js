import { useEffect, useState, useRef } from 'react';
import { webSocketClient } from '@/shared/lib/websocket';
import { connectChatRoom } from '@/shared/api/chatApi';

export const useChatWebSocket = (selectedChatId, onMessageReceived) => {
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

      await webSocketClient.connect(
        selectedChatId,
        (receivedMessage) => {
          if (onMessageReceivedRef.current) {
            onMessageReceivedRef.current(receivedMessage);
          }
        },
        () => {
          setConnectionError('채팅 연결에 실패했습니다. 다시 시도해주세요.');
        },
      );
    } catch {
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

    return () => {
      webSocketClient.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatId]);

  const retryConnection = () => {
    setConnectionError(null);
    connectWebSocket();
  };

  return { isConnecting, connectionError, retryConnection };
};
