import { ArrowLeft } from 'lucide-react';
import PropTypes from 'prop-types';

const ChatHeader = ({ storeName, storeImage: _storeImage, onBack }) => {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
      <button
        onClick={onBack}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ArrowLeft size={24} />
      </button>
      <span className="text-gray-900 font-medium flex-1">{storeName}</span>
    </div>
  );
};

ChatHeader.propTypes = {
  storeName: PropTypes.string.isRequired,
  storeImage: PropTypes.string, // 사용하지 않지만 호환성을 위해 유지
  onBack: PropTypes.func.isRequired,
};

export default ChatHeader;
