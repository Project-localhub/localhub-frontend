let isLoaded = false;
let isLoading = false;

export const loadKakaoMap = (onLoad) => {
  if (isLoaded) {
    onLoad();
    return;
  }

  if (isLoading) {
    const interval = setInterval(() => {
      if (isLoaded) {
        clearInterval(interval);
        onLoad();
      }
    }, 50);
    return;
  }

  isLoading = true;

  const script = document.createElement('script');
  script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_API_KEY}&autoload=false`;
  script.async = true;

  script.onload = () => {
    window.kakao.maps.load(() => {
      isLoaded = true;
      isLoading = false;
      onLoad();
    });
  };

  script.onerror = () => {
    // 스크립트 로드 실패 시 무시
  };

  document.head.appendChild(script);
};
