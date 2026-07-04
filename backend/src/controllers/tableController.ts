import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import qrService from '../services/qrService';
import { sendResponse } from '../utils/formatters';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors';
import logger from '../utils/logger';
import { encryptToken, decryptToken } from '../utils/encryption';


// Helper to generate unique 16-character token
const generateUniqueToken = async (): Promise<string> => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  let isUnique = false;

  while (!isUnique) {
    token = '';
    for (let i = 0; i < 16; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existing = await prisma.table.findUnique({
      where: { qr_code_token: token },
    });
    if (!existing) {
      isUnique = true;
    }
  }
  return token;
};

export const tableController = {
  getTables: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cafeId = req.query.cafe_id as string;
      if (!cafeId) {
        throw new ValidationError('cafe_id query parameter is required');
      }

      // Validate owner matches their assigned cafe ID
      if (req.user?.role === 'owner' && req.user.cafeId !== cafeId) {
        throw new ValidationError('Access denied: Cafe ID mismatch');
      }

      const tables = await prisma.table.findMany({
        where: { cafe_id: cafeId },
        orderBy: { table_number: 'asc' },
      });

      const formatted = tables.map((t) => ({
        ...t,
        qr_code_token: encryptToken(t.qr_code_token),
      }));

      return sendResponse(res, 200, formatted);
    } catch (err) {
      next(err);
    }
  },

  validateToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.query.token as string;
      if (!token) {
        throw new ValidationError('token query parameter is required');
      }

      const decryptedToken = decryptToken(token);

      const table = await prisma.table.findFirst({
        where: { qr_code_token: decryptedToken, is_active: true },
        include: { cafe: true },
      });

      if (!table) {
        throw new NotFoundError('Invalid, expired or inactive QR code token');
      }

      return sendResponse(res, 200, {
        table_id: table.id,
        cafe_id: table.cafe_id,
        table_number: table.table_number,
        cafe_name: table.cafe.name,
      });
    } catch (err) {
      next(err);
    }
  },

  createTable: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { table_number, is_active } = req.body;
      const cafeId = req.user?.cafeId;

      if (!cafeId) {
        throw new ValidationError('User is not associated with any cafe');
      }

      // Check if table number already exists for this cafe
      const existing = await prisma.table.findFirst({
        where: { cafe_id: cafeId, table_number },
      });

      if (existing) {
        throw new ConflictError(`Table number ${table_number} already exists for this cafe`);
      }

      const token = await generateUniqueToken();

      // Create table record first
      const newTable = await prisma.table.create({
        data: {
          cafe_id: cafeId,
          table_number,
          qr_code_token: token,
          is_active: is_active ?? true,
        },
      });

      // Generate and upload QR code image using our service
      let qrUrl = '';
      try {
        qrUrl = await qrService.generateAndUploadQr(cafeId, newTable.id, encryptToken(token));
        // Update URL in DB
        await prisma.table.update({
          where: { id: newTable.id },
          data: { qr_code_url: qrUrl },
        });
      } catch (uploadErr) {
        logger.error('Failed to generate/upload QR image:', uploadErr);
        // Do not crash the table creation; user can regenerate later
      }

      return sendResponse(
        res,
        201,
        {
          ...newTable,
          qr_code_token: encryptToken(newTable.qr_code_token),
          qr_code_url: qrUrl || null,
        },
        'Table created successfully'
      );
    } catch (err) {
      next(err);
    }
  },

  updateTable: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { table_number, is_active } = req.body;
      const cafeId = req.user?.cafeId;

      if (!cafeId) {
        throw new ValidationError('User is not associated with any cafe');
      }

      const table = await prisma.table.findFirst({
        where: { id, cafe_id: cafeId },
      });

      if (!table) {
        throw new NotFoundError('Table not found in this cafe');
      }

      if (table_number !== undefined && table_number !== table.table_number) {
        const duplicate = await prisma.table.findFirst({
          where: { cafe_id: cafeId, table_number, NOT: { id } },
        });
        if (duplicate) {
          throw new ConflictError(`Table number ${table_number} already exists for this cafe`);
        }
      }

      const updated = await prisma.table.update({
        where: { id },
        data: {
          table_number: table_number !== undefined ? table_number : undefined,
          is_active: is_active !== undefined ? is_active : undefined,
        },
      });

      return sendResponse(res, 200, {
        ...updated,
        qr_code_token: encryptToken(updated.qr_code_token),
      }, 'Table updated successfully');
    } catch (err) {
      next(err);
    }
  },

  deleteTable: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const cafeId = req.user?.cafeId;

      if (!cafeId) {
        throw new ValidationError('User is not associated with any cafe');
      }

      const table = await prisma.table.findFirst({
        where: { id, cafe_id: cafeId },
      });

      if (!table) {
        throw new NotFoundError('Table not found in this cafe');
      }

      await prisma.table.delete({
        where: { id },
      });

      return sendResponse(res, 204);
    } catch (err) {
      next(err);
    }
  },

  generateQrs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cafeId = req.query.cafe_id as string;
      const userCafeId = req.user?.cafeId;

      // Access control: Owners can only generate for their own cafe
      if (req.user?.role === 'owner' && userCafeId !== cafeId) {
        throw new ValidationError('Access denied: Cafe ID mismatch');
      }

      if (!cafeId) {
        throw new ValidationError('cafe_id query parameter is required');
      }

      const tables = await prisma.table.findMany({
        where: { cafe_id: cafeId },
      });

      let count = 0;
      for (const table of tables) {
        try {
          const qrUrl = await qrService.generateAndUploadQr(cafeId, table.id, encryptToken(table.qr_code_token));
          await prisma.table.update({
            where: { id: table.id },
            data: { qr_code_url: qrUrl },
          });
          count++;
        } catch (err) {
          logger.error(`Failed to regenerate QR for table ${table.table_number}:`, err);
        }
      }

      return sendResponse(res, 200, { count }, `Generated ${count} QR codes successfully`);
    } catch (err) {
      next(err);
    }
  },
};

export default tableController;
