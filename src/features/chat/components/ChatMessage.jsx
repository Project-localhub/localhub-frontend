import PropTypes from 'prop-types';

const ChatMessage = ({ message, isMyMessage }) => {
  return (
    <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isMyMessage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
        }`}
      >
        <p className="break-words">{message.content || message.message}</p>
        <span className={`text-xs block mt-1 ${isMyMessage ? 'text-blue-100' : 'text-gray-500'}`}>
          {message.timestamp || message.createdAt
            ? new Date(message.timestamp || message.createdAt).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Seoul',
              })
            : message.time || ''}
        </span>
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.shape({
    content: PropTypes.string,
    message: PropTypes.string,
    timestamp: PropTypes.string,
    createdAt: PropTypes.string,
    time: PropTypes.string,
  }).isRequired,
  isMyMessage: PropTypes.bool.isRequired,
};

export default ChatMessage;
