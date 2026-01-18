import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Coffee,
} from 'lucide-react';

import ImageWithFallback from '@/components/figma/imageWithFallback';
import ReviewCard from '@/components/ReviewCard';
import MapView from '@/components/MapView';
import { useCreateInquiryChat } from '@/shared/hooks/useChatQueries';
import { useAuth } from '@/context/AuthContext';
import { getRestaurantDetail, getReviewBy, getRestaurantMenu } from '../shared/api/auth';

const TAB_TYPES = {
  INFO: 'info',
  MENU: 'menu',
  REVIEW: 'review',
};

const StoreDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [store, setStore] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [menu, setMenu] = useState([]);
  const [activeTab, setActiveTab] = useState(TAB_TYPES.INFO);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const createInquiryChat = useCreateInquiryChat();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const handleWriteReview = () => {
    navigate(`/review/${id}`);
  };

  useEffect(() => {
    const fetchStoreDetail = async () => {
      try {
        setLoading(true);
        const data = await getRestaurantDetail(id);
        setStore(data);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreDetail();
  }, [id]);

  useEffect(() => {
    if (activeTab !== TAB_TYPES.MENU) return;
    if (!id) return;

    const fetchMenu = async () => {
      try {
        setMenuLoading(true);
        const data = await getRestaurantMenu(id);
        setMenu(data || []);
      } catch (e) {
        console.error('메뉴 조회 실패:', e);
        setMenu([]);
      } finally {
        setMenuLoading(false);
      }
    };

    fetchMenu();
  }, [activeTab, id]);

  const fetchReviews = async () => {
    console.log('[fetchReviews] id:', id);

    try {
      const res = await getReviewBy(id);
      console.log('[fetchReviews] res:', res);
      console.log('[fetchReviews] res.content:', res?.content);

      setReviews(res.content ?? []);
    } catch (err) {
      console.error('[fetchReviews] error:', err);
    }
  };

  useEffect(() => {
    console.log('[useEffect] fetchReviews 실행');
    fetchReviews();
  }, [id]);

  const handleStartChat = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (user.userType === 'OWNER') {
      alert('사업자는 채팅을 시작할 수 없습니다.');
      return;
    }

    setIsCreatingChat(true);
    try {
      const response = await createInquiryChat.mutateAsync({
        storeId: id,
        userId: user.id,
      });

      const chatRoomId = response.id || response.inquiryChatId || response.chatRoomId;
      navigate('/chat', { state: { chatRoomId } });
    } catch (error) {
      console.error('채팅방 생성 오류:', error);
      alert('채팅방 생성에 실패했습니다.');
    } finally {
      setIsCreatingChat(false);
    }
  };

  if (loading) return <div className="p-4 text-center">로딩 중...</div>;
  if (error || !store)
    return <div className="p-4 text-center text-red-500">가게 정보를 불러올 수 없습니다.</div>;

  // 단일 가게를 MapView에 배열로 전달
  const mapStores = [
    {
      id: store.id,
      name: store.name,
      lat: store.latitude,
      lng: store.longitude,
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-white w-full max-w-md mx-auto shadow-lg">
      {/* 이미지 */}
      <div className="relative">
        <ImageWithFallback
          src={store.image}
          alt={store.name}
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
            <Heart size={20} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="p-4 border-b border-gray-200">
        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">
          {store.category}
        </span>

        <div className="flex items-center gap-2 my-2">
          <Star size={18} className="fill-yellow-400 text-yellow-400" />
          <span>{store.score}</span>
          <span className="text-gray-500 text-sm">리뷰 {store.reviewCount}</span>
        </div>

        <p className="text-gray-700 mb-3">{store.description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={16} />
            {store.address}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} />
            <span>
              {store.openTime}~{store.closeTime}
            </span>
          </div>
          {store.hasBreakTime && (
            <div className="flex items-center gap-2 text-orange-600">
              <Coffee size={16} />
              {store.breakStartTime}~{store.breakEndTime}
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={16} />
            {store.phone}
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200">
        {Object.values(TAB_TYPES).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 ${
              activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
            }`}
          >
            {tab === 'info' && '정보'}
            {tab === 'menu' && '메뉴'}
            {tab === 'review' && `리뷰 (${reviews.length})`}
          </button>
        ))}
      </div>

      {/* 탭 내용 */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === TAB_TYPES.INFO && (
          <>
            {/* 지도 */}
            <MapView
              stores={[
                {
                  id: store.id,
                  name: store.name,
                  lat: store.latitude,
                  lng: store.longitude,
                },
              ]}
              mode="detail"
            />
          </>
        )}

        {activeTab === TAB_TYPES.MENU && (
          <div className="space-y-3">
            {menuLoading ? (
              <div className="text-center text-gray-500">메뉴 불러오는 중...</div>
            ) : menu.length > 0 ? (
              menu.map((item, idx) => (
                <div key={idx} className="flex justify-between border-b py-2">
                  <span>{item.name}</span>
                  <span>{item.price}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400">등록된 메뉴가 없습니다</div>
            )}
          </div>
        )}

        {activeTab === TAB_TYPES.REVIEW && (
          <div className="space-y-6">
            {/* 리뷰 리스트 */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <ReviewCard key={index} review={review} />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400">아직 리뷰가 없습니다.</p>
            )}

            {/* 리뷰 작성 버튼 (하단) */}
            <div className="pt-4 flex justify-center">
              <button
                onClick={handleWriteReview}
                className="w-full py-3 text-sm font-medium text-white bg-blue-600 rounded-lg"
              >
                리뷰 작성하기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      {user?.userType === 'CUSTOMER' && (
        <div className="p-4 border-t flex gap-2">
          <button
            onClick={handleStartChat}
            disabled={isCreatingChat}
            className="flex-1 py-3 border border-blue-600 text-blue-600 rounded-lg"
          >
            채팅하기
          </button>
          <button className="flex-1 py-3 bg-blue-600 text-white rounded-lg">전화하기</button>
        </div>
      )}
    </div>
  );
};

export default StoreDetailPage;
