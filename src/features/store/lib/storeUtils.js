export const formatTime = (time) => {
  if (typeof time === 'string') {
    return time;
  }
  if (time && typeof time === 'object') {
    const hour = String(time.hour || 0).padStart(2, '0');
    const minute = String(time.minute || 0).padStart(2, '0');
    return `${hour}:${minute}`;
  }
  return '';
};

export const getHoursString = (openTime, closeTime) => {
  const openStr = formatTime(openTime);
  const closeStr = formatTime(closeTime);
  return `${openStr} - ${closeStr}`;
};

export const getFirstImageUrl = (imageUrlList) => {
  if (!Array.isArray(imageUrlList) || imageUrlList.length === 0) return '';
  const sorted = [...imageUrlList].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  return sorted[0]?.imageUrl || '';
};

export const getAllImageUrls = (imageUrlList) => {
  if (!Array.isArray(imageUrlList) || imageUrlList.length === 0) return [];
  const sorted = [...imageUrlList].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  return sorted.map((item) => item.imageUrl).filter(Boolean);
};

export const validateBusinessNumber = (number) => {
  const cleaned = number.replace(/-/g, '');
  return /^\d{10}$/.test(cleaned);
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return null;
  }

  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

export const formatDistance = (distanceInKm) => {
  if (distanceInKm === null || distanceInKm === undefined) {
    return '';
  }

  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)}m`;
  }
  return `${distanceInKm.toFixed(1)}km`;
};

export const extractDistrictFromAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return '';
  }

  const districtMatch = address.match(/([가-힣]+구)/);
  if (districtMatch && districtMatch[1]) {
    return districtMatch[1];
  }

  return '';
};
