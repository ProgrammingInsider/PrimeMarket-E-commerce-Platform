import path from 'path';
import fs from 'fs/promises';

const __dirname = process.cwd();

export const deleteImage = async (uploadFolder, olderImageName) => {
  if (olderImageName) {
    const olderImagePath = path.resolve(
      __dirname,
      `./uploads/${uploadFolder}`,
      olderImageName
    );

    try {
      await fs.unlink(olderImagePath);
      return true;
    } catch (err) {
      return false;
    }
  }
  return false;
};
