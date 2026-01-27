import { Search, Filter, MapPin, X } from 'lucide-react';
import PropTypes from 'prop-types';

const HomeSearchHeader = ({
  searchQuery,
  onSearchChange,
  onFilterClick,
  hasActiveFilters,
  selectedCategory,
  selectedDivide,
  onCategoryRemove,
  onDivideRemove,
}) => {
  return (
    <div className="px-4 py-3 border-b border-gray-200">
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
        <Search size={20} className="text-gray-500" />
        <input
          type="text"
          placeholder="가게 이름, 카테고리 검색"
          value={searchQuery}
          onChange={onSearchChange}
          className="flex-1 bg-transparent outline-none"
        />
        <button
          onClick={onFilterClick}
          className={`text-gray-600 ${hasActiveFilters ? 'text-blue-600' : ''}`}
          aria-label="필터 열기"
        >
          <Filter size={20} />
        </button>
      </div>

      {(selectedCategory || selectedDivide) && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {selectedCategory && (
            <button
              onClick={onCategoryRemove}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
              aria-label={`${selectedCategory} 필터 제거`}
            >
              {selectedCategory}
              <X size={14} />
            </button>
          )}
          {selectedDivide && (
            <button
              onClick={onDivideRemove}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
              aria-label={`${selectedDivide} 지역 필터 제거`}
            >
              <MapPin size={14} />
              {selectedDivide}
              <X size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

HomeSearchHeader.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onFilterClick: PropTypes.func.isRequired,
  hasActiveFilters: PropTypes.bool.isRequired,
  selectedCategory: PropTypes.string.isRequired,
  selectedDivide: PropTypes.string.isRequired,
  onCategoryRemove: PropTypes.func.isRequired,
  onDivideRemove: PropTypes.func.isRequired,
};

export default HomeSearchHeader;
