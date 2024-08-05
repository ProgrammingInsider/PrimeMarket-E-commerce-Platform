import path from 'path';
import { BadRequestError } from '../errors/index.js';

const __dirname = process.cwd();
const allowedTypes = ['jpeg', 'jpg', 'png', 'gif'];
const maxFileSize = 5 * 1024 * 1024; // 5 MB

export const uploadImage = async (req, fieldName, uploadFolder) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    throw new BadRequestError('No files were uploaded.');
  }

  const uploadedFile = req.files[fieldName];
  const imageSize = uploadedFile.size;
  const imageName = Date.now() + uploadedFile.name;
  const ext = path.extname(uploadedFile.name).substring(1).toLowerCase();

  if (imageSize > maxFileSize) {
    throw new BadRequestError(
      'File size exceeds the limit. It should be 5MB maximum.'
    );
  }

  if (!allowedTypes.includes(ext)) {
    throw new BadRequestError('Invalid File Extension');
  }

  const uploadPath = path.resolve(
    __dirname,
    `./uploads/${uploadFolder}`,
    imageName
  );

  try {
    await uploadedFile.mv(uploadPath);
    return imageName;
  } catch (err) {
    throw new BadRequestError('File upload failed.');
  }
};
