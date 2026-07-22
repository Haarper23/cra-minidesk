import { z } from 'zod';
import {
  RepairOrderStatusSchema,
  RepairPrioritySchema,
} from '../../repair-orders/schemas/repairOrderSchema';

export const DashboardTotalsSchema = z.object({
  customers: z.number().int().nonnegative(),
  devices: z.number().int().nonnegative(),
  repairOrders: z.number().int().nonnegative(),
  activeRepairOrders: z.number().int().nonnegative(),
  readyForDelivery: z.number().int().nonnegative(),
  openedToday: z.number().int().nonnegative(),
  deliveredToday: z.number().int().nonnegative(),
});

export const RepairStatusCountSchema = z.object({
  status: RepairOrderStatusSchema,
  count: z.number().int().nonnegative(),
});

export const RecentRepairOrderSchema = z.object({
  id: z.number(),
  orderNumber: z.string(),
  customerId: z.number(),
  customerName: z.string(),
  deviceId: z.number(),
  deviceLabel: z.string(),
  status: RepairOrderStatusSchema,
  priority: RepairPrioritySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PriorityQueueItemSchema = z.object({
  id: z.number(),
  orderNumber: z.string(),
  customerName: z.string(),
  deviceLabel: z.string(),
  status: RepairOrderStatusSchema,
  priority: RepairPrioritySchema,
  createdAt: z.string(),
  ageInDays: z.number().int().nonnegative(),
});

export const ReadyForDeliveryQueueItemSchema = z.object({
  id: z.number(),
  orderNumber: z.string(),
  customerName: z.string(),
  deviceLabel: z.string(),
  readySince: z.string(),
  waitingDays: z.number().int().nonnegative(),
});

export const RecentActivitySchema = z.object({
  id: z.number(),
  repairOrderId: z.number(),
  orderNumber: z.string(),
  eventType: z.string(),
  description: z.string(),
  createdAt: z.string(),
});

export const DashboardSummarySchema = z.object({
  generatedAt: z.string(),
  totals: DashboardTotalsSchema,
  statusDistribution: z.array(RepairStatusCountSchema),
  recentRepairOrders: z.array(RecentRepairOrderSchema),
  priorityQueue: z.array(PriorityQueueItemSchema),
  readyForDeliveryQueue: z.array(ReadyForDeliveryQueueItemSchema),
  recentActivity: z.array(RecentActivitySchema),
});
