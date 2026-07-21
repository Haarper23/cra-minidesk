import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './RepairOrderPagination.module.css';

interface RepairOrderPaginationProps {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onSizeChange: (newSize: number) => void;
}

export const RepairOrderPagination: React.FC<RepairOrderPaginationProps> = ({
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
  onSizeChange,
}) => {
  const startItem = totalElements === 0 ? 0 : page * size + 1;
  const endItem = Math.min((page + 1) * size, totalElements);

  return (
    <div className={styles.pagination}>
      <div className={styles.info}>
        Toplam <strong>{totalElements}</strong> kayıttan{' '}
        <strong>
          {startItem}-{endItem}
        </strong>{' '}
        arası gösteriliyor
      </div>

      <div className={styles.controls}>
        <select
          className={styles.sizeSelect}
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          aria-label="Sayfa başına kayıt sayısı"
        >
          <option value={10}>10 / sayfa</option>
          <option value={20}>20 / sayfa</option>
          <option value={25}>25 / sayfa</option>
        </select>

        <div className={styles.pageButtons}>
          <button
            type="button"
            className={styles.pageButton}
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 0}
            aria-label="Önceki sayfa"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>

          <span className={styles.pageIndicator}>
            Sayfa {totalPages === 0 ? 0 : page + 1} / {totalPages}
          </span>

          <button
            type="button"
            className={styles.pageButton}
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1 || totalPages === 0}
            aria-label="Sonraki sayfa"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
