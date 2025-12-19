import { Plus, ChevronDown } from 'lucide-react';
import PropTypes from 'prop-types';

const StoreSelector = ({ stores, selectedStoreId, isOpen, onToggle, onSelect, onAddStore }) => {
  const selectedStore = stores.find((store) => store.id === selectedStoreId);

  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      <div className="mb-2 text-sm text-gray-600">등록한 가게</div>
      <div className="relative">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span className="text-gray-900">
            {selectedStore ? selectedStore.name : '가게를 선택하세요'}
          </span>
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-10"
              onClick={onToggle}
              aria-label="드롭다운 닫기"
            ></button>
            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {stores.length > 0 ? (
                stores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => onSelect(store.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 ${
                      selectedStoreId === store.id ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    {store.name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-sm text-center">
                  등록된 가게가 없습니다
                </div>
              )}
              <button
                onClick={onAddStore}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-t border-gray-200 text-blue-600 flex items-center gap-2"
              >
                <Plus size={16} />
                <span>가게 추가</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

StoreSelector.propTypes = {
  stores: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  selectedStoreId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  onAddStore: PropTypes.func.isRequired,
};

export default StoreSelector;
