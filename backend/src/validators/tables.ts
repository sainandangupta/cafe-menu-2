import { z } from 'zod';

export const createTableSchema = z.object({
  table_number: z.coerce.number().int().positive('Table number must be an integer greater than 0'),
  is_active: z.boolean().default(true),
});

export const updateTableSchema = createTableSchema.partial();

export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
