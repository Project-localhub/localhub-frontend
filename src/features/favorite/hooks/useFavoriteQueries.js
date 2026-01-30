import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyFavoriteList, addFavorite, removeFavorite } from '@/shared/api/favoriteApi';
import { useAuth } from '@/context/AuthContext';

export const favoriteKeys = {
  all: ['favorites'],
  myFavorites: () => [...favoriteKeys.all, 'my'],
};

export const useMyFavorites = (options = {}) => {
  const { isLogin } = useAuth();

  return useQuery({
    queryKey: favoriteKeys.myFavorites(),
    queryFn: async () => {
      try {
        const data = await getMyFavoriteList();
        const favorites = data?.content || (Array.isArray(data) ? data : []);

        return favorites.map((item) => ({
          ...item,
          id: item.restaurantId || item.id,
          image: item.imageUrl || item.image,
          rating: item.score !== undefined ? item.score : item.rating || 0,
          isLiked: true,
          distance: item.distance || '0m',
          tags: item.keyword || item.tags || [],
        }));
      } catch {
        return [];
      }
    },
    enabled: options.enabled !== undefined ? options.enabled : isLogin,
    staleTime: 1 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ restaurantId, isFavorite }) => {
      if (isFavorite) {
        return await removeFavorite(restaurantId);
      } else {
        return await addFavorite(restaurantId);
      }
    },
    onMutate: async ({ restaurantId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: favoriteKeys.myFavorites() });

      const previousFavorites = queryClient.getQueryData(favoriteKeys.myFavorites());

      queryClient.setQueryData(favoriteKeys.myFavorites(), (old = []) => {
        if (isFavorite) {
          return old.filter(
            (fav) =>
              fav.id !== restaurantId &&
              fav.id !== Number(restaurantId) &&
              fav.restaurantId !== restaurantId &&
              fav.restaurantId !== Number(restaurantId),
          );
        } else {
          const newFavorite = {
            id: restaurantId,
            restaurantId: restaurantId,
            isLiked: true,
          };
          return [...old, newFavorite];
        }
      });

      return { previousFavorites };
    },
    onError: (err, variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(favoriteKeys.myFavorites(), context.previousFavorites);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.myFavorites() });
      queryClient.invalidateQueries({ queryKey: ['stores', 'detail', variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['stores', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
};
