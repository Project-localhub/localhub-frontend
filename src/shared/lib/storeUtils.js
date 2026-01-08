// LocalTime 객체 또는 문자열을 HH:mm 형식으로 변환
export const formatTime = (time) => {
  // 이미 문자열 형식인 경우 (예: "14:00")
  if (typeof time === 'string') {
    return time;
  }
  // LocalTime 객체인 경우
  if (time && typeof time === 'object') {
    const hour = String(time.hour || 0).padStart(2, '0');
    const minute = String(time.minute || 0).padStart(2, '0');
    return `${hour}:${minute}`;
  }
  return '';
};

// 영업시간 문자열 생성 (브레이크타임 제외)
export const getHoursString = (openTime, closeTime) => {
  const openStr = formatTime(openTime);
  const closeStr = formatTime(closeTime);
  return `${openStr} - ${closeStr}`;
};

// imageUrlList에서 첫 번째 이미지 URL 추출 (sortOrder 기준으로 정렬)
export const getFirstImageUrl = (imageUrlList) => {
  if (!Array.isArray(imageUrlList) || imageUrlList.length === 0) return '';
  // sortOrder 기준으로 정렬 후 첫 번째 이미지 URL 반환
  const sorted = [...imageUrlList].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  return sorted[0]?.imageUrl || '';
};

// imageUrlList에서 모든 이미지 URL 배열 추출
export const getAllImageUrls = (imageUrlList) => {
  if (!Array.isArray(imageUrlList) || imageUrlList.length === 0) return [];
  const sorted = [...imageUrlList].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  return sorted.map((item) => item.imageUrl).filter(Boolean);
};

