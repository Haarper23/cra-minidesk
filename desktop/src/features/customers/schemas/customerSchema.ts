import { z } from 'zod';

export const CustomerResponseSchema = z.object({
  id: z.number().int().positive(),
  fullName: z.string(),
  email: z.string(),
  phoneNumber: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CustomerPageResponseSchema = z.object({
  content: z.array(CustomerResponseSchema),
  page: z.number().int().min(0),
  size: z.number().int().min(1),
  totalElements: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  first: z.boolean(),
  last: z.boolean(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
});

export const CustomerFormInputSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { message: 'Ad Soyad alanı zorunludur' })
    .max(120, { message: 'Ad Soyad en fazla 120 karakter olabilir' }),
  email: z
    .string()
    .trim()
    .min(1, { message: 'E-posta alanı zorunludur' })
    .email({ message: 'Geçerli bir e-posta adresi giriniz' })
    .max(160, { message: 'E-posta en fazla 160 karakter olabilir' }),
  phoneNumber: z
    .string()
    .trim()
    .max(40, { message: 'Telefon numarası en fazla 40 karakter olabilir' })
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .trim()
    .max(1000, { message: 'Notlar en fazla 1000 karakter olabilir' })
    .optional()
    .or(z.literal('')),
});
