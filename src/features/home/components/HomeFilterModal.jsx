import { X } from 'lucide-react';
import PropTypes from 'prop-types';
import { REGIONS, CATEGORIES } from '@/shared/constants/pageConstants';

const HomeFilterModal = ({
  isOpen,
  onClose,
  selectedCategory,
  selectedDivide,
  onCategoryChange,
  onDivideChange,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">필터</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="필터 닫기"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">지역구</h3>
          <div className="grid grid-cols-4 gap-2">
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => onDivideChange(selectedDivide === region ? '' : region)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  selectedDivide === region
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label={`${region} 지역 선택`}
                aria-pressed={selectedDivide === region}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">카테고리</h3>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(selectedCategory === category ? '' : category)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label={`${category} 카테고리 선택`}
                aria-pressed={selectedCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium"
          >
            초기화
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
};

HomeFilterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedCategory: PropTypes.string.isRequired,
  selectedDivide: PropTypes.string.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  onDivideChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default HomeFilterModal;
