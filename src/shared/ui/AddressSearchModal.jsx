import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const AddressSearchModal = ({ isOpen, onClose, onSelectAddress }) => {
  const [isLoading, setIsLoading] = useState(false);
  const postcodeRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  // Daum Postcode 스크립트 로드
  useEffect(() => {
    if (!isOpen || scriptLoadedRef.current) return;

    const loadScript = () => {
      return new Promise((resolve, reject) => {
        if (window.daum && window.daum.Postcode) {
          scriptLoadedRef.current = true;
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
              scriptLoadedRef.current = true;
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
                scriptLoadedRef.current = true;
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

    setIsLoading(true);
    loadScript()
      .then(() => {
        setIsLoading(false);
        if (postcodeRef.current && window.daum && window.daum.Postcode) {
          new window.daum.Postcode({
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
                  extraAddress +=
                    extraAddress !== '' ? ', ' + data.buildingName : data.buildingName;
                }
                if (extraAddress !== '') {
                  extraAddress = ' (' + extraAddress + ')';
                }
              }

              const fullAddress = address + extraAddress;
              onSelectAddress(fullAddress);
              onClose();
            },
            width: '100%',
            height: '100%',
            maxSuggestItems: 5,
          }).embed(postcodeRef.current);
        }
      })
      .catch((error) => {
        console.error('주소 검색 서비스 로드 실패:', error);
        setIsLoading(false);
        alert('주소 검색 서비스를 불러올 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요.');
      });
  }, [isOpen, onSelectAddress, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-lg h-[500px] max-h-[90vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">주소 검색</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Postcode 영역 */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">주소 검색 서비스를 불러오는 중...</div>
            </div>
          ) : (
            <div ref={postcodeRef} className="w-full h-full" />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressSearchModal;
