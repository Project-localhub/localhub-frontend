import { useParams } from 'react-router-dom';
import { useStoreDetail } from '@/shared/hooks/useStoreQueries';
import MapView from '@/components/MapView';

const StoreDetailPage = () => {
  const { id } = useParams();
  const { data: store, isLoading } = useStoreDetail(id);

  if (isLoading) return <div>로딩 중...</div>;
  if (!store) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <img src={store.imageUrl} alt={store.name} className="h-48 w-full object-cover" />

      <div className="p-4">
        <h1 className="text-xl font-bold">{store.name}</h1>
        <p className="text-gray-500">{store.category}</p>
      </div>

      <div className="flex-1">
        <MapView
          stores={[
            {
              id: store.restaurantId,
              name: store.name,
              lat: store.latitude,
              lng: store.longitude,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default StoreDetailPage;
