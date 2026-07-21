import { z } from 'zod';

export const DeviceTypeEnumSchema = z.enum([
  'LAPTOP',
  'DESKTOP',
  'PHONE',
  'TABLET',
  'MONITOR',
  'PRINTER',
  'OTHER',
]);

export const DeviceSchema = z.object({
  id: z.number().int().positive(),
  customerId: z.number().int().positive(),
  customerFullName: z.string(),
  brand: z.string(),
  model: z.string(),
  serialNumber: z.string().nullable().optional(),
  deviceType: DeviceTypeEnumSchema,
  color: z.string().nullable().optional(),
  accessories: z.string().nullable().optional(),
  conditionNotes: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const DevicePageSchema = z.object({
  content: z.array(DeviceSchema),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  first: z.boolean(),
  last: z.boolean(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
});

export const DeviceFormInputSchema = z.object({
  customerId: z
    .number({ required_error: 'Müşteri seçimi zorunludur' })
    .int()
    .positive('Müşteri seçimi zorunludur'),
  brand: z
    .string()
    .trim()
    .min(1, 'Marka alanı zorunludur')
    .max(80, 'Marka 80 karakterden uzun olamaz'),
  model: z
    .string()
    .trim()
    .min(1, 'Model alanı zorunludur')
    .max(120, 'Model 120 karakterden uzun olamaz'),
  serialNumber: z.string().trim().max(120, 'Seri numarası 120 karakterden uzun olamaz').optional(),
  deviceType: DeviceTypeEnumSchema,
  color: z.string().trim().max(60, 'Renk 60 karakterden uzun olamaz').optional(),
  accessories: z.string().trim().max(500, 'Aksesuarlar 500 karakterden uzun olamaz').optional(),
  conditionNotes: z
    .string()
    .trim()
    .max(1000, 'Durum notları 1000 karakterden uzun olamaz')
    .optional(),
});
