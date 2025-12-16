import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Plus, MapPin, Clock, Phone, FileText } from 'lucide-react';
import { createStore } from '@/shared/api/storeApi';
import { FOOD_CATEGORIES, KEYWORD_OPTIONS } from '@/shared/lib/storeConstants';

const StoreRegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    businessNumber: '', // 사업자등록번호
    description: '',
    category: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
    keywords: [],
    openTime: '09:00',
    closeTime: '22:00',
    hasBreakTime: false,
    breakStartTime: '14:00',
    breakEndTime: '17:00',
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이미지 추가
  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...formData.images, ...files].slice(0, 3); // 최대 3개
    setFormData({ ...formData, images: newImages });
  };

  // 이미지 제거
  const handleImageRemove = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  // 키워드 토글
  const handleKeywordToggle = (keyword) => {
    const newKeywords = formData.keywords.includes(keyword)
      ? formData.keywords.filter((k) => k !== keyword)
      : [...formData.keywords, keyword];
    setFormData({ ...formData, keywords: newKeywords });
  };

  // 카카오맵 주소 검색
  const handleAddressSearch = () => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      // 카카오맵 스크립트가 로드되지 않은 경우
      alert('카카오맵을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.kakao.maps.services.Places().keywordSearch(
      formData.address || '서울',
      (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          if (data && data.length > 0) {
            const place = data[0];
            setFormData({
              ...formData,
              address: place.address_name || place.place_name,
              latitude: place.y,
              longitude: place.x,
            });
          } else {
            alert('검색 결과가 없습니다.');
          }
        } else {
          alert('주소 검색에 실패했습니다.');
        }
      },
    );
  };

  // 사업자등록번호 형식 검증 (10자리 숫자)
  const validateBusinessNumber = (number) => {
    const cleaned = number.replace(/-/g, '');
    return /^\d{10}$/.test(cleaned);
  };

  // 폼 검증
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = '가게 이름을 입력해주세요';
    if (!formData.businessNumber.trim()) {
      newErrors.businessNumber = '사업자등록번호를 입력해주세요';
    } else if (!validateBusinessNumber(formData.businessNumber)) {
      newErrors.businessNumber = '사업자등록번호는 10자리 숫자입니다 (예: 123-45-67890)';
    }
    if (!formData.category) newErrors.category = '음식 카테고리를 선택해주세요';
    if (!formData.description.trim()) newErrors.description = '가게 설명을 입력해주세요';
    if (!formData.address.trim()) newErrors.address = '주소를 입력해주세요';
    if (!formData.phone.trim()) newErrors.phone = '전화번호를 입력해주세요';
    if (formData.images.length === 0) newErrors.images = '최소 1개 이상의 사진을 등록해주세요';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createStore(formData);
      alert('가게 등록이 완료되었습니다!');
      navigate('/dashboard');
    } catch (error) {
      console.error('가게 등록 오류:', error);
      alert('가게 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-auto">
      {/* 헤더 */}
      <div className="bg-white p-4 border-b border-gray-200 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <span className="text-gray-900 font-medium">가게 등록</span>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-6">
        {/* 가게 이름 */}
        <div>
          <label className="block text-gray-900 font-medium mb-2">
            가게 이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="가게 이름을 입력하세요"
            className={`w-full px-4 py-3 border rounded-lg outline-none ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* 사업자등록번호 */}
        <div>
          <label className="block text-gray-900 font-medium mb-2">
            사업자등록번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.businessNumber}
            onChange={(e) => {
              let value = e.target.value.replace(/[^0-9-]/g, '');
              // 자동으로 하이픈 추가 (123-45-67890 형식)
              if (value.length > 3 && value[3] !== '-') {
                value = value.slice(0, 3) + '-' + value.slice(3);
              }
              if (value.length > 6 && value[6] !== '-') {
                value = value.slice(0, 6) + '-' + value.slice(6);
              }
              if (value.length > 13) value = value.slice(0, 13);
              setFormData({ ...formData, businessNumber: value });
            }}
            placeholder="123-45-67890"
            className={`w-full px-4 py-3 border rounded-lg outline-none ${
              errors.businessNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.businessNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.businessNumber}</p>
          )}
        </div>

        {/* 사진 등록 (최대 3개) */}
        <div>
          <label className="block text-gray-900 font-medium mb-2">
            가게 사진 <span className="text-red-500">*</span> (최대 3개)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {formData.images.map((image, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`가게 사진 ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => handleImageRemove(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {formData.images.length < 3 && (
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageAdd}
                  className="hidden"
                  multiple
                />
                <Plus size={24} className="text-gray-400" />
              </label>
            )}
          </div>
          {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
        </div>

        {/* 음식 카테고리 */}
        <div>
          <label className="block text-gray-900 font-medium mb-2">
            음식 카테고리 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg outline-none ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">카테고리를 선택하세요</option>
            {FOOD_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        {/* 키워드 카테고리 */}
        <div>
          <label className="block text-gray-900 font-medium mb-2">키워드 (선택)</label>
          <div className="flex flex-wrap gap-2">
            {KEYWORD_OPTIONS.map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => handleKeywordToggle(keyword)}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  formData.keywords.includes(keyword)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                }`}
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>

        {/* 가게 설명 */}
        <div>
          <label className="block text-gray-900 font-medium mb-2">
            가게 설명 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="가게에 대한 설명을 입력하세요"
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg outline-none resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* 위치 주소 (카카오맵) */}
        <div>
          <label className="block text-gray-900 font-medium mb-2">
            위치 주소 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="주소를 검색하세요"
              className={`flex-1 px-4 py-3 border rounded-lg outline-none ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={handleAddressSearch}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              <MapPin size={20} />
              검색
            </button>
          </div>
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>

        {/* 전화번호 */}
        <div>
          <label className="block text-gray-900 font-medium mb-2">
            전화번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="010-1234-5678"
            className={`w-full px-4 py-3 border rounded-lg outline-none ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        {/* 영업시간 */}
        <div>
          <label className="flex items-center gap-2 text-gray-900 font-medium mb-2">
            <Clock size={20} />
            영업시간 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="time"
              value={formData.openTime}
              onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg outline-none"
            />
            <span className="text-gray-600">~</span>
            <input
              type="time"
              value={formData.closeTime}
              onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          {/* 브레이크타임 설정 */}
          <div className="mt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasBreakTime}
                onChange={(e) => setFormData({ ...formData, hasBreakTime: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-gray-700">브레이크타임 설정</span>
            </label>
            {formData.hasBreakTime && (
              <div className="flex items-center gap-3 mt-2 ml-6">
                <input
                  type="time"
                  value={formData.breakStartTime}
                  onChange={(e) => setFormData({ ...formData, breakStartTime: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg outline-none"
                />
                <span className="text-gray-600">~</span>
                <input
                  type="time"
                  value={formData.breakEndTime}
                  onChange={(e) => setFormData({ ...formData, breakEndTime: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="pb-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '등록 중...' : '가게 등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreRegisterPage;
