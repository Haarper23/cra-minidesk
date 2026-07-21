import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import {
  RepairOrder,
  RepairOrderStatus,
  REPAIR_ORDER_STATUS_LABELS,
} from '../types/repairOrderTypes';
import styles from './StatusChangeDialog.module.css';

interface StatusChangeDialogProps {
  isOpen: boolean;
  order: RepairOrder | null;
  isLoading?: boolean;
  serverError?: string | null;
  onClose: () => void;
  onSubmitStatus: (id: number, status: RepairOrderStatus) => void;
}

function getAllowedTransitions(from: RepairOrderStatus): RepairOrderStatus[] {
  switch (from) {
    case 'RECEIVED':
      return ['DIAGNOSING', 'CANCELLED'];
    case 'DIAGNOSING':
      return ['WAITING_FOR_CUSTOMER_APPROVAL', 'IN_REPAIR', 'CANCELLED'];
    case 'WAITING_FOR_CUSTOMER_APPROVAL':
      return ['APPROVED', 'CANCELLED'];
    case 'APPROVED':
      return ['IN_REPAIR', 'CANCELLED'];
    case 'IN_REPAIR':
      return ['WAITING_FOR_PART', 'COMPLETED', 'CANCELLED'];
    case 'WAITING_FOR_PART':
      return ['IN_REPAIR', 'CANCELLED'];
    case 'COMPLETED':
      return ['READY_FOR_DELIVERY'];
    case 'READY_FOR_DELIVERY':
      return ['DELIVERED'];
    case 'DELIVERED':
    case 'CANCELLED':
    default:
      return [];
  }
}

export const StatusChangeDialog: React.FC<StatusChangeDialogProps> = ({
  isOpen,
  order,
  isLoading = false,
  serverError,
  onClose,
  onSubmitStatus,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [selectedStatus, setSelectedStatus] = useState<RepairOrderStatus | ''>('');

  const allowedTransitions = order ? getAllowedTransitions(order.status) : [];
  const isTerminalState = allowedTransitions.length === 0;

  useEffect(() => {
    if (isOpen && order) {
      const allowed = getAllowedTransitions(order.status);
      setSelectedStatus(allowed.length > 0 ? allowed[0] : '');
    }
  }, [isOpen, order]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus && allowedTransitions.includes(selectedStatus)) {
      onSubmitStatus(order.id, selectedStatus);
    }
  };

  return (
    <div className={styles.overlay} onClick={() => !isLoading && onClose()}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="status-dialog-title" className={styles.title}>
            Servis Kaydı Durumu Güncelle ({order.orderNumber})
          </h2>
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

        <form onSubmit={handleSubmit} className={styles.body}>
          {serverError && (
            <div className={styles.serverError} role="alert">
              {serverError}
            </div>
          )}

          <div className={styles.currentStatusBox}>
            <span className={styles.currentStatusLabel}>Mevcut Durum:</span>
            <span className={styles.currentStatusValue}>
              {REPAIR_ORDER_STATUS_LABELS[order.status] || order.status}
            </span>
          </div>

          {isTerminalState ? (
            <div className={styles.terminalWarning}>
              Bu servis kaydı son durumdadır ({REPAIR_ORDER_STATUS_LABELS[order.status]}). Durum
              geçişi yapılamaz.
            </div>
          ) : (
            <div className={styles.field}>
              <label htmlFor="new-status" className={styles.label}>
                Yeni Durum Seçin
              </label>
              <select
                id="new-status"
                className={styles.select}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as RepairOrderStatus)}
                disabled={isLoading}
              >
                {allowedTransitions.map((status) => (
                  <option key={status} value={status}>
                    {REPAIR_ORDER_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
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
              type="submit"
              className={styles.submitButton}
              disabled={isLoading || isTerminalState || !selectedStatus}
            >
              {isLoading && <Loader2 size={16} className={styles.spin} aria-hidden="true" />}
              <span>Güncelle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
