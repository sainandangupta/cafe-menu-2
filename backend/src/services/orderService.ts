import prisma from '../config/database';
import { CreateOrderInput } from '../validators/orders';
import { ValidationError, NotFoundError } from '../utils/errors';
import { Prisma } from '@prisma/client';

// Generate a random 6-character alphanumeric order token
const generateOrderToken = async (cafeId: string): Promise<string> => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    token = '';
    for (let i = 0; i < 6; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check uniqueness in database
    const existing = await prisma.order.findUnique({
      where: { order_token: token },
    });

    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  return token;
};

export const orderService = {
  createOrder: async (input: CreateOrderInput) => {
    const { table_id, items, customer_notes } = input;

    // Helper to detect a UUID (simple regex)
    const isUuid = (id: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id);

    // 1. Resolve the table reference
    let table;
    if (isUuid(table_id)) {
      // Normal case – table_id is a UUID primary key
      table = await prisma.table.findUnique({
        where: { id: table_id },
        include: { cafe: true },
      });
    } else {
      // Mock token case – expected format "mock-table-<number>"
      const match = table_id.match(/mock-table-(\d+)/);
      if (match) {
        const tableNumber = parseInt(match[1], 10);
        // Attempt to find a table with this number (cafe context may be unknown, so search globally)
        table = await prisma.table.findFirst({
          where: { table_number: tableNumber },
          include: { cafe: true },
        });
      }
    }

    if (!table) {
      throw new NotFoundError('Table not found');
    }

    if (!table.is_active) {
      throw new ValidationError('Table is currently inactive');
    }

    const cafe = table.cafe;
    const cafeId = table.cafe_id;

    // 2. Fetch and validate all dishes
    const dishIds = items.map((item) => item.dish_id);
    const dishes = await prisma.dish.findMany({
      where: {
        id: { in: dishIds },
        cafe_id: cafeId,
      },
    });

    if (dishes.length !== dishIds.length) {
      throw new ValidationError('Some dishes in your cart are invalid or belong to another cafe');
    }

    // Map dishes for fast lookup
    const dishesMap = new Map<string, typeof dishes[0]>();
    dishes.forEach((d) => {
      if (!d.is_available) {
        throw new ValidationError(`Dish "${d.name}" is currently sold out`);
      }
      dishesMap.set(d.id, d);
    });

    // 3. Compute billing details
    let subtotal = 0;
    const itemDetails = items.map((item) => {
      const dish = dishesMap.get(item.dish_id)!;
      const price = Number(dish.price);
      const lineCost = price * item.quantity;
      subtotal += lineCost;

      return {
        dish_id: item.dish_id,
        quantity: item.quantity,
        price: new Prisma.Decimal(price),
        special_instructions: item.special_instructions || null,
        // Helper metadata for controller broadcast
        name: dish.name,
      };
    });

    const gstPercentage = cafe.gst_percentage ? Number(cafe.gst_percentage) : 5.0;
    const gstAmount = (subtotal * gstPercentage) / 100;
    const total = subtotal + gstAmount;

    // 4. Generate order token
    const orderToken = await generateOrderToken(cafeId);

    // 5. Execute transaction to commit order and items
    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          cafe_id: cafeId,
          table_id: table.id,
          status: 'confirmed',
          subtotal: new Prisma.Decimal(subtotal),
          gst_amount: new Prisma.Decimal(gstAmount),
          total: new Prisma.Decimal(total),
          customer_notes: customer_notes || null,
          order_token: orderToken,
          placed_at: new Date(),
        },
      });

      // Insert all line items linked to this order
      await tx.orderItem.createMany({
        data: itemDetails.map((item) => ({
          order_id: order.id,
          dish_id: item.dish_id,
          quantity: item.quantity,
          price: item.price,
          special_instructions: item.special_instructions,
        })),
      });

      return order;
    });

    // Return full payload including item count and details
    return {
      id: createdOrder.id,
      order_token: createdOrder.order_token,
      status: createdOrder.status,
      subtotal: Number(createdOrder.subtotal),
      gst_amount: Number(createdOrder.gst_amount),
      total: Number(createdOrder.total),
      placed_at: createdOrder.placed_at,
      table_number: table.table_number,
      cafe_id: cafeId,
      items_count: items.reduce((sum, item) => sum + item.quantity, 0),
      items: itemDetails,
    };
  },

  getOrderById: async (id: string, requester: { role: string; cafeId: string | null; tableToken?: string }) => {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        order_items: {
          include: {
            dish: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Auth constraints:
    // Owners can only view orders belonging to their cafe
    if (requester.role === 'owner' && requester.cafeId !== order.cafe_id) {
      throw new ValidationError('Access denied: Cafe ID mismatch');
    }

    // Customers can only view the order if their scanned table token matches the order's table token
    if (requester.role === 'customer' && requester.tableToken) {
      if (order.table.qr_code_token !== requester.tableToken) {
        throw new ValidationError('Access denied: Table QR token mismatch');
      }
    }

    return {
      id: order.id,
      status: order.status,
      subtotal: Number(order.subtotal),
      gst_amount: Number(order.gst_amount),
      total: Number(order.total),
      customer_notes: order.customer_notes,
      order_token: order.order_token,
      placed_at: order.placed_at,
      created_at: order.created_at,
      delivered_at: order.delivered_at,
      table_id: order.table_id,
      table_number: order.table.table_number,
      items: order.order_items.map((item) => ({
        id: item.id,
        dish_id: item.dish_id,
        dish_name: item.dish.name,
        image_url: item.dish.image_url,
        quantity: item.quantity,
        price: Number(item.price),
        special_instructions: item.special_instructions,
      })),
    };
  },

  updateOrderStatus: async (id: string, cafeId: string, status: 'confirmed' | 'preparing' | 'prepared' | 'delivered' | 'rejected') => {
    // Fetch order to verify access
    const order = await prisma.order.findFirst({
      where: { id, cafe_id: cafeId },
    });

    if (!order) {
      throw new NotFoundError('Order not found in this cafe');
    }

    // Transition rules:
    const statusPriority = {
      confirmed: 1,
      preparing: 2,
      prepared: 3,
      delivered: 4,
      rejected: 5,
    };

    const currentPriority = statusPriority[order.status as keyof typeof statusPriority] || 0;
    const targetPriority = statusPriority[status];

    if (targetPriority < currentPriority) {
      throw new ValidationError(`Cannot transition status backward from "${order.status}" to "${status}"`);
    }

    const updateData: Prisma.OrderUpdateInput = {
      status,
      updated_at: new Date(),
    };

    if (status === 'delivered') {
      updateData.delivered_at = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { table: true },
    });

    return {
      id: updatedOrder.id,
      status: updatedOrder.status,
      table_id: updatedOrder.table_id,
      table_number: updatedOrder.table.table_number,
      cafe_id: updatedOrder.cafe_id,
      updated_at: updatedOrder.updated_at,
      delivered_at: updatedOrder.delivered_at,
    };
  },
};

export default orderService;
