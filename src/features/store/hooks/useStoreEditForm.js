import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateStore, getMyStores } from '@/shared/api/storeApi';
import { getPresignUrl, uploadImageToStorage } from '@/shared/api/storageApi';
import { convertAddressToCoordinates } from '@/shared/lib/geocoding';
import {
  validateBusinessNumber,
  extractDistrictFromAddress,
} from '@/features/store/lib/storeUtils';

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
  existingImages: [],
};

export const useStoreEditForm = () => {
  const navigate = useNavigate();
  const { id: urlStoreId } = useParams();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConvertingCoordinates, setIsConvertingCoordinates] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        setIsLoading(true);
        const stores = await getMyStores();

        if (!stores || stores.length === 0) {
          alert('가게 정보를 찾을 수 없습니다.');
          navigate('/dashboard');
          return;
        }

        const storeData = urlStoreId
          ? stores.find((store) => store.id === Number(urlStoreId)) || stores[0]
          : stores[0];

        if (!storeData) {
          alert('가게 정보를 찾을 수 없습니다.');
          navigate('/dashboard');
          return;
        }

        setStoreId(storeData.id);

        const existingImageUrls = Array.isArray(storeData.imageUrlList)
          ? storeData.imageUrlList.map((url, index) => ({
              url,
              imageKey: url,
              sortOrder: index + 1,
            }))
          : [];

        const keywords = Array.isArray(storeData.keywordList) ? storeData.keywordList : [];

        const existingDistrict =
          storeData.divide || extractDistrictFromAddress(storeData.address || '');

        setFormData({
          name: storeData.name || '',
          businessNumber: storeData.businessNumber || '',
          description: storeData.description || '',
          category: storeData.category || '',
          phone: storeData.phone || '',
          address: storeData.address || '',
          latitude: storeData.latitude?.toString() || '',
          longitude: storeData.longitude?.toString() || '',
          divide: existingDistrict,
          keywords: keywords,
          openTime: storeData.openTime || '09:00',
          closeTime: storeData.closeTime || '22:00',
          hasBreakTime: storeData.hasBreakTime || false,
          breakStartTime: storeData.breakStartTime || '14:00',
          breakEndTime: storeData.breakEndTime || '17:00',
          images: [],
          imageKeys: existingImageUrls.map((img) => img.imageKey || img.url || ''),
          existingImages: existingImageUrls,
        });
      } catch {
        alert('가게 정보를 불러오는데 실패했습니다.');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoreData();
  }, [urlStoreId, navigate]);

  const handleImageAdd = async (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 3 - (formData.imageKeys.length + formData.images.length);
    const filesToAdd = files.slice(0, remainingSlots);
    const newImages = [...formData.images, ...filesToAdd];
    setFormData({ ...formData, images: newImages });

    if (filesToAdd.length > 0) {
      await uploadImages(filesToAdd);
    }
  };

  const handleImageRemove = (index) => {
    if (index < formData.existingImages.length) {
      const newExistingImages = formData.existingImages.filter((_, i) => i !== index);
      const newImageKeys = formData.imageKeys.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        existingImages: newExistingImages,
        imageKeys: newImageKeys,
      });
    } else {
      const newImageIndex = index - formData.existingImages.length;
      const newImages = formData.images.filter((_, i) => i !== newImageIndex);
      const newImageKeys = formData.imageKeys.filter(
        (_, i) => i !== formData.existingImages.length + newImageIndex,
      );
      setFormData({
        ...formData,
        images: newImages,
        imageKeys: newImageKeys,
      });
    }
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

  const waitForDaumPostcode = () => {
    return new Promise((resolve, reject) => {
      if (window.daum && window.daum.Postcode) {
        resolve();
        return;
      }

      const existingScript = document.querySelector('script[src*="postcode"]');
      if (existingScript) {
        let attempts = 0;
        const maxAttempts = 50;
        const checkInterval = setInterval(() => {
          attempts++;
          if (window.daum && window.daum.Postcode) {
            clearInterval(checkInterval);
            resolve();
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            reject(new Error('주소 검색 서비스 로드 시간 초과'));
          }
        }, 100);
      } else {
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.async = true;
        script.onload = () => {
          setTimeout(() => {
            if (window.daum && window.daum.Postcode) {
              resolve();
            } else {
              reject(new Error('주소 검색 서비스 초기화 실패'));
            }
          }, 100);
        };
        script.onerror = () => {
          reject(new Error('주소 검색 서비스 스크립트 로드 실패'));
        };
        document.head.appendChild(script);
      }
    });
  };

  const handleAddressSearch = async () => {
    try {
      await waitForDaumPostcode();
    } catch {
      alert('주소 검색 서비스를 불러올 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요.');
      return;
    }

    if (!window.daum || !window.daum.Postcode) {
      alert('주소 검색 서비스를 불러올 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요.');
      return;
    }

    const layer = document.createElement('div');
    layer.id = 'address-search-layer';
    layer.style.cssText =
      'position:fixed;width:100%;height:100%;top:0;left:0;z-index:9999;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;';

    const existingLayer = document.getElementById('address-search-layer');
    if (existingLayer) {
      existingLayer.remove();
    }

    const container = document.createElement('div');
    container.style.cssText =
      'position:relative;width:100%;max-width:500px;height:500px;max-height:90vh;background:white;border-radius:12px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.2);display:flex;flex-direction:column;';

    const header = document.createElement('div');
    header.style.cssText =
      'position:relative;width:100%;height:50px;background:white;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;padding:0 16px;flex-shrink:0;z-index:10001;';

    const title = document.createElement('span');
    title.textContent = '주소 검색';
    title.style.cssText = 'font-size:16px;font-weight:600;color:#111827;';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.type = 'button';
    closeBtn.style.cssText =
      'cursor:pointer;font-size:28px;color:#6b7280;width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:transparent;border:none;border-radius:6px;transition:all 0.2s;line-height:1;padding:0;';
    closeBtn.onmouseover = () => {
      closeBtn.style.backgroundColor = '#f3f4f6';
      closeBtn.style.color = '#111827';
    };
    closeBtn.onmouseout = () => {
      closeBtn.style.backgroundColor = 'transparent';
      closeBtn.style.color = '#6b7280';
    };
    closeBtn.onclick = () => layer.remove();

    header.appendChild(title);
    header.appendChild(closeBtn);

    const postcodeDiv = document.createElement('div');
    postcodeDiv.id = 'postcode-embed';
    postcodeDiv.style.cssText = 'width:100%;flex:1;overflow:auto;';

    container.appendChild(header);
    container.appendChild(postcodeDiv);
    layer.appendChild(container);
    document.body.appendChild(layer);

    layer.onclick = (e) => {
      if (e.target === layer) {
        layer.remove();
      }
    };

    new window.daum.Postcode({
      oncomplete: function (data) {
        let address = '';
        let extraAddress = '';

        if (data.userSelectedType === 'R') {
          address = data.roadAddress;
        } else {
          address = data.jibunAddress;
        }

        if (data.userSelectedType === 'R') {
          if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
            extraAddress += data.bname;
          }
          if (data.buildingName !== '' && data.apartment === 'Y') {
            extraAddress += extraAddress !== '' ? ', ' + data.buildingName : data.buildingName;
          }
          if (extraAddress !== '') {
            extraAddress = ' (' + extraAddress + ')';
          }
        }

        const fullAddress = address + extraAddress;
        const district = extractDistrictFromAddress(fullAddress);

        layer.remove();

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
            setFormData((prev) => ({
              ...prev,
              latitude: latitude.toString(),
              longitude: longitude.toString(),
            }));
          })
          .catch(() => {
            setFormData((prev) => ({
              ...prev,
              latitude: '0',
              longitude: '0',
            }));
          })
          .finally(() => {
            setIsConvertingCoordinates(false);
          });
      },
      width: '100%',
      height: '100%',
      maxSuggestItems: 5,
    }).embed(postcodeDiv);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = '가게 이름을 입력해주세요';
    if (formData.businessNumber && !validateBusinessNumber(formData.businessNumber)) {
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
    if (formData.imageKeys.length === 0) {
      newErrors.images = '최소 1개 이상의 사진이 필요합니다';
    } else if (
      formData.images.length > 0 &&
      formData.imageKeys.length !== formData.existingImages.length + formData.images.length
    ) {
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

    if (!storeId) {
      alert('가게 정보를 불러올 수 없습니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateStore(storeId, formData);
      alert('가게 정보가 수정되었습니다!');
      navigate('/dashboard');
    } catch {
      alert('가게 수정에 실패했습니다. 다시 시도해주세요.');
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
    isLoading,
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
