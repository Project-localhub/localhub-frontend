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

  // 다음 우편번호 서비스를 이용한 주소 검색
  const handleAddressSearch = () => {
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

        // 주소를 설정한다.
        setFormData({
          ...formData,
          address: address + extraAddress,
          latitude: '', // 다음 우편번호 서비스는 좌표를 제공하지 않으므로 빈 값
          longitude: '', // 다음 우편번호 서비스는 좌표를 제공하지 않으므로 빈 값
        });

        // 레이어 제거
        layer.remove();
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
