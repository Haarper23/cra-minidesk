import React, { useState, useEffect } from 'react';
import { Search, X, UserPlus } from 'lucide-react';
import styles from './CustomerToolbar.module.css';

interface CustomerToolbarProps {
  initialSearch?: string;
  onSearchChange: (query: string) => void;
  onCreateClick: () => void;
}

export const CustomerToolbar: React.FC<CustomerToolbarProps> = ({
  initialSearch = '',
  onSearchChange,
  onCreateClick,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchTerm);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearchChange]);

  const handleClear = () => {
    setSearchTerm('');
    onSearchChange('');
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.searchBox}>
        <Search size={18} className={styles.searchIcon} aria-hidden="true" />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Ad, e-posta veya telefon ara"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Müşterilerde ara"
        />
        {searchTerm && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Aramayı temizle"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <button type="button" className={styles.createButton} onClick={onCreateClick}>
        <UserPlus size={16} aria-hidden="true" />
        <span>Yeni Müşteri</span>
      </button>
    </div>
  );
};
