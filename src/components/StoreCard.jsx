/* eslint-disable react/prop-types */
import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart, MapPin, MessageCircle } from 'lucide-react';
import ImageWithFallback from '@/components/figma/imageWithFallback';
import { useFavorites } from '../context/FavoritesContext';
import { useCreateInquiryChat } from '@/shared/hooks/useChatQueries';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

const StoreCard = ({ store }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const navigate = useNavigate();
  const createInquiryChat = useCreateInquiryChat();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const favorite = isFavorite(store.id);

  const favoriteButtonHandler = (e) => {
    e.preventDefault(); // Link 이동 막기
    e.stopPropagation(); // 이벤트 전파 차단
    toggleFavorite(store);
  };

  const handleStartChat = async (e) => {
    e.preventDefault(); // Link 이동 막기
    e.stopPropagation(); // 이벤트 전파 차단

    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (user.userType === 'OWNER') {
      alert('사업자는 채팅을 시작할 수 없습니다. 일반 사용자로 로그인해주세요.');
      return;
    }

    setIsCreatingChat(true);
    try {
      // 채팅방 생성
      const response = await createInquiryChat.mutateAsync({
        storeId: store.id,
        userId: user.id,
      });

      // 채팅방 생성 성공 시 ChatPage로 이동
      const chatRoomId = response.id || response.inquiryChatId || response.chatRoomId;
      navigate('/chat', { state: { chatRoomId } });
    } catch (error) {
      console.error('채팅방 생성 오류:', error);
      const errorMessage =
        error.response?.status === 401
          ? '인증이 필요합니다. 다시 로그인해주세요.'
          : error.message || '채팅방 생성에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <Link
      to={`/store/${store.id}`}
      className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative">
        <ImageWithFallback
          src={store.image}
          alt={store.name}
          className="w-full h-48 object-cover"
        />

        <button
          onClick={favoriteButtonHandler}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md"
        >
          <Heart size={20} className={favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
        </button>

        <div className="absolute bottom-2 left-2 px-2 py-1 bg-white rounded-full text-xs flex items-center gap-1">
          <MapPin size={12} className="text-blue-600" />
          {store.distance}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
              {store.category}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Star size={16} className="fill-yellow-400 text-yellow-400" />
            <span className="text-gray-900">{store.rating}</span>
            <span className="text-gray-500 text-sm">({store.reviewCount})</span>
          </div>
        </div>

        <div className="mb-2 text-gray-900">{store.name}</div>

        <div className="flex flex-wrap gap-1 mb-3">
          {store.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              #{tag}
            </span>
          ))}
        </div>

        {user && user.userType !== 'OWNER' && (
          <button
            onClick={handleStartChat}
            disabled={isCreatingChat}
            className="w-full py-2 px-3 bg-blue-600 text-white rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <MessageCircle size={16} />
            {isCreatingChat ? '채팅방 생성 중...' : '채팅하기'}
          </button>
        )}
      </div>
    </Link>
  );
};

export default StoreCard;
