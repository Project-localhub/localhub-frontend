import { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useQueryClient } from '@tanstack/react-query';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { chatKeys } from '@/features/chat/hooks/useChatQueries';
import { SocketContext } from './SocketContext';

export const SocketProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionsRef = useRef(new Map());
  const messageHandlersRef = useRef(new Map());

  const handleMessage = useCallback(
    (roomId, message) => {
      if (!message.body) {
        return;
      }

      try {
        const data = JSON.parse(message.body);
        let parsed = data;

        if (Array.isArray(data)) {
          if (data.length === 0) {
            return;
          }
          parsed = data[0];
        }

        if (!parsed || !parsed.sender || !parsed.message) {
          return;
        }

        const transformedMessage = {
          content: parsed.message || parsed.content,
          message: parsed.message || parsed.content,
          sender: parsed.sender,
          senderId: parsed.senderId || parsed.sender,
          senderType: parsed.senderType || 'user',
          timestamp: parsed.timestamp || new Date().toISOString(),
          createdAt: parsed.createdAt || parsed.timestamp || new Date().toISOString(),
          id: parsed.id || Date.now().toString(),
          messageId: parsed.messageId || parsed.id || Date.now().toString(),
        };

        const handler = messageHandlersRef.current.get(roomId);
        if (handler) {
          handler(transformedMessage);
        }

        queryClient.invalidateQueries({ queryKey: chatKeys.roomMessages(roomId) });

        queryClient.setQueryData(chatKeys.inquiryChats(), (oldData) => {
          if (!oldData) {
            return oldData;
          }

          return oldData.map((chat) => {
            const chatId = chat.id || chat.roomId;
            if (String(chatId) === String(roomId)) {
              return {
                ...chat,
                lastMessage: transformedMessage.message,
                lastMessageTime: transformedMessage.timestamp,
                lastMessageAt: transformedMessage.timestamp,
                unreadCount: chat.unreadCount ? chat.unreadCount + 1 : 1,
              };
            }
            return chat;
          });
        });
      } catch (error) {
        console.error('Failed to update chat list cache:', error);
      }
    },
    [queryClient],
  );

  const connect = useCallback(
    async (roomId, onMessage) => {
      if (!roomId) {
        return Promise.resolve();
      }

      if (messageHandlersRef.current.has(roomId)) {
        messageHandlersRef.current.set(roomId, onMessage);
        return Promise.resolve();
      }

      messageHandlersRef.current.set(roomId, onMessage);

      if (isConnected && client) {
        const subscribePath = `/sub/chats/${roomId}`;
        try {
          const subscription = client.subscribe(
            subscribePath,
            (message) => handleMessage(roomId, message),
            { id: `sub-${roomId}` },
          );
          subscriptionsRef.current.set(roomId, subscription);
        } catch (error) {
          console.error('❌ [SocketProvider] 구독 실패:', error);
        }
        return Promise.resolve();
      }

      if (client && client.connected) {
        return Promise.resolve();
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';
      const normalizedBaseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const wsUrl = `${normalizedBaseUrl}/stomp/chats`;
      const token = localStorage.getItem('accessToken');

      const stompClient = new Client({
        webSocketFactory: () => {
          return new SockJS(wsUrl, null, {
            transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
            withCredentials: true,
          });
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        connectHeaders: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
        debug: () => {},
        onConnect: () => {
          setIsConnected(true);

          subscriptionsRef.current.forEach((subscription) => {
            subscription.unsubscribe();
          });
          subscriptionsRef.current.clear();

          messageHandlersRef.current.forEach((handler, roomId) => {
            const subscribePath = `/sub/chats/${roomId}`;
            try {
              const subscription = stompClient.subscribe(
                subscribePath,
                (message) => handleMessage(roomId, message),
                { id: `sub-${roomId}` },
              );
              subscriptionsRef.current.set(roomId, subscription);
            } catch (error) {
              console.error('❌ [SocketProvider] 구독 실패:', error);
            }
          });
        },
        onStompError: (frame) => {
          console.error('❌ [SocketProvider] STOMP 에러:', frame);
          setIsConnected(false);
        },
        onWebSocketClose: () => {
          setIsConnected(false);
          subscriptionsRef.current.clear();
        },
        onDisconnect: () => {
          setIsConnected(false);
          subscriptionsRef.current.clear();
        },
      });

      setClient(stompClient);
      stompClient.activate();

      return new Promise((resolve, reject) => {
        let timeoutId = null;
        let intervalId = null;
        let isResolved = false;

        const cleanup = () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        };

        timeoutId = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            cleanup();
            reject(new Error('웹소켓 연결 타임아웃'));
          }
        }, 10000);

        let connectionChecked = false;
        intervalId = setInterval(() => {
          if (stompClient.connected && !connectionChecked && !isResolved) {
            connectionChecked = true;
            isResolved = true;
            cleanup();
            resolve();
          }
        }, 100);
      });
    },
    [isConnected, client, handleMessage],
  );

  const disconnect = useCallback(
    (roomId) => {
      if (roomId) {
        const subscription = subscriptionsRef.current.get(roomId);
        if (subscription) {
          subscription.unsubscribe();
          subscriptionsRef.current.delete(roomId);
        }
        messageHandlersRef.current.delete(roomId);
      } else {
        subscriptionsRef.current.forEach((subscription) => {
          subscription.unsubscribe();
        });
        subscriptionsRef.current.clear();
        messageHandlersRef.current.clear();

        if (client) {
          client.deactivate();
          setClient(null);
          setIsConnected(false);
        }
      }
    },
    [client],
  );

  const sendMessage = useCallback(
    (roomId, content, senderType = 'user') => {
      if (!isConnected || !client) {
        throw new Error('웹소켓이 연결되지 않았습니다.');
      }

      const destination = `/pub/chats/${roomId}`;
      const messageBody = {
        content,
        message: content,
        senderType,
        timestamp: new Date().toISOString(),
      };

      client.publish({
        destination,
        body: JSON.stringify(messageBody),
      });
    },
    [isConnected, client],
  );

  useEffect(() => {
    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [client]);

  const value = {
    connect,
    disconnect,
    sendMessage,
    isConnected,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
