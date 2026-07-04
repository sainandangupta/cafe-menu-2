import QRCode from 'qrcode';
import { supabaseAdmin, BUCKET_QR_CODES } from '../config/supabase';
import env from '../config/environment';
import logger from '../utils/logger';

export const qrService = {
  generateAndUploadQr: async (
    cafeId: string,
    tableId: string,
    token: string
  ): Promise<string> => {
    try {
      // 1. Build table URL
      const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173';
      const targetUrl = `${frontendUrl}/menu?tableToken=${token}`;

      // 2. Generate QR code PNG image buffer
      const qrBuffer = await QRCode.toBuffer(targetUrl, {
        errorCorrectionLevel: 'H',
        type: 'png',
        margin: 1,
        width: 300,
      });

      // 3. Upload to Supabase storage qr-codes bucket
      const filePath = `${cafeId}/${tableId}.png`;
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_QR_CODES)
        .upload(filePath, qrBuffer, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        logger.error('QR code storage upload error:', error);
        throw new Error(`QR Code upload failed: ${error.message}`);
      }

      // 4. Retrieve public URL
      const { data: urlData } = supabaseAdmin.storage
        .from(BUCKET_QR_CODES)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err: any) {
      logger.error('qrService.generateAndUploadQr error:', err);
      throw err;
    }
  },
};

export default qrService;
