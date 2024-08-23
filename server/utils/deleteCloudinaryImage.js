import cloudinary from '../config/cloudinary.js';
import { BadRequestError } from '../errors/index.js';

export const deleteCloudinaryImage = async (public_id) => {
  try {
    if (!public_id) {
      throw new BadRequestError('Missing public_id parameter');
    }

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};
