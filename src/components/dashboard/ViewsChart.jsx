import { TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';

const ViewsChart = ({ chartData, selectedPeriod, onPeriodChange }) => {
  return (
    <div className="mx-4 mb-4 bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-600" />
          <span className="text-gray-900">조회수 추이</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPeriodChange('week')}
            className={`px-3 py-1 rounded text-sm ${
              selectedPeriod === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            주간
          </button>
          <button
            onClick={() => onPeriodChange('month')}
            className={`px-3 py-1 rounded text-sm ${
              selectedPeriod === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            월간
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip />
          <Bar dataKey="views" fill="#2563eb" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

ViewsChart.propTypes = {
  chartData: PropTypes.arrayOf(
    PropTypes.shape({
      day: PropTypes.string.isRequired,
      views: PropTypes.number.isRequired,
    }),
  ).isRequired,
  selectedPeriod: PropTypes.oneOf(['week', 'month']).isRequired,
  onPeriodChange: PropTypes.func.isRequired,
};

export default ViewsChart;
