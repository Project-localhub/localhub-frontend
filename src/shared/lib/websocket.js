import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(roomId, onMessage, onError) {
    if (this.isConnected && this.subscriptions.has(roomId)) {
      return Promise.resolve();
    }

    if (this.isConnected) {
      const existingSubscription = this.subscriptions.get(roomId);
      if (!existingSubscription) {
        const subscribePath = `/sub/chats/${roomId}`;
        const subscription = this.client.subscribe(
          subscribePath,
          (message) => this.handleMessage(message, onMessage),
          { id: `sub-${roomId}` },
        );
        this.subscriptions.set(roomId, subscription);
      }
      return Promise.resolve();
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';
    const wsUrl = `${apiBaseUrl}/stomp/chats`;

    // 인증 토큰 가져오기 (클라이언트 생성 전에)
    const token = localStorage.getItem('accessToken');

    this.client = new Client({
      webSocketFactory: () => {
        return new SockJS(wsUrl);
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
      onConnect: (_frame) => {
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // 채팅방 구독 (연결이 완전히 완료된 후에 구독)
        const subscribePath = `/sub/chats/${roomId}`;

        setTimeout(() => {
          try {
            if (!this.client || !this.client.connected) {
              return;
            }

            const subscription = this.client.subscribe(
              subscribePath,
              (message) => {
                try {
                  const parsed = JSON.parse(message.body);

                  // 빈 배열이거나 배열인 경우 처리
                  if (Array.isArray(parsed)) {
                    if (parsed.length === 0) {
                      return;
                    }
                    // 배열의 첫 번째 요소가 메시지일 수 있음
                    const data = parsed[0];
                    if (data && data.sender && data.message) {
                      const transformedMessage = {
                        content: data.message || data.content,
                        message: data.message || data.content,
                        sender: data.sender,
                        senderId: data.senderId || data.sender,
                        senderType: data.senderType || 'user',
                        timestamp: data.timestamp || new Date().toISOString(),
                        createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
                        id: data.id || Date.now().toString(),
                        messageId: data.messageId || data.id || Date.now().toString(),
                      };
                      if (onMessage) {
                        onMessage(transformedMessage);
                      }
                      return;
                    }
                  }

                  // 객체인 경우 (일반적인 경우)
                  if (parsed && typeof parsed === 'object' && parsed.sender && parsed.message) {
                    // 기존 handleMessage 호출 (변환된 형식으로)
                    this.handleMessage(message, onMessage);
                  }
                } catch {
                  this.handleMessage(message, onMessage);
                }
              },
              {
                id: `sub-${roomId}`,
              },
            );

            this.subscriptions.set(roomId, subscription);
          } catch (error) {
            if (onError) {
              onError(error);
            }
          }
        }, 100);
      },
      onStompError: (frame) => {
        this.isConnected = false;
        if (onError) {
          onError(frame);
        }
      },
      onWebSocketClose: () => {
        this.isConnected = false;
        this.subscriptions.clear();
      },
      onDisconnect: () => {
        this.isConnected = false;
        this.subscriptions.clear();
      },
    });

    this.client.activate();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('웹소켓 연결 타임아웃'));
      }, 10000);

      let connectionChecked = false;
      const checkConnection = setInterval(() => {
        if (this.isConnected && !connectionChecked) {
          connectionChecked = true;
          clearTimeout(timeout);
          clearInterval(checkConnection);
          resolve();
        }
      }, 100);
    });
  }

  handleMessage(message, onMessage) {
    if (!message.body) {
      return;
    }
    try {
      const data = JSON.parse(message.body);

      const transformedMessage = {
        content: data.message || data.content,
        message: data.message || data.content,
        sender: data.sender,
        senderId: data.senderId || data.sender,
        senderType: data.senderType || 'user',
        timestamp: data.timestamp || new Date().toISOString(),
        createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
        id: data.id || Date.now().toString(),
        messageId: data.messageId || data.id || Date.now().toString(),
      };

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('chatMessageReceived', { detail: transformedMessage }),
        );
      }

      if (onMessage) {
        onMessage(transformedMessage);
      }
    } catch {
      // 메시지 파싱 실패 시 무시
    }
  }

  sendMessage(roomId, content, senderType = 'user') {
    if (!this.isConnected || !this.client) {
      throw new Error('웹소켓이 연결되지 않았습니다.');
    }

    const destination = `/pub/chats/${roomId}`;
    const messageBody = {
      content,
      message: content,
      senderType,
      timestamp: new Date().toISOString(),
    };

    this.client.publish({
      destination,
      body: JSON.stringify(messageBody),
    });
  }

  unsubscribe(roomId) {
    const subscription = this.subscriptions.get(roomId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(roomId);
    }
  }

  disconnect() {
    if (this.client) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }

  getConnected() {
    return this.isConnected;
  }
}

export const webSocketClient = new WebSocketClient();
