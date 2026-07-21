import React, { useState, useEffect } from 'react';
import { Search, X, Plus, RotateCcw } from 'lucide-react';
import { DeviceType, DEVICE_TYPE_LABELS } from '../types/deviceTypes';
import styles from './DeviceToolbar.module.css';

interface DeviceToolbarProps {
  initialSearch?: string;
  initialDeviceType?: DeviceType;
  onSearchChange: (query: string) => void;
  onDeviceTypeChange: (type?: DeviceType) => void;
  onClearFilters: () => void;
  onCreateClick: () => void;
}

export const DeviceToolbar: React.FC<DeviceToolbarProps> = ({
  initialSearch = '',
  initialDeviceType,
  onSearchChange,
  onDeviceTypeChange,
  onClearFilters,
  onCreateClick,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== initialSearch) {
        onSearchChange(searchTerm);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [searchTerm, initialSearch, onSearchChange]);

  const handleClearSearch = () => {
    setSearchTerm('');
    onSearchChange('');
  };

  const hasActiveFilters = Boolean(searchTerm || initialDeviceType);

  return (
    <div className={styles.toolbar}>
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Cihazlarda ara (marka, model, seri no)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Cihazlarda ara"
          />
          {searchTerm && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={handleClearSearch}
              aria-label="Aramayı temizle"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        <select
          className={styles.selectInput}
          value={initialDeviceType || ''}
          onChange={(e) =>
            onDeviceTypeChange(e.target.value ? (e.target.value as DeviceType) : undefined)
          }
          aria-label="Cihaz türü filtresi"
        >
          <option value="">Tüm Cihaz Türleri</option>
          {(Object.keys(DEVICE_TYPE_LABELS) as DeviceType[]).map((type) => (
            <option key={type} value={type}>
              {DEVICE_TYPE_LABELS[type]}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            className={styles.clearFiltersBtn}
            onClick={onClearFilters}
            aria-label="Filtreleri temizle"
          >
            <RotateCcw size={14} aria-hidden="true" />
            <span>Filtreleri Temizle</span>
          </button>
        )}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.createButton} onClick={onCreateClick}>
          <Plus size={18} aria-hidden="true" />
          <span>Yeni Cihaz</span>
        </button>
      </div>
    </div>
  );
};
