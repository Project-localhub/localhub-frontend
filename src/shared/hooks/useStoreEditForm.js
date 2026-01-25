import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateStore, getMyStores } from '@/shared/api/storeApi';
import { getPresignUrl, uploadImageToStorage } from '@/shared/api/storageApi';
import { convertAddressToCoordinates } from '@/shared/lib/geocoding';
import { validateBusinessNumber, extractDistrictFromAddress } from '@/shared/lib/storeUtils';

const initialFormData = {
  name: '',
  businessNumber: '',
  description: '',
  category: '',
  phone: '',
  address: '',
  latitude: '',
  longitude: '',
  divide: '', // 구 정보 (자동 추출)
  keywords: [],
  openTime: '09:00',
  closeTime: '22:00',
  hasBreakTime: false,
  breakStartTime: '14:00',
  breakEndTime: '17:00',
  images: [], // File 객체 배열 (새로 추가된 이미지)
  imageKeys: [], // 업로드 완료된 이미지 key 배열 (기존 + 새로 업로드)
  existingImages: [], // 기존 이미지 URL 배열 (표시용)
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

  // 기존 가게 정보 로드
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

        // URL 파라미터로 가게 ID가 있으면 해당 가게 사용, 없으면 첫 번째 가게 사용
        const storeData = urlStoreId
          ? stores.find((store) => store.id === Number(urlStoreId)) || stores[0]
          : stores[0];

        if (!storeData) {
          alert('가게 정보를 찾을 수 없습니다.');
          navigate('/dashboard');
          return;
        }

        // 가게 ID 저장
        setStoreId(storeData.id);

        // imageUrlList는 문자열 배열이므로 그대로 사용
        const existingImageUrls = Array.isArray(storeData.imageUrlList)
          ? storeData.imageUrlList.map((url, index) => ({
              url,
              imageKey: url, // URL을 key로 사용 (수정 시에는 새로 업로드 필요)
              sortOrder: index + 1,
            }))
          : [];

        // keywordList는 문자열 배열
        const keywords = Array.isArray(storeData.keywordList) ? storeData.keywordList : [];

        // 기존 주소에서 구 정보 추출 (이미 저장된 divide가 있으면 사용, 없으면 주소에서 추출)
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
          divide: existingDistrict, // 구 정보 설정
          keywords: keywords,
          openTime: storeData.openTime || '09:00',
          closeTime: storeData.closeTime || '22:00',
          hasBreakTime: storeData.hasBreakTime || false,
          breakStartTime: storeData.breakStartTime || '14:00',
          breakEndTime: storeData.breakEndTime || '17:00',
          images: [], // 새로 추가할 이미지
          imageKeys: existingImageUrls.map((img) => img.imageKey || img.url || ''), // 기존 이미지 key 유지
          existingImages: existingImageUrls, // 기존 이미지 URL (표시용)
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

  // 이미지 추가
  const handleImageAdd = async (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 3 - (formData.imageKeys.length + formData.images.length);
    const filesToAdd = files.slice(0, remainingSlots);
    const newImages = [...formData.images, ...filesToAdd];
    setFormData({ ...formData, images: newImages });

    // 이미지 자동 업로드
    if (filesToAdd.length > 0) {
      await uploadImages(filesToAdd);
    }
  };

  // 이미지 제거
  const handleImageRemove = (index) => {
    // 기존 이미지인지 새로 추가한 이미지인지 확인
    if (index < formData.existingImages.length) {
      // 기존 이미지 제거
      const newExistingImages = formData.existingImages.filter((_, i) => i !== index);
      const newImageKeys = formData.imageKeys.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        existingImages: newExistingImages,
        imageKeys: newImageKeys,
      });
    } else {
      // 새로 추가한 이미지 제거
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

  // 이미지 업로드 (presign URL 발급 → S3/R2 업로드)
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
        const maxAttempts = 50; // 5초 대기 (100ms * 50)
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
        // 스크립트가 없으면 동적으로 로드
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.async = true;
        script.onload = () => {
          // 스크립트 로드 후 약간의 지연을 두고 확인
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

  // 다음 우편번호 서비스를 이용한 주소 검색
  const handleAddressSearch = async () => {
    try {
      // 스크립트 로드 대기
      await waitForDaumPostcode();
    } catch {
      alert('주소 검색 서비스를 불러올 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요.');
      return;
    }

    if (!window.daum || !window.daum.Postcode) {
      alert('주소 검색 서비스를 불러올 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요.');
      return;
    }

    // 주소 검색 레이어를 표시하기 위한 컨테이너 생성
    const layer = document.createElement('div');
    layer.id = 'address-search-layer';
    layer.style.cssText =
      'position:fixed;width:100%;height:100%;top:0;left:0;z-index:9999;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;';

    // 기존 레이어가 있으면 제거
    const existingLayer = document.getElementById('address-search-layer');
    if (existingLayer) {
      existingLayer.remove();
    }

    // 레이어 내부 컨테이너
    const container = document.createElement('div');
    container.style.cssText =
      'position:relative;width:100%;max-width:500px;height:500px;max-height:90vh;background:white;border-radius:12px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.2);display:flex;flex-direction:column;';

    // 헤더 영역 (닫기 버튼 포함)
    const header = document.createElement('div');
    header.style.cssText =
      'position:relative;width:100%;height:50px;background:white;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;padding:0 16px;flex-shrink:0;z-index:10001;';

    const title = document.createElement('span');
    title.textContent = '주소 검색';
    title.style.cssText = 'font-size:16px;font-weight:600;color:#111827;';

    // 닫기 버튼
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

    // Postcode를 embed할 div
    const postcodeDiv = document.createElement('div');
    postcodeDiv.id = 'postcode-embed';
    postcodeDiv.style.cssText = 'width:100%;flex:1;overflow:auto;';

    container.appendChild(header);
    container.appendChild(postcodeDiv);
    layer.appendChild(container);
    document.body.appendChild(layer);

    // 배경 클릭 시 닫기
    layer.onclick = (e) => {
      if (e.target === layer) {
        layer.remove();
      }
    };

    // 다음 우편번호 서비스 실행
    new window.daum.Postcode({
      oncomplete: function (data) {
        let address = '';
        let extraAddress = '';

        // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
        if (data.userSelectedType === 'R') {
          // 사용자가 도로명 주소를 선택했을 경우
          address = data.roadAddress;
        } else {
          // 사용자가 지번 주소를 선택했을 경우(J)
          address = data.jibunAddress;
        }

        // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
        if (data.userSelectedType === 'R') {
          // 법정동명이 있을 경우 추가한다. (법정리는 제외)
          // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
          if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
            extraAddress += data.bname;
          }
          // 건물명이 있고, 공동주택일 경우 추가한다.
          if (data.buildingName !== '' && data.apartment === 'Y') {
            extraAddress += extraAddress !== '' ? ', ' + data.buildingName : data.buildingName;
          }
          // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
          if (extraAddress !== '') {
            extraAddress = ' (' + extraAddress + ')';
          }
        }

        const fullAddress = address + extraAddress;

        // 주소에서 구 정보 추출
        const district = extractDistrictFromAddress(fullAddress);

        // 레이어 제거
        layer.remove();

        // 주소 설정 및 좌표 변환 시작
        setIsConvertingCoordinates(true);
        setFormData((prev) => ({
          ...prev,
          address: fullAddress,
          divide: district, // 구 정보 자동 설정
          latitude: '', // 좌표 변환 중이므로 초기화
          longitude: '',
        }));

        // 좌표 변환 완료 후 상태 업데이트
        convertAddressToCoordinates(fullAddress)
          .then(({ latitude, longitude }) => {
            setFormData((prev) => ({
              ...prev,
              latitude: latitude.toString(),
              longitude: longitude.toString(),
            }));
          })
          .catch(() => {
            // 에러 발생 시에도 기본값으로 설정
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

  // 폼 검증
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
      // 좌표가 없으면 기본값(0, 0)으로 설정
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

  // 폼 제출
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
    handleImageAdd,
    handleImageRemove,
    handleKeywordToggle,
    handleAddressSearch,
    handleSubmit,
  };
};
