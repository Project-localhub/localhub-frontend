import PropTypes from 'prop-types';
import { MessageCircle, Phone } from 'lucide-react';

const StoreDetailActions = ({ store, onStartChat, isCreatingChat }) => {
  return (
    <div className="p-4 border-t border-gray-200 flex gap-2">
      <button
        onClick={onStartChat}
        disabled={isCreatingChat}
        className="flex-1 py-3 border border-blue-600 text-blue-600 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MessageCircle size={20} />
        {isCreatingChat ? '채팅방 생성 중...' : '채팅하기'}
      </button>
      <a
        href={`tel:${store.phone}`}
        className="flex-1 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
      >
        <Phone size={20} />
        전화하기
      </a>
    </div>
  );
};

StoreDetailActions.propTypes = {
  store: PropTypes.shape({
    phone: PropTypes.string.isRequired,
  }).isRequired,
  onStartChat: PropTypes.func.isRequired,
  isCreatingChat: PropTypes.bool,
};

export default StoreDetailActions;
