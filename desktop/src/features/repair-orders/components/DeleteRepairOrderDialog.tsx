import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { RepairOrder, REPAIR_ORDER_STATUS_LABELS } from '../types/repairOrderTypes';
import styles from './DeleteRepairOrderDialog.module.css';

interface DeleteRepairOrderDialogProps {
  isOpen: boolean;
  order: RepairOrder | null;
  isLoading?: boolean;
  serverError?: string | null;
  onClose: () => void;
  onConfirmDelete: (id: number) => void;
}

export const DeleteRepairOrderDialog: React.FC<DeleteRepairOrderDialogProps> = ({
  isOpen,
  order,
  isLoading = false,
  serverError,
  onClose,
  onConfirmDelete,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !order) return null;

  const isDeletionAllowed = order.status === 'RECEIVED' || order.status === 'CANCELLED';

  return (
    <div className={styles.overlay} onClick={() => !isLoading && onClose()}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <AlertTriangle size={20} aria-hidden="true" />
            <h2 id="delete-dialog-title" className={styles.title}>
              Servis Kaydını Sil
            </h2>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isLoading}
            aria-label="Kapat"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.body}>
          {serverError && (
            <div className={styles.serverError} role="alert">
              {serverError}
            </div>
          )}

          {!isDeletionAllowed ? (
            <div className={styles.warningBox}>
              Yalnızca <strong>Teslim Alındı</strong> veya <strong>İptal Edildi</strong> durumundaki
              servis kayıtları silinebilir. Mevcut durum:{' '}
              <strong>{REPAIR_ORDER_STATUS_LABELS[order.status]}</strong>.
            </div>
          ) : (
            <p className={styles.description}>
              <strong>{order.orderNumber}</strong> numaralı servis kaydını silmek istediğinize emin
              misiniz? Bu işlem geri alınamaz.
            </p>
          )}

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isLoading}
            >
              Vazgeç
            </button>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => onConfirmDelete(order.id)}
              disabled={isLoading || !isDeletionAllowed}
            >
              {isLoading && <Loader2 size={16} className={styles.spin} aria-hidden="true" />}
              <span>Sil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
