import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
const MAX_WIDTH = 1200;
const THUMBNAIL_WIDTH = 200;
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadService = {
  async saveImage(file: Express.Multer.File): Promise<string> {
    // Validate file
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      throw new Error('Format de fichier non supporte. Utilisez JPEG, PNG ou WebP.');
    }

    if (file.size > MAX_SIZE) {
      throw new Error('Le fichier est trop volumineux. Maximum 5 Mo.');
    }

    // Ensure upload directory exists
    await fs.mkdir(UPLOAD_PATH, { recursive: true });

    // Generate unique filename
    const fileId = randomUUID();
    const extension = '.webp'; // Convert all to webp for consistency
    const filename = `${fileId}${extension}`;
    const filepath = path.join(UPLOAD_PATH, filename);

    // Process and save image
    await sharp(file.buffer)
      .resize(MAX_WIDTH, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: 80 })
      .toFile(filepath);

    // Create thumbnail
    const thumbnailFilename = `${fileId}_thumb${extension}`;
    const thumbnailPath = path.join(UPLOAD_PATH, thumbnailFilename);

    await sharp(file.buffer)
      .resize(THUMBNAIL_WIDTH, THUMBNAIL_WIDTH, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 70 })
      .toFile(thumbnailPath);

    return `/uploads/${filename}`;
  },

  async deleteImage(photoUrl: string): Promise<void> {
    if (!photoUrl) return;

    try {
      // Extract filename from URL
      const filename = path.basename(photoUrl);
      const filepath = path.join(UPLOAD_PATH, filename);

      // Delete main image
      await fs.unlink(filepath).catch(() => {});

      // Delete thumbnail
      const thumbFilename = filename.replace('.webp', '_thumb.webp');
      const thumbPath = path.join(UPLOAD_PATH, thumbFilename);
      await fs.unlink(thumbPath).catch(() => {});
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  },

  getThumbnailUrl(photoUrl: string | null): string | null {
    if (!photoUrl) return null;
    return photoUrl.replace('.webp', '_thumb.webp');
  },
};
