import StoreCard from '@/components/StoreCard';

const mockFavorites = [
  {
    id: '1',
    name: '맛있는 한식당',
    category: '한식',
    rating: 4.8,
    reviewCount: 234,
    distance: '0.3km',
    image:
      'https://images.unsplash.com/photo-1629642621587-9947ce328799?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjByZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NjUxNTg3MTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['깨끗함', '맛있음', '친절함'],
    isFavorite: true,
  },
  {
    id: '3',
    name: '동네 빵집',
    category: '베이커리',
    rating: 4.9,
    reviewCount: 412,
    distance: '0.7km',
    image:
      'https://images.unsplash.com/photo-1658740877393-7d001187d867?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWtlcnklMjBicmVhZCUyMHBhc3RyeXxlbnwxfHx8fDE3NjUxNjQzODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['신선함', '친절함', '재방문'],
    isFavorite: true,
  },
];

const FavoritesPage = () => {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="mb-2">찜한 가게</div>
        <div className="text-gray-600 text-sm">
          총 <span className="text-blue-600">{mockFavorites.length}</span>개
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {mockFavorites.length > 0 ? (
          <div className="space-y-3">
            {mockFavorites.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-gray-400 mb-2">찜한 가게가 없습니다</div>
            <p className="text-gray-500 text-sm">마음에 드는 가게를 찜해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
