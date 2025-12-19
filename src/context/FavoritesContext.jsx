import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const toggleFavorite = (store) => {
    setFavorites((prev) => {
      const exists = prev.find((item) => item.id === store.id);
      if (exists) {
        return prev.filter((item) => item.id !== store.id);
      }
      return [...prev, store];
    });
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
