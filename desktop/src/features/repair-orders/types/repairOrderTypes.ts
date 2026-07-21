import { PageResponse } from '../../../lib/api/apiTypes';

export type RepairOrderStatus =
  | 'RECEIVED'
  | 'DIAGNOSING'
  | 'WAITING_FOR_CUSTOMER_APPROVAL'
  | 'APPROVED'
  | 'IN_REPAIR'
  | 'WAITING_FOR_PART'
  | 'COMPLETED'
  | 'READY_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type RepairPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export const REPAIR_ORDER_STATUS_LABELS: Record<RepairOrderStatus, string> = {
  RECEIVED: 'Teslim Alındı',
  DIAGNOSING: 'Arıza Tespiti Yapılıyor',
  WAITING_FOR_CUSTOMER_APPROVAL: 'Müşteri Onayı Bekleniyor',
  APPROVED: 'Onaylandı',
  IN_REPAIR: 'Onarımda',
  WAITING_FOR_PART: 'Parça Bekleniyor',
  COMPLETED: 'Tamamlandı',
  READY_FOR_DELIVERY: 'Teslime Hazır',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
};

export const REPAIR_PRIORITY_LABELS: Record<RepairPriority, string> = {
  LOW: 'Düşük',
  NORMAL: 'Normal',
  HIGH: 'Yüksek',
  URGENT: 'Acil',
};

export interface RepairOrder {
  id: number;
  orderNumber: string;
  deviceId: number;
  deviceBrand: string;
  deviceModel: string;
  customerId: number;
  customerFullName: string;
  reportedIssue: string;
  diagnosisNotes?: string | null;
  technicianNotes?: string | null;
  status: RepairOrderStatus;
  priority: RepairPriority;
  estimatedCost?: number | null;
  finalCost?: number | null;
  receivedAt: string;
  completedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRepairOrderInput {
  deviceId: number;
  reportedIssue: string;
  priority: RepairPriority;
  diagnosisNotes?: string | null;
  technicianNotes?: string | null;
  estimatedCost?: number | null;
}

export interface UpdateRepairOrderInput {
  reportedIssue: string;
  priority: RepairPriority;
  diagnosisNotes?: string | null;
  technicianNotes?: string | null;
  estimatedCost?: number | null;
  finalCost?: number | null;
}

export interface UpdateRepairOrderStatusInput {
  status: RepairOrderStatus;
}

export interface RepairOrderQueryParams {
  query?: string;
  status?: RepairOrderStatus;
  priority?: RepairPriority;
  customerId?: number;
  deviceId?: number;
  page?: number;
  size?: number;
  sortBy?:
    | 'id'
    | 'orderNumber'
    | 'status'
    | 'priority'
    | 'receivedAt'
    | 'completedAt'
    | 'deliveredAt'
    | 'createdAt'
    | 'updatedAt';
  sortDirection?: 'asc' | 'desc';
}

export type RepairOrderPageResponse = PageResponse<RepairOrder>;
