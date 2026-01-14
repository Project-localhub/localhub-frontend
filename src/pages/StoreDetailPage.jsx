import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Star, MapPin, Clock, Phone, Coffee } from 'lucide-react';

import ImageWithFallback from '@/components/figma/imageWithFallback';
import ReviewCard from '@/components/ReviewCard';
import MapView from '@/components/MapView';
import { useCreateInquiryChat } from '@/shared/hooks/useChatQueries';
import { useAuth } from '@/context/AuthContext';
import { getRestaurantDetail } from '../shared/api/auth';

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
  const [activeTab, setActiveTab] = useState(TAB_TYPES.INFO);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const createInquiryChat = useCreateInquiryChat();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  useEffect(() => {
    const fetchStoreDetail = async () => {
      try {
        setIsLoading(true);
        const data = await getRestaurantDetail(id);
        setStore(data);
        setReviews(data.reviews || []);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreDetail();
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

    if (!store) {
      alert('가게 정보를 불러올 수 없습니다.');
      return;
    }

    // 기존 채팅방 확인 (에러가 발생해도 계속 진행)
    let existingChat = null;
    try {
      const { getInquiryChats } = await import('@/shared/api/chatApi');
      const chats = await getInquiryChats();
      existingChat = chats.find((chat) => {
        // 채팅방이 해당 가게와 연결되어 있는지 확인
        // 응답 형식에 따라 storeId, restaurantId, ownerId 등 확인
        return (
          chat.storeId === id ||
          chat.restaurantId === id ||
          (chat.ownerId && chat.ownerId === store?.ownerId)
        );
      });
    } catch {
      // 채팅방 목록 조회 실패해도 계속 진행 (채팅방 생성 시도)
    }

    // 기존 채팅방이 있으면 해당 채팅방으로 이동
    if (existingChat) {
      const chatRoomId = existingChat.inquiryChatId || existingChat.id;
      navigate(`/chat/${chatRoomId}`);
      return;
    }

    // 기존 채팅방이 없으면 새로 생성
    setIsCreatingChat(true);
    try {
      const response = await createInquiryChat.mutateAsync({
        storeId: id, // 가게 ID
      });

      // 채팅방 생성 성공 시 ChatPage로 이동
      // 응답 형식: { id, inquiryChatId, chatRoomId } 중 하나
      const chatRoomId =
        response?.id || response?.inquiryChatId || response?.chatRoomId || response?.data?.id;

      if (!chatRoomId) {
        throw new Error('채팅방 ID를 받을 수 없습니다.');
      }

      // 채팅방으로 이동
      navigate(`/chat/${chatRoomId}`);
    } catch (error) {
      // 409 Conflict (이미 존재하는 채팅방)인 경우 채팅 목록으로 이동
      if (error.response?.status === 409) {
        navigate('/chat');
        return;
      }

      const errorMessage =
        error.response?.status === 401
          ? '인증이 필요합니다. 다시 로그인해주세요.'
          : error.message || '채팅방 생성에 실패했습니다.';

      alert(errorMessage);
    } finally {
      setIsCreatingChat(false);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  // 에러 상태
  if (error || !store) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-gray-400 mb-2">가게 정보를 불러올 수 없습니다</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

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
          <span>{store.rating}</span>
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
            />
          </>
        )}

        {activeTab === TAB_TYPES.MENU && (
          <div className="space-y-3">
            {store.menu?.map((item, idx) => (
              <div key={idx} className="flex justify-between border-b py-2">
                <span>{item.name}</span>
                <span>{item.price}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === TAB_TYPES.REVIEW && (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
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
