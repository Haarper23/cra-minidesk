import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Customer } from '../types/customerTypes';
import styles from './DeleteCustomerDialog.module.css';

interface DeleteCustomerDialogProps {
  isOpen: boolean;
  customerToDelete: Customer | null;
  isLoading?: boolean;
  serverError?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteCustomerDialog: React.FC<DeleteCustomerDialogProps> = ({
  isOpen,
  customerToDelete,
  isLoading = false,
  serverError,
  onClose,
  onConfirm,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;

      setTimeout(() => {
        const cancelButton =
          dialogRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])');
        cancelButton?.focus();
      }, 50);
    } else if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  const handleDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && dialogRef.current) {
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  if (!isOpen || !customerToDelete) return null;

  const displayError = serverError?.includes('related devices or repair orders exist')
    ? 'Bu müşteri, bağlı cihazları veya servis kayıtları bulunduğu için silinemiyor.'
    : serverError;

  return (
    <div className={styles.overlay} onClick={() => !isLoading && onClose()}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        onKeyDown={handleDialogKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.content}>
          <div className={styles.iconContainer}>
            <AlertTriangle size={24} className={styles.warningIcon} aria-hidden="true" />
          </div>

          <div className={styles.textContent}>
            <h2 id="delete-dialog-title" className={styles.title}>
              Müşteriyi Sil
            </h2>
            <p className={styles.message}>
              <strong>{customerToDelete.fullName}</strong> isimli müşteriyi silmek istediğinizden
              emin misiniz?
            </p>
            <p className={styles.warningText}>
              Bu işlem geri alınamaz. Müşteriye bağlı aktif servis kaydı veya cihaz bulunuyorsa
              silme işlemi engellenebilir.
            </p>
          </div>
        </div>

        {displayError && (
          <div className={styles.serverError} role="alert">
            {displayError}
          </div>
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
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 size={16} className={styles.spin} aria-hidden="true" />}
            <span>Müşteriyi Sil</span>
          </button>
        </div>
      </div>
    </div>
  );
};
