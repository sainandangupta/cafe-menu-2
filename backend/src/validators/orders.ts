import { z } from 'zod';

export const orderItemInputSchema = z.object({
  dish_id: z.string().uuid('Invalid dish ID format'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').max(10, 'Quantity cannot exceed 10 per item'),
  special_instructions: z.string().max(255).optional(),
});

export const createOrderSchema = z.object({
  table_id: z.string().nonempty('Invalid table ID format'),
  items: z.array(orderItemInputSchema).min(1, 'Order must contain at least one item'),
  customer_notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['confirmed', 'preparing', 'prepared', 'delivered', 'rejected']),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
