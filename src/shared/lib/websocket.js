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
    // 이미 연결되어 있고 구독도 있으면 바로 반환 (중복 연결 방지)
    if (this.isConnected && this.subscriptions.has(roomId)) {
      return Promise.resolve();
    }

    if (this.isConnected) {
      // 이미 연결되어 있지만 구독이 없는 경우만 구독 추가
      const existingSubscription = this.subscriptions.get(roomId);
      if (!existingSubscription) {
        const subscribePath = `/sub/chats/${roomId}`;
        const subscription = this.client.subscribe(
          subscribePath,
          (message) => this.handleMessage(message, onMessage),
          { id: `sub-${roomId}` },
        );
        this.subscriptions.set(roomId, subscription);
        console.log('✅ [WebSocket] 구독 추가 완료:', roomId);
      }
      return Promise.resolve();
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';
    const wsUrl = `${apiBaseUrl}/stomp/chats`;

    console.log('🔌 [WebSocket] 연결 시도:', roomId);

    // 인증 토큰 가져오기 (클라이언트 생성 전에)
    const token = localStorage.getItem('accessToken');

    this.client = new Client({
      webSocketFactory: () => {
        return new SockJS(wsUrl);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      // 인증 헤더를 클라이언트 생성 시점에 설정
      connectHeaders: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      debug: (_str) => {
        // STOMP 디버그 로그 비활성화 (너무 많은 로그 출력 방지)
        // 필요시 주석 해제
        // if (import.meta.env.DEV) {
        //   console.log('🔌 [STOMP Debug]:', _str);
        // }
      },
      onConnect: (_frame) => {
        console.log('✅ [WebSocket] 연결 성공');
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // 채팅방 구독 (연결이 완전히 완료된 후에 구독)
        const subscribePath = `/sub/chats/${roomId}`;

        // 약간의 지연을 두어 연결이 완전히 안정화된 후 구독
        setTimeout(() => {
          try {
            // client가 활성화되어 있고 연결되어 있는지 확인
            if (!this.client || !this.client.connected) {
              console.error('❌ [WebSocket] 클라이언트가 연결되지 않음');
              return;
            }

            // 백엔드 예시와 동일한 방식으로 구독
            // stompClient.subscribe("/sub/chats/1", (message) => { ... })
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
                } catch (error) {
                  console.error('❌ [WebSocket] 메시지 파싱 오류:', error);
                  // 기존 방식으로도 시도
                  this.handleMessage(message, onMessage);
                }
              },
              {
                id: `sub-${roomId}`,
              },
            );

            this.subscriptions.set(roomId, subscription);
            console.log('✅ [WebSocket] 구독 완료:', roomId);
          } catch (error) {
            console.error('❌ [WebSocket] 구독 실패:', error);
            if (onError) {
              onError(error);
            }
          }
        }, 100); // 100ms 지연
      },
      onStompError: (frame) => {
        console.error('❌ [WebSocket] STOMP 에러:', frame);
        console.error('❌ [WebSocket] STOMP 에러 메시지:', frame.headers?.message);
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
        console.error('❌ [WebSocket] 연결 타임아웃 (10초)');
        reject(new Error('웹소켓 연결 타임아웃'));
      }, 10000);

      let connectionChecked = false;
      const checkConnection = setInterval(() => {
        if (this.isConnected && !connectionChecked) {
          connectionChecked = true;
          console.log('✅ [WebSocket] 연결 확인 완료');
          clearTimeout(timeout);
          clearInterval(checkConnection);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * 메시지 수신 처리
   * @param {Object} message - STOMP 메시지 객체
   * @param {Function} onMessage - 메시지 수신 콜백
   */
  handleMessage(message, onMessage) {
    if (!message.body) {
      return;
    }
    try {
      const data = JSON.parse(message.body);

      // 백엔드 형식: { "sender": "testUser", "message": "안녕하세요" }
      // 프론트엔드 형식으로 변환: { content, senderId, senderType, timestamp 등 }
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

      // 전역 이벤트 발생 (ChatListPage에서 채팅방 목록 갱신을 위해)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('chatMessageReceived', { detail: transformedMessage }),
        );
      }

      if (onMessage) {
        onMessage(transformedMessage);
      }
    } catch (error) {
      console.error('❌ [WebSocket] 메시지 파싱 오류:', error);
    }
  }

  /**
   * 메시지 전송
   * @param {string} roomId - 채팅방 ID
   * @param {string} content - 메시지 내용
   * @param {string} senderType - 발신자 타입 ('user' | 'store')
   */
  sendMessage(roomId, content, senderType = 'user') {
    if (!this.isConnected || !this.client) {
      console.error('❌ [WebSocket] 메시지 전송 실패: 연결되지 않음');
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
