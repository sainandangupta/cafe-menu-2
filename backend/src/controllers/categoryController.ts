import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { sendResponse } from '../utils/formatters';
import { ValidationError, NotFoundError } from '../utils/errors';

export const categoryController = {
  getCategories: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cafeId = req.query.cafe_id as string;

      if (!cafeId) {
        throw new ValidationError('cafe_id query parameter is required');
      }

      // Validate owner matches their assigned cafe ID
      if (req.user?.role === 'owner' && req.user.cafeId !== cafeId) {
        throw new ValidationError('Access denied: Cafe ID mismatch');
      }

      // Customers should only see active categories
      const isCustomer = !req.user || req.user.role === 'customer';
      const whereClause: any = {
        cafe_id: cafeId,
      };

      if (isCustomer) {
        whereClause.is_active = true;
      }

      const categories = await prisma.category.findMany({
        where: whereClause,
        include: {
          _count: {
            select: { dishes: true },
          },
        },
        orderBy: { display_order: 'asc' },
      });

      const formatted = categories.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        display_order: c.display_order,
        is_active: c.is_active,
        dish_count: c._count.dishes,
        created_at: c.created_at,
        updated_at: c.updated_at,
      }));

      return sendResponse(res, 200, formatted);
    } catch (err) {
      next(err);
    }
  },

  createCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cafeId = req.user?.cafeId;
      if (!cafeId) {
        throw new ValidationError('User is not associated with any cafe');
      }

      const category = await prisma.category.create({
        data: {
          cafe_id: cafeId,
          name: req.body.name,
          description: req.body.description,
          display_order: req.body.display_order,
          is_active: req.body.is_active,
        },
      });

      return sendResponse(res, 201, category, 'Category created successfully');
    } catch (err) {
      next(err);
    }
  },

  updateCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const cafeId = req.user?.cafeId;

      if (!cafeId) {
        throw new ValidationError('User is not associated with any cafe');
      }

      // Check ownership
      const existing = await prisma.category.findFirst({
        where: { id, cafe_id: cafeId },
      });

      if (!existing) {
        throw new NotFoundError('Category not found in this cafe');
      }

      const updated = await prisma.category.update({
        where: { id },
        data: req.body as any,
      });

      return sendResponse(res, 200, updated, 'Category updated successfully');
    } catch (err) {
      next(err);
    }
  },

  deleteCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const cafeId = req.user?.cafeId;

      if (!cafeId) {
        throw new ValidationError('User is not associated with any cafe');
      }

      const existing = await prisma.category.findFirst({
        where: { id, cafe_id: cafeId },
      });

      if (!existing) {
        throw new NotFoundError('Category not found in this cafe');
      }

      // Verify that this category has no dishes before deletion
      const dishCount = await prisma.dish.count({
        where: { category_id: id },
      });

      if (dishCount > 0) {
        throw new ValidationError('Cannot delete category containing dishes. Reassign or delete dishes first.');
      }

      await prisma.category.delete({
        where: { id },
      });

      return sendResponse(res, 204);
    } catch (err) {
      next(err);
    }
  },
};

export default categoryController;
