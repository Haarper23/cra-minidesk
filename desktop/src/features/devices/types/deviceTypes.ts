import { PageResponse, SortDirection } from '../../../lib/api/apiTypes';

export type DeviceType =
  'LAPTOP' | 'DESKTOP' | 'PHONE' | 'TABLET' | 'MONITOR' | 'PRINTER' | 'OTHER';

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  LAPTOP: 'Dizüstü',
  DESKTOP: 'Masaüstü',
  PHONE: 'Telefon',
  TABLET: 'Tablet',
  MONITOR: 'Monitör',
  PRINTER: 'Yazıcı',
  OTHER: 'Diğer',
};

export interface Device {
  id: number;
  customerId: number;
  customerFullName: string;
  brand: string;
  model: string;
  serialNumber?: string | null;
  deviceType: DeviceType;
  color?: string | null;
  accessories?: string | null;
  conditionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DevicePage = PageResponse<Device>;

export type DeviceSortField = 'id' | 'brand' | 'model' | 'deviceType' | 'createdAt' | 'updatedAt';

export interface DeviceQueryParams {
  query?: string;
  customerId?: number;
  deviceType?: DeviceType;
  page?: number;
  size?: number;
  sortBy?: DeviceSortField;
  sortDirection?: SortDirection;
}

export interface DeviceFormInput {
  customerId: number;
  brand: string;
  model: string;
  serialNumber?: string;
  deviceType: DeviceType;
  color?: string;
  accessories?: string;
  conditionNotes?: string;
}
