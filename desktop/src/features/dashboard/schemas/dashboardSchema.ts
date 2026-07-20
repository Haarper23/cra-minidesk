import { z } from 'zod';

export const RepairOrderStatusEnum = z.enum([
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

export const RepairStatusCountSchema = z.object({
  status: RepairOrderStatusEnum,
  count: z.number().int().min(0),
});

export const DashboardResponseSchema = z.object({
  totalCustomers: z.number().int().min(0),
  totalDevices: z.number().int().min(0),
  totalRepairOrders: z.number().int().min(0),
  activeRepairOrders: z.number().int().min(0),
  waitingForCustomerApproval: z.number().int().min(0),
  waitingForPart: z.number().int().min(0),
  readyForDelivery: z.number().int().min(0),
  urgentRepairOrders: z.number().int().min(0),
  completedToday: z.number().int().min(0),
  deliveredToday: z.number().int().min(0),
  repairOrdersByStatus: z.array(RepairStatusCountSchema),
  generatedAt: z.string(),
});
