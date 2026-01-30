import PropTypes from 'prop-types';

const HomeViewModeTabs = ({ viewMode, onListClick, onMapClick }) => {
  return (
    <div className="px-4 py-2 border-b border-gray-200 flex gap-2">
      <button
        onClick={onListClick}
        className={`flex-1 py-2 rounded-lg ${
          viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
        }`}
        aria-label="리스트 보기"
        aria-pressed={viewMode === 'list'}
      >
        리스트
      </button>
      <button
        onClick={onMapClick}
        className={`flex-1 py-2 rounded-lg ${
          viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
        }`}
        aria-label="지도 보기"
        aria-pressed={viewMode === 'map'}
      >
        지도
      </button>
    </div>
  );
};

HomeViewModeTabs.propTypes = {
  viewMode: PropTypes.oneOf(['list', 'map']).isRequired,
  onListClick: PropTypes.func.isRequired,
  onMapClick: PropTypes.func.isRequired,
};

export default HomeViewModeTabs;
