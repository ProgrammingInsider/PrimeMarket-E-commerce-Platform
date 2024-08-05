import cloudinary from '../config/cloudinary.js';
import { BadRequestError } from '../errors/index.js';

const allowedTypes = ['jpeg', 'jpg', 'png', 'gif'];
const maxFileSize = 5 * 1024 * 1024; // 5 MB

export const uploadCloudinaryImage = async (req, fieldName, uploadFolder) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    throw new BadRequestError('No files were uploaded.');
  }

  const uploadedFile = req.files[fieldName];
  const imageSize = uploadedFile.size;
  const ext = uploadedFile.name.split('.').pop().toLowerCase();

  if (imageSize > maxFileSize) {
    throw new BadRequestError(
      'File size exceeds the limit. It should be 5MB maximum.'
    );
  }

  if (!allowedTypes.includes(ext)) {
    throw new BadRequestError('Invalid File Extension');
  }

  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(uploadedFile.tempFilePath, {
      folder: uploadFolder, // Optional - Folder name in Cloudinary
    });

    // Return the URL of the uploaded image and public_id
    return {
      imageUrl: result.secure_url,
      publicId: result.public_id,
    };
  } catch (err) {
    console.error('File upload failed:', err);
    throw new BadRequestError('File upload failed.');
  }
};
