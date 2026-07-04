import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const DishSchema = z.object({
  name: z.string().min(1, 'Dish name is required'),
  category_id: z.string().uuid('Please select a valid category'),
  price: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().positive('Price must be greater than 0')
  ),
  description: z.string().optional(),
  ingredients: z.array(z.string()).default([]),
  image_url: z.string().url('Please enter a valid image URL').or(z.string().length(0)).optional(),
  is_available: z.boolean().default(true),
  is_veg: z.boolean().default(false),
  is_spicy: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  is_seasonal: z.boolean().default(false),
  labels: z.array(z.string()).default([]),
});

export const CategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  display_order: z.preprocess(
    (val) => (val === '' ? 0 : Number(val)),
    z.number().int().nonnegative('Display order must be a non-negative number')
  ),
  is_active: z.boolean().default(true),
});

export const TableSchema = z.object({
  table_number: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().int().positive('Table number must be a positive integer')
  ),
});

export const SettingsSchema = z.object({
  name: z.string().min(1, 'Cafe name is required'),
  email: z.string().email('Please enter a valid email address').or(z.string().length(0)).optional(),
  phone: z.string().min(8, 'Phone number must be at least 8 characters').or(z.string().length(0)).optional(),
  address: z.string().optional(),
  gst_percentage: z.preprocess(
    (val) => (val === '' ? 5 : Number(val)),
    z.number().min(0, 'GST cannot be negative').max(100, 'GST cannot exceed 100%')
  ),
  tax_type: z.enum(['item', 'total']).default('total'),
  logo_url: z.string().url('Please enter a valid URL').or(z.string().length(0)).optional(),
  open_time: z.string().optional(),
  close_time: z.string().optional(),
  closed_days: z.array(z.string()).default([]),
  email_notifications: z.boolean().default(true),
  sound_alerts: z.boolean().default(true),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type DishInput = z.infer<typeof DishSchema>;
export type CategoryInput = z.infer<typeof CategorySchema>;
export type TableInput = z.infer<typeof TableSchema>;
export type SettingsInput = z.infer<typeof SettingsSchema>;
