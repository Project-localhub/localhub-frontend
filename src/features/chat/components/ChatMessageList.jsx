import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ChatMessage from './ChatMessage';

const ChatMessageList = ({ messages, currentUser, isConnecting }) => {
  const messagesEndRef = useRef(null);

  // 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 메시지가 내가 보낸 것인지 확인하는 함수
  const isMyMessage = (message) => {
    if (!currentUser) {
      return false;
    }

    // senderId가 있으면 senderId로 비교 (가장 정확)
    if (message.senderId !== undefined && message.senderId !== null) {
      return (
        String(message.senderId) === String(currentUser.id) ||
        Number(message.senderId) === Number(currentUser.id)
      );
    }

    // sender가 있으면 sender와 사용자 이름/username 비교
    if (message.sender) {
      const currentUserIdentifier =
        currentUser.username || currentUser.name || String(currentUser.id || '');
      return String(message.sender) === String(currentUserIdentifier);
    }

    // optimistic 메시지는 항상 내 메시지로 간주
    if (message.isOptimistic) {
      return true;
    }

    // 기본값: 내 메시지가 아님
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
    <div className="flex-1 overflow-auto p-4 space-y-3">
      {messages.map((msg, index) => (
        <ChatMessage
          key={msg.id || msg.messageId || index}
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
      isOptimistic: PropTypes.bool,
    }),
  ).isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string,
    name: PropTypes.string,
  }),
  isConnecting: PropTypes.bool,
};

ChatMessageList.defaultProps = {
  currentUser: null,
  isConnecting: false,
};

export default ChatMessageList;
