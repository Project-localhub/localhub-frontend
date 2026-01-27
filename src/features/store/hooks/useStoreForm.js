import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { createStore } from '@/shared/api/storeApi';
import { getPresignUrl, uploadImageToStorage } from '@/shared/api/storageApi';
import { convertAddressToCoordinates } from '@/shared/lib/geocoding';
import {
  validateBusinessNumber,
  extractDistrictFromAddress,
} from '@/features/store/lib/storeUtils';
import { storeKeys } from '@/features/store/hooks/useStoreQueries';

const initialFormData = {
  name: '',
  businessNumber: '',
  description: '',
  category: '',
  phone: '',
  address: '',
  latitude: '',
  longitude: '',
  divide: '',
  keywords: [],
  openTime: '09:00',
  closeTime: '22:00',
  hasBreakTime: false,
  breakStartTime: '14:00',
  breakEndTime: '17:00',
  images: [],
  imageKeys: [],
};

export const useStoreForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isConvertingCoordinates, setIsConvertingCoordinates] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const handleImageAdd = async (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 3 - formData.images.length;
    const filesToAdd = files.slice(0, remainingSlots);
    const newImages = [...formData.images, ...filesToAdd];
    setFormData({ ...formData, images: newImages });

    if (filesToAdd.length > 0) {
      await uploadImages(filesToAdd);
    }
  };

  const handleImageRemove = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newImageKeys = formData.imageKeys.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages, imageKeys: newImageKeys });
  };

  const uploadImages = async (files) => {
    setIsUploadingImages(true);
    const uploadedKeys = [];

    try {
      for (const file of files) {
        const { key, url } = await getPresignUrl(file.name, file.type);
        await uploadImageToStorage(url, file);
        uploadedKeys.push(key);
      }

      setFormData((prev) => ({
        ...prev,
        imageKeys: [...prev.imageKeys, ...uploadedKeys],
      }));
    } catch {
      alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
      setFormData((prev) => ({
        ...prev,
        images: prev.images.slice(0, prev.images.length - files.length),
      }));
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleKeywordToggle = (keyword) => {
    const newKeywords = formData.keywords.includes(keyword)
      ? formData.keywords.filter((k) => k !== keyword)
      : [...formData.keywords, keyword];
    setFormData({ ...formData, keywords: newKeywords });
  };

  const handleAddressSearch = () => {
    setShowAddressModal(true);
  };

  const handleAddressComplete = (fullAddress) => {
    const district = extractDistrictFromAddress(fullAddress);

    setIsConvertingCoordinates(true);
    setFormData((prev) => ({
      ...prev,
      address: fullAddress,
      divide: district,
      latitude: '',
      longitude: '',
    }));

    convertAddressToCoordinates(fullAddress)
      .then(({ latitude, longitude }) => {
        if (latitude === 0 && longitude === 0) {
          alert('주소를 좌표로 변환할 수 없습니다. 주소를 다시 확인해주세요.');
        }
        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));
      })
      .catch(() => {
        alert('주소를 좌표로 변환하는 중 오류가 발생했습니다.');
        setFormData((prev) => ({
          ...prev,
          latitude: '0',
          longitude: '0',
        }));
      })
      .finally(() => {
        setIsConvertingCoordinates(false);
      });
  };

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
    if (!formData.address.trim()) {
      newErrors.address = '주소를 입력해주세요';
    } else if (isConvertingCoordinates) {
      newErrors.address = '주소 검색 후 좌표 변환이 완료될 때까지 기다려주세요';
    } else if (!formData.latitude || !formData.longitude) {
      setFormData((prev) => ({
        ...prev,
        latitude: prev.latitude || '0',
        longitude: prev.longitude || '0',
      }));
    }
    if (!formData.phone.trim()) newErrors.phone = '전화번호를 입력해주세요';
    if (formData.images.length === 0) {
      newErrors.images = '최소 1개 이상의 사진을 등록해주세요';
    } else if (formData.imageKeys.length !== formData.images.length) {
      newErrors.images = '이미지 업로드가 완료될 때까지 기다려주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createStore(formData);
      queryClient.invalidateQueries({ queryKey: storeKeys.all() });
      alert('가게 등록이 완료되었습니다!');
      navigate('/dashboard');
    } catch {
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
    isUploadingImages,
    isConvertingCoordinates,
    showAddressModal,
    setShowAddressModal,
    handleImageAdd,
    handleImageRemove,
    handleKeywordToggle,
    handleAddressSearch,
    handleAddressComplete,
    handleSubmit,
  };
};
