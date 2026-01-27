import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { getMenu, updateMenu } from '@/shared/api/storeApi';
import { useMyStores } from '@/shared/hooks/useStoreQueries';

const MenuManagePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: stores = [] } = useMyStores();
  const selectedStore = stores.find((store) => store.id === id || store.id === Number(id));

  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // 메뉴 조회
  useEffect(() => {
    const fetchMenu = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        const data = await getMenu(id);
        setMenuItems(data || []);
      } catch {
        setError('메뉴를 불러오는데 실패했습니다.');
        setMenuItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [id]);

  // 메뉴 항목 추가
  const handleAddMenuItem = () => {
    setMenuItems([
      ...menuItems,
      {
        restaurantId: id ? Number(id) : null,
        name: '',
        price: 0,
      },
    ]);
  };

  // 메뉴 항목 삭제
  const handleRemoveMenuItem = (index) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  // 메뉴 항목 수정
  const handleMenuItemChange = (index, field, value) => {
    const updated = [...menuItems];
    if (field === 'price') {
      updated[index][field] = Number(value) || 0;
    } else {
      updated[index][field] = value;
    }
    setMenuItems(updated);
  };

  // 메뉴 저장
  const handleSave = async () => {
    if (!id) {
      alert('가게 ID가 없습니다.');
      return;
    }

    // 유효성 검사
    const invalidItems = menuItems.filter(
      (item) => !item.name || !item.name.trim() || item.price <= 0,
    );

    if (invalidItems.length > 0) {
      alert('메뉴 이름과 가격을 모두 입력해주세요. (가격은 0보다 커야 합니다)');
      return;
    }

    // API 형식에 맞게 데이터 변환
    const itemsToSave = menuItems.map((item) => ({
      restaurantId: Number(id),
      name: item.name.trim(),
      price: Number(item.price),
    }));

    try {
      setIsSaving(true);
      setError(null);

      // updateMenu는 전체 수정이므로 항상 updateMenu 사용
      // (기존 메뉴 전부 삭제 후 재등록)
      await updateMenu(itemsToSave);

      alert('메뉴가 저장되었습니다.');
      navigate('/dashboard');
    } catch {
      setError('메뉴 저장에 실패했습니다. 다시 시도해주세요.');
      alert('메뉴 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">메뉴를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 */}
      <div className="header-flex header-bar">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">메뉴 관리</h1>
          {selectedStore && <p className="text-sm text-gray-500">{selectedStore.name}</p>}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={18} />
          <span>{isSaving ? '저장 중...' : '저장'}</span>
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 메뉴 목록 */}
      <div className="flex-1 overflow-auto p-4">
        {menuItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-500 mb-4">등록된 메뉴가 없습니다</p>
            <button onClick={handleAddMenuItem} className="btn-primary flex items-center gap-2">
              <Plus size={18} />
              <span>메뉴 추가</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1 space-y-3">
                  <div>
                    <label
                      htmlFor={`menu-name-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      메뉴 이름
                    </label>
                    <input
                      id={`menu-name-${index}`}
                      type="text"
                      value={item.name || ''}
                      onChange={(e) => handleMenuItemChange(index, 'name', e.target.value)}
                      placeholder="예: 김치찌개"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`menu-price-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      가격
                    </label>
                    <input
                      id={`menu-price-${index}`}
                      type="number"
                      value={item.price || 0}
                      onChange={(e) => handleMenuItemChange(index, 'price', e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveMenuItem(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="메뉴 삭제"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 메뉴 추가 버튼 */}
        {menuItems.length > 0 && (
          <button
            onClick={handleAddMenuItem}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300"
          >
            <Plus size={20} />
            <span>메뉴 추가</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MenuManagePage;
