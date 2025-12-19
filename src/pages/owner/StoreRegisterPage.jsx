import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FOOD_CATEGORIES, KEYWORD_OPTIONS } from '@/shared/lib/storeConstants';
import { useStoreForm } from '@/shared/hooks/useStoreForm';
import ImageUpload from '@/components/dashboard/ImageUpload';
import AddressSearch from '@/components/dashboard/AddressSearch';
import OperatingHours from '@/components/dashboard/OperatingHours';

const StoreRegisterPage = () => {
  const navigate = useNavigate();
  const {
    formData,
    setFormData,
    errors,
    isSubmitting,
    handleImageAdd,
    handleImageRemove,
    handleKeywordToggle,
    handleAddressSearch,
    handleSubmit,
  } = useStoreForm();

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
            사업자등록번호 <span className="text-red-500">*</span>
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

        <ImageUpload
          images={formData.images}
          onAdd={handleImageAdd}
          onRemove={handleImageRemove}
          error={errors.images}
        />

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
            {isSubmitting ? '등록 중...' : '가게 등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreRegisterPage;
