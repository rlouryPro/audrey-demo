import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

export const uploadService = {
  async saveImage(file: Express.Multer.File): Promise<string> {
    // Validate file
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      throw new Error('Format de fichier non supporte. Utilisez JPEG, PNG ou WebP.');
    }

    if (file.size > MAX_SIZE) {
      throw new Error('Le fichier est trop volumineux. Maximum 5 Mo.');
    }

    // Optimize image with sharp before upload
    const optimizedBuffer = await sharp(file.buffer)
      .resize(1200, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: 80 })
      .toBuffer();

    if (isCloudinaryConfigured()) {
      // Upload to Cloudinary
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'esat-livret',
            resource_type: 'image',
            format: 'webp',
          },
          (error, result) => {
            if (error) {
              reject(new Error('Erreur lors de l\'upload de l\'image'));
            } else if (result) {
              resolve(result.secure_url);
            } else {
              reject(new Error('Erreur inconnue lors de l\'upload'));
            }
          }
        ).end(optimizedBuffer);
      });
    } else {
      // Fallback to local storage (for development)
      const fs = await import('fs/promises');
      const path = await import('path');
      const { randomUUID } = await import('crypto');

      const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
      await fs.mkdir(UPLOAD_PATH, { recursive: true });

      const fileId = randomUUID();
      const filename = `${fileId}.webp`;
      const filepath = path.join(UPLOAD_PATH, filename);

      await fs.writeFile(filepath, optimizedBuffer);

      // Create thumbnail
      const thumbnailBuffer = await sharp(file.buffer)
        .resize(200, 200, { fit: 'cover', position: 'center' })
        .webp({ quality: 70 })
        .toBuffer();

      const thumbnailFilename = `${fileId}_thumb.webp`;
      const thumbnailPath = path.join(UPLOAD_PATH, thumbnailFilename);
      await fs.writeFile(thumbnailPath, thumbnailBuffer);

      return `/uploads/${filename}`;
    }
  },

  async deleteImage(photoUrl: string): Promise<void> {
    if (!photoUrl) return;

    try {
      if (isCloudinaryConfigured() && photoUrl.includes('cloudinary')) {
        // Extract public_id from Cloudinary URL
        const parts = photoUrl.split('/');
        const filenameWithExt = parts[parts.length - 1];
        const publicId = `esat-livret/${filenameWithExt.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } else {
        // Local file deletion
        const fs = await import('fs/promises');
        const path = await import('path');
        const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';

        const filename = path.basename(photoUrl);
        const filepath = path.join(UPLOAD_PATH, filename);
        await fs.unlink(filepath).catch(() => {});

        const thumbFilename = filename.replace('.webp', '_thumb.webp');
        const thumbPath = path.join(UPLOAD_PATH, thumbFilename);
        await fs.unlink(thumbPath).catch(() => {});
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  },

  getThumbnailUrl(photoUrl: string | null): string | null {
    if (!photoUrl) return null;

    if (photoUrl.includes('cloudinary')) {
      // Cloudinary transformation for thumbnail
      return photoUrl.replace('/upload/', '/upload/w_200,h_200,c_fill/');
    }

    // Local thumbnail
    return photoUrl.replace('.webp', '_thumb.webp');
  },
};
