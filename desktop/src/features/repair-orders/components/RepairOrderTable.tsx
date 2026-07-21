import React from 'react';
import { Eye, Edit2, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Trash2 } from 'lucide-react';
import {
  RepairOrder,
  RepairOrderQueryParams,
  RepairOrderStatus,
  RepairPriority,
  REPAIR_ORDER_STATUS_LABELS,
  REPAIR_PRIORITY_LABELS,
} from '../types/repairOrderTypes';
import styles from './RepairOrderTable.module.css';

interface RepairOrderTableProps {
  repairOrders: RepairOrder[];
  sortBy?: RepairOrderQueryParams['sortBy'];
  sortDirection?: 'asc' | 'desc';
  onSortChange: (field: RepairOrderQueryParams['sortBy']) => void;
  onViewDetails: (order: RepairOrder) => void;
  onEditOrder: (order: RepairOrder) => void;
  onStatusChangeClick: (order: RepairOrder) => void;
  onDeleteOrder: (order: RepairOrder) => void;
}

function getStatusBadgeClass(status: RepairOrderStatus): string {
  switch (status) {
    case 'RECEIVED':
      return styles.statusReceived;
    case 'DIAGNOSING':
      return styles.statusDiagnosing;
    case 'WAITING_FOR_CUSTOMER_APPROVAL':
      return styles.statusWaitingApproval;
    case 'APPROVED':
      return styles.statusApproved;
    case 'IN_REPAIR':
      return styles.statusInRepair;
    case 'WAITING_FOR_PART':
      return styles.statusWaitingPart;
    case 'COMPLETED':
      return styles.statusCompleted;
    case 'READY_FOR_DELIVERY':
      return styles.statusReadyDelivery;
    case 'DELIVERED':
      return styles.statusDelivered;
    case 'CANCELLED':
      return styles.statusCancelled;
    default:
      return styles.statusReceived;
  }
}

function getPriorityBadgeClass(priority: RepairPriority): string {
  switch (priority) {
    case 'LOW':
      return styles.priorityLow;
    case 'NORMAL':
      return styles.priorityNormal;
    case 'HIGH':
      return styles.priorityHigh;
    case 'URGENT':
      return styles.priorityUrgent;
    default:
      return styles.priorityNormal;
  }
}

function formatDate(isoString: string): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

export const RepairOrderTable: React.FC<RepairOrderTableProps> = ({
  repairOrders,
  sortBy,
  sortDirection,
  onSortChange,
  onViewDetails,
  onEditOrder,
  onStatusChangeClick,
  onDeleteOrder,
}) => {
  const renderSortIcon = (field: RepairOrderQueryParams['sortBy']) => {
    if (sortBy !== field) {
      return <ArrowUpDown size={14} aria-hidden="true" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} aria-hidden="true" />
    ) : (
      <ArrowDown size={14} aria-hidden="true" />
    );
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th
              className={`${styles.th} ${styles.sortableTh}`}
              onClick={() => onSortChange('orderNumber')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSortChange('orderNumber')}
            >
              <div className={styles.thContent}>
                <span>Servis No</span>
                {renderSortIcon('orderNumber')}
              </div>
            </th>
            <th className={styles.th}>Müşteri</th>
            <th className={styles.th}>Cihaz</th>
            <th className={styles.th}>Şikayet / Arıza</th>
            <th
              className={`${styles.th} ${styles.sortableTh}`}
              onClick={() => onSortChange('priority')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSortChange('priority')}
            >
              <div className={styles.thContent}>
                <span>Öncelik</span>
                {renderSortIcon('priority')}
              </div>
            </th>
            <th
              className={`${styles.th} ${styles.sortableTh}`}
              onClick={() => onSortChange('status')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSortChange('status')}
            >
              <div className={styles.thContent}>
                <span>Durum</span>
                {renderSortIcon('status')}
              </div>
            </th>
            <th
              className={`${styles.th} ${styles.sortableTh}`}
              onClick={() => onSortChange('createdAt')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSortChange('createdAt')}
            >
              <div className={styles.thContent}>
                <span>Kayıt Tarihi</span>
                {renderSortIcon('createdAt')}
              </div>
            </th>
            <th className={styles.th}>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {repairOrders.map((order) => (
            <tr key={order.id} className={styles.tr}>
              <td className={styles.td}>
                <span className={styles.orderNumber}>{order.orderNumber}</span>
              </td>
              <td className={styles.td}>
                <span className={styles.customerName}>{order.customerFullName}</span>
              </td>
              <td className={styles.td}>
                <div className={styles.deviceInfo}>
                  <strong>{order.deviceBrand}</strong> {order.deviceModel}
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.reportedIssue} title={order.reportedIssue}>
                  {order.reportedIssue}
                </div>
              </td>
              <td className={styles.td}>
                <span
                  className={`${styles.priorityBadge} ${getPriorityBadgeClass(order.priority)}`}
                >
                  {REPAIR_PRIORITY_LABELS[order.priority] || order.priority}
                </span>
              </td>
              <td className={styles.td}>
                <span className={`${styles.statusBadge} ${getStatusBadgeClass(order.status)}`}>
                  {REPAIR_ORDER_STATUS_LABELS[order.status] || order.status}
                </span>
              </td>
              <td className={styles.td}>{formatDate(order.createdAt)}</td>
              <td className={styles.td}>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => onViewDetails(order)}
                    title="Detayları Görüntüle"
                    aria-label={`${order.orderNumber} detaylarını görüntüle`}
                  >
                    <Eye size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => onEditOrder(order)}
                    title="Düzenle"
                    aria-label={`${order.orderNumber} kaydını düzenle`}
                  >
                    <Edit2 size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => onStatusChangeClick(order)}
                    title="Durum Değiştir"
                    aria-label={`${order.orderNumber} durumunu değiştir`}
                  >
                    <RefreshCw size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => onDeleteOrder(order)}
                    title="Sil"
                    aria-label={`${order.orderNumber} kaydını sil`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
