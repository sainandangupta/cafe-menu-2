import { z } from 'zod';

export const updateSettingsSchema = z.object({
  cafe_name: z.string().min(1, 'Cafe name cannot be empty').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  phone: z.string().min(8, 'Phone number must be at least 8 digits').max(20).optional(),
  address: z.string().optional(),
  gst_percentage: z.coerce.number().min(0, 'GST rate cannot be negative').max(100, 'GST rate cannot exceed 100%').optional(),
  open_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid open time format (use HH:MM)').optional(),
  close_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid close time format (use HH:MM)').optional(),
  closed_days: z.array(z.string()).optional(),
  logo_url: z.string().url('Invalid logo URL format').optional().or(z.literal('')),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export default updateSettingsSchema;
