import { z } from 'zod';
import {
  DashboardTotalsSchema,
  RepairStatusCountSchema,
  RecentRepairOrderSchema,
  PriorityQueueItemSchema,
  ReadyForDeliveryQueueItemSchema,
  RecentActivitySchema,
  DashboardSummarySchema,
} from '../schemas/dashboardSchema';

export type DashboardTotalsData = z.infer<typeof DashboardTotalsSchema>;
export type RepairStatusCountData = z.infer<typeof RepairStatusCountSchema>;
export type RecentRepairOrderData = z.infer<typeof RecentRepairOrderSchema>;
export type PriorityQueueItemData = z.infer<typeof PriorityQueueItemSchema>;
export type ReadyForDeliveryQueueItemData = z.infer<typeof ReadyForDeliveryQueueItemSchema>;
export type RecentActivityData = z.infer<typeof RecentActivitySchema>;
export type DashboardSummaryData = z.infer<typeof DashboardSummarySchema>;
