import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

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
    console.log('🔌 [WebSocket] connect() 호출:', { roomId, isConnected: this.isConnected });

    if (this.isConnected) {
      console.log('✅ [WebSocket] 이미 연결되어 있음');
      return Promise.resolve();
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';
    const wsUrl = `${apiBaseUrl}/stomp/chats`;

    console.log('🔌 [WebSocket] 연결 시도:', { wsUrl, roomId, apiBaseUrl });

    this.client = new Client({
      webSocketFactory: () => {
        console.log('🔌 [WebSocket] SockJS 생성:', wsUrl);
        return new SockJS(wsUrl);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('🔌 [STOMP Debug]:', str);
        }
      },
      onConnect: (frame) => {
        console.log('✅ [WebSocket] 연결 성공:', frame);
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // 채팅방 구독
        const subscribePath = `/sub/chats/${roomId}`;
        console.log('📡 [WebSocket] 채팅방 구독:', subscribePath);
        const subscription = this.client.subscribe(subscribePath, (message) => {
          console.log('📨 [WebSocket] 메시지 수신:', message.body);
          try {
            const data = JSON.parse(message.body);
            console.log('📨 [WebSocket] 파싱된 메시지:', data);
            onMessage(data);
          } catch (error) {
            console.error('❌ [WebSocket] 메시지 파싱 오류:', error);
          }
        });

        this.subscriptions.set(roomId, subscription);
        console.log('✅ [WebSocket] 구독 완료:', roomId);
      },
      onStompError: (frame) => {
        console.error('❌ [WebSocket] STOMP 에러:', frame);
        this.isConnected = false;
        if (onError) {
          onError(frame);
        }
      },
      onWebSocketClose: (event) => {
        console.log('🔌 [WebSocket] 연결 종료:', event);
        this.isConnected = false;
        this.subscriptions.clear();
      },
      onDisconnect: () => {
        console.log('🔌 [WebSocket] 연결 해제');
        this.isConnected = false;
        this.subscriptions.clear();
      },
    });

    // 인증 토큰 추가
    const token = localStorage.getItem('accessToken');
    console.log('🔑 [WebSocket] 토큰 확인:', token ? '있음' : '없음');
    if (token) {
      this.client.configure({
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('🔑 [WebSocket] Authorization 헤더 추가됨');
    } else {
      // 토큰이 없으면 기본 헤더 설정
      this.client.configure({
        connectHeaders: {},
      });
      console.warn('⚠️ [WebSocket] 토큰이 없습니다.');
    }

    console.log('🚀 [WebSocket] 클라이언트 활성화 시작...');
    this.client.activate();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('❌ [WebSocket] 연결 타임아웃 (10초)');
        reject(new Error('웹소켓 연결 타임아웃'));
      }, 10000);

      const checkConnection = setInterval(() => {
        if (this.isConnected) {
          console.log('✅ [WebSocket] 연결 확인 완료');
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
    console.log('📤 [WebSocket] 메시지 전송 시도:', {
      roomId,
      content,
      senderType,
      isConnected: this.isConnected,
    });

    if (!this.isConnected || !this.client) {
      console.error('❌ [WebSocket] 메시지 전송 실패: 연결되지 않음');
      throw new Error('웹소켓이 연결되지 않았습니다.');
    }

    const destination = `/pub/chats/${roomId}`;
    const messageBody = {
      content,
      senderType,
      timestamp: new Date().toISOString(),
    };

    console.log('📤 [WebSocket] 메시지 전송:', { destination, messageBody });

    this.client.publish({
      destination,
      body: JSON.stringify(messageBody),
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
      console.log('🔌 [WebSocket] 연결 해제 시작...');
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      console.log('✅ [WebSocket] 연결 해제 완료');
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
