import { Send } from 'lucide-react';
import PropTypes from 'prop-types';

const ChatInput = ({ message, setMessage, onSend, disabled }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !disabled) {
      onSend();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
        <input
          type="text"
          placeholder="메시지를 입력하세요"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-transparent outline-none"
          disabled={disabled}
        />
        <button
          onClick={onSend}
          disabled={!message.trim() || disabled}
          className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 transition-colors"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

ChatInput.propTypes = {
  message: PropTypes.string.isRequired,
  setMessage: PropTypes.func.isRequired,
  onSend: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

ChatInput.defaultProps = {
  disabled: false,
};

export default ChatInput;
