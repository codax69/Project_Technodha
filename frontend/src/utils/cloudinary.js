import axios from 'axios';

// Cloudinary configuration from environment variables or defaults
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dltmiswel',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default',
};

/**
 * Uploads an image file to Cloudinary and returns the secure URL string.
 * Enforces a strict 1MB size limit.
 */
export const uploadImageToCloudinary = async (file) => {
  // 1MB Size Limit Check (1,048,576 bytes)
  const MAX_SIZE = 1 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds strict 1 MB limit.`);
  }

  const cloudName = CLOUDINARY_CONFIG.cloudName;
  const uploadPreset = CLOUDINARY_CONFIG.uploadPreset;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    const response = await axios.post(uploadUrl, formData);

    if (response.data && response.data.secure_url) {
      return response.data.secure_url;
    } else {
      throw new Error('Invalid response from Cloudinary.');
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(`Cloudinary Error: ${error.response.data.error.message}`);
    }
    throw new Error('Cloudinary image upload failed. Verify unsigned upload_preset setting.');
  }
};
