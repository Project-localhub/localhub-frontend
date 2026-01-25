import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import ReviewCard from '@/components/ReviewCard';
import { TAB_TYPES } from './StoreDetailTabs';

const mockReviews = [
  {
    id: '1',
    userName: '김철수',
    rating: 5,
    date: '2024.12.05',
    content: '정말 맛있어요! 김치찌개가 특히 일품입니다. 사장님도 친절하시고 분위기도 좋아요.',
    images: [],
  },
  {
    id: '2',
    userName: '이영희',
    rating: 4,
    date: '2024.12.03',
    content: '가성비가 좋아요. 반찬도 계속 리필해주시고 맛도 괜찮습니다.',
    images: [],
  },
  {
    id: '3',
    userName: '박민수',
    rating: 5,
    date: '2024.12.01',
    content: '동네 맛집이에요. 자주 가는데 항상 만족스럽습니다. 추천합니다!',
    images: [],
  },
];

const StoreDetailContent = ({ activeTab, storeId }) => {
  const navigate = useNavigate();

  const handleReviewButton = () => {
    navigate(`/review/${storeId}`);
  };

  return (
    <div className="flex-1 overflow-auto">
      {activeTab === TAB_TYPES.INFO && (
        <div className="p-4">
          <div className="mb-4">
            <div className="mb-2 text-gray-900">위치</div>
            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <MapPin size={32} className="text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {activeTab === TAB_TYPES.MENU && (
        <div className="p-4">
          <div className="text-center text-gray-400 py-8">메뉴 정보가 준비 중입니다</div>
        </div>
      )}

      {activeTab === TAB_TYPES.REVIEW && (
        <div className="p-4">
          <button
            onClick={handleReviewButton}
            className="w-full py-3 bg-blue-600 text-white rounded-lg mb-4"
          >
            리뷰 작성하기
          </button>
          <div className="space-y-4">
            {mockReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDetailContent;
