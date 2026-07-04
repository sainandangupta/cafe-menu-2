import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { sendResponse } from '../utils/formatters';
import { ValidationError, NotFoundError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export const settingsController = {
  getSettings: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cafeId = req.query.cafe_id as string || req.user?.cafeId;

      if (!cafeId) {
        throw new ValidationError('cafe_id is required');
      }

      // Check ownership if not admin
      if (req.user?.role === 'owner' && req.user.cafeId !== cafeId) {
        throw new ValidationError('Access denied: Cafe ID mismatch');
      }

      // 1. Fetch Cafe basic settings
      const cafe = await prisma.cafe.findUnique({
        where: { id: cafeId },
      });

      if (!cafe) {
        throw new NotFoundError('Cafe not found');
      }

      // 2. Fetch specific configuration variables from Settings table
      const dbSettings = await prisma.setting.findMany({
        where: { cafe_id: cafeId },
      });

      // Map rows to a key-value object
      const settingsObj: Record<string, any> = {};
      dbSettings.forEach((s) => {
        try {
          // Parse JSON if possible (for arrays like closed_days)
          settingsObj[s.setting_key] = JSON.parse(s.setting_value || 'null');
        } catch {
          settingsObj[s.setting_key] = s.setting_value;
        }
      });

      const responsePayload = {
        cafe_name: cafe.name,
        email: cafe.email,
        phone: cafe.phone,
        address: cafe.address,
        gst_percentage: Number(cafe.gst_percentage),
        open_time: settingsObj.open_time || '08:00',
        close_time: settingsObj.close_time || '22:00',
        closed_days: settingsObj.closed_days || [],
        logo_url: settingsObj.logo_url || '',
      };

      return sendResponse(res, 200, responsePayload);
    } catch (err) {
      next(err);
    }
  },

  updateSettings: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cafeId = req.user?.cafeId;
      if (!cafeId) {
        throw new ValidationError('User is not associated with any cafe');
      }

      const {
        cafe_name,
        email,
        phone,
        address,
        gst_percentage,
        open_time,
        close_time,
        closed_days,
        logo_url,
      } = req.body;

      // Execute transaction to update both Cafe and Setting tables
      await prisma.$transaction(async (tx) => {
        // 1. Update basic properties on Cafe
        const cafeUpdate: Prisma.CafeUpdateInput = {};
        if (cafe_name !== undefined) cafeUpdate.name = cafe_name;
        if (email !== undefined) cafeUpdate.email = email;
        if (phone !== undefined) cafeUpdate.phone = phone;
        if (address !== undefined) cafeUpdate.address = address;
        if (gst_percentage !== undefined) cafeUpdate.gst_percentage = new Prisma.Decimal(gst_percentage);

        if (Object.keys(cafeUpdate).length > 0) {
          await tx.cafe.update({
            where: { id: cafeId },
            data: cafeUpdate,
          });
        }

        // Helper to upsert key-value pairs
        const upsertConfig = async (key: string, value: any) => {
          if (value === undefined) return;
          const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);

          await tx.setting.upsert({
            where: {
              cafe_id_setting_key: {
                cafe_id: cafeId,
                setting_key: key,
              },
            },
            create: {
              cafe_id: cafeId,
              setting_key: key,
              setting_value: valStr,
            },
            update: {
              setting_value: valStr,
              updated_at: new Date(),
            },
          });
        };

        // 2. Upsert specific configuration settings
        await upsertConfig('open_time', open_time);
        await upsertConfig('close_time', close_time);
        await upsertConfig('closed_days', closed_days);
        await upsertConfig('logo_url', logo_url);
      });

      return sendResponse(res, 200, null, 'Settings updated successfully');
    } catch (err) {
      next(err);
    }
  },
};

export default settingsController;
