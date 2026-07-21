import React, { useState, useEffect } from 'react';
import { Search, Plus, FilterX } from 'lucide-react';
import {
  RepairOrderStatus,
  RepairPriority,
  REPAIR_ORDER_STATUS_LABELS,
  REPAIR_PRIORITY_LABELS,
} from '../types/repairOrderTypes';
import { useCustomerSearch } from '../../devices/hooks/useCustomerSearch';
import { useDeviceSearch } from '../hooks/useDeviceSearch';
import styles from './RepairOrderToolbar.module.css';

interface RepairOrderToolbarProps {
  searchValue: string;
  selectedStatus?: RepairOrderStatus;
  selectedPriority?: RepairPriority;
  selectedCustomerId?: number;
  selectedDeviceId?: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (status?: RepairOrderStatus) => void;
  onPriorityChange: (priority?: RepairPriority) => void;
  onCustomerChange: (customerId?: number) => void;
  onDeviceChange: (deviceId?: number) => void;
  onClearFilters: () => void;
  onCreateClick: () => void;
}

export const RepairOrderToolbar: React.FC<RepairOrderToolbarProps> = ({
  searchValue,
  selectedStatus,
  selectedPriority,
  selectedCustomerId,
  selectedDeviceId,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onCustomerChange,
  onDeviceChange,
  onClearFilters,
  onCreateClick,
}) => {
  const [localSearch, setLocalSearch] = useState(searchValue);

  const { customers, isLoading: isCustomersLoading } = useCustomerSearch();
  const { devices, isLoading: isDevicesLoading } = useDeviceSearch(selectedCustomerId);

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchValue) {
        onSearchChange(localSearch);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [localSearch, searchValue, onSearchChange]);

  const handleCustomerSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? Number(e.target.value) : undefined;
    onCustomerChange(val);
  };

  const handleDeviceSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? Number(e.target.value) : undefined;
    onDeviceChange(val);
  };

  const hasActiveFilters = Boolean(
    searchValue || selectedStatus || selectedPriority || selectedCustomerId || selectedDeviceId
  );

  return (
    <div className={styles.toolbar}>
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Servis emri no, müşteri, cihaz veya şikayet ile ara..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            aria-label="Servis kayıtlarında ara"
          />
        </div>

        <select
          className={styles.selectInput}
          value={selectedCustomerId || ''}
          onChange={handleCustomerSelectChange}
          aria-label="Müşteri filtresi"
        >
          <option value="">
            {isCustomersLoading ? 'Müşteriler Yükleniyor...' : 'Tüm Müşteriler'}
          </option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.fullName}
            </option>
          ))}
        </select>

        <select
          className={styles.selectInput}
          value={selectedDeviceId || ''}
          onChange={handleDeviceSelectChange}
          aria-label="Cihaz filtresi"
          disabled={!selectedCustomerId && devices.length === 0}
        >
          <option value="">
            {isDevicesLoading
              ? 'Cihazlar Yükleniyor...'
              : selectedCustomerId
                ? 'Müşteriye Ait Tüm Cihazlar'
                : 'Tüm Cihazlar'}
          </option>
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.brand} {device.model}
            </option>
          ))}
        </select>

        <select
          className={styles.selectInput}
          value={selectedStatus || ''}
          onChange={(e) => onStatusChange((e.target.value as RepairOrderStatus) || undefined)}
          aria-label="Durum filtresi"
        >
          <option value="">Tüm Durumlar</option>
          {(Object.keys(REPAIR_ORDER_STATUS_LABELS) as RepairOrderStatus[]).map((status) => (
            <option key={status} value={status}>
              {REPAIR_ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        <select
          className={styles.selectInput}
          value={selectedPriority || ''}
          onChange={(e) => onPriorityChange((e.target.value as RepairPriority) || undefined)}
          aria-label="Öncelik filtresi"
        >
          <option value="">Tüm Öncelikler</option>
          {(Object.keys(REPAIR_PRIORITY_LABELS) as RepairPriority[]).map((priority) => (
            <option key={priority} value={priority}>
              {REPAIR_PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={onClearFilters}
            title="Filtreleri Temizle"
          >
            <FilterX size={14} aria-hidden="true" />
            <span>Temizle</span>
          </button>
        )}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.createButton} onClick={onCreateClick}>
          <Plus size={18} aria-hidden="true" />
          <span>Yeni Servis Kaydı</span>
        </button>
      </div>
    </div>
  );
};
