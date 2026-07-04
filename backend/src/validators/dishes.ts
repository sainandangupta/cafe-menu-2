import { z } from 'zod';

export const createDishSchema = z.object({
  category_id: z.string().uuid('Invalid category ID format'),
  name: z.string().min(1, 'Dish name is required').max(255),
  description: z.string().optional(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  ingredients: z.array(z.string()).default([]),
  image_url: z.string().url('Invalid image URL format').optional().or(z.literal('')),
  is_available: z.boolean().default(true),
  is_veg: z.boolean().default(false),
  is_spicy: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  is_seasonal: z.boolean().default(false),
  labels: z.array(z.string()).default([]),
});

export const updateDishSchema = createDishSchema.partial();

export type CreateDishInput = z.infer<typeof createDishSchema>;
export type UpdateDishInput = z.infer<typeof updateDishSchema>;
