import client from './client';

/**
 * Presign URL 발급
 * @param {string} filename - 원본 파일 이름 (확장자 추출 용도)
 * @param {string} contentType - 파일의 MIME 타입 (image/jpeg, image/png 등)
 * @returns {Promise<{key: string, url: string}>}
 */
export const getPresignUrl = async (filename, contentType) => {
  const response = await client.post(
    `/api/storage/presign-put?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(contentType)}`,
  );
  return response.data;
};

/**
 * Presign URL로 이미지 업로드 (S3/R2)
 * @param {string} presignUrl - presign된 업로드 URL
 * @param {File} file - 업로드할 이미지 파일
 * @returns {Promise<void>}
 */
export const uploadImageToStorage = async (presignUrl, file) => {
  const response = await fetch(presignUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!response.ok) {
    throw new Error(`이미지 업로드 실패: ${response.statusText}`);
  }
};
