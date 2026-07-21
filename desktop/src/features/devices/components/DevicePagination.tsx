import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './DevicePagination.module.css';

interface DevicePaginationProps {
  currentPage: number; // 0-based
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const DevicePagination: React.FC<DevicePaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}) => {
  if (totalElements === 0) return null;

  const startElement = currentPage * pageSize + 1;
  const endElement = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className={styles.paginationContainer}>
      <div className={styles.info}>
        Toplam <strong>{totalElements}</strong> kayıttan{' '}
        <strong>
          {startElement}-{endElement}
        </strong>{' '}
        arası gösteriliyor
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.pageButton}
          disabled={currentPage <= 0}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Önceki sayfaya git"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          <span>Önceki</span>
        </button>

        <span className={styles.pageIndicator}>
          Sayfa {currentPage + 1} / {Math.max(1, totalPages)}
        </span>

        <button
          type="button"
          className={styles.pageButton}
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Sonraki sayfaya git"
        >
          <span>Sonraki</span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
