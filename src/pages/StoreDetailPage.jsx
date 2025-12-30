import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Star, MapPin, Clock, Phone, MessageCircle } from 'lucide-react';
import ImageWithFallback from '@/components/figma/imageWithFallback';
import ReviewCard from '@/components/ReviewCard';

const mockStore = {
  id: '1',
  name: '맛있는 한식당',
  category: '한식',
  rating: 4.8,
  reviewCount: 234,
  distance: '0.3km',
  image:
    'https://images.unsplash.com/photo-1629642621587-9947ce328799?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjByZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NjUxNTg3MTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  address: '서울시 강남구 역삼동 123-45',
  phone: '02-1234-5678',
  hours: '10:00 - 22:00 (브레이크타임 15:00-17:00)',
  description:
    '신선한 재료로 만드는 정성스러운 한식 전문점입니다. 푸짐한 한상차림과 깔끔한 맛으로 손님들의 사랑을 받고 있습니다.',
  tags: ['깨끗함', '맛있음', '친절함'],
  isFavorite: true,
  menu: [
    { name: '김치찌개', price: '9,000원' },
    { name: '된장찌개', price: '8,000원' },
    { name: '제육볶음', price: '12,000원' },
    { name: '비빔밥', price: '10,000원' },
  ],
};

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

const TAB_TYPES = {
  INFO: 'info',
  MENU: 'menu',
  REVIEW: 'review',
};

const StoreDetailPage = () => {
  // eslint-disable-next-line no-unused-vars
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TAB_TYPES.INFO);
  const reviewButton = () => {
    navigate(`/review/${mockStore.id}`);
  };

  return (
    <div className="flex flex-col h-screen bg-white w-full max-w-md mx-auto shadow-lg">
      <div className="relative">
        <ImageWithFallback
          src={mockStore.image}
          alt={mockStore.name}
          className="w-full h-64 object-cover"
        />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 bg-white rounded-full shadow-md">
            <Share2 size={20} />
          </button>
          <button className="p-2 bg-white rounded-full shadow-md">
            <Heart
              size={20}
              className={mockStore.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}
            />
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">
                {mockStore.category}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star size={18} className="fill-yellow-400 text-yellow-400" />
                <span>{mockStore.rating}</span>
              </div>
              <span className="text-gray-500 text-sm">리뷰 {mockStore.reviewCount}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {mockStore.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
              #{tag}
            </span>
          ))}
        </div>
        <p className="text-gray-700 mb-3">{mockStore.description}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={16} />
            {mockStore.address}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} />
            {mockStore.hours}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={16} />
            {mockStore.phone}
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab(TAB_TYPES.INFO)}
          className={`flex-1 py-3 ${
            activeTab === TAB_TYPES.INFO
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          정보
        </button>
        <button
          onClick={() => setActiveTab(TAB_TYPES.MENU)}
          className={`flex-1 py-3 ${
            activeTab === TAB_TYPES.MENU
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          메뉴
        </button>
        <button
          onClick={() => setActiveTab(TAB_TYPES.REVIEW)}
          className={`flex-1 py-3 ${
            activeTab === TAB_TYPES.REVIEW
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          리뷰 ({mockStore.reviewCount})
        </button>
      </div>

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
            <div className="space-y-3">
              {mockStore.menu.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100"
                >
                  <span className="text-gray-900">{item.name}</span>
                  <span className="text-gray-700">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === TAB_TYPES.REVIEW && (
          <div className="p-4">
            <button
              onClick={reviewButton}
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

      <div className="p-4 border-t border-gray-200 flex gap-2">
        <button className="flex-1 py-3 border border-blue-600 text-blue-600 rounded-lg flex items-center justify-center gap-2">
          <MessageCircle size={20} />
          채팅하기
        </button>
        <button className="flex-1 py-3 bg-blue-600 text-white rounded-lg">전화하기</button>
      </div>
    </div>
  );
};

export default StoreDetailPage;
