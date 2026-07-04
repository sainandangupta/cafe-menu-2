import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { sendResponse } from '../utils/formatters';
import { ValidationError, NotFoundError } from '../utils/errors';

export const adminController = {
  getReports: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cafeId = req.query.cafe_id as string;
      const startDateParam = req.query.start_date as string;
      const endDateParam = req.query.end_date as string;

      if (!cafeId) {
        throw new ValidationError('cafe_id query parameter is required');
      }

      // Default to last 30 days if dates are missing
      const startDate = startDateParam ? new Date(startDateParam) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = endDateParam ? new Date(endDateParam) : new Date();

      // Ensure endDate captures the full day
      endDate.setHours(23, 59, 59, 999);

      // 1. Fetch orders in date range
      const orders = await prisma.order.findMany({
        where: {
          cafe_id: cafeId,
          placed_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          order_items: {
            include: { dish: true },
          },
        },
      });

      const totalOrders = orders.length;
      let totalRevenue = 0;
      orders.forEach((o) => {
        totalRevenue += Number(o.total);
      });

      const avgOrderValue = totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0;

      // 2. Compute Top Selling Dish
      const dishSalesCount: Record<string, { name: string; count: number }> = {};
      orders.forEach((o) => {
        o.order_items.forEach((item) => {
          if (!dishSalesCount[item.dish_id]) {
            dishSalesCount[item.dish_id] = { name: item.dish.name, count: 0 };
          }
          dishSalesCount[item.dish_id].count += item.quantity;
        });
      });

      let topSellingDish = { name: 'N/A', count: 0 };
      Object.values(dishSalesCount).forEach((val) => {
        if (val.count > topSellingDish.count) {
          topSellingDish = val;
        }
      });

      // 3. Compute Daily Sales Breakdown
      const dailyMap: Record<string, { date: string; orders: number; revenue: number }> = {};
      orders.forEach((o) => {
        if (o.placed_at) {
          const dateStr = o.placed_at.toISOString().split('T')[0];
          if (!dailyMap[dateStr]) {
            dailyMap[dateStr] = { date: dateStr, orders: 0, revenue: 0 };
          }
          dailyMap[dateStr].orders += 1;
          dailyMap[dateStr].revenue += Number(o.total);
        }
      });

      const dailyBreakdown = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

      return sendResponse(res, 200, {
        total_orders: totalOrders,
        total_revenue: parseFloat(totalRevenue.toFixed(2)),
        avg_order_value: avgOrderValue,
        top_selling_dish: topSellingDish,
        daily_breakdown: dailyBreakdown,
      });
    } catch (err) {
      next(err);
    }
  },

  getDishRatingsReport: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cafeId = req.query.cafe_id as string;
      if (!cafeId) {
        throw new ValidationError('cafe_id query parameter is required');
      }

      // Fetch dishes with inline ratings aggregates
      const dishes = await prisma.dish.findMany({
        where: { cafe_id: cafeId },
        include: {
          ratings: true,
        },
      });

      const reports = dishes.map((d) => {
        const ratingCount = d.ratings.length;
        const ratingSum = d.ratings.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = ratingCount > 0 ? parseFloat((ratingSum / ratingCount).toFixed(1)) : 0;

        return {
          dish_id: d.id,
          dish_name: d.name,
          avg_rating: avgRating,
          rating_count: ratingCount,
        };
      });

      // Sort by rating (descending)
      reports.sort((a, b) => b.avg_rating - a.avg_rating);

      return sendResponse(res, 200, reports);
    } catch (err) {
      next(err);
    }
  },

  exportOrdersCsv: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cafeId = req.query.cafe_id as string;
      const startDateParam = req.query.start_date as string;
      const endDateParam = req.query.end_date as string;

      if (!cafeId) {
        throw new ValidationError('cafe_id query parameter is required');
      }

      const startDate = startDateParam ? new Date(startDateParam) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = endDateParam ? new Date(endDateParam) : new Date();
      endDate.setHours(23, 59, 59, 999);

      const orders = await prisma.order.findMany({
        where: {
          cafe_id: cafeId,
          placed_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          table: true,
        },
        orderBy: { placed_at: 'desc' },
      });

      // Build CSV String manually to avoid package dependency locking issues
      let csvContent = 'Order ID,Order Token,Table Number,Status,Subtotal,GST Amount,Total,Placed At\n';

      orders.forEach((o) => {
        const placedAtStr = o.placed_at ? o.placed_at.toISOString() : 'N/A';
        const notesSafe = o.customer_notes ? o.customer_notes.replace(/"/g, '""') : '';
        csvContent += `"${o.id}","${o.order_token || ''}",${o.table.table_number},"${o.status}",${o.subtotal},${o.gst_amount},${o.total},"${placedAtStr}"\n`;
      });

      // Set headers for download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="orders_export_${Date.now()}.csv"`);
      return res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  },
};

export default adminController;
