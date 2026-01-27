import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const DaumPostcodeModal = ({ isOpen, onClose, onComplete }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const postcodeRef = useRef(null);
  const postcodeInstanceRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    let checkIntervalId = null;
    let timeoutId = null;

    const loadDaumPostcode = () => {
      if (window.daum && window.daum.Postcode) {
        setIsScriptLoaded(true);
        return;
      }

      const existingScript = document.querySelector('script[src*="postcode"]');
      if (existingScript) {
        let attempts = 0;
        const maxAttempts = 50;
        checkIntervalId = setInterval(() => {
          attempts++;
          if (window.daum && window.daum.Postcode) {
            clearInterval(checkIntervalId);
            checkIntervalId = null;
            setIsScriptLoaded(true);
          } else if (attempts >= maxAttempts) {
            clearInterval(checkIntervalId);
            checkIntervalId = null;
            alert('주소 검색 서비스 로드 시간 초과');
            onClose();
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.async = true;
      script.onload = () => {
        timeoutId = setTimeout(() => {
          if (window.daum && window.daum.Postcode) {
            setIsScriptLoaded(true);
          } else {
            alert('주소 검색 서비스 초기화 실패');
            onClose();
          }
          timeoutId = null;
        }, 100);
      };
      script.onerror = () => {
        alert('주소 검색 서비스 스크립트 로드 실패');
        onClose();
      };
      document.head.appendChild(script);
    };

    loadDaumPostcode();

    return () => {
      if (checkIntervalId) {
        clearInterval(checkIntervalId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !isScriptLoaded || !postcodeRef.current) return;

    if (postcodeInstanceRef.current) {
      return;
    }

    postcodeInstanceRef.current = new window.daum.Postcode({
      oncomplete: (data) => {
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
        onComplete(fullAddress);
        onClose();
      },
      width: '100%',
      height: '100%',
      maxSuggestItems: 5,
    });

    postcodeInstanceRef.current.embed(postcodeRef.current);

    return () => {
      if (postcodeInstanceRef.current) {
        postcodeInstanceRef.current = null;
      }
    };
  }, [isOpen, isScriptLoaded, onComplete, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-[500px] h-[500px] max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="relative w-full h-[50px] bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-[10001]">
          <span className="text-base font-semibold text-gray-900">주소 검색</span>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-[28px] text-gray-500 w-8 h-8 flex items-center justify-center bg-transparent border-none rounded-md transition-all hover:bg-gray-100 hover:text-gray-900 leading-none p-0"
            aria-label="닫기"
          >
            <X size={24} />
          </button>
        </div>
        <div ref={postcodeRef} className="w-full flex-1 overflow-auto" />
      </div>
    </div>,
    document.body,
  );
};

export default DaumPostcodeModal;
