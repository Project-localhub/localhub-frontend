// import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';

/**
 * STOMP 웹소켓 클라이언트 생성 및 관리
 */
class WebSocketClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * 웹소켓 연결
   * @param {string} roomId - 채팅방 ID
   * @param {Function} onMessage - 메시지 수신 콜백
   * @param {Function} onError - 에러 콜백
   * @returns {Promise<void>}
   */
  connect(roomId, onMessage, onError) {
    if (this.isConnected) {
      return Promise.resolve();
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';
    const wsUrl = apiBaseUrl.replace(/^http/, 'ws') + '/stomp';

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${apiBaseUrl}/stomp`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('STOMP:', str);
        }
      },
      onConnect: () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // 채팅방 구독
        const subscription = this.client.subscribe(`/sub/chats/${roomId}`, (message) => {
          try {
            const data = JSON.parse(message.body);
            onMessage(data);
          } catch (error) {
            console.error('메시지 파싱 오류:', error);
          }
        });

        this.subscriptions.set(roomId, subscription);
      },
      onStompError: (frame) => {
        console.error('STOMP 에러:', frame);
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

    // 인증 토큰 추가
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.client.configure({
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      // 토큰이 없으면 기본 헤더 설정
      this.client.configure({
        connectHeaders: {},
      });
    }

    this.client.activate();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('웹소켓 연결 타임아웃'));
      }, 10000);

      const checkConnection = setInterval(() => {
        if (this.isConnected) {
          clearTimeout(timeout);
          clearInterval(checkConnection);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * 메시지 전송
   * @param {string} roomId - 채팅방 ID
   * @param {string} content - 메시지 내용
   * @param {string} senderType - 발신자 타입 ('user' | 'store')
   */
  sendMessage(roomId, content, senderType = 'user') {
    if (!this.isConnected || !this.client) {
      throw new Error('웹소켓이 연결되지 않았습니다.');
    }

    this.client.publish({
      destination: `/pub/chats/${roomId}`,
      body: JSON.stringify({
        content,
        senderType,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  /**
   * 채팅방 구독 해제
   * @param {string} roomId - 채팅방 ID
   */
  unsubscribe(roomId) {
    const subscription = this.subscriptions.get(roomId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(roomId);
    }
  }

  /**
   * 웹소켓 연결 해제
   */
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

  /**
   * 연결 상태 확인
   * @returns {boolean}
   */
  getConnected() {
    return this.isConnected;
  }
}

// 싱글톤 인스턴스
export const webSocketClient = new WebSocketClient();
