import { apiClient } from '../api/client';

// Strict 1MB size limit, enforced both here and server-side.
const MAX_SIZE = 1 * 1024 * 1024;

/**
 * Uploads a product image file to backend signed Cloudinary endpoint and returns the secure URL string.
 * Endpoint: POST /api/products/upload-image/
 */
export const uploadProductImage = async (file) => {
  if (file.size > MAX_SIZE) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds strict 1 MB limit.`);
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await apiClient.post('/products/upload-image/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data && response.data.url) {
      return response.data.url;
    }
    throw new Error('Invalid response from image upload service.');
  } catch (error) {
    const serverMessage =
      error.response?.data?.image ||
      error.response?.data?.detail ||
      error.message;
    throw new Error(serverMessage || 'Image upload failed.');
  }
};
