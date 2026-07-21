import React from 'react';
import { ArrowUp, ArrowDown, Edit2, Trash2 } from 'lucide-react';
import { Device, DeviceSortField, DEVICE_TYPE_LABELS } from '../types/deviceTypes';
import { SortDirection } from '../../../lib/api/apiTypes';
import styles from './DeviceTable.module.css';

interface DeviceTableProps {
  devices: Device[];
  sortBy: DeviceSortField;
  sortDirection: SortDirection;
  onSortChange: (field: DeviceSortField) => void;
  onEditClick: (device: Device) => void;
  onDeleteClick: (device: Device) => void;
}

export const DeviceTable: React.FC<DeviceTableProps> = ({
  devices,
  sortBy,
  sortDirection,
  onSortChange,
  onEditClick,
  onDeleteClick,
}) => {
  const renderSortIcon = (field: DeviceSortField) => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} aria-hidden="true" />
    ) : (
      <ArrowDown size={14} aria-hidden="true" />
    );
  };

  const getAriaSort = (field: DeviceSortField) => {
    if (sortBy !== field) return 'none';
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getDeviceTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'LAPTOP':
        return `${styles.badge} ${styles.laptopBadge}`;
      case 'DESKTOP':
        return `${styles.badge} ${styles.desktopBadge}`;
      case 'PHONE':
      case 'TABLET':
        return `${styles.badge} ${styles.phoneBadge}`;
      default:
        return styles.badge;
    }
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Müşteri</th>

            <th className={`${styles.th} ${styles.thSortable}`} aria-sort={getAriaSort('brand')}>
              <button
                type="button"
                className={styles.sortButton}
                onClick={() => onSortChange('brand')}
                aria-label="Marka sütununa göre sırala"
              >
                <span>Marka & Model</span>
                {renderSortIcon('brand')}
              </button>
            </th>

            <th className={styles.th}>Seri Numarası</th>

            <th
              className={`${styles.th} ${styles.thSortable}`}
              aria-sort={getAriaSort('deviceType')}
            >
              <button
                type="button"
                className={styles.sortButton}
                onClick={() => onSortChange('deviceType')}
                aria-label="Cihaz türü sütununa göre sırala"
              >
                <span>Cihaz Türü</span>
                {renderSortIcon('deviceType')}
              </button>
            </th>

            <th className={styles.th}>Renk / Notlar</th>

            <th
              className={`${styles.th} ${styles.thSortable}`}
              aria-sort={getAriaSort('createdAt')}
            >
              <button
                type="button"
                className={styles.sortButton}
                onClick={() => onSortChange('createdAt')}
                aria-label="Kayıt tarihi sütununa göre sırala"
              >
                <span>Kayıt Tarihi</span>
                {renderSortIcon('createdAt')}
              </button>
            </th>

            <th className={`${styles.th} ${styles.actionsCell}`}>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr key={device.id} className={styles.tr}>
              <td className={styles.td}>
                <div className={styles.customerInfo}>
                  <span className={styles.customerName}>{device.customerFullName}</span>
                </div>
              </td>

              <td className={styles.td}>
                <div>
                  <span className={styles.deviceTitle}>{device.brand}</span>
                  <div className={styles.deviceModel}>{device.model}</div>
                </div>
              </td>

              <td className={styles.td}>
                {device.serialNumber ? (
                  <span className={styles.serialNumber}>{device.serialNumber}</span>
                ) : (
                  <span className={styles.mutedText}>—</span>
                )}
              </td>

              <td className={styles.td}>
                <span className={getDeviceTypeBadgeClass(device.deviceType)}>
                  {DEVICE_TYPE_LABELS[device.deviceType] || device.deviceType}
                </span>
              </td>

              <td className={styles.td}>
                {device.color || device.conditionNotes ? (
                  <span>
                    {device.color && <strong>{device.color}</strong>}
                    {device.color && device.conditionNotes && ' • '}
                    {device.conditionNotes}
                  </span>
                ) : (
                  <span className={styles.mutedText}>—</span>
                )}
              </td>

              <td className={styles.td}>{formatDate(device.createdAt)}</td>

              <td className={`${styles.td} ${styles.actionsCell}`}>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => onEditClick(device)}
                  aria-label={`${device.brand} ${device.model} cihazını düzenle`}
                >
                  <Edit2 size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => onDeleteClick(device)}
                  aria-label={`${device.brand} ${device.model} cihazını sil`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
