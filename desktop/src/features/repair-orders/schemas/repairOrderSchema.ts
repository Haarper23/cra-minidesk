import { z } from 'zod';

export const RepairOrderStatusSchema = z.enum([
  'RECEIVED',
  'DIAGNOSING',
  'WAITING_FOR_CUSTOMER_APPROVAL',
  'APPROVED',
  'IN_REPAIR',
  'WAITING_FOR_PART',
  'COMPLETED',
  'READY_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
]);

export const RepairPrioritySchema = z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']);

export const RepairOrderSchema = z.object({
  id: z.number().int().positive(),
  orderNumber: z.string(),
  deviceId: z.number().int().positive(),
  deviceBrand: z.string(),
  deviceModel: z.string(),
  customerId: z.number().int().positive(),
  customerFullName: z.string(),
  reportedIssue: z.string(),
  diagnosisNotes: z.string().nullable().optional(),
  technicianNotes: z.string().nullable().optional(),
  status: RepairOrderStatusSchema,
  priority: RepairPrioritySchema,
  estimatedCost: z.number().nullable().optional(),
  finalCost: z.number().nullable().optional(),
  receivedAt: z.string(),
  completedAt: z.string().nullable().optional(),
  deliveredAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateRepairOrderInputSchema = z.object({
  deviceId: z
    .number({ required_error: 'Cihaz seçimi zorunludur' })
    .int()
    .positive('Cihaz seçimi zorunludur'),
  reportedIssue: z
    .string({ required_error: 'Şikayet / arıza açıklaması zorunludur' })
    .trim()
    .min(1, 'Şikayet / arıza açıklaması boş bırakılamaz')
    .max(2000, 'Arıza açıklaması en fazla 2000 karakter olabilir'),
  priority: RepairPrioritySchema,
  diagnosisNotes: z
    .string()
    .max(4000, 'Teşhis notları en fazla 4000 karakter olabilir')
    .optional()
    .nullable(),
  technicianNotes: z
    .string()
    .max(4000, 'Teknisyen notları en fazla 4000 karakter olabilir')
    .optional()
    .nullable(),
  estimatedCost: z.coerce.number().min(0, 'Tahmini tutar negatif olamaz').optional().nullable(),
});

export const UpdateRepairOrderInputSchema = z.object({
  reportedIssue: z
    .string({ required_error: 'Şikayet / arıza açıklaması zorunludur' })
    .trim()
    .min(1, 'Şikayet / arıza açıklaması boş bırakılamaz')
    .max(2000, 'Arıza açıklaması en fazla 2000 karakter olabilir'),
  priority: RepairPrioritySchema,
  diagnosisNotes: z
    .string()
    .max(4000, 'Teşhis notları en fazla 4000 karakter olabilir')
    .optional()
    .nullable(),
  technicianNotes: z
    .string()
    .max(4000, 'Teknisyen notları en fazla 4000 karakter olabilir')
    .optional()
    .nullable(),
  estimatedCost: z.coerce.number().min(0, 'Tahmini tutar negatif olamaz').optional().nullable(),
  finalCost: z.coerce.number().min(0, 'Nihai tutar negatif olamaz').optional().nullable(),
});

export const UpdateRepairOrderStatusInputSchema = z.object({
  status: RepairOrderStatusSchema,
});

export const RepairOrderPageResponseSchema = z.object({
  content: z.array(RepairOrderSchema),
  page: z.number().int(),
  size: z.number().int(),
  totalElements: z.number().int(),
  totalPages: z.number().int(),
  first: z.boolean(),
  last: z.boolean(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
});
