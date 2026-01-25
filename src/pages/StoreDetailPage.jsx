import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  MapPin,
  Clock,
  Phone,
  Coffee,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import ImageWithFallback from '@/components/figma/imageWithFallback';
import ReviewCard from '@/components/ReviewCard';
import MapView from '@/components/MapView';
import { useCreateInquiryChat } from '@/shared/hooks/useChatQueries';
import { useAuth } from '@/context/AuthContext';
import { useMyFavorites, useToggleFavorite } from '@/shared/hooks/useFavoriteQueries';
import { getRestaurantDetail, getReviewBy } from '../shared/api/auth';
import { getMenu } from '@/shared/api/storeApi';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const createInquiryChat = useCreateInquiryChat();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 찜하기 관련 훅
  const { data: myFavorites = [] } = useMyFavorites({ enabled: !!user?.id });
  const toggleFavoriteMutation = useToggleFavorite();

  // 현재 가게가 찜한 목록에 있는지 확인
  // id와 restaurantId의 타입이 다를 수 있으므로 Number 변환하여 비교
  const isFavorite = useMemo(() => {
    const result = myFavorites.some(
      (fav) =>
        fav.id === id ||
        fav.id === Number(id) ||
        fav.restaurantId === id ||
        fav.restaurantId === Number(id),
    );
    console.log('📄 [StoreDetailPage] isFavorite 계산:', {
      id,
      myFavoritesCount: myFavorites.length,
      isFavorite: result,
      myFavorites: myFavorites.map((fav) => ({
        id: fav.id,
        restaurantId: fav.restaurantId,
      })),
    });
    return result;
  }, [myFavorites, id]);

  const handleWriteReview = () => {
    navigate(`/review/${id}`);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (!id) {
      alert('가게 정보를 불러올 수 없습니다.');
      return;
    }

    try {
      await toggleFavoriteMutation.mutateAsync({
        restaurantId: id,
        isFavorite: isFavorite,
      });
    } catch (err) {
      console.error('찜하기 오류:', err);
      alert('찜하기 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  useEffect(() => {
    const fetchStoreDetail = async () => {
      try {
        setIsLoading(true);
        const data = await getRestaurantDetail(id);
        console.log('🔍 [StoreDetailPage] 가게 상세 데이터:', data);
        console.log('🔍 [StoreDetailPage] 이미지 데이터:', {
          image: data?.image,
          imageUrl: data?.imageUrl,
          images: data?.images,
          imagesLength: data?.images?.length,
          firstImage: data?.images?.[0],
        });
        setStore(data);
        // 이미지 인덱스 초기화
        setCurrentImageIndex(0);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setIsLoading(false);
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
        const data = await getMenu(id);
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
        // 실제 응답 형식: chat.restaurantId 또는 chat.restaurant?.id가 가게 ID와 일치하는지 확인
        return (
          chat.restaurantId === id ||
          chat.restaurantId === Number(id) ||
          chat.restaurant?.id === id ||
          chat.restaurant?.id === Number(id) ||
          (chat.peer?.id && chat.peer.id === store?.ownerId)
        );
      });
      console.log('🔍 [StoreDetailPage] 기존 채팅방 찾기:', {
        storeId: id,
        chats: chats.map((c) => ({
          roomId: c.roomId,
          restaurantId: c.restaurant?.id,
          peerId: c.peer?.id,
        })),
        foundChat: existingChat,
      });
    } catch {
      // 채팅방 목록 조회 실패해도 계속 진행 (채팅방 생성 시도)
    }

    // 기존 채팅방이 있으면 해당 채팅방으로 이동
    if (existingChat) {
      // 실제 응답 형식: id가 채팅방 ID (inquiryChatId)
      const chatRoomId = existingChat.id || existingChat.roomId;
      console.log('✅ [StoreDetailPage] 기존 채팅방으로 이동:', chatRoomId);
      navigate(`/chat/${chatRoomId}`, {
        state: {
          storeName: store?.name, // 가게 이름 전달
          storeImage:
            store?.imageUrlList && store.imageUrlList.length > 0
              ? store.imageUrlList[0].imageUrl
              : store?.image || store?.imageUrl || '', // 가게 이미지 전달
        },
      });
      return;
    }

    // 기존 채팅방이 없으면 새로 생성
    setIsCreatingChat(true);
    try {
      const response = await createInquiryChat.mutateAsync({
        storeId: id, // 가게 ID
      });

      // 디버깅: 응답 구조 확인
      console.log('🔍 [StoreDetailPage] 채팅방 생성 응답:', response);
      console.log('🔍 [StoreDetailPage] 응답 타입:', typeof response);
      console.log(
        '🔍 [StoreDetailPage] 응답이 객체인가?',
        response && typeof response === 'object',
      );
      if (response && typeof response === 'object') {
        console.log('🔍 [StoreDetailPage] 응답 키 목록:', Object.keys(response));
        console.log('🔍 [StoreDetailPage] response.id:', response.id);
        console.log('🔍 [StoreDetailPage] response.id 타입:', typeof response.id);
        console.log('🔍 [StoreDetailPage] response.exist:', response.exist);
        console.log('🔍 [StoreDetailPage] response.inquiryChatId:', response.inquiryChatId);
        console.log('🔍 [StoreDetailPage] response.chatRoomId:', response.chatRoomId);
      }

      // 응답 형식: { id: "7", exist: "true" }
      // id 필드를 채팅방 ID로 사용
      let chatRoomId = null;

      if (response && typeof response === 'object') {
        // 응답에서 id 필드 추출
        chatRoomId = response.id || response.inquiryChatId || response.chatRoomId;
        console.log('🔍 [StoreDetailPage] 추출된 chatRoomId:', chatRoomId);
      }

      // id를 찾았으면 해당 채팅방으로 이동
      if (chatRoomId) {
        chatRoomId = String(chatRoomId);
        console.log('✅ [StoreDetailPage] 채팅방 ID:', chatRoomId, 'exist:', response?.exist);
        navigate(`/chat/${chatRoomId}`, {
          state: {
            storeName: store?.name,
            storeImage:
              store?.imageUrlList && store.imageUrlList.length > 0
                ? store.imageUrlList[0].imageUrl
                : store?.image || store?.imageUrl || '',
          },
        });
        return;
      }

      // 백엔드가 응답 body 없이 200 OK만 보내는 경우 처리
      // 응답이 없거나 빈 값이면 채팅 목록을 다시 조회하여 해당 채팅방 찾기
      if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
        console.log('ℹ️ [StoreDetailPage] 응답이 없음. 채팅 목록을 조회하여 채팅방 찾기');
        // 채팅 목록을 다시 조회하여 해당 채팅방 찾기
        try {
          const { getInquiryChats } = await import('@/shared/api/chatApi');
          // 약간의 지연을 두고 조회 (백엔드에서 채팅방 생성이 완료될 시간 확보)
          await new Promise((resolve) => setTimeout(resolve, 500));
          const chats = await getInquiryChats();
          const existingChat = chats.find((chat) => {
            // 새로운 응답 형식: chat.restaurant.id 사용
            return (
              chat.restaurant?.id === id ||
              chat.restaurant?.id === Number(id) ||
              (chat.peer?.id && chat.peer.id === store?.ownerId)
            );
          });
          if (existingChat) {
            // 실제 응답 형식: id가 채팅방 ID (inquiryChatId)
            const chatRoomId = existingChat.id || existingChat.roomId;
            console.log('✅ [StoreDetailPage] 채팅 목록에서 찾은 채팅방 ID:', chatRoomId);
            navigate(`/chat/${chatRoomId}`, {
              state: {
                storeName: store?.name, // 가게 이름 전달
                storeImage:
                  store?.imageUrlList && store.imageUrlList.length > 0
                    ? store.imageUrlList[0].imageUrl
                    : store?.image || store?.imageUrl || '', // 가게 이미지 전달
              },
            });
            return;
          }
        } catch (err) {
          console.error('❌ [StoreDetailPage] 채팅 목록 조회 실패:', err);
        }
        // 채팅 목록에서 찾지 못하면 채팅 목록 페이지로 이동
        navigate('/chat');
        return;
      }

      // ID를 찾지 못한 경우에도 채팅 목록에서 찾기 시도 (재시도 로직)
      console.log('ℹ️ [StoreDetailPage] 응답에서 ID를 찾지 못함. 채팅 목록 조회 시도');
      let foundChat = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (!foundChat && retryCount < maxRetries) {
        try {
          // 재시도할 때마다 대기 시간 증가 (500ms, 1000ms, 1500ms)
          await new Promise((resolve) => setTimeout(resolve, 500 + retryCount * 500));
          const { getInquiryChats } = await import('@/shared/api/chatApi');
          const chats = await getInquiryChats();
          foundChat = chats.find((chat) => {
            // 실제 응답 형식: chat.restaurantId 또는 chat.restaurant?.id 사용
            const restaurantIdMatch =
              chat.restaurantId === id ||
              chat.restaurantId === Number(id) ||
              chat.restaurant?.id === id ||
              chat.restaurant?.id === Number(id);
            const ownerIdMatch = chat.peer?.id && store?.ownerId && chat.peer.id === store.ownerId;
            return restaurantIdMatch || ownerIdMatch;
          });

          if (foundChat) {
            // 실제 응답 형식: id가 채팅방 ID (inquiryChatId)
            const foundChatRoomId = foundChat.id || foundChat.roomId;
            console.log(
              `✅ [StoreDetailPage] 채팅 목록에서 찾은 채팅방 ID (시도 ${retryCount + 1}):`,
              foundChatRoomId,
            );
            navigate(`/chat/${foundChatRoomId}`, {
              state: {
                storeName: store?.name, // 가게 이름 전달
                storeImage:
                  store?.imageUrlList && store.imageUrlList.length > 0
                    ? store.imageUrlList[0].imageUrl
                    : store?.image || store?.imageUrl || '', // 가게 이미지 전달
              },
            });
            return;
          }
        } catch (err) {
          console.error(`❌ [StoreDetailPage] 채팅 목록 조회 실패 (시도 ${retryCount + 1}):`, err);
        }
        retryCount++;
      }

      // 모든 방법으로 찾지 못한 경우에도 채팅 목록 페이지로 이동하지 않고
      // 사용자에게 알림 후 가게 상세 페이지에 머무름
      console.error('❌ [StoreDetailPage] 채팅방을 찾을 수 없음. 모든 시도 실패');
      alert('채팅방을 생성했지만 찾을 수 없습니다. 잠시 후 다시 시도해주세요.');
    } catch (error) {
      console.error('❌ [StoreDetailPage] 채팅방 생성 에러:', error);
      console.error('❌ [StoreDetailPage] 에러 상태 코드:', error.response?.status);
      console.error('❌ [StoreDetailPage] 에러 메시지:', error.response?.data);

      // 400 Bad Request 또는 409 Conflict (이미 존재하는 채팅방)인 경우 해당 채팅방으로 이동
      if (error.response?.status === 400 || error.response?.status === 409) {
        // 기존 채팅방 목록을 다시 조회하여 해당 채팅방으로 이동
        try {
          const { getInquiryChats } = await import('@/shared/api/chatApi');
          const chats = await getInquiryChats();
          const existingChat = chats.find((chat) => {
            // 새로운 응답 형식: chat.restaurant.id 사용
            return (
              chat.restaurant?.id === id ||
              chat.restaurant?.id === Number(id) ||
              (chat.peer?.id && chat.peer.id === store?.ownerId)
            );
          });
          if (existingChat) {
            // 실제 응답 형식: id가 채팅방 ID (inquiryChatId)
            const chatRoomId = existingChat.id || existingChat.roomId;
            console.log('✅ [StoreDetailPage] 기존 채팅방으로 이동:', chatRoomId);
            navigate(`/chat/${chatRoomId}`, {
              state: {
                storeName: store?.name, // 가게 이름 전달
                storeImage:
                  store?.imageUrlList && store.imageUrlList.length > 0
                    ? store.imageUrlList[0].imageUrl
                    : store?.image || store?.imageUrl || '', // 가게 이미지 전달
              },
            });
            return;
          }
        } catch (err) {
          console.error('❌ [StoreDetailPage] 채팅 목록 조회 실패:', err);
        }
        // 채팅 목록에서 찾지 못한 경우에도 채팅 목록 페이지로 이동하지 않음
        alert('채팅방을 찾을 수 없습니다. 잠시 후 다시 시도해주세요.');
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
        <button onClick={() => navigate(-1)} className="btn-primary">
          뒤로 가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white w-full max-w-md mx-auto shadow-lg">
      {/* 이미지 슬라이드 */}
      <div className="relative">
        {/* 이미지 목록 가져오기 */}
        {(() => {
          const imageList =
            store.imageUrlList && store.imageUrlList.length > 0
              ? store.imageUrlList.map((img) => img.imageUrl)
              : store.image
                ? [store.image]
                : store.imageUrl
                  ? [store.imageUrl]
                  : store.images && store.images.length > 0
                    ? store.images.map((img) => img.imageUrl || img.imageKey).filter(Boolean)
                    : [];

          const hasMultipleImages = imageList.length > 1;

          return (
            <>
              <div className="relative w-full h-64 overflow-hidden">
                {imageList.length > 0 ? (
                  <ImageWithFallback
                    src={imageList[currentImageIndex] || imageList[0]}
                    alt={store.name}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">이미지 없음</span>
                  </div>
                )}

                {/* 이전/다음 버튼 (이미지가 여러 개일 때만 표시) */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) =>
                          prev === 0 ? imageList.length - 1 : prev - 1,
                        );
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                      aria-label="이전 이미지"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) =>
                          prev === imageList.length - 1 ? 0 : prev + 1,
                        );
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                      aria-label="다음 이미지"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* 이미지 인디케이터 (이미지가 여러 개일 때만 표시) */}
                {hasMultipleImages && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {imageList.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`h-1.5 rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'bg-white w-6'
                            : 'bg-white/50 w-1.5 hover:bg-white/75'
                        }`}
                        aria-label={`이미지 ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 뒤로가기 버튼 */}
              <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors z-10"
              >
                <ArrowLeft size={20} />
              </button>

              {/* 공유/찜 버튼 */}
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                  <Share2 size={20} />
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  aria-label={isFavorite ? '찜 해제' : '찜하기'}
                >
                  <Heart
                    size={20}
                    className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}
                  />
                </button>
              </div>
            </>
          );
        })()}
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
          <button className="btn-primary flex-1 py-3">전화하기</button>
        </div>
      )}
    </div>
  );
};

export default StoreDetailPage;
