import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStore } from '@/shared/api/storeApi';

const initialFormData = {
  name: '',
  businessNumber: '',
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
};

// 사업자등록번호 형식 검증 (10자리 숫자)
const validateBusinessNumber = (number) => {
  const cleaned = number.replace(/-/g, '');
  return /^\d{10}$/.test(cleaned);
};

export const useStoreForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
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

  return {
    formData,
    setFormData,
    errors,
    isSubmitting,
    handleImageAdd,
    handleImageRemove,
    handleKeywordToggle,
    handleAddressSearch,
    handleSubmit,
  };
};
