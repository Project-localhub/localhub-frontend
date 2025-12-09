import { useState } from 'react';
import Layout from '@/components/Layout';
import StoreCard from '@/components/StoreCard';
import MapView from '@/components/MapView';
import { Search, Filter, MapPin } from 'lucide-react';

const mockStores = [
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
    id: '2',
    name: '아늑한 카페',
    category: '카페',
    rating: 4.6,
    reviewCount: 156,
    distance: '0.5km',
    image:
      'https://images.unsplash.com/photo-1642647916334-82e513d9cc48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZlJTIwY29mZmVlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY1MjAwMjY5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['조용함', '커피 맛있음'],
    isFavorite: false,
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
  {
    id: '4',
    name: '골목 분식집',
    category: '분식',
    rating: 4.5,
    reviewCount: 89,
    distance: '1.2km',
    image:
      'https://images.unsplash.com/photo-1707858127144-69b147b28b94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXQlMjBtYXJrZXQlMjBzaG9wfGVufDF8fHx8MTc2NTIwMDI2OXww&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['가성비', '맛있음'],
    isFavorite: false,
  },
];

const HomePage = () => {
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <div className="bg-white px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <Search size={20} className="text-gray-500" />
            <input
              type="text"
              placeholder="가게 이름, 카테고리 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none"
            />
            <button className="text-gray-600">
              <Filter size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
              <MapPin size={14} />
              강남구
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              한식
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              카페
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              베이커리
            </button>
          </div>
        </div>

        <div className="bg-white px-4 py-2 border-b border-gray-200 flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 rounded-lg ${
              viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            리스트
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex-1 py-2 rounded-lg ${
              viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            지도
          </button>
        </div>

        {viewMode === 'list' ? (
          <div className="flex-1 overflow-auto p-4">
            <div className="mb-3 text-gray-600">
              주변 가게 <span className="text-blue-600">{mockStores.length}</span>개
            </div>
            <div className="space-y-3">
              {mockStores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </div>
        ) : (
          <MapView stores={mockStores} />
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
