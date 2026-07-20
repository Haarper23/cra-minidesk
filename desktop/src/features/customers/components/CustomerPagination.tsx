import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './CustomerPagination.module.css';

interface CustomerPaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
  onPageChange: (newPage: number) => void;
}

export const CustomerPagination: React.FC<CustomerPaginationProps> = ({
  page,
  totalPages,
  totalElements,
  isFirst,
  isLast,
  onPageChange,
}) => {
  const displayCurrentPage = totalPages === 0 ? 0 : page + 1;

  return (
    <nav className={styles.pagination} aria-label="Müşteri listesi sayfalandırması">
      <div className={styles.info}>
        Toplam <strong>{totalElements}</strong> müşteri (Sayfa <strong>{displayCurrentPage}</strong>{' '}
        / <strong>{totalPages}</strong>)
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.button}
          onClick={() => onPageChange(page - 1)}
          disabled={isFirst || page <= 0}
          aria-label="Önceki sayfaya git"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          <span>Önceki</span>
        </button>

        <button
          type="button"
          className={styles.button}
          onClick={() => onPageChange(page + 1)}
          disabled={isLast || totalPages === 0 || page >= totalPages - 1}
          aria-label="Sonraki sayfaya git"
        >
          <span>Sonraki</span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};
