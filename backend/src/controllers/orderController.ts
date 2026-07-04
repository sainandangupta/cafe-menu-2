import { Request, Response, NextFunction } from 'express';
import orderService from '../services/orderService';
import prisma from '../config/database';
import { sendResponse } from '../utils/formatters';
import { ValidationError, UnauthorizedError } from '../utils/errors';
import { decryptToken } from '../utils/encryption';


export const orderController = {
  getOrders: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cafeId = req.query.cafe_id as string;
      const status = req.query.status as string;
      const statusIn = req.query.status_in as string;
      const tableId = req.query.table_id as string;

      if (!cafeId) {
        throw new ValidationError('cafe_id query parameter is required');
      }

      // Check ownership
      if (req.user?.role === 'owner' && req.user.cafeId !== cafeId) {
        throw new ValidationError('Access denied: Cafe ID mismatch');
      }

      const whereClause: any = {
        cafe_id: cafeId,
      };

      if (statusIn) {
        // Support comma-separated statuses e.g. "confirmed,preparing,prepared,delivered"
        whereClause.status = { in: statusIn.split(',').map(s => s.trim()) };
      } else if (status) {
        whereClause.status = status;
      }

      if (tableId) {
        whereClause.table_id = tableId;
      }

      const orders = await prisma.order.findMany({
        where: whereClause,
        include: {
          table: true,
          _count: {
            select: { order_items: true },
          },
          order_items: { include: { dish: true } },
        },
        orderBy: { placed_at: 'desc' },
      });

      const formatted = orders.map((o) => ({
        id: o.id,
        table_id: o.table_id,
        table_number: o.table.table_number,
        table: { table_number: o.table.table_number },
        status: o.status,
        subtotal: Number(o.subtotal),
        gst_amount: Number(o.gst_amount),
        total: Number(o.total),
        items_count: o._count.order_items,
        placed_at: o.placed_at,
        delivered_at: o.delivered_at,
        created_at: o.created_at,
        order_token: o.order_token,
        order_items: o.order_items.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          price: Number(item.price),
          special_instructions: item.special_instructions,
          dish: {
            name: item.dish?.name || 'Unknown Dish',
            image_url: item.dish?.image_url || null,
          },
        })),
      }));

      return sendResponse(res, 200, formatted);
    } catch (err) {
      next(err);
    }
  },

  getOrderById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const tableToken = (req.query.tableToken || req.headers['x-table-token'] || req.query.token) as string | undefined;
      const decryptedToken = tableToken ? decryptToken(tableToken) : undefined;

      const requester = req.user
        ? { role: req.user.role, cafeId: req.user.cafeId }
        : { role: 'customer', cafeId: null, tableToken: decryptedToken };

      const order = await orderService.getOrderById(id, requester);
      return sendResponse(res, 200, order);
    } catch (err) {
      next(err);
    }
  },

  createOrder: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.createOrder(req.body);

      // Broadcast order to owner's Socket room
      const io = req.app.get('io');
      if (io) {
        io.to(`cafe-${order.cafe_id}`).emit('newOrder', {
          id: order.id,
          order_token: order.order_token,
          table_number: order.table_number,
          total: order.total,
          items_count: order.items_count,
          placed_at: order.placed_at,
        });
      }

      return sendResponse(res, 201, order, 'Order placed successfully');
    } catch (err) {
      next(err);
    }
  },

  updateStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const cafeId = req.user?.cafeId;

      if (!cafeId) {
        throw new ValidationError('User is not associated with any cafe');
      }

      const updated = await orderService.updateOrderStatus(id, cafeId, status);

      // Broadcast order status change to customer and owner rooms
      const io = req.app.get('io');
      if (io) {
        // Emit to cafe room (owners/dashboard)
        io.to(`cafe-${cafeId}`).emit('orderStatusChanged', {
          order_id: id,
          status,
        });

        // Emit to specific table room (customer tracking screen)
        io.to(`table-${updated.table_id}`).emit('orderStatusChanged', {
          order_id: id,
          status,
          table_number: updated.table_number,
        });
      }

      return sendResponse(res, 200, updated, 'Order status updated successfully');
    } catch (err) {
      next(err);
    }
  },

  deleteOrder: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      // Double-check: Only admins can delete orders
      if (req.user?.role !== 'admin') {
        throw new ValidationError('Access denied: Admin permissions required');
      }

      await prisma.order.delete({
        where: { id },
      });

      return sendResponse(res, 204);
    } catch (err) {
      next(err);
    }
  },

  getOrderItems: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const tableToken = (req.query.tableToken || req.headers['x-table-token'] || req.query.token) as string | undefined;
      const decryptedToken = tableToken ? decryptToken(tableToken) : undefined;

      const requester = req.user
        ? { role: req.user.role, cafeId: req.user.cafeId }
        : { role: 'customer', cafeId: null, tableToken: decryptedToken };

      // Verify authorization before fetching items
      const order = await orderService.getOrderById(id, requester);

      const items = await prisma.orderItem.findMany({
        where: { order_id: id },
        include: { dish: true },
      });

      const formatted = items.map((item: any) => ({
        id: item.id,
        dish_id: item.dish_id,
        dish_name: item.dish.name,
        image_url: item.dish.image_url,
        quantity: item.quantity,
        price: Number(item.price),
        special_instructions: item.special_instructions,
      }));

      return sendResponse(res, 200, formatted);
    } catch (err) {
      next(err);
    }
  },

  getOrderHistory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cafeId = req.query.cafe_id as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      if (!cafeId) {
        throw new ValidationError('cafe_id query parameter is required');
      }

      // Check ownership
      if (req.user?.role === 'owner' && req.user.cafeId !== cafeId) {
        throw new ValidationError('Access denied: Cafe ID mismatch');
      }

      const whereClause: any = {
        cafe_id: cafeId,
      };

      if (startDate || endDate) {
        whereClause.created_at = {};
        if (startDate) {
          whereClause.created_at.gte = new Date(startDate);
        }
        if (endDate) {
          whereClause.created_at.lte = new Date(endDate);
        }
      }

      const orders = await prisma.order.findMany({
        where: whereClause,
        include: {
          table: true,
          order_items: { include: { dish: true } },
        },
        orderBy: { placed_at: 'desc' },
      });

      const formatted = orders.map((o) => ({
        id: o.id,
        table_id: o.table_id,
        table_number: o.table.table_number,
        table: { table_number: o.table.table_number },
        status: o.status,
        subtotal: Number(o.subtotal),
        gst_amount: Number(o.gst_amount),
        total: Number(o.total),
        placed_at: o.placed_at,
        delivered_at: o.delivered_at,
        created_at: o.created_at,
        order_token: o.order_token,
        order_items: o.order_items.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          price: Number(item.price),
          special_instructions: item.special_instructions,
          dish: {
            name: item.dish?.name || 'Unknown Dish',
            image_url: item.dish?.image_url || null,
          },
        })),
      }));

      return sendResponse(res, 200, formatted);
    } catch (err) {
      next(err);
    }
  },
};

export default orderController;
