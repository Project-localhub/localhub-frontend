import PropTypes from 'prop-types';

const StatsCards = ({ statsData, isLoading }) => {
  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-3">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Icon size={20} className="text-blue-600" />
                <span
                  className={`text-sm ${
                    stat.trend === 'up'
                      ? 'text-green-600'
                      : stat.trend === 'down'
                        ? 'text-red-600'
                        : 'text-gray-600'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <div className="text-gray-600 text-sm mb-1">{stat.label}</div>
              <div className="text-2xl text-gray-900">{isLoading ? '...' : stat.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

StatsCards.propTypes = {
  statsData: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      icon: PropTypes.elementType.isRequired,
      change: PropTypes.string.isRequired,
      trend: PropTypes.oneOf(['up', 'down', 'neutral']).isRequired,
    }),
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default StatsCards;
