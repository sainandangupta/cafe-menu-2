import { supabaseAdmin, BUCKET_DISH_IMAGES } from '../config/supabase';
import { ValidationError } from '../utils/errors';
import logger from '../utils/logger';

export const imageService = {
  uploadDishImage: async (
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    cafeId: string,
    dishId: string
  ): Promise<string> => {
    try {
      // 1. Generate unique file path inside the bucket
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileExtension = fileName.split('.').pop() || 'jpg';
      const filePath = `${cafeId}/${dishId}/${timestamp}-${randomStr}.${fileExtension}`;

      // 2. Upload file buffer to Supabase storage with administrative client
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_DISH_IMAGES)
        .upload(filePath, fileBuffer, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        logger.error('Supabase upload error details:', error);
        throw new ValidationError(`Storage upload failed: ${error.message}`);
      }

      // 3. Retrieve public URL
      const { data: urlData } = supabaseAdmin.storage
        .from(BUCKET_DISH_IMAGES)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err: any) {
      logger.error('imageService.uploadDishImage error:', err);
      throw err;
    }
  },
};

export default imageService;
