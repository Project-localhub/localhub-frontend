import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Plus } from 'lucide-react';
import { FOOD_CATEGORIES, KEYWORD_OPTIONS } from '@/features/store/constants/storeConstants';
import { useStoreEditForm } from '@/features/store/hooks/useStoreEditForm';
import AddressSearch from '@/components/dashboard/AddressSearch';
import OperatingHours from '@/components/dashboard/OperatingHours';
import DaumPostcodeModal from '@/components/dashboard/DaumPostcodeModal';

const StoreEditPage = () => {
  const navigate = useNavigate();
  const {
    formData,
    setFormData,
    errors,
    isSubmitting,
    isUploadingImages,
    isLoading,
    showAddressModal,
    setShowAddressModal,
    handleImageAdd,
    handleImageRemove,
    handleKeywordToggle,
    handleAddressSearch,
    handleAddressComplete,
    handleSubmit,
  } = useStoreEditForm();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">가게 정보를 불러오는 중...</div>
      </div>
    );
  }

  const allImages = [
    ...formData.existingImages.map((img) => ({
      url: img.url || img.imageUrl || '',
      isExisting: true,
    })),
    ...formData.images.map((file) => ({
      file,
      isExisting: false,
    })),
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-auto">
      {/* 헤더 */}
      <div className="bg-white p-4 border-b border-gray-200 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <span className="text-gray-900 font-medium">가게 정보 수정</span>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-6">
        {/* 가게 이름 */}
        <div>
          <label htmlFor="store-name" className="block text-gray-900 font-medium mb-2">
            가게 이름 <span className="text-red-500">*</span>
          </label>
          <input
            id="store-name"
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
          <label htmlFor="business-number" className="block text-gray-900 font-medium mb-2">
            사업자등록번호
          </label>
          <input
            id="business-number"
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

        {/* 이미지 업로드 (기존 + 새로 추가) */}
        <div>
          <div className="block text-gray-900 font-medium mb-2">
            가게 사진 <span className="text-red-500">*</span> (최대 3개)
          </div>
          <div className="grid grid-cols-3 gap-3">
            {allImages.map((img, index) => (
              <div key={index} className="relative aspect-square">
                {img.isExisting ? (
                  <img
                    src={img.url}
                    alt={`가게 사진 ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-gray-300"
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(img.file)}
                    alt={`가게 사진 ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-gray-300"
                  />
                )}
                <button
                  type="button"
                  onClick={() => handleImageRemove(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {allImages.length < 3 && (
              <label
                className={`aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${
                  isUploadingImages
                    ? 'cursor-wait opacity-50'
                    : 'cursor-pointer hover:border-blue-500'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageAdd}
                  className="hidden"
                  multiple
                  disabled={isUploadingImages}
                />
                {isUploadingImages ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <span className="text-xs text-gray-500">업로드 중...</span>
                  </div>
                ) : (
                  <Plus size={24} className="text-gray-400" />
                )}
              </label>
            )}
          </div>
          {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
        </div>

        {/* 음식 카테고리 */}
        <div>
          <label htmlFor="category" className="block text-gray-900 font-medium mb-2">
            음식 카테고리 <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
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
          <div className="block text-gray-900 font-medium mb-2">키워드 (선택)</div>
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
          <label htmlFor="description" className="block text-gray-900 font-medium mb-2">
            가게 설명 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
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

        <AddressSearch
          address={formData.address}
          onAddressChange={(value) => setFormData({ ...formData, address: value })}
          onSearch={handleAddressSearch}
          error={errors.address}
        />

        <DaumPostcodeModal
          isOpen={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          onComplete={handleAddressComplete}
        />

        {/* 전화번호 */}
        <div>
          <label htmlFor="phone" className="block text-gray-900 font-medium mb-2">
            전화번호 <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
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

        <OperatingHours
          openTime={formData.openTime}
          closeTime={formData.closeTime}
          hasBreakTime={formData.hasBreakTime}
          breakStartTime={formData.breakStartTime}
          breakEndTime={formData.breakEndTime}
          onOpenTimeChange={(value) => setFormData({ ...formData, openTime: value })}
          onCloseTimeChange={(value) => setFormData({ ...formData, closeTime: value })}
          onBreakTimeToggle={(checked) => setFormData({ ...formData, hasBreakTime: checked })}
          onBreakStartTimeChange={(value) => setFormData({ ...formData, breakStartTime: value })}
          onBreakEndTimeChange={(value) => setFormData({ ...formData, breakEndTime: value })}
        />

        {/* 제출 버튼 */}
        <div className="pb-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '수정 중...' : '가게 정보 수정하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreEditPage;
