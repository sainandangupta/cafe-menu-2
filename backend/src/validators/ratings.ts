import { z } from 'zod';

export const ratingSchema = z.object({
  dish_id: z.string().uuid('Invalid dish ID format'),
  order_id: z.string().uuid('Invalid order ID format').optional().nullable(),
  table_id: z.string().uuid('Invalid table ID format').optional().nullable(),
  rating: z.coerce.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().max(500, 'Comment is too long (max 500 characters)').optional(),
});

export type RatingInput = z.infer<typeof ratingSchema>;
export default ratingSchema;
