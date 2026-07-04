import { Request, Response, NextFunction } from 'express';
import dishService from '../services/dishService';
import imageService from '../services/imageService';
import prisma from '../config/database';
import { sendResponse } from '../utils/formatters';
import { ValidationError, NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

// Helper to check image magic number signatures (first few bytes)
const validateImageMagicNumbers = (buffer: Buffer): boolean => {
  if (!buffer || buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return true;
  }

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return true;
  }

  // GIF: 47 49 46 38 ("GIF8")
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return true;
  }

  // WEBP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return true;
  }

  return false;
};

export const dishController = {
  getDishes: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cafeId = req.query.cafe_id as string;
      const categoryId = req.query.category_id as string;
      const isAvailableParam = req.query.is_available as string;

      if (!cafeId) {
        throw new ValidationError('cafe_id is required');
      }

      // Validate owner matches their assigned cafe ID
      if (req.user?.role === 'owner' && req.user.cafeId !== cafeId) {
        throw new ValidationError('Access denied: Cafe ID mismatch');
      }

      let isAvailable: boolean | undefined;
      if (isAvailableParam !== undefined) {
        isAvailable = isAvailableParam === 'true';
      }

      // If user is authenticated, determine if customer-only view
      // Customers should only view available items.
      const isCustomer = !req.user || req.user.role === 'customer';

      const dishes = await dishService.getDishes({
        cafe_id: cafeId,
        category_id: categoryId,
        is_available: isAvailable,
        customer_only: isCustomer,
      });

      return sendResponse(res, 200, dishes);
    } catch (err) {
      next(err);
    }
  },

  getDishById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const dish = await dishService.getDishById(id);
      return sendResponse(res, 200, dish);
    } catch (err) {
      next(err);
    }
  },

  createDish: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cafeId = req.user?.cafeId;
      if (!cafeId) {
        throw new ValidationError('User is not associated with any cafe');
      }

      const dish = await dishService.createDish(cafeId, req.body);
      return sendResponse(res, 201, dish, 'Dish created successfully');
    } catch (err) {
      next(err);
    }
  },

  updateDish: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const cafeId = req.user?.cafeId;
      if (!cafeId) {
        throw new ValidationError('User is not associated with any cafe');
      }

      const dish = await dishService.updateDish(id, cafeId, req.body);

      // Trigger WebSockets event on status updates if Socket.io is bound
      const io = req.app.get('io');
      if (io && req.body.is_available !== undefined) {
        io.to(`cafe-${cafeId}`).emit('dishAvailabilityChanged', {
          dish_id: id,
          is_available: req.body.is_available,
        });
      }

      return sendResponse(res, 200, dish, 'Dish updated successfully');
    } catch (err) {
      next(err);
    }
  },

  deleteDish: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const cafeId = req.user?.cafeId;
      if (!cafeId) {
        throw new ValidationError('User is not associated with any cafe');
      }

      await dishService.deleteDish(id, cafeId);
      return sendResponse(res, 204);
    } catch (err) {
      next(err);
    }
  },

  uploadImage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      const { dish_id } = req.body;
      const cafeId = req.user?.cafeId;

      if (!file) {
        throw new ValidationError('Please upload a file');
      }

      // Secure server-side MIME type verification via magic numbers
      if (!validateImageMagicNumbers(file.buffer)) {
        throw new ValidationError('Invalid file format: Only genuine PNG, JPG, JPEG, or WEBP image files are allowed');
      }

      if (!dish_id) {
        throw new ValidationError('dish_id is required');
      }

      if (!cafeId) {
        throw new ValidationError('User is not associated with any cafe');
      }

      // Check dish existence and cafe ownership
      const dish = await prisma.dish.findFirst({
        where: { id: dish_id, cafe_id: cafeId },
      });

      if (!dish) {
        throw new NotFoundError('Dish not found in this cafe');
      }

      // Upload to Supabase Storage
      const imageUrl = await imageService.uploadDishImage(
        file.buffer,
        file.originalname,
        file.mimetype,
        cafeId,
        dish_id
      );

      // Update in DB
      await prisma.dish.update({
        where: { id: dish_id },
        data: { image_url: imageUrl },
      });

      return sendResponse(res, 200, { image_url: imageUrl }, 'Image uploaded successfully');
    } catch (err) {
      next(err);
    }
  },
};

export default dishController;
