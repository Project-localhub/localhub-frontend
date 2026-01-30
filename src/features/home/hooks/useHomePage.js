import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAllRestaurants, useRestaurantsByFilter } from '@/features/store/hooks/useStoreQueries';
import { useMyFavorites } from '@/features/favorite/hooks/useFavoriteQueries';
import { calculateDistance, formatDistance } from '@/features/store/lib/storeUtils';

export const useHomePage = () => {
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDivide, setSelectedDivide] = useState('');
  const loadMoreRef = useRef(null);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleViewModeList = useCallback(() => {
    setViewMode('list');
  }, []);

  const handleViewModeMap = useCallback(() => {
    setViewMode('map');
  }, []);

  const hasActiveFilters = selectedCategory || selectedDivide || searchQuery.trim();

  const filterParams = useMemo(
    () => ({
      category: selectedCategory || undefined,
      divide: selectedDivide || undefined,
      name: searchQuery.trim() || undefined,
    }),
    [selectedCategory, selectedDivide, searchQuery],
  );

  const {
    data: allData,
    fetchNextPage: fetchNextPageAll,
    hasNextPage: hasNextPageAll,
    isFetchingNextPage: isFetchingNextPageAll,
    isLoading: isLoadingAll,
  } = useAllRestaurants({
    name: searchQuery.trim() || undefined,
    enabled: !hasActiveFilters,
  });

  const {
    data: filterData,
    fetchNextPage: fetchNextPageFilter,
    hasNextPage: hasNextPageFilter,
    isFetchingNextPage: isFetchingNextPageFilter,
    isLoading: isLoadingFilter,
  } = useRestaurantsByFilter(filterParams, { enabled: hasActiveFilters });

  const data = hasActiveFilters ? filterData : allData;
  const fetchNextPage = hasActiveFilters ? fetchNextPageFilter : fetchNextPageAll;
  const hasNextPage = hasActiveFilters ? hasNextPageFilter : hasNextPageAll;
  const isFetchingNextPage = hasActiveFilters ? isFetchingNextPageFilter : isFetchingNextPageAll;
  const isLoading = hasActiveFilters ? isLoadingFilter : isLoadingAll;

  const { data: myFavorites = [] } = useMyFavorites();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {},
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        },
      );
    }
  }, []);

  useEffect(() => {
    if (viewMode !== 'list') return;

    let observer = null;
    let timeoutId = null;
    const currentRef = loadMoreRef.current;

    timeoutId = setTimeout(() => {
      const ref = loadMoreRef.current;
      if (!ref || !hasNextPage || isFetchingNextPage) return;

      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchNextPage();
          }
        },
        {
          threshold: 0.1,
        },
      );

      observer.observe(ref);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (observer && currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [viewMode, searchQuery, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const favoriteIds = useMemo(
    () => new Set(myFavorites.map((fav) => fav.id || fav.restaurantId)),
    [myFavorites],
  );

  const allRestaurants = useMemo(() => {
    const allItems = data?.pages?.flatMap((page) => page?.content || []) || [];
    const uniqueMap = new Map();
    allItems.forEach((restaurant) => {
      if (restaurant && restaurant.restaurantId) {
        if (!uniqueMap.has(restaurant.restaurantId)) {
          uniqueMap.set(restaurant.restaurantId, restaurant);
        }
      }
    });
    return Array.from(uniqueMap.values());
  }, [data?.pages]);

  const totalElements = data?.pages?.[0]?.totalElements || allRestaurants.length;

  const filteredStores = useMemo(() => {
    return allRestaurants.filter((restaurant) => restaurant && restaurant.restaurantId);
  }, [allRestaurants]);

  const stores = useMemo(() => {
    return filteredStores.map((restaurant) => {
      const distance =
        userLocation && restaurant.latitude && restaurant.longitude
          ? formatDistance(
              calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                restaurant.latitude,
                restaurant.longitude,
              ),
            )
          : '';

      return {
        id: restaurant.restaurantId,
        name: restaurant.name || '',
        category: restaurant.category || '',
        rating: restaurant.score || 0,
        reviewCount: restaurant.reviewCount || 0,
        distance,
        image: restaurant.imageUrl || '',
        tags: restaurant.keyword || [],
        isLiked: favoriteIds.has(restaurant.restaurantId),
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
      };
    });
  }, [filteredStores, favoriteIds, userLocation]);

  return {
    viewMode,
    searchQuery,
    showFilterModal,
    selectedCategory,
    selectedDivide,
    hasActiveFilters,
    loadMoreRef,
    stores,
    isLoading,
    totalElements,
    isFetchingNextPage,
    hasNextPage,
    handleSearchChange,
    handleViewModeList,
    handleViewModeMap,
    setShowFilterModal,
    setSelectedCategory,
    setSelectedDivide,
  };
};
