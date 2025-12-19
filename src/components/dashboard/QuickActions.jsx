import { Plus, ChevronRight, Calendar, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const QuickActions = ({ selectedStoreId }) => {
  const navigate = useNavigate();

  return (
    <div className="mx-4 mb-4 bg-white rounded-lg p-4 border border-gray-200">
      <div className="mb-3 text-gray-900">빠른 작업</div>
      <div className="space-y-2">
        <button
          onClick={() => navigate('/dashboard/store/register')}
          className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200"
        >
          <div className="flex items-center gap-3">
            <Plus size={20} className="text-blue-600" />
            <span className="text-gray-900 font-medium">가게 등록</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>
        {selectedStoreId && (
          <>
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-blue-600" />
                <span className="text-gray-900">영업시간 수정</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <div className="flex items-center gap-3">
                <MessageCircle size={20} className="text-blue-600" />
                <span className="text-gray-900">메뉴 관리</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

QuickActions.propTypes = {
  selectedStoreId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default QuickActions;
