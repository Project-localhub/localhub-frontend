import PropTypes from 'prop-types';

const TAB_TYPES = {
  INFO: 'info',
  MENU: 'menu',
  REVIEW: 'review',
};

const StoreDetailTabs = ({ activeTab, onTabChange, reviewCount }) => {
  return (
    <div className="flex border-b border-gray-200">
      <button
        onClick={() => onTabChange(TAB_TYPES.INFO)}
        className={`flex-1 py-3 ${
          activeTab === TAB_TYPES.INFO
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600'
        }`}
      >
        정보
      </button>
      <button
        onClick={() => onTabChange(TAB_TYPES.MENU)}
        className={`flex-1 py-3 ${
          activeTab === TAB_TYPES.MENU
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600'
        }`}
      >
        메뉴
      </button>
      <button
        onClick={() => onTabChange(TAB_TYPES.REVIEW)}
        className={`flex-1 py-3 ${
          activeTab === TAB_TYPES.REVIEW
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600'
        }`}
      >
        리뷰 ({reviewCount})
      </button>
    </div>
  );
};

StoreDetailTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  reviewCount: PropTypes.number.isRequired,
};

export { TAB_TYPES };
export default StoreDetailTabs;
