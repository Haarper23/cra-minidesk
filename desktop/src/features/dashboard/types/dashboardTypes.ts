import { z } from 'zod';
import {
  RepairOrderStatusEnum,
  RepairStatusCountSchema,
  DashboardResponseSchema,
} from '../schemas/dashboardSchema';

export type RepairOrderStatus = z.infer<typeof RepairOrderStatusEnum>;
export type RepairStatusCount = z.infer<typeof RepairStatusCountSchema>;
export type DashboardData = z.infer<typeof DashboardResponseSchema>;
