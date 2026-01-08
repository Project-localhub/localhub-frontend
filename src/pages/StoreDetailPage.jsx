import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreateInquiryChat } from '@/shared/hooks/useChatQueries';
import { useAuth } from '@/context/AuthContext';
import { useRestaurantDetail } from '@/shared/hooks/useStoreQueries';
import { useToggleFavorite, useMyFavorites } from '@/shared/hooks/useFavoriteQueries';
import { formatTime, getHoursString, getFirstImageUrl, getAllImageUrls } from '@/shared/lib/storeUtils';
import StoreDetailHeader from '@/features/store/components/StoreDetailHeader';
import StoreDetailInfo from '@/features/store/components/StoreDetailInfo';
import StoreDetailTabs, { TAB_TYPES } from '@/features/store/components/StoreDetailTabs';
import StoreDetailContent from '@/features/store/components/StoreDetailContent';
import StoreDetailActions from '@/features/store/components/StoreDetailActions';

const StoreDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TAB_TYPES.INFO);
  const { user } = useAuth();
  const createInquiryChat = useCreateInquiryChat();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // 가게 상세 정보 조회
  const { data: restaurantData, isLoading, error } = useRestaurantDetail(id);
  const { data: myFavorites = [] } = useMyFavorites();
  const toggleFavoriteMutation = useToggleFavorite();

  // 찜한 가게 ID Set
  const favoriteIds = new Set(myFavorites.map((fav) => fav.id || fav.restaurantId));
  const isFavorite = restaurantData ? favoriteIds.has(restaurantData.id) : false;

  // 데이터 변환
  const store = restaurantData
    ? {
        id: restaurantData.id,
        name: restaurantData.name,
        category: restaurantData.category,
        rating: restaurantData.score || 0,
        reviewCount: restaurantData.reviewCount || 0,
        favoriteCount: restaurantData.favoriteCount || 0,
        image: getFirstImageUrl(restaurantData.imageUrlList),
        images: getAllImageUrls(restaurantData.imageUrlList),
        address: restaurantData.address || '',
        phone: restaurantData.phone || '',
        hours: getHoursString(restaurantData.openTime, restaurantData.closeTime),
        hasBreakTime: restaurantData.hasBreakTime || false,
        breakStartTime: restaurantData.breakStartTime
          ? formatTime(restaurantData.breakStartTime)
          : '',
        breakEndTime: restaurantData.breakEndTime
          ? formatTime(restaurantData.breakEndTime)
          : '',
        description: restaurantData.description || '',
        tags: Array.isArray(restaurantData.keywordList) ? restaurantData.keywordList : [],
        latitude: restaurantData.latitude,
        longitude: restaurantData.longitude,
        isFavorite,
      }
    : null;

  const handleStartChat = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (user.userType === 'OWNER') {
      alert('사업자는 채팅을 시작할 수 없습니다. 일반 사용자로 로그인해주세요.');
      return;
    }

    if (!store) {
      alert('가게 정보를 불러올 수 없습니다.');
      return;
    }

    setIsCreatingChat(true);
    try {
      // 채팅방 생성 (storeId는 가게 ID, 쿼리 파라미터로 전달, userId는 현재 로그인한 사용자 ID)
      const response = await createInquiryChat.mutateAsync({
        storeId: id, // 가게 ID (쿼리 파라미터로 전달)
        userId: user.id, // 현재 사용자 ID
      });

      // 채팅방 생성 성공 시 ChatPage로 이동 (채팅방 ID를 state로 전달)
      const chatRoomId = response.id || response.inquiryChatId || response.chatRoomId;
      navigate('/chat', { state: { chatRoomId } });
    } catch (error) {
      const errorMessage =
        error.response?.status === 401
          ? '인증이 필요합니다. 다시 로그인해주세요.'
          : error.message || '채팅방 생성에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!store) return;

    try {
      await toggleFavoriteMutation.mutateAsync({
        restaurantId: store.id,
        isFavorite: isFavorite,
      });
    } catch (err) {
      alert('찜하기 처리에 실패했습니다. 다시 시도해주세요.');
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
      <StoreDetailHeader
        store={store}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
        isPending={toggleFavoriteMutation.isPending}
      />

      <StoreDetailInfo store={store} />

      <StoreDetailTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        reviewCount={store.reviewCount}
      />

      <StoreDetailContent activeTab={activeTab} storeId={store.id} />

      {user && user.userType === 'CUSTOMER' && (
        <StoreDetailActions
          store={store}
          onStartChat={handleStartChat}
          isCreatingChat={isCreatingChat}
        />
      )}
    </div>
  );
};

export default StoreDetailPage;
