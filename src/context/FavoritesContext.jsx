import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { toggleLike } from '../shared/api/auth';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = async (store) => {
    try {
      // 서버에 찜 요청 보내기
      const msg = await toggleLike(store.id);
      console.log(msg); // "찜 완료" or "찜 취소"

      // UI 업데이트
      setFavorites((prev) => {
        const exists = prev.find((item) => item.id === store.id);
        if (exists) {
          return prev.filter((item) => item.id !== store.id); // 취소
        }
        return [...prev, store]; // 추가
      });
    } catch (err) {
      console.log('🟥 status:', err.response?.status);
      console.log('🟥 url:', err.config?.url);
      console.log('🟥 token:', err.config?.headers?.Authorization);

      console.log('에러', err);
      alert('로그인이 필요합니다.');
    }
  };

  const isFavorite = (storeId) => {
    return favorites.some((item) => item.id === storeId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, setFavorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

FavoritesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useFavorites = () => useContext(FavoritesContext);
