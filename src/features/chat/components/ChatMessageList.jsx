import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ChatMessage from './ChatMessage';

const ChatMessageList = ({
  messages,
  currentUser,
  isConnecting,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
}) => {
  const messagesEndRef = useRef(null);
  const messagesTopRef = useRef(null);
  const containerRef = useRef(null);
  const previousScrollHeightRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (isInitialLoadRef.current && messages.length > 0 && !isConnecting) {
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        isInitialLoadRef.current = false;
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, isConnecting]);

  useEffect(() => {
    if (isInitialLoadRef.current) {
      return;
    }

    const container = containerRef.current;
    if (container) {
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  // 무한 스크롤: Intersection Observer를 사용하여 맨 위에 도달하면 이전 메시지 로드
  useEffect(() => {
    const topElement = messagesTopRef.current;
    if (!topElement || !hasNextPage || isFetchingNextPage) {
      return;
    }

    let timeoutId = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          const container = containerRef.current;
          if (container) {
            previousScrollHeightRef.current = container.scrollHeight;
            onLoadMore().then(() => {
              if (timeoutId) {
                clearTimeout(timeoutId);
              }
              timeoutId = setTimeout(() => {
                const newScrollHeight = container.scrollHeight;
                const scrollDiff = newScrollHeight - previousScrollHeightRef.current;
                container.scrollTop = container.scrollTop + scrollDiff;
                timeoutId = null;
              }, 0);
            });
          }
        }
      },
      {
        root: containerRef.current,
        rootMargin: '100px',
        threshold: 0.1,
      },
    );

    observer.observe(topElement);
    return () => {
      observer.disconnect();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  const isMyMessage = (message) => {
    if (!currentUser) {
      return false;
    }

    if (message.senderId !== undefined && message.senderId !== null) {
      return (
        String(message.senderId) === String(currentUser.id) ||
        Number(message.senderId) === Number(currentUser.id)
      );
    }

    if (message.sender) {
      const currentUserIdentifier =
        currentUser.username || currentUser.name || String(currentUser.id || '');
      return String(message.sender) === String(currentUserIdentifier);
    }

    return false;
  };

  if (isConnecting) {
    return (
      <div className="flex-1 overflow-auto p-4">
        <div className="text-center text-gray-500 text-sm py-4">채팅 연결 중...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-auto p-4">
        <div className="text-center text-gray-500 text-sm py-4">메시지가 없습니다</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-auto p-4 space-y-3">
      {isFetchingNextPage && (
        <div className="text-center text-gray-500 text-sm py-2">이전 메시지 불러오는 중...</div>
      )}
      <div ref={messagesTopRef} />
      {messages.map((msg, index) => (
        <ChatMessage
          key={msg.id || msg.messageId || `msg-${index}`}
          message={msg}
          isMyMessage={isMyMessage(msg)}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

ChatMessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      messageId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      content: PropTypes.string,
      message: PropTypes.string,
      sender: PropTypes.string,
      senderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      senderType: PropTypes.string,
      timestamp: PropTypes.string,
      createdAt: PropTypes.string,
      time: PropTypes.string,
    }),
  ).isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string,
    name: PropTypes.string,
  }),
  isConnecting: PropTypes.bool,
  onLoadMore: PropTypes.func,
  hasNextPage: PropTypes.bool,
  isFetchingNextPage: PropTypes.bool,
};

ChatMessageList.defaultProps = {
  currentUser: null,
  isConnecting: false,
  onLoadMore: () => Promise.resolve(),
  hasNextPage: false,
  isFetchingNextPage: false,
};

export default ChatMessageList;
