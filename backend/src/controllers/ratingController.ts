import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { sendResponse } from '../utils/formatters';
import { ValidationError, NotFoundError } from '../utils/errors';

export const ratingController = {
  getRatings: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cafeId = req.query.cafe_id as string;
      const dishId = req.query.dish_id as string;
      const orderId = req.query.order_id as string;

      if (!cafeId && !dishId && !orderId) {
        throw new ValidationError('cafe_id, dish_id, or order_id query parameter is required');
      }

      const whereClause: any = {};
      if (cafeId) whereClause.cafe_id = cafeId;
      if (dishId) whereClause.dish_id = dishId;
      if (orderId) whereClause.order_id = orderId;

      const ratings = await prisma.rating.findMany({
        where: whereClause,
        include: { dish: true },
        orderBy: { created_at: 'desc' },
      });

      const formatted = ratings.map((r) => ({
        id: r.id,
        dish_id: r.dish_id,
        dish_name: r.dish.name,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
      }));

      return sendResponse(res, 200, formatted);
    } catch (err) {
      next(err);
    }
  },

  createRating: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dish_id, order_id, table_id, rating, comment } = req.body;

      // 1. Verify dish exists
      const dish = await prisma.dish.findUnique({
        where: { id: dish_id },
      });
      if (!dish) {
        throw new NotFoundError('Dish not found');
      }

      // 2. Validate table_id if provided, fallback to null if it doesn't exist
      let validatedTableId = table_id || null;
      if (validatedTableId) {
        const table = await prisma.table.findUnique({
          where: { id: validatedTableId },
        });
        if (!table) {
          validatedTableId = null;
        }
      }

      // 3. If order_id is provided, verify it belongs to the table and contains the dish
      if (order_id) {
        if (validatedTableId) {
          const order = await prisma.order.findFirst({
            where: { id: order_id, table_id: validatedTableId },
          });
          if (!order) {
            throw new ValidationError('The specified order does not match your table context');
          }
        }

        const orderItem = await prisma.orderItem.findFirst({
          where: { order_id, dish_id },
        });
        if (!orderItem) {
          throw new ValidationError('This dish was not part of the specified order');
        }
      }

      // 4. Create the review
      const newRating = await prisma.rating.create({
        data: {
          cafe_id: dish.cafe_id,
          dish_id,
          order_id: order_id || null,
          table_id: validatedTableId,
          rating,
          comment: comment || null,
        },
      });

      return sendResponse(
        res,
        201,
        {
          id: newRating.id,
          dish_id: newRating.dish_id,
          rating: newRating.rating,
          comment: newRating.comment,
        },
        'Thank you for your rating!'
      );
    } catch (err) {
      next(err);
    }
  },

  getDishRatings: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const dish = await prisma.dish.findUnique({
        where: { id },
      });
      if (!dish) {
        throw new NotFoundError('Dish not found');
      }

      // Get aggregates
      const ratingAggregate = (await prisma.rating.aggregate({
        where: { dish_id: id },
        _avg: { rating: true },
        _count: { _all: true },
      })) as any;

      // Get last 10 reviews
      const ratings = await prisma.rating.findMany({
        where: { dish_id: id },
        orderBy: { created_at: 'desc' },
        take: 10,
      });

      return sendResponse(res, 200, {
        avg_rating: ratingAggregate._avg.rating ? parseFloat(ratingAggregate._avg.rating.toFixed(1)) : 0,
        rating_count: ratingAggregate._count._all,
        ratings: ratings.map((r) => ({
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
        })),
      });
    } catch (err) {
      next(err);
    }
  },
};

export default ratingController;
